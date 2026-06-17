"use server";

import type { PrismaPromise } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES, sanitizeFileName } from "@/lib/upload";

export type AtenderChamadoState = {
  error?: string;
  success?: boolean;
};

export type MensagemChamadoState = {
  error?: string;
  success?: boolean;
};

const STATUS_VALIDOS = ["aberto", "atribuido", "em_andamento", "resolvido", "fechado", "cancelado"] as const;

export async function atualizarChamadoAction(
  _prevState: AtenderChamadoState,
  formData: FormData
): Promise<AtenderChamadoState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) return { error: "Não autenticado." };

  const id = Number(formData.get("id"));
  const status = formData.get("status") as string | null;
  const urgenteAtendimento = (formData.get("urgente_atendimento") as string | null)?.trim();
  const urgenciaDescricaoAtendimento = (formData.get("urgencia_descricao_atendimento") as string | null)?.trim();
  const atendente_id = formData.get("atendente_id")
    ? Number(formData.get("atendente_id"))
    : undefined;

  if (!id || isNaN(id)) return { error: "Chamado inválido." };

  const chamado = await prisma.chamado.findUnique({
    where: { id },
    select: { id: true, status: true, solicitante_id: true, servico_id: true, atendente_id: true, urgente: true, urgencia_descricao: true },
  });
  if (!chamado) return { error: "Chamado não encontrado." };

  // Solicitante só pode cancelar/fechar o próprio chamado.
  if (user.role === "solicitante") {
    if (chamado.solicitante_id !== user.id) return { error: "Sem permissão." };
    if (!status || (status !== "cancelado" && status !== "fechado" && status !== "aberto")) {
      return { error: "Solicitantes só podem cancelar, fechar ou reabrir chamados." };
    }

    if (status !== chamado.status) {
      await prisma.$transaction([
        prisma.chamado.update({ where: { id }, data: { status } }),
        prisma.chamadoStatusHistorico.create({
          data: {
            chamado_id: id,
            de_status: chamado.status,
            para_status: status,
            autor_id: user.id,
          },
        }),
      ]);
    }

    revalidatePath(`/chamados/${id}`);
    revalidatePath("/chamados");
    return { success: true };
  }

  if (user.role !== "admin" && user.role !== "atendente") {
    return { error: "Sem permissão." };
  }

  if (user.role === "atendente") {
    const vinculo = await prisma.atendenteServico.findUnique({
      where: {
        user_id_servico_id: {
          user_id: user.id,
          servico_id: chamado.servico_id,
        },
      },
    });

    if (!vinculo) {
      return { error: "Você só pode atender solicitações dos seus serviços vinculados." };
    }
  }

  if (status && !STATUS_VALIDOS.includes(status as (typeof STATUS_VALIDOS)[number])) {
    return { error: "Status inválido." };
  }

  if (status && (status === "cancelado" || status === "fechado")) {
    return { error: "Apenas o solicitante pode cancelar ou fechar chamados." };
  }

  if (
    urgenteAtendimento !== undefined &&
    urgenteAtendimento !== null &&
    urgenteAtendimento !== "" &&
    urgenteAtendimento !== "sim" &&
    urgenteAtendimento !== "nao"
  ) {
    return { error: "Valor de prioridade inválido." };
  }

  const urgenteDefinido = urgenteAtendimento === "sim" || urgenteAtendimento === "nao";
  const novoUrgente = urgenteAtendimento === "sim";

  if (urgenteDefinido && novoUrgente && !urgenciaDescricaoAtendimento && !chamado.urgencia_descricao) {
    return { error: "Descreva o motivo da urgência." };
  }

  if (urgenciaDescricaoAtendimento && urgenciaDescricaoAtendimento.length > 800) {
    return { error: "A justificativa de urgência deve ter no máximo 800 caracteres." };
  }

  const updateData: {
    status?: string;
    atendente_id?: number | null;
    urgente?: boolean;
    urgencia_descricao?: string | null;
  } = {};
  if (status) updateData.status = status;

  if (urgenteDefinido) {
    updateData.urgente = novoUrgente;
    updateData.urgencia_descricao = novoUrgente
      ? urgenciaDescricaoAtendimento ?? chamado.urgencia_descricao ?? null
      : chamado.urgencia_descricao ?? null;
  }

  if (atendente_id !== undefined) {
    if (user.role !== "admin") {
      return { error: "Apenas administradores podem alterar a atribuição do chamado." };
    }

    if (isNaN(atendente_id)) return { error: "Atendente inválido." };
    if (!atendente_id) {
      updateData.atendente_id = null;
    } else {
      const atendente = await prisma.user.findUnique({
        where: { id: atendente_id },
        select: { id: true, role: true },
      });

      if (!atendente) return { error: "Atendente não encontrado." };

      if (atendente.role === "atendente") {
        const vinculoAtendente = await prisma.atendenteServico.findUnique({
          where: {
            user_id_servico_id: {
              user_id: atendente_id,
              servico_id: chamado.servico_id,
            },
          },
        });

        if (!vinculoAtendente) {
          return { error: "Este atendente não está vinculado ao serviço deste chamado." };
        }
      }

      updateData.atendente_id = atendente_id;

      // Toda atribuição manual força o chamado para "atribuido".
      updateData.status = "atribuido";
    }
  }

  const proximoAtendenteId =
    updateData.atendente_id !== undefined ? updateData.atendente_id : chamado.atendente_id;
  const proximoStatus = updateData.status ?? chamado.status;

  if (!proximoAtendenteId && proximoStatus !== "aberto") {
    return { error: "Não é possível avançar o atendimento sem um atendente atribuído." };
  }

  const novoStatus = updateData.status;
  const mudouUrgencia =
    urgenteDefinido &&
    (novoUrgente !== chamado.urgente || (novoUrgente && urgenciaDescricaoAtendimento !== chamado.urgencia_descricao));

  if (Object.keys(updateData).length > 0) {
    const operations: PrismaPromise<unknown>[] = [
      prisma.chamado.update({ where: { id }, data: updateData }),
    ];

    if (novoStatus && novoStatus !== chamado.status) {
      operations.push(
        prisma.chamadoStatusHistorico.create({
          data: {
            chamado_id: id,
            de_status: chamado.status,
            para_status: novoStatus,
            autor_id: user.id,
          },
        }),
      );
    }

    if (mudouUrgencia) {
      const prioridadeTexto = novoUrgente ? "Urgente" : "Não urgente";
      const motivoTexto = novoUrgente
        ? `\nMotivo: ${updateData.urgencia_descricao ?? "Não informado."}`
        : urgenciaDescricaoAtendimento
          ? `\nMotivo: ${urgenciaDescricaoAtendimento}`
          : "";

      operations.push(
        prisma.chamadoMensagem.create({
          data: {
            chamado_id: id,
            autor_id: user.id,
            mensagem: `Prioridade atualizada para ${prioridadeTexto}.${motivoTexto}`,
          },
        }),
      );
    }

    await prisma.$transaction(operations);
  }

  revalidatePath(`/chamados/${id}`);
  revalidatePath("/chamados");
  return { success: true };
}

export async function enviarMensagemChamadoAction(
  _prevState: MensagemChamadoState,
  formData: FormData,
): Promise<MensagemChamadoState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) return { error: "Não autenticado." };

  const chamadoId = Number(formData.get("chamado_id"));
  const mensagem = (formData.get("mensagem") as string | null)?.trim();
  const anexo = formData.get("anexo");
  const arquivo = anexo instanceof File && anexo.size > 0 ? anexo : null;

  if (!chamadoId || Number.isNaN(chamadoId)) {
    return { error: "Chamado inválido." };
  }

  if (!mensagem && !arquivo) {
    return { error: "Digite uma mensagem ou envie um anexo." };
  }

  if (mensagem && mensagem.length > 2000) {
    return { error: "A mensagem deve ter no máximo 2000 caracteres." };
  }

  if (arquivo) {
    if (!ALLOWED_MIME_TYPES.includes(arquivo.type)) {
      return { error: "Tipo de arquivo não permitido. Envie apenas imagens ou PDF." };
    }

    if (arquivo.size > MAX_FILE_SIZE_BYTES) {
      return { error: "O arquivo excede o limite de 5MB." };
    }
  }

  const chamado = await prisma.chamado.findUnique({
    where: { id: chamadoId },
    select: { id: true, solicitante_id: true, servico_id: true },
  });

  if (!chamado) return { error: "Chamado não encontrado." };

  if (user.role === "solicitante" && chamado.solicitante_id !== user.id) {
    return { error: "Sem permissão." };
  }

  if (user.role === "atendente") {
    const vinculo = await prisma.atendenteServico.findUnique({
      where: {
        user_id_servico_id: {
          user_id: user.id,
          servico_id: chamado.servico_id,
        },
      },
    });

    if (!vinculo) {
      return { error: "Você não pode interagir neste chamado." };
    }
  }

  if (user.role !== "admin" && user.role !== "atendente" && user.role !== "solicitante") {
    return { error: "Sem permissão." };
  }

  const operations: PrismaPromise<unknown>[] = [];

  if (mensagem) {
    operations.push(
      prisma.chamadoMensagem.create({
        data: {
          chamado_id: chamadoId,
          autor_id: user.id,
          mensagem,
        },
      }),
    );
  }

  if (operations.length > 0) {
    await prisma.$transaction(operations);
  }

  if (arquivo) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "chamados", String(chamadoId));
    await mkdir(uploadDir, { recursive: true });

    const extension = path.extname(arquivo.name).toLowerCase();
    const baseName = sanitizeFileName(path.basename(arquivo.name, extension));
    const storedFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}${extension}`;
    const targetPath = path.join(uploadDir, storedFileName);
    const bytes = Buffer.from(await arquivo.arrayBuffer());

    await writeFile(targetPath, bytes);

    await prisma.chamadoAnexo.create({
      data: {
        chamado_id: chamadoId,
        nome_original: arquivo.name,
        mime_type: arquivo.type,
        tamanho_bytes: arquivo.size,
        url: `/uploads/chamados/${chamadoId}/${storedFileName}`,
      },
    });
  }

  revalidatePath(`/chamados/${chamadoId}`);
  return { success: true };
}

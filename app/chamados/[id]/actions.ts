"use server";

import type { PrismaPromise } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const atendente_id = formData.get("atendente_id")
    ? Number(formData.get("atendente_id"))
    : undefined;

  if (!id || isNaN(id)) return { error: "Chamado inválido." };

  const chamado = await prisma.chamado.findUnique({
    where: { id },
    include: { servico: true },
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

  const updateData: { status?: string; atendente_id?: number | null } = {};
  if (status) updateData.status = status;

  if (atendente_id !== undefined) {
    if (isNaN(atendente_id)) return { error: "Atendente inválido." };
    if (!atendente_id) {
      updateData.atendente_id = null;
    } else {
      const atendente = await prisma.user.findUnique({
        where: { id: atendente_id },
        select: { role: true },
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

      if (!status && chamado.status === "aberto") {
        updateData.status = "atribuido";
      }
    }
  }

  const novoStatus = updateData.status;

  if (Object.keys(updateData).length > 0) {
      const operations: PrismaPromise<any>[] = [
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

  if (!chamadoId || Number.isNaN(chamadoId)) {
    return { error: "Chamado inválido." };
  }

  if (!mensagem) {
    return { error: "Digite uma mensagem." };
  }

  if (mensagem.length > 2000) {
    return { error: "A mensagem deve ter no máximo 2000 caracteres." };
  }

  const chamado = await prisma.chamado.findUnique({
    where: { id: chamadoId },
    include: { servico: true },
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

  await prisma.chamadoMensagem.create({
    data: {
      chamado_id: chamadoId,
      autor_id: user.id,
      mensagem,
    },
  });

  revalidatePath(`/chamados/${chamadoId}`);
  return { success: true };
}

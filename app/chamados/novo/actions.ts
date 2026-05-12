"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";

export type NovoChamadoState = {
  error?: string;
  success?: boolean;
  chamadoId?: number;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function abrirChamadoAction(
  _prevState: NovoChamadoState,
  formData: FormData
): Promise<NovoChamadoState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) return { error: "Não autenticado." };
  if (user.role !== "solicitante") return { error: "Apenas solicitantes podem abrir chamados." };

  const titulo = (formData.get("titulo") as string | null)?.trim();
  const descricao = (formData.get("descricao") as string | null)?.trim();
  const setor_id = Number(formData.get("setor_id"));
  const servico_id = Number(formData.get("servico_id"));
  const anexos = formData
    .getAll("anexos")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!titulo) return { error: "O título é obrigatório." };
  if (titulo.length > 200) return { error: "Título deve ter no máximo 200 caracteres." };
  if (!descricao) return { error: "A descrição é obrigatória." };
  if (!setor_id || isNaN(setor_id)) return { error: "Selecione um setor." };
  if (!servico_id || isNaN(servico_id)) return { error: "Selecione um serviço." };
  if (anexos.length > MAX_FILES) {
    return { error: `Você pode enviar no máximo ${MAX_FILES} arquivos por chamado.` };
  }

  for (const anexo of anexos) {
    if (!ALLOWED_MIME_TYPES.includes(anexo.type)) {
      return { error: `Tipo de arquivo não permitido: ${anexo.name}. Envie apenas imagens ou PDF.` };
    }

    if (anexo.size > MAX_FILE_SIZE_BYTES) {
      return { error: `O arquivo ${anexo.name} excede o limite de 5MB.` };
    }
  }

  const servico = await prisma.servico.findUnique({ where: { id: servico_id } });
  if (!servico) return { error: "Serviço não encontrado." };
  if (servico.setor_id !== setor_id) {
    return { error: "O serviço selecionado não pertence ao setor informado." };
  }

  const chamado = await prisma.chamado.create({
    data: {
      titulo,
      descricao,
      servico_id,
      solicitante_id: user.id,
    },
  });

  if (anexos.length > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "chamados", String(chamado.id));
    await mkdir(uploadDir, { recursive: true });

    const anexosData: Array<{
      chamado_id: number;
      nome_original: string;
      mime_type: string;
      tamanho_bytes: number;
      url: string;
    }> = [];

    for (const anexo of anexos) {
      const extension = path.extname(anexo.name).toLowerCase();
      const baseName = sanitizeFileName(path.basename(anexo.name, extension));
      const storedFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}${extension}`;
      const targetPath = path.join(uploadDir, storedFileName);
      const bytes = Buffer.from(await anexo.arrayBuffer());

      await writeFile(targetPath, bytes);

      anexosData.push({
        chamado_id: chamado.id,
        nome_original: anexo.name,
        mime_type: anexo.type,
        tamanho_bytes: anexo.size,
        url: `/uploads/chamados/${chamado.id}/${storedFileName}`,
      });
    }

    await prisma.chamadoAnexo.createMany({ data: anexosData });
  }

  redirect(`${ROUTES.CHAMADOS}/${chamado.id}`);
}

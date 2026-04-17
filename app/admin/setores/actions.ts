"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SetorState = {
  error?: string;
  success?: boolean;
};

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function criarSetorAction(
  _prevState: SetorState,
  formData: FormData
): Promise<SetorState> {
  const user = await requireAdmin();
  if (!user) return { error: "Acesso negado." };

  const nome = (formData.get("nome") as string | null)?.trim();
  const descricao = (formData.get("descricao") as string | null)?.trim() || null;

  if (!nome) return { error: "O nome do setor é obrigatório." };
  if (nome.length > 150) return { error: "Nome deve ter no máximo 150 caracteres." };

  const existing = await prisma.setor.findFirst({ where: { nome: { equals: nome, mode: "insensitive" } } });
  if (existing) return { error: "Já existe um setor com esse nome." };

  await prisma.setor.create({ data: { nome, descricao } });
  revalidatePath("/admin/setores");
  return { success: true };
}

export async function editarSetorAction(
  _prevState: SetorState,
  formData: FormData
): Promise<SetorState> {
  const user = await requireAdmin();
  if (!user) return { error: "Acesso negado." };

  const id = Number(formData.get("id"));
  const nome = (formData.get("nome") as string | null)?.trim();
  const descricao = (formData.get("descricao") as string | null)?.trim() || null;

  if (!id || isNaN(id)) return { error: "Setor inválido." };
  if (!nome) return { error: "O nome do setor é obrigatório." };
  if (nome.length > 150) return { error: "Nome deve ter no máximo 150 caracteres." };

  const existing = await prisma.setor.findFirst({
    where: { nome: { equals: nome, mode: "insensitive" }, NOT: { id } },
  });
  if (existing) return { error: "Já existe um setor com esse nome." };

  await prisma.setor.update({ where: { id }, data: { nome, descricao } });
  revalidatePath("/admin/setores");
  return { success: true };
}

export async function excluirSetorAction(id: number): Promise<SetorState> {
  const user = await requireAdmin();
  if (!user) return { error: "Acesso negado." };

  const inUse = await prisma.user.findFirst({ where: { setor_id: id } });
  if (inUse) return { error: "Não é possível excluir: há usuários neste setor." };

  const inUseServico = await prisma.servico.findFirst({ where: { setor_id: id } });
  if (inUseServico) return { error: "Não é possível excluir: há serviços neste setor." };

  await prisma.setor.delete({ where: { id } });
  revalidatePath("/admin/setores");
  return { success: true };
}

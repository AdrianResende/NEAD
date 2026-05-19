"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ServicoState = {
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

export async function criarServicoAction(
  _prevState: ServicoState,
  formData: FormData
): Promise<ServicoState> {
  const user = await requireAdmin();
  if (!user) return { error: "Acesso negado." };

  const nome = (formData.get("nome") as string | null)?.trim();
  const descricao = (formData.get("descricao") as string | null)?.trim() || null;
  const setor_id = Number(formData.get("setor_id"));

  if (!nome) return { error: "O nome do serviço é obrigatório." };
  if (nome.length > 200) return { error: "Nome deve ter no máximo 200 caracteres." };
  if (!setor_id || isNaN(setor_id)) return { error: "Selecione um setor." };

  const setorExists = await prisma.setor.findUnique({ where: { id: setor_id } });
  if (!setorExists) return { error: "Setor não encontrado." };

  await prisma.servico.create({ data: { nome, descricao, setor_id } });
  revalidatePath("/admin/servicos");
  revalidatePath(`/admin/setores/${setor_id}/servicos`);
  return { success: true };
}

export async function editarServicoAction(
  _prevState: ServicoState,
  formData: FormData
): Promise<ServicoState> {
  const user = await requireAdmin();
  if (!user) return { error: "Acesso negado." };

  const id = Number(formData.get("id"));
  const nome = (formData.get("nome") as string | null)?.trim();
  const descricao = (formData.get("descricao") as string | null)?.trim() || null;
  const setor_id = Number(formData.get("setor_id"));

  if (!id || isNaN(id)) return { error: "Serviço inválido." };
  if (!nome) return { error: "O nome do serviço é obrigatório." };
  if (nome.length > 200) return { error: "Nome deve ter no máximo 200 caracteres." };
  if (!setor_id || isNaN(setor_id)) return { error: "Selecione um setor." };

  const setorExists = await prisma.setor.findUnique({ where: { id: setor_id } });
  if (!setorExists) return { error: "Setor não encontrado." };

  const existingServico = await prisma.servico.findUnique({ where: { id } });
  if (!existingServico) return { error: "Serviço não encontrado." };

  await prisma.servico.update({ where: { id }, data: { nome, descricao, setor_id } });
  revalidatePath("/admin/servicos");
  revalidatePath(`/admin/setores/${setor_id}/servicos`);
  revalidatePath(`/admin/setores/${existingServico.setor_id}/servicos`);
  return { success: true };
}

export async function excluirServicoAction(id: number): Promise<ServicoState> {
  const user = await requireAdmin();
  if (!user) return { error: "Acesso negado." };

  const servico = await prisma.servico.findUnique({ where: { id } });
  if (!servico) return { error: "Serviço não encontrado." };

  const inUse = await prisma.chamado.findFirst({ where: { servico_id: id } });
  if (inUse) return { error: "Não é possível excluir: há chamados vinculados a este serviço." };

  await prisma.servico.delete({ where: { id } });
  revalidatePath("/admin/servicos");
  revalidatePath(`/admin/setores/${servico.setor_id}/servicos`);
  return { success: true };
}

export async function adicionarAtendenteAction(
  _prevState: ServicoState,
  formData: FormData
): Promise<ServicoState> {
  const user = await requireAdmin();
  if (!user) return { error: "Acesso negado." };

  const servico_id = Number(formData.get("servico_id"));
  const user_id = Number(formData.get("user_id"));

  if (!servico_id || isNaN(servico_id)) return { error: "Serviço inválido." };
  if (!user_id || isNaN(user_id)) return { error: "Usuário inválido." };

  const servico = await prisma.servico.findUnique({ where: { id: servico_id } });
  if (!servico) return { error: "Serviço não encontrado." };

  const targetUser = await prisma.user.findUnique({ where: { id: user_id } });
  if (!targetUser) return { error: "Usuário não encontrado." };

  if (targetUser.role !== "atendente") return { error: "Apenas atendentes podem ser vinculados." };

  const existing = await prisma.atendenteServico.findUnique({
    where: { user_id_servico_id: { user_id, servico_id } },
  });

  if (existing) return { error: "Este atendente já está vinculado a este serviço." };

  await prisma.atendenteServico.create({ data: { user_id, servico_id } });
  revalidatePath(`/admin/setores/${servico.setor_id}/servicos`);
  return { success: true };
}

export async function removerAtendenteAction(
  _prevState: ServicoState,
  formData: FormData
): Promise<ServicoState> {
  const user = await requireAdmin();
  if (!user) return { error: "Acesso negado." };

  const servico_id = Number(formData.get("servico_id"));
  const user_id = Number(formData.get("user_id"));

  if (!servico_id || isNaN(servico_id)) return { error: "Serviço inválido." };
  if (!user_id || isNaN(user_id)) return { error: "Usuário inválido." };

  const servico = await prisma.servico.findUnique({ where: { id: servico_id } });
  if (!servico) return { error: "Serviço não encontrado." };

  await prisma.atendenteServico.delete({
    where: { user_id_servico_id: { user_id, servico_id } },
  });

  revalidatePath(`/admin/setores/${servico.setor_id}/servicos`);
  return { success: true };
}

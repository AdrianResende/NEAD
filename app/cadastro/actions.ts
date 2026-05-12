"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { hashPassword, SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAssignableRoles, normalizeRole } from "@/lib/roles";

export type CadastroState = {
  error?: string;
  success?: boolean;
};

export async function criarUsuarioAction(
  _prevState: CadastroState,
  formData: FormData
): Promise<CadastroState> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const currentUser = sessionToken ? await validateSession(sessionToken) : null;

  const nome = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;
  const requestedRole = normalizeRole(formData.get("role") as string | null);
  const setor_id = formData.get("setor_id") ? Number(formData.get("setor_id")) : null;
  const servicoIds = formData
    .getAll("servico_ids")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  const assignableRoles = getAssignableRoles(currentUser?.role);

  if (!nome || !email || !password) {
    return { error: "Preencha nome, e-mail e senha." };
  }

  if (!assignableRoles.includes(requestedRole)) {
    return { error: "Você não tem permissão para cadastrar esse perfil." };
  }

  if (password.length < 6) {
    return { error: "A senha precisa ter no mínimo 6 caracteres." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Este e-mail já está em uso." };
  }

  if (requestedRole === "atendente" && servicoIds.length === 0) {
    return { error: "Selecione ao menos um serviço para o atendente." };
  }

  if (requestedRole === "atendente") {
    const servicosVinculados = await prisma.servico.findMany({
      where: { id: { in: servicoIds } },
      select: { id: true, setor_id: true },
    });

    if (servicosVinculados.length !== servicoIds.length) {
      return { error: "Um ou mais serviços selecionados são inválidos." };
    }

    if (setor_id && servicosVinculados.some((s) => s.setor_id !== setor_id)) {
      return { error: "Todos os serviços selecionados devem pertencer ao setor escolhido." };
    }
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      nome,
      email,
      password: passwordHash,
      role: requestedRole,
      setor_id: requestedRole === "solicitante" ? null : setor_id || null,
      servicosAtendidos:
        requestedRole === "atendente"
          ? {
              create: servicoIds.map((servico_id) => ({ servico_id })),
            }
          : undefined,
    },
  });

  revalidatePath("/cadastro");
  return { success: true };
}

export type EditarUsuarioState = {
  error?: string;
  success?: boolean;
};

export async function editarUsuarioAction(
  _prevState: EditarUsuarioState,
  formData: FormData
): Promise<EditarUsuarioState> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const currentUser = sessionToken ? await validateSession(sessionToken) : null;

  if (!currentUser) {
    return { error: "Não autenticado." };
  }

  const targetId = Number(formData.get("userId"));
  const newRole = normalizeRole(formData.get("role") as string | null);
  const setor_id = formData.get("setor_id") ? Number(formData.get("setor_id")) : null;
  const servicoIds = formData
    .getAll("servico_ids")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (!targetId || Number.isNaN(targetId)) {
    return { error: "Usuário inválido." };
  }

  const assignableRoles = getAssignableRoles(currentUser.role);
  if (!assignableRoles.includes(newRole)) {
    return { error: "Você não tem permissão para atribuir esse perfil." };
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) {
    return { error: "Usuário não encontrado." };
  }

  if (target.role === "admin" && currentUser.role !== "admin") {
    return { error: "Sem permissão para editar administradores." };
  }

  if (target.id === currentUser.id) {
    return { error: "Você não pode alterar o seu próprio perfil." };
  }

  if (newRole === "atendente" && servicoIds.length === 0) {
    return { error: "Selecione ao menos um serviço para o atendente." };
  }

  if (newRole === "atendente") {
    const servicosVinculados = await prisma.servico.findMany({
      where: { id: { in: servicoIds } },
      select: { id: true, setor_id: true },
    });

    if (servicosVinculados.length !== servicoIds.length) {
      return { error: "Um ou mais serviços selecionados são inválidos." };
    }

    if (setor_id && servicosVinculados.some((s) => s.setor_id !== setor_id)) {
      return { error: "Todos os serviços selecionados devem pertencer ao setor escolhido." };
    }
  }

  await prisma.user.update({
    where: { id: targetId },
    data: {
      role: newRole,
      setor_id: newRole === "solicitante" ? null : setor_id || null,
      servicosAtendidos:
        newRole === "atendente"
          ? {
              deleteMany: {},
              create: servicoIds.map((servico_id) => ({ servico_id })),
            }
          : {
              deleteMany: {},
            },
    },
  });

  revalidatePath("/cadastro");
  return { success: true };
}

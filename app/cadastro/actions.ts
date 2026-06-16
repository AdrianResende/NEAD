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
  const selectedSetorIds = Array.from(
    new Set(
      formData
        .getAll("setor_ids")
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  );
  const selectedServicoIds = Array.from(
    new Set(
      formData
        .getAll("servico_ids")
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  );

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

  if (requestedRole === "atendente") {
    if (selectedSetorIds.length === 0) {
      return { error: "Selecione pelo menos um setor." };
    }

    if (selectedServicoIds.length === 0) {
      return { error: "Selecione pelo menos um serviço." };
    }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Este e-mail já está em uso." };
  }

  const passwordHash = await hashPassword(password);

  const servicosSelecionados =
    selectedServicoIds.length > 0
      ? await prisma.servico.findMany({
          where: { id: { in: selectedServicoIds } },
          select: { id: true, setor_id: true },
        })
      : [];

  if (selectedServicoIds.length > 0 && servicosSelecionados.length !== selectedServicoIds.length) {
    return { error: "Um ou mais serviços selecionados são inválidos." };
  }

  if (requestedRole !== "solicitante") {
    const setoresPermitidos = new Set(selectedSetorIds);
    const servicosForaDoSetor = servicosSelecionados.some((servico) => !setoresPermitidos.has(servico.setor_id));
    if (servicosForaDoSetor) {
      return { error: "Os serviços selecionados não pertencem aos setores escolhidos." };
    }
  }

  const setorPrincipalId = requestedRole === "solicitante" ? null : (selectedSetorIds[0] ?? null);

  await prisma.user.create({
    data: {
      nome,
      email,
      password: passwordHash,
      role: requestedRole,
      setor_id: setorPrincipalId,
      servicosAtendidos:
        requestedRole === "solicitante" || servicosSelecionados.length === 0
          ? undefined
          : {
              createMany: {
                data: servicosSelecionados.map((servico) => ({ servico_id: servico.id })),
                skipDuplicates: true,
              },
            },
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
  const selectedSetorIds = Array.from(
    new Set(
      formData
        .getAll("setor_ids")
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  );
  const selectedServicoIds = Array.from(
    new Set(
      formData
        .getAll("servico_ids")
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  );

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

  if (newRole === "atendente") {
    if (selectedSetorIds.length === 0) {
      return { error: "Selecione pelo menos um setor." };
    }

    if (selectedServicoIds.length === 0) {
      return { error: "Selecione pelo menos um serviço." };
    }
  }

  const servicosSelecionados =
    selectedServicoIds.length > 0
      ? await prisma.servico.findMany({
          where: { id: { in: selectedServicoIds } },
          select: { id: true, setor_id: true },
        })
      : [];

  if (selectedServicoIds.length > 0 && servicosSelecionados.length !== selectedServicoIds.length) {
    return { error: "Um ou mais serviços selecionados são inválidos." };
  }

  if (newRole !== "solicitante") {
    const setoresPermitidos = new Set(selectedSetorIds);
    const servicosForaDoSetor = servicosSelecionados.some((servico) => !setoresPermitidos.has(servico.setor_id));
    if (servicosForaDoSetor) {
      return { error: "Os serviços selecionados não pertencem aos setores escolhidos." };
    }
  }

  const setorPrincipalId = newRole === "solicitante" ? null : (selectedSetorIds[0] ?? null);

  await prisma.user.update({
    where: { id: targetId },
    data: {
      role: newRole,
      setor_id: setorPrincipalId,
      servicosAtendidos:
        newRole === "solicitante"
          ? {
              deleteMany: {},
            }
          : {
              deleteMany: {},
              createMany: {
                data: servicosSelecionados.map((servico) => ({ servico_id: servico.id })),
                skipDuplicates: true,
              },
            },
    },
  });

  revalidatePath("/cadastro");
  return { success: true };
}

export type ToggleActivoState = {
  error?: string;
  success?: boolean;
};

export async function toggleActivoUsuarioAction(
  _prevState: ToggleActivoState,
  formData: FormData
): Promise<ToggleActivoState> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const currentUser = sessionToken ? await validateSession(sessionToken) : null;

  if (!currentUser) {
    return { error: "Não autenticado." };
  }

  const targetId = Number(formData.get("userId"));

  if (!targetId || Number.isNaN(targetId)) {
    return { error: "Usuário inválido." };
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) {
    return { error: "Usuário não encontrado." };
  }

  if (target.role === "admin" && currentUser.role !== "admin") {
    return { error: "Sem permissão para alterar administradores." };
  }

  if (target.id === currentUser.id) {
    return { error: "Você não pode desativar/ativar sua própria conta." };
  }

  await prisma.user.update({
    where: { id: targetId },
    data: {
      ativo: !target.ativo,
    },
  });

  revalidatePath("/cadastro");
  return { success: true };
}

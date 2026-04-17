"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AtenderChamadoState = {
  error?: string;
  success?: boolean;
};

const STATUS_VALIDOS = ["aberto", "em_andamento", "resolvido", "fechado", "cancelado"] as const;

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

  const chamado = await prisma.chamado.findUnique({ where: { id } });
  if (!chamado) return { error: "Chamado não encontrado." };

  // Solicitante só pode cancelar o próprio chamado
  if (user.role === "solicitante") {
    if (chamado.solicitante_id !== user.id) return { error: "Sem permissão." };
    if (status !== "cancelado") return { error: "Solicitantes só podem cancelar chamados." };
    await prisma.chamado.update({ where: { id }, data: { status: "cancelado" } });
    revalidatePath(`/chamados/${id}`);
    return { success: true };
  }

  if (user.role !== "admin" && user.role !== "atendente") {
    return { error: "Sem permissão." };
  }

  if (status && !STATUS_VALIDOS.includes(status as (typeof STATUS_VALIDOS)[number])) {
    return { error: "Status inválido." };
  }

  const updateData: { status?: string; atendente_id?: number | null } = {};
  if (status) updateData.status = status;

  if (atendente_id !== undefined) {
    if (isNaN(atendente_id)) return { error: "Atendente inválido." };
    updateData.atendente_id = atendente_id || null;
  }

  await prisma.chamado.update({ where: { id }, data: updateData });
  revalidatePath(`/chamados/${id}`);
  revalidatePath("/chamados");
  return { success: true };
}

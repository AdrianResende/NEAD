"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";

export type NovoChamadoState = {
  error?: string;
  success?: boolean;
  chamadoId?: number;
};

const PRIORIDADES = ["baixa", "normal", "alta", "urgente"] as const;

export async function abrirChamadoAction(
  _prevState: NovoChamadoState,
  formData: FormData
): Promise<NovoChamadoState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) return { error: "Não autenticado." };

  const titulo = (formData.get("titulo") as string | null)?.trim();
  const descricao = (formData.get("descricao") as string | null)?.trim();
  const servico_id = Number(formData.get("servico_id"));
  const prioridade = (formData.get("prioridade") as string | null) ?? "normal";

  if (!titulo) return { error: "O título é obrigatório." };
  if (titulo.length > 200) return { error: "Título deve ter no máximo 200 caracteres." };
  if (!descricao) return { error: "A descrição é obrigatória." };
  if (!servico_id || isNaN(servico_id)) return { error: "Selecione um serviço." };
  if (!PRIORIDADES.includes(prioridade as (typeof PRIORIDADES)[number])) {
    return { error: "Prioridade inválida." };
  }

  const servico = await prisma.servico.findUnique({ where: { id: servico_id } });
  if (!servico) return { error: "Serviço não encontrado." };

  const chamado = await prisma.chamado.create({
    data: {
      titulo,
      descricao,
      servico_id,
      prioridade,
      solicitante_id: user.id,
    },
  });

  redirect(`${ROUTES.CHAMADOS}/${chamado.id}`);
}

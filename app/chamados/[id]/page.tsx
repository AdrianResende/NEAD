import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { ChamadoDetalheClient } from "./chamado.client";

export default async function ChamadoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) redirect(ROUTES.LOGIN);

  const id = Number(idParam);
  if (isNaN(id)) notFound();

  const chamado = await prisma.chamado.findUnique({
    where: { id },
    include: {
      servico: { include: { setor: true } },
      solicitante: true,
      atendente: true,
    },
  });

  if (!chamado) notFound();

  // Solicitante só pode ver seus próprios chamados
  if (user.role === "solicitante" && chamado.solicitante_id !== user.id) {
    redirect(ROUTES.CHAMADOS);
  }

  const atendentes =
    user.role === "admin"
      ? await prisma.user.findMany({
          where: { role: { in: ["admin", "atendente"] } },
          orderBy: { nome: "asc" },
          select: { id: true, nome: true },
        })
      : [];

  return (
    <ChamadoDetalheClient
      chamado={{
        id: chamado.id,
        titulo: chamado.titulo,
        descricao: chamado.descricao,
        status: chamado.status,
        prioridade: chamado.prioridade,
        createdAt: chamado.created_at.toISOString(),
        updatedAt: chamado.updated_at.toISOString(),
        servico: {
          nome: chamado.servico.nome,
          setor: chamado.servico.setor.nome,
        },
        solicitante: {
          nome: chamado.solicitante.nome,
          email: chamado.solicitante.email,
        },
        atendente: chamado.atendente
          ? { id: chamado.atendente.id, nome: chamado.atendente.nome }
          : null,
      }}
      currentUserId={user.id}
      currentUserRole={user.role}
      atendentes={atendentes}
    />
  );
}

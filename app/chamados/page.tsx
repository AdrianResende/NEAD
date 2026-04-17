import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { ChamadosClient } from "./chamados.client";

export default async function ChamadosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) redirect(ROUTES.LOGIN);

  const where =
    user.role === "solicitante"
      ? { solicitante_id: user.id }
      : user.role === "atendente"
        ? {
            status: { in: ["aberto", "em_andamento"] },
            ...(user.setor_id ? { servico: { setor_id: user.setor_id } } : {}),
          }
        : {};

  const [chamados, totalServicos] = await Promise.all([
    prisma.chamado.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        servico: true,
        solicitante: true,
        atendente: true,
      },
    }),
    user.role === "admin" ? prisma.servico.count() : Promise.resolve(0),
  ]);

  return (
    <ChamadosClient
      role={user.role}
      totalServicos={totalServicos}
      chamados={chamados.map((c) => ({
        id: c.id,
        titulo: c.titulo,
        status: c.status,
        prioridade: c.prioridade,
        servico: c.servico.nome,
        solicitante: c.solicitante.nome,
        atendente: c.atendente?.nome ?? null,
        createdAt: c.created_at.toISOString(),
      }))}
    />
  );
}

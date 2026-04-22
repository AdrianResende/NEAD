import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { getSetorFilter } from "@/lib/permissions";
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
            servico: { setor_id: getSetorFilter(user.setor_id) },
          }
        : {};

  const [chamados, totalServicos, servicos] = await Promise.all([
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
    user.role === "solicitante"
      ? prisma.servico.findMany({
          orderBy: [{ setor: { nome: "asc" } }, { nome: "asc" }],
          include: { setor: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <ChamadosClient
      role={user.role}
      totalServicos={totalServicos}
      servicos={servicos.map((s) => ({
        id: s.id,
        nome: s.nome,
        setor: s.setor.nome,
        setor_id: s.setor_id,
      }))}
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

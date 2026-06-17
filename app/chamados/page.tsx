import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { autoFecharChamadosResolvidos } from "@/lib/chamados-status";
import { ChamadosClient } from "./chamados.client";

export default async function ChamadosPage({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  const user = await requireAuth();

  await autoFecharChamadosResolvidos();

  const params = await searchParams;
  const abrirModal = params?.novo === "1";

  const where =
    user.role === "solicitante"
      ? { solicitante_id: user.id }
      : user.role === "atendente"
        ? { atendente_id: user.id }
        : {};

  const [chamados, servicos] = await Promise.all([
    prisma.chamado.findMany({
      where,
      orderBy: [{ urgente: "desc" }, { created_at: "desc" }],
      include: {
        servico: true,
        solicitante: true,
        atendente: true,
      },
    }),
    prisma.servico.findMany({
      orderBy: [{ setor: { nome: "asc" } }, { nome: "asc" }],
      include: { setor: true },
    }),
  ]);

  return (
    <ChamadosClient
      role={user.role}
      abrirModal={abrirModal}
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
        urgente: c.urgente,
        servico: c.servico.nome,
        solicitante: c.solicitante.nome,
        atendente: c.atendente?.nome ?? null,
        createdAt: c.created_at.toISOString(),
      }))}
    />
  );
}

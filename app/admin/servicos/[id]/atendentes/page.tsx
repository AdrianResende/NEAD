import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-auth";
import { VinculoAtendentesClient } from "./vinculo-atendentes.client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServicoAtendentesPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const servicoId = Number(id);

  if (!servicoId || Number.isNaN(servicoId)) {
    notFound();
  }

  const [servico, atendentesDisponiveis] = await Promise.all([
    prisma.servico.findUnique({
      where: { id: servicoId },
      include: {
        setor: true,
        atendentes: {
          include: {
            user: true,
          },
          orderBy: {
            user: {
              nome: "asc",
            },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        role: "atendente",
      },
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
      },
    }),
  ]);

  if (!servico) {
    notFound();
  }

  return (
    <VinculoAtendentesClient
      servico={{
        id: servico.id,
        nome: servico.nome,
        setor: { id: servico.setor.id, nome: servico.setor.nome },
        vinculados: servico.atendentes.map((v) => ({
          id: v.user.id,
          nome: v.user.nome,
          email: v.user.email,
          ativo: v.user.ativo,
        })),
      }}
      atendentesDisponiveis={atendentesDisponiveis}
    />
  );
}

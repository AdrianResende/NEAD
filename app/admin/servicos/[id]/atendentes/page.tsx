import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { getFirstMenuRouteByRole } from "@/lib/navigation";
import { VinculoAtendentesClient } from "./vinculo-atendentes.client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServicoAtendentesPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) redirect(ROUTES.LOGIN);
  if (user.role !== "admin") redirect(getFirstMenuRouteByRole(user.role));

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

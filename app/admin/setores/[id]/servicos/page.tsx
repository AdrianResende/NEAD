import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { getFirstMenuRouteByRole } from "@/lib/navigation";
import { ServicosClient } from "@/app/admin/servicos/servicos.client";

export default async function SetorServicosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) redirect(ROUTES.LOGIN);
  if (user.role !== "admin") redirect(getFirstMenuRouteByRole(user.role));

  const { id } = await params;
  const setorId = Number(id);

  if (!setorId || Number.isNaN(setorId)) {
    notFound();
  }

  const setor = await prisma.setor.findUnique({ where: { id: setorId } });
  if (!setor) {
    notFound();
  }

  const servicos = await prisma.servico.findMany({
    where: { setor_id: setorId },
    orderBy: { nome: "asc" },
    include: {
      setor: true,
      atendentes: {
        select: {
          user_id: true,
        },
      },
      _count: { select: { chamados: true } },
    },
  });

  return (
    <ServicosClient
      servicos={servicos.map((s) => ({
        id: s.id,
        nome: s.nome,
        descricao: s.descricao ?? null,
        setor: { id: s.setor.id, nome: s.setor.nome },
        _count: s._count,
        atendentes: s.atendentes.map((a) => ({ id: a.user_id })),
      }))}
      setores={[{ id: setor.id, nome: setor.nome }]}
      setorAtual={{ id: setor.id, nome: setor.nome }}
    />
  );
}

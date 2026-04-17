import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { ServicosClient } from "./servicos.client";

export default async function ServicosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) redirect(ROUTES.LOGIN);
  if (user.role !== "admin") redirect(ROUTES.DASHBOARD);

  const [servicos, setores] = await Promise.all([
    prisma.servico.findMany({
      orderBy: { nome: "asc" },
      include: {
        setor: true,
        _count: { select: { chamados: true } },
      },
    }),
    prisma.setor.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <ServicosClient
      servicos={servicos.map((s) => ({
        id: s.id,
        nome: s.nome,
        descricao: s.descricao ?? null,
        setor: { id: s.setor.id, nome: s.setor.nome },
        _count: s._count,
      }))}
      setores={setores.map((s) => ({ id: s.id, nome: s.nome }))}
    />
  );
}

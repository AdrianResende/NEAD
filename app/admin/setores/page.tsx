import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { SetoresClient } from "./setores.client";

export default async function SetoresPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) redirect(ROUTES.LOGIN);
  if (user.role !== "admin") redirect(ROUTES.DASHBOARD);

  const setores = await prisma.setor.findMany({
    orderBy: { nome: "asc" },
    include: {
      _count: { select: { users: true, servicos: true } },
    },
  });

  return (
    <SetoresClient
      setores={setores.map((s) => ({
        id: s.id,
        nome: s.nome,
        descricao: s.descricao ?? null,
        _count: s._count,
      }))}
    />
  );
}

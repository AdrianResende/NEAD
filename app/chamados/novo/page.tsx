import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { NovoChamadoClient } from "./novo.client";

export default async function NovoChamadoPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) redirect(ROUTES.LOGIN);

  const servicos = await prisma.servico.findMany({
    orderBy: { nome: "asc" },
    include: { setor: true },
  });

  return (
    <NovoChamadoClient
      servicos={servicos.map((s) => ({
        id: s.id,
        nome: s.nome,
        setor: s.setor.nome,
      }))}
    />
  );
}

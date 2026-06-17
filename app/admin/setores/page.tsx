import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-auth";
import { SetoresClient } from "./setores.client";

export default async function SetoresPage() {
  await requireAdmin();

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

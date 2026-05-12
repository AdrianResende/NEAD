import { prisma } from "@/lib/prisma";

const DIAS_AUTO_FECHAMENTO = 15;

export async function autoFecharChamadosResolvidos() {
  const limite = new Date(Date.now() - DIAS_AUTO_FECHAMENTO * 24 * 60 * 60 * 1000);

  const chamados = await prisma.chamado.findMany({
    where: {
      status: "resolvido",
      updated_at: { lte: limite },
    },
    select: { id: true, status: true },
  });

  if (chamados.length === 0) return 0;

  await prisma.$transaction(
    chamados.flatMap((chamado) => [
      prisma.chamado.update({
        where: { id: chamado.id },
        data: { status: "fechado" },
      }),
      prisma.chamadoStatusHistorico.create({
        data: {
          chamado_id: chamado.id,
          de_status: chamado.status,
          para_status: "fechado",
          autor_id: null,
          observacao: "Fechamento automático após 15 dias em resolvido.",
        },
      }),
    ]),
  );

  return chamados.length;
}

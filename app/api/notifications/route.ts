import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) {
    return NextResponse.json({ notifications: [] }, { status: 401 });
  }

  const LIMIT = 8;

  if (user.role === "solicitante") {
    const chamados = await prisma.chamado.findMany({
      where: { solicitante_id: user.id },
      orderBy: { updated_at: "desc" },
      take: LIMIT,
      select: {
        id: true,
        titulo: true,
        status: true,
        updated_at: true,
        servico: { select: { nome: true } },
      },
    });

    return NextResponse.json({
      notifications: chamados.map((c) => ({
        id: c.id,
        titulo: c.titulo,
        descricao: `${c.servico.nome} · ${formatStatus(c.status)}`,
        href: `/chamados/${c.id}`,
        data: c.updated_at.toISOString(),
      })),
    });
  }

  if (user.role === "atendente") {
    const chamados = await prisma.chamado.findMany({
      where: {
        atendente_id: user.id,
        status: { notIn: ["fechado", "cancelado"] },
      },
      orderBy: { updated_at: "desc" },
      take: LIMIT,
      select: {
        id: true,
        titulo: true,
        status: true,
        updated_at: true,
        servico: { select: { nome: true } },
        solicitante: { select: { nome: true } },
      },
    });

    return NextResponse.json({
      notifications: chamados.map((c) => ({
        id: c.id,
        titulo: c.titulo,
        descricao: `${c.solicitante.nome} · ${formatStatus(c.status)}`,
        href: `/chamados/${c.id}`,
        data: c.updated_at.toISOString(),
      })),
    });
  }

  // admin
  const chamados = await prisma.chamado.findMany({
    where: { status: { notIn: ["fechado", "cancelado"] } },
    orderBy: { updated_at: "desc" },
    take: LIMIT,
    select: {
      id: true,
      titulo: true,
      status: true,
      updated_at: true,
      servico: { select: { nome: true } },
      solicitante: { select: { nome: true } },
    },
  });

  return NextResponse.json({
    notifications: chamados.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      descricao: `${c.solicitante.nome} · ${c.servico.nome} · ${formatStatus(c.status)}`,
      href: `/chamados/${c.id}`,
      data: c.updated_at.toISOString(),
    })),
  });
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    aberto: "Aberto",
    atribuido: "Atribuído",
    em_andamento: "Em andamento",
    resolvido: "Resolvido",
    fechado: "Fechado",
    cancelado: "Cancelado",
  };
  return labels[status] ?? status;
}

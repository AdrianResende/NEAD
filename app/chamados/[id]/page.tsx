import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { autoFecharChamadosResolvidos } from "@/lib/chamados-status";
import { ChamadoDetalheClient } from "./chamado.client";

export default async function ChamadoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) redirect(ROUTES.LOGIN);

  await autoFecharChamadosResolvidos();

  const id = Number(idParam);
  if (isNaN(id)) notFound();

  const chamado = await prisma.chamado.findUnique({
    where: { id },
    include: {
      servico: { include: { setor: true } },
      solicitante: true,
      atendente: true,
      anexos: { orderBy: { created_at: "asc" } },
      mensagens: {
        orderBy: { created_at: "asc" },
        include: { autor: true },
      },
      historicoStatus: {
        orderBy: { created_at: "asc" },
        include: { autor: true },
      },
    },
  });

  if (!chamado) notFound();

  // Solicitante só pode ver seus próprios chamados
  if (user.role === "solicitante" && chamado.solicitante_id !== user.id) {
    redirect(ROUTES.CHAMADOS);
  }

  // Atendente só pode ver chamados de serviços vinculados.
  if (user.role === "atendente") {
    const vinculo = await prisma.atendenteServico.findUnique({
      where: {
        user_id_servico_id: {
          user_id: user.id,
          servico_id: chamado.servico_id,
        },
      },
    });

    if (!vinculo) {
      redirect(ROUTES.CHAMADOS);
    }
  }

  const atendentes =
    user.role === "admin"
      ? await prisma.user.findMany({
          where: {
            OR: [
              { role: "admin" },
              {
                role: "atendente",
                servicosAtendidos: {
                  some: {
                    servico_id: chamado.servico_id,
                  },
                },
              },
            ],
          },
          orderBy: { nome: "asc" },
          select: { id: true, nome: true },
        })
      : [];

  return (
    <ChamadoDetalheClient
      chamado={{
        id: chamado.id,
        titulo: chamado.titulo,
        descricao: chamado.descricao,
        status: chamado.status,
        createdAt: chamado.created_at.toISOString(),
        updatedAt: chamado.updated_at.toISOString(),
        servico: {
          nome: chamado.servico.nome,
          setor: chamado.servico.setor.nome,
        },
        solicitante: {
          nome: chamado.solicitante.nome,
          email: chamado.solicitante.email,
        },
        anexos: chamado.anexos.map((a) => ({
          id: a.id,
          nomeOriginal: a.nome_original,
          url: a.url,
          mimeType: a.mime_type,
          tamanhoBytes: a.tamanho_bytes,
        })),
        mensagens: chamado.mensagens.map((m) => ({
          id: m.id,
          mensagem: m.mensagem,
          createdAt: m.created_at.toISOString(),
          autor: {
            id: m.autor.id,
            nome: m.autor.nome,
            role: m.autor.role,
          },
        })),
        historicoStatus: chamado.historicoStatus.map((h) => ({
          id: h.id,
          deStatus: h.de_status,
          paraStatus: h.para_status,
          createdAt: h.created_at.toISOString(),
          autorNome: h.autor?.nome ?? "Sistema",
          observacao: h.observacao ?? null,
        })),
        atendente: chamado.atendente
          ? { id: chamado.atendente.id, nome: chamado.atendente.nome }
          : null,
      }}
      currentUserId={user.id}
      currentUserRole={user.role}
      atendentes={atendentes}
    />
  );
}

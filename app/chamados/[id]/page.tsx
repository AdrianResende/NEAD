import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { requireAuth } from "@/lib/require-auth";
import { autoFecharChamadosResolvidos } from "@/lib/chamados-status";
import { ChamadoDetalheClient } from "./chamado.client";

export default async function ChamadoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const user = await requireAuth();

  await autoFecharChamadosResolvidos();

  const id = Number(idParam);
  if (isNaN(id)) notFound();

  // select específico: evita carregar password, sessions, accounts e demais
  // campos sensíveis dos usuários relacionados ao chamado
  const chamado = await prisma.chamado.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      descricao: true,
      urgente: true,
      urgencia_descricao: true,
      status: true,
      created_at: true,
      updated_at: true,
      solicitante_id: true,
      servico_id: true,
      servico: { select: { nome: true, setor: { select: { nome: true } } } },
      solicitante: { select: { nome: true, email: true } },
      atendente: { select: { id: true, nome: true } },
      anexos: {
        orderBy: { created_at: "asc" },
        select: { id: true, nome_original: true, url: true, mime_type: true, tamanho_bytes: true },
      },
      mensagens: {
        orderBy: { created_at: "asc" },
        select: {
          id: true,
          mensagem: true,
          created_at: true,
          autor: { select: { id: true, nome: true, role: true } },
        },
      },
      historicoStatus: {
        orderBy: { created_at: "asc" },
        select: {
          id: true,
          de_status: true,
          para_status: true,
          created_at: true,
          observacao: true,
          autor: { select: { nome: true } },
        },
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
        urgente: chamado.urgente,
        urgenciaDescricao: chamado.urgencia_descricao,
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Eye, MapPin } from "lucide-react";
import { Badge, Button, Table, TableBody, TableEmpty, TableHead, Td, Th, Tr } from "@/components/ui";
import { NovoChamadoForm, type ServicoOption } from "./novo/novo-form";
import { ROUTES } from "@/lib/constants";

type Chamado = {
  id: number;
  titulo: string;
  status: string;
  servico: string;
  solicitante: string;
  atendente: string | null;
  createdAt: string;
};

type Props = {
  chamados: Chamado[];
  role: string;
  servicos?: ServicoOption[];
};

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Escolha o setor e o serviço sem sair da tela de acompanhamento.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}


const STATUS_BADGE: Record<string, "default" | "warning" | "success" | "danger" | "info"> = {
  aberto: "info",
  atribuido: "default",
  em_andamento: "warning",
  resolvido: "success",
  fechado: "default",
  cancelado: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto",
  atribuido: "Atribuído",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
  fechado: "Fechado",
  cancelado: "Cancelado",
};

export function ChamadosClient({ chamados, role, servicos = [] }: Props) {
  const isSolicitante = role === "solicitante";
  const isAdmin = role === "admin";
  const [showSolicitarModal, setShowSolicitarModal] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-zinc-100/60 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {isSolicitante ? "Meus Chamados" : "Chamados"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {isSolicitante
                ? "Acompanhe o status das suas solicitações."
                : "Gerencie os atendimentos e solicitações de serviço."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <Link href={ROUTES.SETORES} title="Acessar setores">
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Setores
                </Button>
              </Link>
            )}
            {isSolicitante && (
              <Button onClick={() => setShowSolicitarModal(true)} title="Solicitar novo serviço">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Solicitar Serviço
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {chamados.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            {isSolicitante
              ? "Você ainda não solicitou nenhum serviço."
              : "Nenhuma solicitação encontrada."}
          </div>
        ) : (
          chamados.map((c) => (
            <article key={c.id} className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">#{c.id}</p>
                  <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{c.titulo}</h3>
                  <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{c.servico}</p>
                </div>
                <Badge variant={STATUS_BADGE[c.status] ?? "default"}>
                  {STATUS_LABEL[c.status] ?? c.status}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-200/80 pt-3 text-xs dark:border-zinc-800">
                {!isSolicitante && (
                  <div>
                    <p className="font-medium text-zinc-500 dark:text-zinc-400">Solicitante</p>
                    <p className="mt-0.5 text-zinc-700 dark:text-zinc-300">{c.solicitante}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-zinc-500 dark:text-zinc-400">Atendente</p>
                  <p className="mt-0.5 text-zinc-700 dark:text-zinc-300">{c.atendente ?? "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-zinc-500 dark:text-zinc-400">Aberto em</p>
                  <p className="mt-0.5 text-zinc-700 dark:text-zinc-300">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-end justify-end">
                  <Link href={`${ROUTES.CHAMADOS}/${c.id}`}>
                    <Button variant="ghost" size="sm" aria-label={`Ver chamado ${c.id}`} title={`Ver chamado ${c.id}`}>
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:block">
        <Table>
          <TableHead>
            <tr>
              <Th>#</Th>
              <Th>Título</Th>
              <Th>Serviço</Th>
              {!isSolicitante && <Th>Solicitante</Th>}
              <Th>Atendente</Th>
              <Th>Status</Th>
              <Th>Aberto em</Th>
              <Th className="text-right">Ação</Th>
            </tr>
          </TableHead>
          <TableBody>
            {chamados.length === 0 ? (
              <TableEmpty
                colSpan={isSolicitante ? 7 : 8}
                message={
                  isSolicitante
                    ? "Você ainda não solicitou nenhum serviço."
                    : "Nenhuma solicitação encontrada."
                }
              />
            ) : (
              chamados.map((c) => (
                <Tr key={c.id}>
                  <Td className="text-zinc-500">#{c.id}</Td>
                  <Td className="font-semibold">{c.titulo}</Td>
                  <Td className="text-zinc-500 dark:text-zinc-400">{c.servico}</Td>
                  {!isSolicitante && <Td className="text-zinc-600 dark:text-zinc-300">{c.solicitante}</Td>}
                  <Td>{c.atendente ?? <span className="text-zinc-400">—</span>}</Td>
                  <Td>
                    <Badge variant={STATUS_BADGE[c.status] ?? "default"}>
                      {STATUS_LABEL[c.status] ?? c.status}
                    </Badge>
                  </Td>
                  <Td className="text-zinc-500 text-xs">
                    {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                  </Td>
                  <Td className="text-right">
                    <Link href={`${ROUTES.CHAMADOS}/${c.id}`}>
                      <Button variant="ghost" size="sm" aria-label={`Ver chamado ${c.id}`} title={`Ver chamado ${c.id}`}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden lg:inline">Ver</span>
                      </Button>
                    </Link>
                  </Td>
                </Tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isSolicitante && showSolicitarModal && (
        <Modal title="Solicitar Serviço" onClose={() => setShowSolicitarModal(false)}>
          <NovoChamadoForm servicos={servicos} />
        </Modal>
      )}
    </div>
  );
}

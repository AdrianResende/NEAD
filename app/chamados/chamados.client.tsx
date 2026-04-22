"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Table, TableBody, TableEmpty, TableHead, Td, Th, Tr } from "@/components/ui";
import { NovoChamadoForm, type ServicoOption } from "./novo/novo-form";
import { ROUTES } from "@/lib/constants";

type Chamado = {
  id: number;
  titulo: string;
  status: string;
  prioridade: string;
  servico: string;
  solicitante: string;
  atendente: string | null;
  createdAt: string;
};

type Props = {
  chamados: Chamado[];
  role: string;
  totalServicos?: number;
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
  em_andamento: "warning",
  resolvido: "success",
  fechado: "default",
  cancelado: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
  fechado: "Fechado",
  cancelado: "Cancelado",
};

const PRIORIDADE_BADGE: Record<string, "default" | "warning" | "danger" | "success"> = {
  baixa: "success",
  normal: "default",
  alta: "warning",
  urgente: "danger",
};

export function ChamadosClient({ chamados, role, totalServicos = 0, servicos = [] }: Props) {
  const isSolicitante = role === "solicitante";
  const isAdmin = role === "admin";
  const [showSolicitarModal, setShowSolicitarModal] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {isSolicitante ? "Meus Serviços" : "Serviços"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isSolicitante
              ? "Acompanhe o status das suas solicitações."
              : "Gerencie os atendimentos e solicitações de serviço."}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link href={ROUTES.SERVICOS}>
              <Button variant="outline">Catálogo ({totalServicos})</Button>
            </Link>
          )}
          {isSolicitante && (
            <Button onClick={() => setShowSolicitarModal(true)}>+ Solicitar Serviço</Button>
          )}
        </div>
      </div>

      <Table>
        <TableHead>
          <tr>
            <Th>#</Th>
            <Th>Título</Th>
            <Th>Serviço</Th>
            {!isSolicitante && <Th>Solicitante</Th>}
            <Th>Atendente</Th>
            <Th>Prioridade</Th>
            <Th>Status</Th>
            <Th>Aberto em</Th>
            <Th className="text-right">Ação</Th>
          </tr>
        </TableHead>
        <TableBody>
          {chamados.length === 0 ? (
            <TableEmpty
              colSpan={isSolicitante ? 8 : 9}
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
                <Td className="font-medium">{c.titulo}</Td>
                <Td className="text-zinc-500 dark:text-zinc-400">{c.servico}</Td>
                {!isSolicitante && <Td>{c.solicitante}</Td>}
                <Td>{c.atendente ?? <span className="text-zinc-400">—</span>}</Td>
                <Td>
                  <Badge variant={PRIORIDADE_BADGE[c.prioridade] ?? "default"}>
                    {c.prioridade.charAt(0).toUpperCase() + c.prioridade.slice(1)}
                  </Badge>
                </Td>
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
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                  </Link>
                </Td>
              </Tr>
            ))
          )}
        </TableBody>
      </Table>

      {isSolicitante && showSolicitarModal && (
        <Modal title="Solicitar Serviço" onClose={() => setShowSolicitarModal(false)}>
          <NovoChamadoForm servicos={servicos} />
        </Modal>
      )}
    </div>
  );
}

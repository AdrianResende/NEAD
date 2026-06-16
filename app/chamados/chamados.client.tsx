"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import {
  Button,
  Table,
  TableBody,
  TableEmpty,
  TableHead,
  Td,
  Th,
  Tr,
  StatusBadge,
  UrgentBadge,
} from "@/components/ui";
import { NovoChamadoForm, type ServicoOption } from "./novo/novo-form";
import { PAGINATION, ROUTES } from "@/lib/constants";
import { Modal } from "@/components/shared/modal";

type Chamado = {
  id: number;
  titulo: string;
  status: string;
  urgente: boolean;
  servico: string;
  solicitante: string;
  atendente: string | null;
  createdAt: string;
};

type Props = {
  chamados: Chamado[];
  role: string;
  servicos?: ServicoOption[];
  abrirModal?: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto",
  atribuido: "Atribuído",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
  fechado: "Fechado",
  cancelado: "Cancelado",
};

type TabKey = "todos" | "abertos" | "andamento" | "resolvidos";

const TAB_DEFS: { key: TabKey; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "abertos", label: "Abertos" },
  { key: "andamento", label: "Em andamento" },
  { key: "resolvidos", label: "Resolvidos" },
];

function inTab(status: string, tab: TabKey): boolean {
  if (tab === "todos") return true;
  if (tab === "abertos") return ["aberto", "atribuido"].includes(status);
  if (tab === "andamento") return status === "em_andamento";
  return ["resolvido", "fechado"].includes(status);
}

export function ChamadosClient({ chamados, role, servicos = [], abrirModal = false }: Props) {
  const isSolicitante = role === "solicitante";
  const [showSolicitarModal, setShowSolicitarModal] = useState(abrirModal);
  const [activeTab, setActiveTab] = useState<TabKey>("todos");
  const [paginaAtual, setPaginaAtual] = useState<number>(PAGINATION.DEFAULT_PAGE);

  const filteredChamados = useMemo(
    () => chamados.filter((c) => inTab(c.status, activeTab)),
    [chamados, activeTab],
  );

  const totalPaginas = Math.max(1, Math.ceil(filteredChamados.length / PAGINATION.DEFAULT_PER_PAGE));
  const paginaNormalizada = Math.min(paginaAtual, totalPaginas);
  const chamadosPaginados = useMemo(() => {
    const start = (paginaNormalizada - 1) * PAGINATION.DEFAULT_PER_PAGE;
    return filteredChamados.slice(start, start + PAGINATION.DEFAULT_PER_PAGE);
  }, [filteredChamados, paginaNormalizada]);

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    setPaginaAtual(1);
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-[18px]">
        <h1 className="mb-1 text-[25px] font-bold tracking-[-0.02em] text-[#1C1C1A]">
          {isSolicitante ? "Meus Chamados" : "Chamados"}
        </h1>
        <p className="text-[14px] text-[#86867D]">
          {isSolicitante
            ? `Acompanhe o status das suas solicitações · ${chamados.length} chamados`
            : `Fila operacional de atendimento · ${chamados.length} chamados`}
        </p>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {chamados.length === 0 ? (
          <div className="rounded-[14px] border border-[#E8E8E3] bg-white p-4 text-sm text-[#A8A89F] shadow-[0_1px_2px_rgba(28,28,26,0.03)]">
            {isSolicitante
              ? "Você ainda não solicitou nenhum serviço."
              : "Nenhuma solicitação encontrada."}
          </div>
        ) : (
          chamadosPaginados.map((c) => (
            <article
              key={c.id}
              className="rounded-[14px] border border-[#E8E8E3] bg-white p-4 shadow-[0_1px_2px_rgba(28,28,26,0.03)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-[#86867D]">#{c.id}</p>
                  <h3 className="truncate text-[13.5px] font-semibold text-[#1C1C1A]">{c.titulo}</h3>
                  <p className="mt-0.5 truncate text-[11.5px] text-[#A0A099]">{c.servico}</p>
                  {c.urgente && (
                    <div className="mt-2">
                      <UrgentBadge />
                    </div>
                  )}
                </div>
                <StatusBadge status={c.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#F0F0EC] pt-3 text-xs">
                {!isSolicitante && (
                  <div>
                    <p className="font-semibold text-[#A8A89F]">Solicitante</p>
                    <p className="mt-0.5 text-[#56564F]">{c.solicitante}</p>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-[#A8A89F]">Atendente</p>
                  <p className="mt-0.5 text-[#56564F]">{c.atendente ?? "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-[#A8A89F]">Aberto em</p>
                  <p className="mt-0.5 text-[#56564F]">
                    {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-end justify-end">
                  <Link href={`${ROUTES.CHAMADOS}/${c.id}`}>
                    <Button variant="ghost" size="sm" aria-label={`Ver chamado ${c.id}`}>
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden rounded-[14px] border border-[#E8E8E3] bg-white shadow-[0_1px_2px_rgba(28,28,26,0.03)] overflow-hidden md:block">
        {/* Tabs */}
        {!isSolicitante && (
          <div className="flex items-center gap-0 border-b border-[#ECECE7] px-[18px]">
            {TAB_DEFS.map((tab) => {
              const active = activeTab === tab.key;
              const count = chamados.filter((c) => inTab(c.status, tab.key)).length;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className="relative mr-6 border-none bg-none py-[13px] text-[14px] font-medium transition-colors"
                  style={{
                    color: active ? "var(--color-accent-ink)" : "#86867D",
                    fontWeight: active ? 600 : 500,
                    boxShadow: active ? "inset 0 -2px 0 var(--color-accent)" : "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  {tab.label}{" "}
                  <span
                    className="ml-[2px] rounded-[999px] px-[7px] py-[1px] text-[11.5px] font-semibold"
                    style={{
                      background: active ? "var(--color-accent-soft)" : "#F0F0EC",
                      color: active ? "var(--color-accent-ink)" : "#A0A099",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <Table>
          <TableHead>
            <tr>
              <Th>ID</Th>
              <Th>Assunto</Th>
              {!isSolicitante && <Th>Solicitante</Th>}
              <Th>Atendente</Th>
              <Th>Status</Th>
              <Th>Aberto em</Th>
              <Th className="text-right">Ação</Th>
            </tr>
          </TableHead>
          <TableBody>
            {filteredChamados.length === 0 ? (
              <TableEmpty
                colSpan={isSolicitante ? 5 : 6}
                message={
                  isSolicitante
                    ? "Você ainda não solicitou nenhum serviço."
                    : "Nenhuma solicitação encontrada."
                }
              />
            ) : (
              chamadosPaginados.map((c) => (
                <Tr key={c.id} clickable>
                  <Td mono>#{c.id}</Td>
                  <Td>
                    <div>
                      <p className="text-[13.5px] font-semibold text-[#1C1C1A]">{c.titulo}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11.5px] text-[#A0A099]">{c.servico}</p>
                        {c.urgente && <UrgentBadge />}
                      </div>
                    </div>
                  </Td>
                  {!isSolicitante && (
                    <Td>
                      <span className="text-[13px] text-[#56564F]">{c.solicitante}</span>
                    </Td>
                  )}
                  <Td>
                    <span className="text-[13px] text-[#56564F]">{c.atendente ?? <span className="text-[#B4B4AB]">—</span>}</span>
                  </Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td muted>
                    <span className="text-xs">
                      {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <Link href={`${ROUTES.CHAMADOS}/${c.id}`}>
                      <Button variant="ghost" size="sm" aria-label={`Ver chamado ${c.id}`}>
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

        <div className="flex items-center justify-between px-[18px] py-[13px]">
          <span className="text-[12.5px] text-[#A0A099]">
            Mostrando {chamadosPaginados.length} de {filteredChamados.length} chamados
          </span>
          {totalPaginas > 1 && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={paginaNormalizada <= 1}
                onClick={() => setPaginaAtual((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={paginaNormalizada >= totalPaginas}
                onClick={() => setPaginaAtual((p) => p + 1)}
              >
                Próximo
              </Button>
            </div>
          )}
        </div>
      </div>

      {showSolicitarModal && (
        <Modal
          title={isSolicitante ? "Solicitar Serviço" : "Novo Chamado"}
          description="Preencha as informações para abrir um chamado."
          size="lg"
          onClose={() => setShowSolicitarModal(false)}
        >
          <NovoChamadoForm servicos={servicos} />
        </Modal>
      )}
    </div>
  );
}

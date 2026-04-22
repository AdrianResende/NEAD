"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Badge, Button, Field, Form, Select } from "@/components/ui";
import { atualizarChamadoAction } from "./actions";
import { ROUTES } from "@/lib/constants";

type Chamado = {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  createdAt: string;
  updatedAt: string;
  servico: { nome: string; setor: string };
  solicitante: { nome: string; email: string };
  atendente: { id: number; nome: string } | null;
};

type Atendente = { id: number; nome: string };

type Props = {
  chamado: Chamado;
  currentUserRole: string;
  atendentes: Atendente[];
};

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

const STATUS_OPTIONS_ATENDENTE = [
  { value: "aberto", label: "Aberto" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "resolvido", label: "Resolvido" },
  { value: "fechado", label: "Fechado" },
  { value: "cancelado", label: "Cancelado" },
];

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
      <span className="w-32 shrink-0 text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm text-zinc-900 dark:text-zinc-100">{children}</span>
    </div>
  );
}

function AtendimentoForm({
  chamado,
  atendentes,
  role,
}: {
  chamado: Chamado;
  atendentes: Atendente[];
  role: string;
}) {
  const [state, action, pending] = useActionState(atualizarChamadoAction, {});

  const atendenteOptions = [
    { value: "", label: "Sem atendente" },
    ...atendentes.map((a) => ({ value: String(a.id), label: a.nome })),
  ];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">Atendimento</h2>

      {state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
          Chamado atualizado com sucesso.
        </div>
      )}

      <Form action={action}>
        <input type="hidden" name="id" value={chamado.id} />

        <Field label="Status" htmlFor="status">
          <Select
            id="status"
            name="status"
            options={STATUS_OPTIONS_ATENDENTE}
            defaultValue={chamado.status}
          />
        </Field>

        {role === "admin" && (
          <Field label="Atendente" htmlFor="atendente_id">
            <Select
              id="atendente_id"
              name="atendente_id"
              options={atendenteOptions}
              defaultValue={chamado.atendente ? String(chamado.atendente.id) : ""}
            />
          </Field>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </Form>
    </div>
  );
}

function CancelarForm({ chamadoId }: { chamadoId: number }) {
  const [state, action, pending] = useActionState(atualizarChamadoAction, {});

  return (
    <Form action={action}>
      <input type="hidden" name="id" value={chamadoId} />
      <input type="hidden" name="status" value="cancelado" />
      {state.error && (
        <p className="mb-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Cancelando..." : "Cancelar Chamado"}
      </Button>
    </Form>
  );
}

export function ChamadoDetalheClient({ chamado, currentUserRole, atendentes }: Props) {
  const isSolicitante = currentUserRole === "solicitante";
  const isAtendente = currentUserRole === "atendente";
  const isAdmin = currentUserRole === "admin";
  const canAtend = isAdmin || isAtendente;
  const canCancel = isSolicitante && ["aberto"].includes(chamado.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={ROUTES.CHAMADOS}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Voltar para chamados
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            #{chamado.id} — {chamado.titulo}
          </h1>
          <Badge variant={STATUS_BADGE[chamado.status] ?? "default"}>
            {STATUS_LABEL[chamado.status] ?? chamado.status}
          </Badge>
          <Badge variant={PRIORIDADE_BADGE[chamado.prioridade] ?? "default"}>
            {chamado.prioridade.charAt(0).toUpperCase() + chamado.prioridade.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Detalhes */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">Detalhes</h2>
            <div className="space-y-3">
              <InfoRow label="Serviço">{chamado.servico.nome}</InfoRow>
              <InfoRow label="Setor">{chamado.servico.setor}</InfoRow>
              <InfoRow label="Solicitante">{chamado.solicitante.nome}</InfoRow>
              <InfoRow label="Atendente">{chamado.atendente?.nome ?? "Não atribuído"}</InfoRow>
              <InfoRow label="Aberto em">
                {new Date(chamado.createdAt).toLocaleString("pt-BR")}
              </InfoRow>
              <InfoRow label="Atualizado em">
                {new Date(chamado.updatedAt).toLocaleString("pt-BR")}
              </InfoRow>
            </div>
          </div>

          {/* Descrição */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">Descrição</h2>
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {chamado.descricao}
            </p>
          </div>
        </div>

        {/* Painel lateral */}
        <div className="space-y-4">
          {canAtend && (
            <AtendimentoForm chamado={chamado} atendentes={atendentes} role={currentUserRole} />
          )}
          {canCancel && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">Ações</h2>
              <CancelarForm chamadoId={chamado.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

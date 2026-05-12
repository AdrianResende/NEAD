"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Badge, Button, Field, Form, Input, Select } from "@/components/ui";
import { atualizarChamadoAction, enviarMensagemChamadoAction } from "./actions";
import { ROUTES } from "@/lib/constants";

type Chamado = {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  servico: { nome: string; setor: string };
  solicitante: { nome: string; email: string };
  anexos: Array<{
    id: number;
    nomeOriginal: string;
    url: string;
    mimeType: string;
    tamanhoBytes: number;
  }>;
  mensagens: Array<{
    id: number;
    mensagem: string;
    createdAt: string;
    autor: { id: number; nome: string; role: string };
  }>;
  atendente: { id: number; nome: string } | null;
};

type Atendente = { id: number; nome: string };

type Props = {
  chamado: Chamado;
  currentUserId: number;
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
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
          <Field label="Atendente" htmlFor="atendente_id" hint="Você pode trocar o atendente deste chamado a qualquer momento.">
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

function MensagensPanel({
  chamado,
  currentUserId,
}: {
  chamado: Chamado;
  currentUserId: number;
}) {
  const [state, action, pending] = useActionState(enviarMensagemChamadoAction, {});

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">Histórico de mensagens</h2>

      <div className="mb-4 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        {chamado.mensagens.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhuma mensagem ainda.</p>
        ) : (
          chamado.mensagens.map((msg) => {
            const isMine = msg.autor.id === currentUserId;
            return (
              <div
                key={msg.id}
                className={isMine ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    isMine
                      ? "max-w-[90%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-white"
                      : "max-w-[90%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  }
                >
                  <div className="flex items-center gap-2">
                    <p className={isMine ? "text-xs font-semibold text-white/90" : "text-xs font-semibold text-zinc-500 dark:text-zinc-400"}>
                      {msg.autor.nome}
                    </p>
                    <p className={isMine ? "text-[11px] text-white/80" : "text-[11px] text-zinc-500 dark:text-zinc-400"}>
                      {new Date(msg.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{msg.mensagem}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {state.error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
          Mensagem enviada.
        </div>
      )}

      <Form action={action} className="gap-3">
        <input type="hidden" name="chamado_id" value={chamado.id} />
        <Field label="Nova mensagem" htmlFor="mensagem">
          <Input id="mensagem" name="mensagem" placeholder="Escreva uma mensagem para o histórico..." maxLength={2000} />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Enviando..." : "Enviar mensagem"}
        </Button>
      </Form>
    </div>
  );
}

export function ChamadoDetalheClient({ chamado, currentUserId, currentUserRole, atendentes }: Props) {
  const isSolicitante = currentUserRole === "solicitante";
  const isAtendente = currentUserRole === "atendente";
  const isAdmin = currentUserRole === "admin";
  const canAtend = isAdmin || isAtendente;
  const canCancel = isSolicitante && ["aberto"].includes(chamado.status);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={ROUTES.CHAMADOS}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/15 dark:border-primary/30"
        >
          <span aria-hidden="true">←</span>
          <span>Voltar para chamados</span>
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            #{chamado.id} — {chamado.titulo}
          </h1>
          <Badge variant={STATUS_BADGE[chamado.status] ?? "default"}>
            {STATUS_LABEL[chamado.status] ?? chamado.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
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

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">Anexos</h2>
            {chamado.anexos.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum anexo enviado.</p>
            ) : (
              <ul className="space-y-2">
                {chamado.anexos.map((anexo) => (
                  <li key={anexo.id} className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{anexo.nomeOriginal}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {anexo.mimeType} • {formatFileSize(anexo.tamanhoBytes)}
                      </p>
                    </div>
                    <a
                      href={anexo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Abrir
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Painel lateral */}
        <div className="space-y-4 lg:col-span-2">
          {canAtend && (
            <AtendimentoForm chamado={chamado} atendentes={atendentes} role={currentUserRole} />
          )}
          <MensagensPanel chamado={chamado} currentUserId={currentUserId} />
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

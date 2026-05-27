"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Clock3,
  Download,
  FileText,
  LifeBuoy,
  MessageSquareText,
  SendHorizonal,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Workflow,
} from "lucide-react";
import { Badge, Button, Field, Form, Select, Textarea } from "@/components/ui";
import { atualizarChamadoAction, enviarMensagemChamadoAction } from "./actions";
import { ROUTES } from "@/lib/constants";
import { notifyError, notifySuccess } from "@/lib/toast";

type Chamado = {
  id: number;
  titulo: string;
  descricao: string;
  urgente: boolean;
  urgenciaDescricao: string | null;
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
  historicoStatus: Array<{
    id: number;
    deStatus: string;
    paraStatus: string;
    createdAt: string;
    autorNome: string;
    observacao: string | null;
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

const STATUS_OPTIONS_ATENDENTE = [
  { value: "aberto", label: "Aberto" },
  { value: "atribuido", label: "Atribuído" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "resolvido", label: "Resolvido" },
];

const STATUS_OPTIONS_SOLICITANTE = [
  { value: "cancelado", label: "Cancelar chamado" },
  { value: "fechado", label: "Fechar chamado" },
  { value: "aberto", label: "Reabrir chamado" },
];

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  aberto: CircleAlert,
  atribuido: UserCheck,
  em_andamento: Clock3,
  resolvido: CheckCircle2,
  fechado: ShieldCheck,
  cancelado: CircleDashed,
};

function SurfaceCard({
  title,
  subtitle,
  icon,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-zinc-100/60 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-900 sm:p-6 ${className ?? ""}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>
        {icon && (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            {icon}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function formatDateTime(dateIso: string) {
  return new Date(dateIso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function AcoesSolicitanteForm({ chamadoId }: { chamadoId: number }) {
  const [state, action, pending] = useActionState(atualizarChamadoAction, {});

  useEffect(() => {
    if (state.error) {
      notifyError(state.error);
    }
    if (state.success) {
      notifySuccess("Ação executada com sucesso.");
    }
  }, [state.error, state.success]);

  return (
    <SurfaceCard
      title="Ações do solicitante"
      subtitle="Cancelar, fechar ou reabrir o chamado"
      icon={<Workflow className="h-4 w-4" />}
    >
      <Form action={action} className="gap-3">
        <input type="hidden" name="id" value={chamadoId} />
        <Field label="Escolha a ação" htmlFor="status">
          <Select id="status" name="status" options={STATUS_OPTIONS_SOLICITANTE} placeholder="Selecione uma ação" />
        </Field>
        <Button type="submit" variant="outline" disabled={pending} title="Executar ação selecionada">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {pending ? "Processando..." : "Executar ação"}
        </Button>
      </Form>
    </SurfaceCard>
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

  useEffect(() => {
    if (state.error) {
      notifyError(state.error);
    }
    if (state.success) {
      notifySuccess("Mensagem enviada.");
    }
  }, [state.error, state.success]);

  return (
    <SurfaceCard
      title="Conversa do chamado"
      subtitle="Centralize alinhamentos entre solicitante e equipe"
      icon={<MessageSquareText className="h-4 w-4" />}
      className="h-full"
    >
      <div className="mb-4 max-h-[28rem] space-y-3 overflow-y-auto rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-4">
        {chamado.mensagens.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            Nenhuma mensagem ainda. Inicie a conversa com contexto objetivo para agilizar o atendimento.
          </div>
        ) : (
          chamado.mensagens.map((msg) => {
            const isMine = msg.autor.id === currentUserId;
            return (
              <div key={msg.id} className={isMine ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    isMine
                      ? "max-w-[92%] rounded-2xl rounded-br-md bg-primary px-3.5 py-3 text-white shadow-sm sm:max-w-[78%]"
                      : "max-w-[92%] rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-3.5 py-3 text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 sm:max-w-[78%]"
                  }
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className={isMine ? "text-xs font-semibold text-white/90" : "text-xs font-semibold text-zinc-500 dark:text-zinc-400"}>
                      {msg.autor.nome}
                    </p>
                    <p className={isMine ? "text-[11px] text-white/80" : "text-[11px] text-zinc-500 dark:text-zinc-400"}>
                      {formatDateTime(msg.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{msg.mensagem}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Form action={action} className="gap-3">
        <input type="hidden" name="chamado_id" value={chamado.id} />
        <Field label="Nova mensagem" htmlFor="mensagem">
          <Textarea
            id="mensagem"
            name="mensagem"
            placeholder="Compartilhe atualização, decisão técnica, pedido de validação ou retorno ao solicitante..."
            maxLength={2000}
            rows={3}
          />
        </Field>
        <Button type="submit" disabled={pending} title="Enviar mensagem">
          <SendHorizonal className="h-4 w-4" aria-hidden="true" />
          {pending ? "Enviando..." : "Enviar mensagem"}
        </Button>
      </Form>
    </SurfaceCard>
  );
}

function HistoricoStatusPanel({ chamado }: { chamado: Chamado }) {
  return (
    <SurfaceCard
      title="Timeline de status"
      subtitle="Evolução do ticket ao longo do atendimento"
      icon={<CalendarClock className="h-4 w-4" />}
    >
      {chamado.historicoStatus.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhuma mudança de status registrada.</p>
      ) : (
        <ol className="space-y-3">
          {chamado.historicoStatus.map((item, index) => {
            const ToIcon = STATUS_ICON[item.paraStatus] ?? CircleDashed;
            return (
              <li
                key={item.id}
                className="relative rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-4"
              >
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                      <ToIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="default">{STATUS_LABEL[item.deStatus] ?? item.deStatus}</Badge>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">→</span>
                        <Badge variant={STATUS_BADGE[item.paraStatus] ?? "default"}>
                          {STATUS_LABEL[item.paraStatus] ?? item.paraStatus}
                        </Badge>
                      </div>
                      {item.observacao && (
                        <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{item.observacao}</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1.5 text-right dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="text-[11px] font-medium text-zinc-700 dark:text-zinc-200">{item.autorNome}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{formatDateTime(item.createdAt)}</p>
                  </div>
                </div>
                {index < chamado.historicoStatus.length - 1 && (
                  <span
                    className="pointer-events-none absolute left-[1.08rem] top-[2.6rem] h-4 w-px bg-zinc-300/70 dark:bg-zinc-700"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </SurfaceCard>
  );
}

export function ChamadoDetalheClient({ chamado, currentUserId, currentUserRole, atendentes }: Props) {
  const router = useRouter();
  const isSolicitante = currentUserRole === "solicitante";
  const isAtendente = currentUserRole === "atendente";
  const isAdmin = currentUserRole === "admin";
  const canAtend = isAdmin || isAtendente;
  const canSolicitanteAction = isSolicitante;
  const StatusIcon = STATUS_ICON[chamado.status] ?? CircleDashed;
  const [atendimentoState, atendimentoAction, atendimentoPending] = useActionState(atualizarChamadoAction, {});
  const [urgenteAtendimento, setUrgenteAtendimento] = useState<"sim" | "nao">(chamado.urgente ? "sim" : "nao");
  const [motivoAtendimento, setMotivoAtendimento] = useState(chamado.urgenciaDescricao ?? "");
  const urgenciaJaRegistrada = Boolean(chamado.urgenciaDescricao?.trim());

  const atendenteOptions = [
    { value: "", label: "Sem atendente" },
    ...atendentes.map((a) => ({ value: String(a.id), label: a.nome })),
  ];

  useEffect(() => {
    if (atendimentoState.error) {
      notifyError(atendimentoState.error);
    }
  }, [atendimentoState]);

  useEffect(() => {
    if (!atendimentoState.success) return;
    notifySuccess("Chamado atualizado com sucesso.");
    router.refresh();
  }, [atendimentoState, router]);

  return (
    <div className="relative w-full px-4 py-8 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-zinc-100/80 to-transparent dark:from-zinc-900/40"
        aria-hidden="true"
      />

      <div className="mb-6 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm ring-1 ring-zinc-100/60 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-900 sm:p-5">
        <Link
          href={ROUTES.CHAMADOS}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          title="Voltar para chamados"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Voltar</span>
        </Link>

        <div className="mt-2 grid gap-4 sm:gap-5">
          {/* Linha 1: Título e Status */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  <LifeBuoy className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Chamado #{chamado.id}</span>
                <Badge variant={chamado.urgente ? "danger" : "default"}>
                  {chamado.urgente ? "Urgente" : "Não urgente"}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{chamado.titulo}</h1>
            </div>

            <div className="grid w-full max-w-md gap-2 self-start rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 sm:w-auto">
              {canAtend && (
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={atendimentoPending}
                    title="Salvar alterações do atendimento"
                    className="h-9 rounded-lg border border-primary/20 bg-primary px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
                    form="atendimento-form"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {atendimentoPending ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              )}
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Datas</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">Criado: {formatDateTime(chamado.createdAt)}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">Atualizado: {formatDateTime(chamado.updatedAt)}</p>
            </div>
          </div>

          {/* Linha 2: Informações principais */}
          {canAtend ? (
            <Form action={atendimentoAction} className="gap-3" id="atendimento-form">
              <input type="hidden" name="id" value={chamado.id} />

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Solicitante</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 shrink-0 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">{chamado.solicitante.nome}</p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{chamado.solicitante.email}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Serviço</p>
                  <p className="mt-1 text-xs font-semibold text-zinc-900 dark:text-zinc-50">{chamado.servico.nome}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{chamado.servico.setor}</p>
                </div>

                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Status</p>
                  <div className="mt-1">
                    <Select id="status" name="status" options={STATUS_OPTIONS_ATENDENTE} defaultValue={chamado.status} />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Atendente</p>
                  <div className="mt-1">
                    {isAdmin ? (
                      <Select
                        id="atendente_id"
                        name="atendente_id"
                        options={atendenteOptions}
                        defaultValue={chamado.atendente ? String(chamado.atendente.id) : ""}
                      />
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 dark:border-zinc-700 dark:bg-zinc-950">
                        <UserCheck className="h-3.5 w-3.5 shrink-0 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
                        <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">{chamado.atendente?.nome ?? "Não atribuído"}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Prioridade</p>
                  <div className="mt-1">
                    <Select
                      id="urgente_atendimento"
                      name="urgente_atendimento"
                      options={[
                        { value: "nao", label: "Não urgente" },
                        { value: "sim", label: "Urgente" },
                      ]}
                      value={urgenteAtendimento}
                      disabled={urgenciaJaRegistrada}
                      onChange={(event) => {
                        const value = event.target.value as "sim" | "nao";
                        setUrgenteAtendimento(value);
                        if (value === "nao") {
                          setMotivoAtendimento("");
                        }
                      }}
                    />
                  </div>
                  {urgenciaJaRegistrada && (
                    <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                      Prioridade travada após registro da justificativa.
                    </p>
                  )}
                </div>
              </div>

              {!urgenciaJaRegistrada && (
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <Field
                    label={urgenteAtendimento === "sim" ? "Motivo da urgência" : "Motivo da alteração (opcional)"}
                    htmlFor="urgencia_descricao_atendimento"
                    required={urgenteAtendimento === "sim"}
                  >
                    <Textarea
                      id="urgencia_descricao_atendimento"
                      name="urgencia_descricao_atendimento"
                      rows={3}
                      maxLength={800}
                      required={urgenteAtendimento === "sim"}
                      value={motivoAtendimento}
                      onChange={(event) => setMotivoAtendimento(event.target.value)}
                      placeholder={
                        urgenteAtendimento === "sim"
                          ? "Descreva o impacto e por que este chamado precisa de prioridade..."
                          : "Se desejar, informe por que a prioridade foi alterada..."
                      }
                    />
                  </Field>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Ao salvar, essa atualização de prioridade será registrada automaticamente no chat do chamado.
                  </p>
                </div>
              )}
            </Form>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Solicitante</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">{chamado.solicitante.nome}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{chamado.solicitante.email}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Serviço</p>
                <p className="mt-1 text-xs font-semibold text-zinc-900 dark:text-zinc-50">{chamado.servico.nome}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{chamado.servico.setor}</p>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Status</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <StatusIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden="true" />
                  <Badge variant={STATUS_BADGE[chamado.status] ?? "default"}>
                    {STATUS_LABEL[chamado.status] ?? chamado.status}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Atendente</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 shrink-0 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
                  <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">{chamado.atendente?.nome ?? "Não atribuído"}</p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Prioridade</p>
                <div className="mt-1">
                  <Badge variant={chamado.urgente ? "danger" : "default"}>
                    {chamado.urgente ? "Urgente" : "Não urgente"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <main className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:items-start">
            <MensagensPanel chamado={chamado} currentUserId={currentUserId} />
            <div className="space-y-6 lg:self-start">
              <SurfaceCard
                title="Descrição"
                subtitle="Contexto inicial informado na abertura do chamado"
                icon={<FileText className="h-4 w-4" />}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{chamado.descricao}</p>
              </SurfaceCard>

              <SurfaceCard
                title="Anexos"
                subtitle="Arquivos compartilhados para apoiar análise e resolução"
                icon={<Download className="h-4 w-4" />}
              >
                {chamado.anexos.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
                    Nenhum anexo enviado até o momento.
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {chamado.anexos.map((anexo) => (
                      <li
                        key={anexo.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/70 px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-900/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{anexo.nomeOriginal}</p>
                          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                            {anexo.mimeType} • {formatFileSize(anexo.tamanhoBytes)}
                          </p>
                        </div>
                        <a
                          href={anexo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          Abrir
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </SurfaceCard>
            </div>
          </div>

          <HistoricoStatusPanel chamado={chamado} />
        </main>

        <aside className="space-y-4">
          {canSolicitanteAction && <AcoesSolicitanteForm chamadoId={chamado.id} />}

          {!canAtend && !canSolicitanteAction && (
            <SurfaceCard
              title="Sem ações pendentes"
              subtitle="Use a conversa para acompanhar atualizações deste chamado"
              icon={<CheckCircle2 className="h-4 w-4" />}
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                O fluxo operacional deste ticket está sob responsabilidade do time de atendimento.
              </p>
            </SurfaceCard>
          )}
        </aside>
      </div>
    </div>
  );
}

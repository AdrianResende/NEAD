"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import { Badge, StatusBadge, UrgentBadge, Button, Field, Form, Select, Textarea } from "@/components/ui";
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
      className={`rounded-[14px] border border-[#E8E8E3] bg-white p-5 shadow-[0_1px_2px_rgba(28,28,26,0.03)] sm:p-6 ${className ?? ""}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15.5px] font-bold tracking-tight text-[#1C1C1A]">{title}</h2>
          {subtitle && <p className="mt-1 text-[13px] text-[#86867D]">{subtitle}</p>}
        </div>
        {icon && (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#E8E8E3] bg-[#FAFAF8] text-[#86867D]">
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

function isMensagemSistemaPrioridade(mensagem: string) {
  return mensagem.startsWith("Prioridade atualizada para ");
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
  const mensagensContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (state.error) {
      notifyError(state.error);
    }
    if (state.success) {
      notifySuccess("Mensagem enviada.");
    }
  }, [state.error, state.success]);

  useEffect(() => {
    const container = mensagensContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [chamado.mensagens.length]);

  return (
    <SurfaceCard
      title="Conversa do chamado"
      subtitle="Centralize alinhamentos entre solicitante e equipe"
      icon={<MessageSquareText className="h-4 w-4" />}
      className="h-full"
    >
      <div
        ref={mensagensContainerRef}
        className="mb-4 max-h-[28rem] space-y-3 overflow-y-auto rounded-[11px] border border-[#ECECE7] bg-[#FAFAF9] p-3.5 sm:p-4"
      >
        {chamado.mensagens.length === 0 ? (
          <div className="rounded-[9px] border border-dashed border-[#D9D9D3] bg-white px-4 py-6 text-center text-[13.5px] text-[#A8A89F]">
            Nenhuma mensagem ainda. Inicie a conversa com contexto objetivo para agilizar o atendimento.
          </div>
        ) : (
          chamado.mensagens.map((msg) => {
            const isMensagemSistema = isMensagemSistemaPrioridade(msg.mensagem);
            const isMine = msg.autor.id === currentUserId;

            if (isMensagemSistema) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="w-full max-w-[98%] rounded-xl border border-amber-300/80 bg-amber-50/90 px-3.5 py-3 text-amber-900 shadow-sm dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-100 sm:max-w-[92%]">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="inline-flex items-center rounded-md border border-amber-400/70 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:border-amber-700 dark:bg-amber-900/70 dark:text-amber-200">
                        Atualização automática
                      </span>
                      <p className="text-[11px] text-amber-800/90 dark:text-amber-200/90">{msg.autor.nome}</p>
                      <p className="text-[11px] text-amber-800/80 dark:text-amber-200/80">{formatDateTime(msg.createdAt)}</p>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.mensagem}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={isMine ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    isMine
                      ? "max-w-[90%] rounded-[13px] rounded-br-[4px] px-3.5 py-3 sm:max-w-[84%]"
                      : "max-w-[90%] rounded-[4px] rounded-br-[13px] rounded-tl-[13px] rounded-tr-[13px] border border-[#ECECE7] bg-white px-3.5 py-3 sm:max-w-[84%]"
                  }
                  style={isMine ? { background: "var(--color-accent-soft)", color: "#274A47" } : {}}
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className={isMine ? "text-[13px] font-semibold text-[#1C1C1A]" : "text-[13px] font-semibold text-[#1C1C1A]"}>
                      {msg.autor.nome}
                    </p>
                    <p className="text-[11px] text-[#B4B4AB]">
                      {formatDateTime(msg.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-[#36362F]">{msg.mensagem}</p>
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
        <Field label="Anexo (opcional)" htmlFor="mensagem-anexo">
          <input
            id="mensagem-anexo"
            name="anexo"
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
            className="block w-full cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition-colors file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 focus:ring-2 focus:ring-[color:var(--color-primary-ring)] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-200 dark:hover:file:bg-zinc-700"
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
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {chamado.historicoStatus.map((item, index) => {
            return (
              <li
                key={item.id}
                className="relative rounded-[9px] border border-[#E8E8E3] bg-[#FAFAF8] p-2.5"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {index === 0 ? (
                          <>
                            <StatusBadge status={item.deStatus} />
                            <span className="text-xs text-[#A8A89F]">→</span>
                            <StatusBadge status={item.paraStatus} />
                          </>
                        ) : (
                          <StatusBadge status={item.paraStatus} />
                        )}
                      </div>
                    </div>

                    <div className="w-fit rounded-[7px] border border-[#ECECE7] bg-white px-1.5 py-1 text-right">
                      <p className="text-[10px] font-medium leading-tight text-[#56564F]">{item.autorNome}</p>
                      <p className="mt-0.5 whitespace-nowrap text-[10px] leading-tight text-[#A8A89F]">{formatDateTime(item.createdAt)}</p>
                    </div>
                  </div>

                  {item.observacao && (
                    <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">{item.observacao}</p>
                  )}
                </div>
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
  const exibirCampoMotivo = urgenteAtendimento === "sim";

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
    <div className="relative w-full">
      <div className="mb-6 rounded-[14px] border border-[#E8E8E3] bg-white p-5 shadow-[0_1px_2px_rgba(28,28,26,0.03)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={ROUTES.CHAMADOS}
                className="inline-flex items-center gap-2 rounded-[9px] border border-[#E4E4DE] bg-white px-3 py-2 text-[13px] font-medium text-[#56564F] hover:bg-[#F4F4F1]"
                title="Voltar para chamados"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Voltar</span>
              </Link>
              <span className="font-mono text-[13px] text-[#56564F]">#{chamado.id}</span>
              {chamado.urgente && <UrgentBadge />}
            </div>

            <h1 className="max-w-3xl text-[23px] font-bold tracking-[-0.02em] text-[#1C1C1A]">
              {chamado.titulo}
            </h1>
          </div>

          <div className="w-full rounded-[11px] border border-[#E8E8E3] bg-[#FAFAF8] px-3 py-3 lg:max-w-sm">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A8A89F]">Datas</p>
                <div className="mt-1.5 grid gap-1.5 text-[12px] text-[#56564F]">
                  <p>Criado: {formatDateTime(chamado.createdAt)}</p>
                  <p>Atualizado: {formatDateTime(chamado.updatedAt)}</p>
                  <div className="flex items-center gap-1.5">
                    <span>Status:</span>
                    <StatusBadge status={chamado.status} />
                  </div>
                </div>
              </div>

              {canAtend && (
                <div className="sm:shrink-0 sm:pt-4">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={atendimentoPending}
                    title="Salvar alterações do atendimento"
                    form="atendimento-form"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {atendimentoPending ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="my-4 h-px bg-zinc-200/80 dark:bg-zinc-800" />

        <div className="grid gap-4 sm:gap-5">

          {/* Linha 2: Informações principais */}
          {canAtend ? (
            <Form action={atendimentoAction} className="gap-3" id="atendimento-form">
              <input type="hidden" name="id" value={chamado.id} />

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
                <div className="rounded-[9px] border border-[#E8E8E3] bg-[#FAFAF8] p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A8A89F]">Solicitante</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 shrink-0 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#1C1C1A]">{chamado.solicitante.nome}</p>
                      <p className="truncate text-xs text-[#86867D]">{chamado.solicitante.email}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[9px] border border-[#E8E8E3] bg-[#FAFAF8] p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A8A89F]">Serviço</p>
                  <p className="mt-1 text-xs font-semibold text-zinc-900 dark:text-zinc-50">{chamado.servico.nome}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{chamado.servico.setor}</p>
                </div>

                <div className="rounded-[9px] border border-[#E8E8E3] bg-[#FAFAF8] p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A8A89F]">Status</p>
                  <div className="mt-1">
                    <Select id="status" name="status" options={STATUS_OPTIONS_ATENDENTE} defaultValue={chamado.status} />
                  </div>
                </div>

                <div className="rounded-[9px] border border-[#E8E8E3] bg-[#FAFAF8] p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A8A89F]">Atendente</p>
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

                <div className="rounded-[9px] border border-[#E8E8E3] bg-[#FAFAF8] p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A8A89F]">Prioridade</p>
                  <div className="mt-1">
                    <Select
                      id="urgente_atendimento"
                      name="urgente_atendimento"
                      options={[
                        { value: "nao", label: "Não urgente" },
                        { value: "sim", label: "Urgente" },
                      ]}
                      value={urgenteAtendimento}
                      onChange={(event) => {
                        const value = event.target.value as "sim" | "nao";
                        setUrgenteAtendimento(value);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  exibirCampoMotivo ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
                aria-hidden={!exibirCampoMotivo}
              >
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <Field
                    label="Motivo da urgência"
                    htmlFor="urgencia_descricao_atendimento"
                    required
                  >
                    <Textarea
                      id="urgencia_descricao_atendimento"
                      name="urgencia_descricao_atendimento"
                      rows={3}
                      maxLength={800}
                      required={exibirCampoMotivo}
                      disabled={!exibirCampoMotivo}
                      value={motivoAtendimento}
                      onChange={(event) => setMotivoAtendimento(event.target.value)}
                      placeholder="Descreva o impacto e por que este chamado precisa de prioridade..."
                    />
                  </Field>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Ao salvar, essa atualização de prioridade será registrada automaticamente no chat do chamado.
                  </p>
                </div>
              </div>
            </Form>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
              <div className="rounded-[9px] border border-[#E8E8E3] bg-[#FAFAF8] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A8A89F]">Solicitante</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#1C1C1A]">{chamado.solicitante.nome}</p>
                    <p className="truncate text-xs text-[#86867D]">{chamado.solicitante.email}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[9px] border border-[#E8E8E3] bg-[#FAFAF8] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A8A89F]">Serviço</p>
                <p className="mt-1 text-xs font-semibold text-zinc-900 dark:text-zinc-50">{chamado.servico.nome}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{chamado.servico.setor}</p>
              </div>

              <div className="rounded-[9px] border border-[#E8E8E3] bg-[#FAFAF8] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A8A89F]">Status</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <StatusBadge status={chamado.status} />
                </div>
              </div>

              <div className="rounded-[9px] border border-[#E8E8E3] bg-[#FAFAF8] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A8A89F]">Atendente</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 shrink-0 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
                  <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">{chamado.atendente?.nome ?? "Não atribuído"}</p>
                </div>
              </div>

              <div className="rounded-[9px] border border-[#E8E8E3] bg-[#FAFAF8] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A8A89F]">Prioridade</p>
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
          <SurfaceCard
            title="Descrição"
            subtitle="Contexto inicial informado na abertura do chamado"
            icon={<FileText className="h-4 w-4" />}
          >
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{chamado.descricao}</p>
          </SurfaceCard>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:items-start">
            <MensagensPanel chamado={chamado} currentUserId={currentUserId} />
            <div className="space-y-6 lg:self-start">
              <SurfaceCard
                title="Documentos e prints de apoio"
                subtitle="Materiais enviados para auxiliar o atendimento do chamado"
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

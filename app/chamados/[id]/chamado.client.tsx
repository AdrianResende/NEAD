"use client";

import { useActionState } from "react";
import Link from "next/link";
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
  MessageCircle,
  MessageSquareText,
  SendHorizonal,
  Settings2,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Workflow,
} from "lucide-react";
import { Badge, Button, Field, Form, Select, Textarea } from "@/components/ui";
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
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-zinc-100/60 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-900 sm:p-6">
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

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/70 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
      {icon && <span className="mt-0.5 text-zinc-500 dark:text-zinc-400">{icon}</span>}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-zinc-900 dark:text-zinc-100">{value}</p>
      </div>
    </div>
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
    <SurfaceCard
      title="Atendimento"
      subtitle="Atualize status e responsável do chamado"
      icon={<Settings2 className="h-4 w-4" />}
    >
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
          <Select id="status" name="status" options={STATUS_OPTIONS_ATENDENTE} defaultValue={chamado.status} />
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
          <CheckCircle2 className="h-4 w-4" title="Salvar alterações" aria-hidden="true" />
          {pending ? "Salvando..." : "Salvar mudanças"}
        </Button>
      </Form>
    </SurfaceCard>
  );
}

function AcoesSolicitanteForm({ chamadoId }: { chamadoId: number }) {
  const [state, action, pending] = useActionState(atualizarChamadoAction, {});

  return (
    <SurfaceCard
      title="Ações do solicitante"
      subtitle="Disponível quando o chamado estiver resolvido"
      icon={<Workflow className="h-4 w-4" />}
    >
      <Form action={action} className="gap-3">
        <input type="hidden" name="id" value={chamadoId} />
        <Field label="Escolha a ação" htmlFor="status">
          <Select id="status" name="status" options={STATUS_OPTIONS_SOLICITANTE} placeholder="Selecione uma ação" />
        </Field>
        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
        <Button type="submit" variant="outline" disabled={pending}>
          <Sparkles className="h-4 w-4" title="Executar ação" aria-hidden="true" />
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

  return (
    <SurfaceCard
      title="Conversa do chamado"
      subtitle="Centralize alinhamentos entre solicitante e equipe"
      icon={<MessageSquareText className="h-4 w-4" />}
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
          <Textarea
            id="mensagem"
            name="mensagem"
            placeholder="Compartilhe atualização, decisão técnica, pedido de validação ou retorno ao solicitante..."
            maxLength={2000}
            rows={3}
          />
        </Field>
        <Button type="submit" disabled={pending}>
          <SendHorizonal className="h-4 w-4" title="Enviar mensagem" aria-hidden="true" />
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
                className="relative rounded-xl border border-zinc-200/80 bg-zinc-50/60 px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-4"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                    <ToIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      {STATUS_LABEL[item.deStatus] ?? item.deStatus} {"→"} {STATUS_LABEL[item.paraStatus] ?? item.paraStatus}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.autorNome} em {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                </div>
                {item.observacao && (
                  <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{item.observacao}</p>
                )}
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
  const isSolicitante = currentUserRole === "solicitante";
  const isAtendente = currentUserRole === "atendente";
  const isAdmin = currentUserRole === "admin";
  const canAtend = isAdmin || isAtendente;
  const canSolicitanteAction = isSolicitante && chamado.status === "resolvido";
  const StatusIcon = STATUS_ICON[chamado.status] ?? CircleDashed;

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-zinc-100/80 to-transparent dark:from-zinc-900/40"
        aria-hidden="true"
      />

      <div className="mb-6 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm ring-1 ring-zinc-100/60 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-900 sm:p-5">
        <Link
          href={ROUTES.CHAMADOS}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" title="Voltar para chamados" aria-hidden="true" />
          <span>Voltar para chamados</span>
        </Link>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Chamado #{chamado.id}</p>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{chamado.titulo}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Serviço {chamado.servico.nome} • Setor {chamado.servico.setor}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
            <StatusIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden="true" />
            <Badge variant={STATUS_BADGE[chamado.status] ?? "default"}>
              {STATUS_LABEL[chamado.status] ?? chamado.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-6">
          <MensagensPanel chamado={chamado} currentUserId={currentUserId} />

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

          <HistoricoStatusPanel chamado={chamado} />
        </main>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <SurfaceCard
            title="Resumo do chamado"
            subtitle="Informações essenciais para triagem e priorização"
            icon={<LifeBuoy className="h-4 w-4" />}
          >
            <div className="space-y-2.5">
              <InfoRow label="Serviço" value={chamado.servico.nome} icon={<Workflow className="h-4 w-4" />} />
              <InfoRow label="Setor" value={chamado.servico.setor} icon={<ShieldCheck className="h-4 w-4" />} />
              <InfoRow
                label="Solicitante"
                value={`${chamado.solicitante.nome} (${chamado.solicitante.email})`}
                icon={<User className="h-4 w-4" />}
              />
              <InfoRow
                label="Atendente"
                value={chamado.atendente?.nome ?? "Não atribuído"}
                icon={<UserCheck className="h-4 w-4" />}
              />
              <InfoRow label="Criado em" value={formatDateTime(chamado.createdAt)} icon={<CalendarClock className="h-4 w-4" />} />
              <InfoRow label="Atualizado" value={formatDateTime(chamado.updatedAt)} icon={<Clock3 className="h-4 w-4" />} />
              <InfoRow label="Mensagens" value={`${chamado.mensagens.length} interações`} icon={<MessageCircle className="h-4 w-4" />} />
              <InfoRow label="Anexos" value={`${chamado.anexos.length} arquivo(s)`} icon={<FileText className="h-4 w-4" />} />
            </div>
          </SurfaceCard>

          {canAtend && <AtendimentoForm chamado={chamado} atendentes={atendentes} role={currentUserRole} />}
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

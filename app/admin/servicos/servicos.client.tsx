"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { SquarePlus, Edit2, Trash2, ArrowLeft, Users } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import {
  Badge,
  Button,
  Field,
  Form,
  Input,
  Select,
  Table,
  TableBody,
  TableEmpty,
  TableHead,
  Td,
  Th,
  Tr,
} from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";
import { criarServicoAction, editarServicoAction, excluirServicoAction, adicionarAtendenteAction, removerAtendenteAction } from "./actions";
import { notifyError, notifySuccess } from "@/lib/toast";

type Setor = { id: number; nome: string };

type Atendente = { id: number; nome: string; email: string };

type Servico = {
  id: number;
  nome: string;
  descricao: string | null;
  setor: Setor;
  _count: { chamados: number };
  atendentes: Atendente[];
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
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
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


function ServicoForm({
  defaultValues,
  setores,
  setorFixo,
  action,
  pending,
  error,
  submitLabel,
}: {
  defaultValues?: { nome: string; descricao: string | null; setor_id: number };
  setores: Setor[];
  setorFixo?: Setor;
  action: (formData: FormData) => void;
  pending: boolean;
  error?: string;
  submitLabel: string;
}) {
  const setorOptions = setores.map((s) => ({ value: String(s.id), label: s.nome }));

  return (
    <Form action={action}>
      <Field label="Nome" htmlFor="nome" required error={error}>
        <Input id="nome" name="nome" defaultValue={defaultValues?.nome} maxLength={200} placeholder="Ex: Instalação de Software" />
      </Field>
      {setorFixo ? (
        <>
          <input type="hidden" name="setor_id" value={setorFixo.id} />
          <Field label="Setor" htmlFor="setor_nome" required>
            <Input id="setor_nome" value={setorFixo.nome} disabled />
          </Field>
        </>
      ) : (
        <Field label="Setor" htmlFor="setor_id" required>
          <Select
            id="setor_id"
            name="setor_id"
            options={setorOptions}
            defaultValue={defaultValues ? String(defaultValues.setor_id) : ""}
            placeholder="Selecione um setor"
          />
        </Field>
      )}
      <Field label="Descrição" htmlFor="descricao">
        <Textarea id="descricao" name="descricao" defaultValue={defaultValues?.descricao ?? ""} rows={3} placeholder="Descrição opcional" />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : submitLabel}
      </Button>
    </Form>
  );
}

export function ServicosClient({
  servicos,
  setores,
  setorAtual,
  atendentesDisponiveis = [],
}: {
  servicos: Servico[];
  setores: Setor[];
  setorAtual?: Setor;
  atendentesDisponiveis?: Atendente[];
}) {
  const router = useRouter();
  const [showCriar, setShowCriar] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);
  const [gerenciandoAtendentesId, setGerenciandoAtendentesId] = useState<number | null>(null);
  const [addAtendenteState, addAtendenteAction, isAddingAtendente] = useActionState(adicionarAtendenteAction, {});
  const [removeAtendenteState, removeAtendenteAction, isRemovingAtendente] = useActionState(removerAtendenteAction, {});

  const gerenciandoAtendentes =
    gerenciandoAtendentesId !== null
      ? servicos.find((servico) => servico.id === gerenciandoAtendentesId) ?? null
      : null;

  useEffect(() => {
    if (addAtendenteState.success || removeAtendenteState.success) {
      router.refresh();
    }
  }, [addAtendenteState.success, removeAtendenteState.success, router]);

  useEffect(() => {
    if (addAtendenteState.success) {
      notifySuccess("Atendente vinculado com sucesso.");
    }
    if (addAtendenteState.error) {
      notifyError(addAtendenteState.error);
    }
  }, [addAtendenteState.success, addAtendenteState.error]);

  useEffect(() => {
    if (removeAtendenteState.success) {
      notifySuccess("Atendente removido com sucesso.");
    }
    if (removeAtendenteState.error) {
      notifyError(removeAtendenteState.error);
    }
  }, [removeAtendenteState.success, removeAtendenteState.error]);

  async function handleExcluir(id: number) {
    const result = await excluirServicoAction(id);
    if (result.error) {
      notifyError(result.error);
      return;
    }
    notifySuccess("Serviço excluído com sucesso.");
  }

  const atendentesSemVinculo = gerenciandoAtendentes
    ? atendentesDisponiveis.filter(
        (a) => !gerenciandoAtendentes.atendentes.some((at) => at.id === a.id)
      )
    : [];

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-zinc-100/60 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {setorAtual ? `Serviços do Setor: ${setorAtual.nome}` : "Catálogo de Serviços"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {setorAtual
                ? "Cadastre e mantenha os serviços deste setor."
                : "Gerencie os tipos de serviço que podem ser solicitados."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {setorAtual ? (
              <Link href={ROUTES.SETORES} className="w-full sm:w-40">
                <Button variant="outline" size="sm" title="Voltar para setores" className="w-full justify-center">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Voltar
                </Button>
              </Link>
            ) : (
              <Link href={ROUTES.CHAMADOS} className="w-full sm:w-40">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Ver Solicitações
                </Button>
              </Link>
            )}
            <Button onClick={() => setShowCriar(true)} title="Novo serviço" size="sm" className="w-full justify-center sm:w-40">
              <SquarePlus className="h-4 w-4" aria-hidden="true" />
              Novo Serviço
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {servicos.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Nenhum serviço cadastrado.
          </div>
        ) : (
          servicos.map((s) => (
            <article key={s.id} className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{s.nome}</h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{s.descricao ?? "Sem descrição"}</p>
                </div>
                <Badge variant="default">{s._count.chamados}</Badge>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-zinc-200/80 pt-3 dark:border-zinc-800">
                <Badge variant="info">{s.setor.nome}</Badge>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setGerenciandoAtendentesId(s.id)} aria-label={`Gerenciar atendentes de ${s.nome}`} title={`Gerenciar atendentes de ${s.nome}`}>
                    <Users className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditando(s)} aria-label={`Editar serviço ${s.nome}`} title={`Editar serviço ${s.nome}`}>
                    <Edit2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleExcluir(s.id)}
                    disabled={s._count.chamados > 0}
                    aria-label={`Excluir serviço ${s.nome}`}
                    title={`Excluir serviço ${s.nome}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
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
              <Th>Nome</Th>
              <Th>Descrição</Th>
              <Th className="text-center">Chamados</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </TableHead>
          <TableBody>
            {servicos.length === 0 ? (
              <TableEmpty colSpan={4} message="Nenhum serviço cadastrado." />
            ) : (
              servicos.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-semibold">{s.nome}</Td>
                  <Td className="text-zinc-500 dark:text-zinc-400">{s.descricao ?? "—"}</Td>
                  <Td className="text-center">
                    <Badge variant="default">{s._count.chamados}</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setGerenciandoAtendentesId(s.id)} aria-label={`Gerenciar atendentes de ${s.nome}`} title={`Gerenciar atendentes de ${s.nome}`}>
                        <Users className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditando(s)} aria-label={`Editar serviço ${s.nome}`} title={`Editar serviço ${s.nome}`}>
                        <Edit2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleExcluir(s.id)}
                        disabled={s._count.chamados > 0}
                        aria-label={`Excluir serviço ${s.nome}`}
                        title={`Excluir serviço ${s.nome}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showCriar && (
        <Modal title="Novo Serviço" onClose={() => setShowCriar(false)}>
          <CriarServicoForm setores={setores} setorFixo={setorAtual} onClose={() => setShowCriar(false)} />
        </Modal>
      )}
      {editando && (
        <Modal title="Editar Serviço" onClose={() => setEditando(null)}>
          <EditarServicoForm servico={editando} setores={setores} setorFixo={setorAtual} onClose={() => setEditando(null)} />
        </Modal>
      )}

      {gerenciandoAtendentes && (
        <Modal title={`Atendentes: ${gerenciandoAtendentes.nome}`} onClose={() => setGerenciandoAtendentesId(null)}>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Atendentes Vinculados ({gerenciandoAtendentes.atendentes.length})</h3>
              {gerenciandoAtendentes.atendentes.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum atendente vinculado.</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {gerenciandoAtendentes.atendentes.map((atendente) => (
                    <div key={atendente.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{atendente.nome}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{atendente.email}</p>
                      </div>
                      <Form action={removeAtendenteAction}>
                        <input type="hidden" name="servico_id" value={gerenciandoAtendentes.id} />
                        <input type="hidden" name="user_id" value={atendente.id} />
                        <Button type="submit" variant="danger" size="sm" loading={isRemovingAtendente} aria-label={`Remover ${atendente.nome}`} title={`Remover ${atendente.nome}`}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Form>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {atendentesSemVinculo.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Adicionar Atendente</h3>
                <Form action={addAtendenteAction}>
                  <input type="hidden" name="servico_id" value={gerenciandoAtendentes.id} />
                  <div className="flex gap-2">
                    <Select
                      name="user_id"
                      options={atendentesSemVinculo.map((a) => ({ value: String(a.id), label: a.nome }))}
                      placeholder="Selecionar atendente"
                    />
                    <Button type="submit" loading={isAddingAtendente} title="Adicionar atendente">
                      <SquarePlus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </Form>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function CriarServicoForm({ setores, setorFixo, onClose }: { setores: Setor[]; setorFixo?: Setor; onClose: () => void }) {
  const [state, action, pending] = useActionState(criarServicoAction, {});

  useEffect(() => {
    if (state.success) {
      notifySuccess("Serviço criado com sucesso.");
      onClose();
    }
  }, [onClose, state.success]);

  useEffect(() => {
    if (state.error) {
      notifyError(state.error);
    }
  }, [state.error]);

  return (
    <ServicoForm
      setores={setores}
      setorFixo={setorFixo}
      action={action}
      pending={pending}
      error={state.error}
      submitLabel="Criar Serviço"
    />
  );
}

function EditarServicoForm({ servico, setores, setorFixo, onClose }: { servico: Servico; setores: Setor[]; setorFixo?: Setor; onClose: () => void }) {
  const [state, action, pending] = useActionState(editarServicoAction, {});

  useEffect(() => {
    if (state.success) {
      notifySuccess("Serviço atualizado com sucesso.");
      onClose();
    }
  }, [onClose, state.success]);

  useEffect(() => {
    if (state.error) {
      notifyError(state.error);
    }
  }, [state.error]);

  const wrappedAction = (formData: FormData) => {
    formData.set("id", String(servico.id));
    return action(formData);
  };

  return (
    <ServicoForm
      defaultValues={{ nome: servico.nome, descricao: servico.descricao, setor_id: servico.setor.id }}
      setores={setores}
      setorFixo={setorFixo}
      action={wrappedAction}
      pending={pending}
      error={state.error}
      submitLabel="Salvar Alterações"
    />
  );
}

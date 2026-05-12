"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";
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
import { criarServicoAction, editarServicoAction, excluirServicoAction } from "./actions";

type Setor = { id: number; nome: string };

type Servico = {
  id: number;
  nome: string;
  descricao: string | null;
  setor: Setor;
  _count: { chamados: number };
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
}: {
  servicos: Servico[];
  setores: Setor[];
  setorAtual?: Setor;
}) {
  const [showCriar, setShowCriar] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleExcluir(id: number) {
    setDeleteError(null);
    const result = await excluirServicoAction(id);
    if (result.error) setDeleteError(result.error);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
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
              <Link href={ROUTES.SETORES}>
                <Button variant="outline" size="sm" title="Voltar para setores">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Voltar
                </Button>
              </Link>
            ) : (
              <Link href={ROUTES.CHAMADOS}>
                <Button variant="outline" size="sm">
                  Ver Solicitações
                </Button>
              </Link>
            )}
            <Button onClick={() => setShowCriar(true)} title="Novo serviço">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Novo Serviço
            </Button>
          </div>
        </div>
      </div>

      {deleteError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {deleteError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Table>
          <TableHead>
            <tr>
              <Th>Nome</Th>
              <Th>Setor</Th>
              <Th>Descrição</Th>
              <Th className="text-center">Chamados</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </TableHead>
          <TableBody>
            {servicos.length === 0 ? (
              <TableEmpty colSpan={5} message="Nenhum serviço cadastrado." />
            ) : (
              servicos.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-semibold">{s.nome}</Td>
                  <Td>
                    <Badge variant="info">{s.setor.nome}</Badge>
                  </Td>
                  <Td className="text-zinc-500 dark:text-zinc-400">{s.descricao ?? "—"}</Td>
                  <Td className="text-center">
                    <Badge variant="default">{s._count.chamados}</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
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
    </div>
  );
}

function CriarServicoForm({ setores, setorFixo, onClose }: { setores: Setor[]; setorFixo?: Setor; onClose: () => void }) {
  const [state, action, pending] = useActionState(criarServicoAction, {});

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [onClose, state.success]);

  if (state.success) return null;

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
      onClose();
    }
  }, [onClose, state.success]);

  if (state.success) return null;

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

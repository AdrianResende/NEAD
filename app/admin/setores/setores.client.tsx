"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import {
  Badge,
  Button,
  Field,
  Form,
  Input,
  Table,
  TableBody,
  TableEmpty,
  TableHead,
  Td,
  Th,
  Tr,
} from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";
import { criarSetorAction, editarSetorAction, excluirSetorAction } from "./actions";

type Setor = {
  id: number;
  nome: string;
  descricao: string | null;
  _count: { users: number; servicos: number };
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


function CriarSetorModal({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState(criarSetorAction, {});

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [onClose, state.success]);

  if (state.success) {
    return null;
  }

  return (
    <Modal title="Novo Setor" onClose={onClose}>
      <Form action={action}>
        <Field label="Nome" htmlFor="nome" required error={state.error}>
          <Input id="nome" name="nome" placeholder="Ex: Suporte Técnico" maxLength={150} />
        </Field>
        <Field label="Descrição" htmlFor="descricao">
          <Textarea id="descricao" name="descricao" placeholder="Descrição opcional" rows={3} />
        </Field>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Salvando..." : "Criar Setor"}
        </Button>
      </Form>
    </Modal>
  );
}

function EditarSetorModal({ setor, onClose }: { setor: Setor; onClose: () => void }) {
  const [state, action, pending] = useActionState(editarSetorAction, {});

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [onClose, state.success]);

  if (state.success) {
    return null;
  }

  return (
    <Modal title="Editar Setor" onClose={onClose}>
      <Form action={action}>
        <input type="hidden" name="id" value={setor.id} />
        <Field label="Nome" htmlFor="nome" required error={state.error}>
          <Input id="nome" name="nome" defaultValue={setor.nome} maxLength={150} />
        </Field>
        <Field label="Descrição" htmlFor="descricao">
          <Textarea id="descricao" name="descricao" defaultValue={setor.descricao ?? ""} rows={3} />
        </Field>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </Form>
    </Modal>
  );
}

export function SetoresClient({ setores }: { setores: Setor[] }) {
  const [showCriar, setShowCriar] = useState(false);
  const [editando, setEditando] = useState<Setor | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleExcluir(id: number) {
    setDeleteError(null);
    const result = await excluirSetorAction(id);
    if (result.error) setDeleteError(result.error);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-zinc-100/60 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Setores</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Gerencie os setores da organização.
            </p>
          </div>
          <Button onClick={() => setShowCriar(true)} title="Novo setor">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo Setor
          </Button>
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
              <Th>Descrição</Th>
              <Th className="text-center">Usuários</Th>
              <Th className="text-center">Serviços</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </TableHead>
          <TableBody>
            {setores.length === 0 ? (
              <TableEmpty colSpan={5} message="Nenhum setor cadastrado." />
            ) : (
              setores.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-semibold">{s.nome}</Td>
                  <Td className="text-zinc-500 dark:text-zinc-400">{s.descricao ?? "—"}</Td>
                  <Td className="text-center">
                    <Badge variant="default">{s._count.users}</Badge>
                  </Td>
                  <Td className="text-center">
                    <Badge variant="default">{s._count.servicos}</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`${ROUTES.SETORES}/${s.id}/servicos`}>
                        <Button size="sm" variant="ghost" aria-label={`Acessar serviços do setor ${s.nome}`} title={`Acessar serviços do setor ${s.nome}`}>
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => setEditando(s)} aria-label={`Editar setor ${s.nome}`} title={`Editar setor ${s.nome}`}>
                        <Edit2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleExcluir(s.id)}
                        disabled={s._count.users > 0 || s._count.servicos > 0}
                        aria-label={`Excluir setor ${s.nome}`}
                        title={`Excluir setor ${s.nome}`}
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

      {showCriar && <CriarSetorModal onClose={() => setShowCriar(false)} />}
      {editando && <EditarSetorModal setor={editando} onClose={() => setEditando(null)} />}
    </div>
  );
}

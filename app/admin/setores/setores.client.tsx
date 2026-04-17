"use client";

import { useActionState, useState } from "react";
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

  if (state.success) {
    onClose();
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

  if (state.success) {
    onClose();
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Setores</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gerencie os setores da organização.
          </p>
        </div>
        <Button onClick={() => setShowCriar(true)}>+ Novo Setor</Button>
      </div>

      {deleteError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {deleteError}
        </div>
      )}

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
                <Td className="font-medium">{s.nome}</Td>
                <Td className="text-zinc-500 dark:text-zinc-400">{s.descricao ?? "—"}</Td>
                <Td className="text-center">
                  <Badge variant="default">{s._count.users}</Badge>
                </Td>
                <Td className="text-center">
                  <Badge variant="default">{s._count.servicos}</Badge>
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditando(s)}>
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleExcluir(s.id)}
                      disabled={s._count.users > 0 || s._count.servicos > 0}
                    >
                      Excluir
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </TableBody>
      </Table>

      {showCriar && <CriarSetorModal onClose={() => setShowCriar(false)} />}
      {editando && <EditarSetorModal setor={editando} onClose={() => setEditando(null)} />}
    </div>
  );
}

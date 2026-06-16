"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { PAGINATION, ROUTES } from "@/lib/constants";
import {
  Badge,
  Button,
  Field,
  Form,
  Input,
  Pagination,
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
import { notifyError, notifySuccess } from "@/lib/toast";
import { Modal } from "@/components/shared/modal";

type Setor = {
  id: number;
  nome: string;
  descricao: string | null;
  _count: { users: number; servicos: number };
};



function CriarSetorModal({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState(criarSetorAction, {});

  useEffect(() => {
    if (state.success) {
      notifySuccess("Setor criado com sucesso.");
      onClose();
    }
  }, [onClose, state.success]);

  useEffect(() => {
    if (state.error) {
      notifyError(state.error);
    }
  }, [state.error]);

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
      notifySuccess("Setor atualizado com sucesso.");
      onClose();
    }
  }, [onClose, state.success]);

  useEffect(() => {
    if (state.error) {
      notifyError(state.error);
    }
  }, [state.error]);

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
  const [paginaAtual, setPaginaAtual] = useState<number>(PAGINATION.DEFAULT_PAGE);

  const totalPaginas = Math.max(1, Math.ceil(setores.length / PAGINATION.DEFAULT_PER_PAGE));
  const paginaNormalizada = Math.min(paginaAtual, totalPaginas);
  const setoresPaginados = useMemo(() => {
    const start = (paginaNormalizada - 1) * PAGINATION.DEFAULT_PER_PAGE;
    return setores.slice(start, start + PAGINATION.DEFAULT_PER_PAGE);
  }, [paginaNormalizada, setores]);

  async function handleExcluir(id: number) {
    const result = await excluirSetorAction(id);
    if (result.error) {
      notifyError(result.error);
      return;
    }
    notifySuccess("Setor excluído com sucesso.");
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-zinc-100/60 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Setores</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Gerencie os setores da organização.
            </p>
          </div>
          <Button onClick={() => setShowCriar(true)} title="Novo setor" className="w-full justify-center sm:w-auto">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo Setor
          </Button>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {setores.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Nenhum setor cadastrado.
          </div>
        ) : (
          setoresPaginados.map((s) => (
            <article key={s.id} className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{s.nome}</h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{s.descricao ?? "Sem descrição"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="default">U: {s._count.users}</Badge>
                  <Badge variant="default">S: {s._count.servicos}</Badge>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 border-t border-zinc-200/80 pt-3 dark:border-zinc-800">
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
              <Th className="text-center">Usuários</Th>
              <Th className="text-center">Serviços</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </TableHead>
          <TableBody>
            {setores.length === 0 ? (
              <TableEmpty colSpan={5} message="Nenhum setor cadastrado." />
            ) : (
              setoresPaginados.map((s) => (
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

      <Pagination
        page={paginaNormalizada}
        totalPages={totalPaginas}
        totalItems={setores.length}
        perPage={PAGINATION.DEFAULT_PER_PAGE}
        onPageChange={setPaginaAtual}
        label="setores"
      />

      {showCriar && <CriarSetorModal onClose={() => setShowCriar(false)} />}
      {editando && <EditarSetorModal setor={editando} onClose={() => setEditando(null)} />}
    </div>
  );
}

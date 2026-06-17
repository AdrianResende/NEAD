"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { PAGINATION, ROUTES } from "@/lib/constants";
import {
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
  const router = useRouter();
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
    <div>
      {/* Header */}
      <div className="mb-[18px] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 text-[25px] font-bold tracking-[-0.02em] text-[#1C1C1A]">Setores &amp; Serviços</h1>
          <p className="text-[14px] text-[#86867D]">Estrutura organizacional e serviços oferecidos</p>
        </div>
        <Button onClick={() => setShowCriar(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo Setor
        </Button>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {setores.length === 0 ? (
          <div className="rounded-[14px] border border-[#E8E8E3] bg-white p-4 text-sm text-[#A8A89F] shadow-[0_1px_2px_rgba(28,28,26,0.03)]">
            Nenhum setor cadastrado.
          </div>
        ) : (
          setoresPaginados.map((s) => (
            <article
              key={s.id}
              className="cursor-pointer rounded-[14px] border border-[#E8E8E3] bg-white p-4 shadow-[0_1px_2px_rgba(28,28,26,0.03)] transition-[border-color,box-shadow] hover:border-[#3E6F6B] hover:shadow-[0_4px_14px_rgba(46,92,88,0.1)]"
              onClick={() => router.push(`${ROUTES.SETORES}/${s.id}/servicos`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[15.5px] font-bold text-[#1C1C1A]">{s.nome}</h3>
                  <p className="mt-1 text-[12.5px] text-[#A0A099]">{s.descricao ?? "Sem descrição"}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 border-t border-[#F0F0EC] pt-3">
                <div>
                  <span className="text-[17px] font-bold">{s._count.users}</span>{" "}
                  <span className="text-[12px] text-[#A0A099]">usuários</span>
                </div>
                <div>
                  <span className="text-[17px] font-bold">{s._count.servicos}</span>{" "}
                  <span className="text-[12px] text-[#A0A099]">serviços</span>
                </div>
                <div className="ml-auto flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => setEditando(s)}><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="danger" size="sm" onClick={() => handleExcluir(s.id)} disabled={s._count.users > 0 || s._count.servicos > 0}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-4">
        {setores.length === 0 ? (
          <div className="col-span-3 rounded-[14px] border border-[#E8E8E3] bg-white p-8 text-center text-sm text-[#A8A89F]">
            Nenhum setor cadastrado.
          </div>
        ) : (
          setoresPaginados.map((s) => (
            <div
              key={s.id}
              className="cursor-pointer rounded-[14px] border border-[#E8E8E3] bg-white p-[18px] shadow-[0_1px_2px_rgba(28,28,26,0.03)] transition-[border-color,box-shadow] hover:border-[#3E6F6B] hover:shadow-[0_4px_14px_rgba(46,92,88,0.1)]"
              onClick={() => router.push(`${ROUTES.SETORES}/${s.id}/servicos`)}
            >
              <div className="mb-[14px] flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#EAF2F1] text-[#2E5C58]">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6M3 21h18"/>
                  </svg>
                </div>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3E6F6B" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              </div>
              <p className="mb-[3px] text-[15.5px] font-bold text-[#1C1C1A]">{s.nome}</p>
              <p className="mb-[14px] min-h-[36px] text-[12.5px] leading-[1.45] text-[#A0A099]">{s.descricao ?? "Sem descrição"}</p>
              <div className="flex items-center justify-between border-t border-[#F0F0EC] pt-3">
                <div className="flex gap-[18px]">
                  <div>
                    <span className="text-[17px] font-bold">{s._count.users}</span>{" "}
                    <span className="text-[12px] text-[#A0A099]">usuários</span>
                  </div>
                  <div>
                    <span className="text-[17px] font-bold">{s._count.servicos}</span>{" "}
                    <span className="text-[12px] text-[#A0A099]">serviços</span>
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => setEditando(s)} title={`Editar ${s.nome}`}><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="danger" size="sm" onClick={() => handleExcluir(s.id)} disabled={s._count.users > 0 || s._count.servicos > 0} title={`Excluir ${s.nome}`}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))
        )}
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

"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { SquarePlus, Edit2, Trash2, ArrowLeft, Users } from "lucide-react";
import { PAGINATION, ROUTES } from "@/lib/constants";
import {
  Badge,
  Button,
  Field,
  Form,
  Input,
  Pagination,
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
import { notifyError, notifySuccess } from "@/lib/toast";
import { Modal } from "@/components/shared/modal";

type Setor = { id: number; nome: string };

type Servico = {
  id: number;
  nome: string;
  descricao: string | null;
  setor: Setor;
  _count: { chamados: number };
  atendentes: Array<{ id: number }>;
};



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
  const [filtro, setFiltro] = useState("");
  const [showCriar, setShowCriar] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);
  const [paginaAtual, setPaginaAtual] = useState<number>(PAGINATION.DEFAULT_PAGE);

  async function handleExcluir(id: number) {
    const result = await excluirServicoAction(id);
    if (result.error) {
      notifyError(result.error);
      return;
    }
    notifySuccess("Serviço excluído com sucesso.");
  }

  const filtroNormalizado = filtro.trim().toLowerCase();
  const servicosFiltrados = useMemo(
    () =>
      servicos.filter((servico) => {
        if (!filtroNormalizado) return true;
        return (
          servico.nome.toLowerCase().includes(filtroNormalizado) ||
          servico.setor.nome.toLowerCase().includes(filtroNormalizado)
        );
      }),
    [filtroNormalizado, servicos],
  );

  const totalPaginas = Math.max(1, Math.ceil(servicosFiltrados.length / PAGINATION.DEFAULT_PER_PAGE));
  const paginaNormalizada = Math.min(paginaAtual, totalPaginas);

  const servicosPaginados = useMemo(() => {
    const start = (paginaNormalizada - 1) * PAGINATION.DEFAULT_PER_PAGE;
    return servicosFiltrados.slice(start, start + PAGINATION.DEFAULT_PER_PAGE);
  }, [paginaNormalizada, servicosFiltrados]);

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

        <div className="mt-4">
          <Field label="Filtro" htmlFor="servico-filtro">
            <Input
              id="servico-filtro"
              value={filtro}
              onChange={(e) => {
                setFiltro(e.target.value);
                setPaginaAtual(PAGINATION.DEFAULT_PAGE);
              }}
              placeholder="Filtre o setor ou serviço"
            />
          </Field>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {servicosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            {filtroNormalizado ? "Nenhum serviço encontrado para o filtro." : "Nenhum serviço cadastrado."}
          </div>
        ) : (
          servicosPaginados.map((s) => (
            <article key={s.id} className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{s.nome}</h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{s.descricao ?? "Sem descrição"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="default">{s._count.chamados} chamados</Badge>
                  <Badge variant="info">{s.atendentes.length} atendentes</Badge>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-zinc-200/80 pt-3 dark:border-zinc-800">
                <Badge variant="info">{s.setor.nome}</Badge>
                <div className="flex items-center gap-2">
                  <Link href={`${ROUTES.SERVICOS}/${s.id}/atendentes`}>
                    <Button variant="ghost" size="sm" aria-label={`Gerenciar atendentes de ${s.nome}`} title={`Gerenciar atendentes de ${s.nome}`}>
                      <Users className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
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
            {servicosFiltrados.length === 0 ? (
              <TableEmpty colSpan={4} message={filtroNormalizado ? "Nenhum serviço encontrado para o filtro." : "Nenhum serviço cadastrado."} />
            ) : (
              servicosPaginados.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-semibold">{s.nome}</Td>
                  <Td className="text-zinc-500 dark:text-zinc-400">{s.descricao ?? "—"}</Td>
                  <Td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Badge variant="default">{s._count.chamados}</Badge>
                      <Badge variant="info">{s.atendentes.length}</Badge>
                    </div>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`${ROUTES.SERVICOS}/${s.id}/atendentes`}>
                        <Button variant="ghost" size="sm" aria-label={`Gerenciar atendentes de ${s.nome}`} title={`Gerenciar atendentes de ${s.nome}`}>
                          <Users className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
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

      <Pagination
        page={paginaNormalizada}
        totalPages={totalPaginas}
        totalItems={servicosFiltrados.length}
        perPage={PAGINATION.DEFAULT_PER_PAGE}
        onPageChange={setPaginaAtual}
        label="serviços"
      />

      {showCriar && (
        <Modal title="Novo Serviço" onClose={() => setShowCriar(false)}>
          <CriarServicoForm setores={setores} setorFixo={setorAtual} onClose={() => setShowCriar(false)} />
        </Modal>
      )}
      {editando && (
        <Modal title="Editar Serviço" onClose={() => setEditando(null)}>
          <EditarServicoForm key={editando.id} servico={editando} setores={setores} setorFixo={setorAtual} onClose={() => setEditando(null)} />
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

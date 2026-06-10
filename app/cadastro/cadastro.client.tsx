"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { criarUsuarioAction, editarUsuarioAction, toggleActivoUsuarioAction } from "./actions";
import { notifyError, notifySuccess } from "@/lib/toast";
import { PAGINATION } from "@/lib/constants";

type User = {
  id: number;
  nome: string;
  email: string;
  role: string;
  setor: string | null;
  setor_id: number | null;
  servico_ids: number[];
  servicos: string[];
  createdAt: string;
  ativo: boolean;
};

type RoleOption = { value: string; label: string };
type SetorOption = { value: string; label: string };
type ServicoOption = { value: string; label: string; setor_id: number };

type UsuariosClientProps = {
  usersAtivos: User[];
  usersDesativados: User[];
  roleOptions: RoleOption[];
  setorOptions: SetorOption[];
  servicoOptions: ServicoOption[];
  canEdit: boolean;
  currentUserId: number;
};

const ROLE_BADGE: Record<string, "danger" | "warning" | "default"> = {
  admin: "danger",
  atendente: "warning",
  solicitante: "default",
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  atendente: "Atendente",
  solicitante: "Solicitante",
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

export const CadastroClient = ({
  usersAtivos,
  usersDesativados,
  roleOptions,
  setorOptions,
  servicoOptions,
  canEdit,
  currentUserId,
}: UsuariosClientProps) => {
  const router = useRouter();
  const [aba, setAba] = useState<"ativos" | "desativados">("ativos");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<User | null>(null);
  const [toggleIntentAtivo, setToggleIntentAtivo] = useState<boolean | null>(null);
  const [createRole, setCreateRole] = useState("");
  const [editRole, setEditRole] = useState("solicitante");
  const [createSetorIds, setCreateSetorIds] = useState<string[]>([]);
  const [createServicoIds, setCreateServicoIds] = useState<string[]>([]);
  const [editSetorIds, setEditSetorIds] = useState<string[]>([]);
  const [editServicoIds, setEditServicoIds] = useState<string[]>([]);
  const [paginaAtual, setPaginaAtual] = useState<number>(PAGINATION.DEFAULT_PAGE);

  const [createState, createAction, isCreating] = useActionState(criarUsuarioAction, {});
  const [editState, editAction, isEditing] = useActionState(editarUsuarioAction, {});
  const [toggleState, toggleAction, isToggling] = useActionState(toggleActivoUsuarioAction, {});

  useEffect(() => {
    if (createState.error) {
      notifyError(createState.error);
    }
    if (createState.success) {
      notifySuccess("Usuário cadastrado com sucesso.");
      setTimeout(() => {
        setCreateOpen(false);
        setCreateRole("");
        setCreateSetorIds([]);
        setCreateServicoIds([]);
        router.refresh();
      }, 0);
    }
  }, [createState.error, createState.success, router]);

  useEffect(() => {
    if (editState.error) {
      notifyError(editState.error);
    }
    if (editState.success) {
      notifySuccess("Perfil atualizado com sucesso.");
      setTimeout(() => {
        setEditingUser(null);
        setEditRole("solicitante");
        setEditSetorIds([]);
        setEditServicoIds([]);
        router.refresh();
      }, 0);
    }
  }, [editState.error, editState.success, router]);

  useEffect(() => {
    if (!toggleState) {
      return;
    }

    if (toggleState.error) {
      notifyError(toggleState.error);
      return;
    }

    if (toggleState.success) {
      notifySuccess(
        toggleIntentAtivo
          ? "Usuário desativado com sucesso."
          : "Usuário reativado com sucesso.",
      );
      setTimeout(() => {
        setToggleConfirm(null);
        setToggleIntentAtivo(null);
        router.refresh();
      }, 0);
    }
  }, [toggleState, toggleIntentAtivo, router]);

  const createFilteredServicoOptions = useMemo(() => {
    if (createSetorIds.length === 0) {
      return [];
    }

    const setorSet = new Set(createSetorIds.map((id) => Number(id)));
    return servicoOptions.filter((servico) => setorSet.has(servico.setor_id));
  }, [createSetorIds, servicoOptions]);

  const editFilteredServicoOptions = useMemo(() => {
    if (editSetorIds.length === 0) {
      return [];
    }

    const setorSet = new Set(editSetorIds.map((id) => Number(id)));
    return servicoOptions.filter((servico) => setorSet.has(servico.setor_id));
  }, [editSetorIds, servicoOptions]);

  function filterServicoIdsBySetores(selectedSetores: string[], currentServicoIds: string[]) {
    if (selectedSetores.length === 0) {
      return [];
    }

    const allowedSetores = new Set(selectedSetores.map((id) => Number(id)));
    const allowedServicos = new Set(
      servicoOptions
        .filter((servico) => allowedSetores.has(servico.setor_id))
        .map((servico) => servico.value),
    );

    return currentServicoIds.filter((id) => allowedServicos.has(id));
  }

  function deriveSetoresFromServicos(servicosIds: number[]) {
    const setorSet = new Set<string>();
    for (const servicoId of servicosIds) {
      const match = servicoOptions.find((opt) => Number(opt.value) === servicoId);
      if (match) {
        setorSet.add(String(match.setor_id));
      }
    }

    return Array.from(setorSet);
  }

  function toggleIdInList(current: string[], value: string, checked: boolean) {
    if (checked) {
      return current.includes(value) ? current : [...current, value];
    }

    return current.filter((id) => id !== value);
  }

  function handleCreateSetorToggle(value: string, checked: boolean) {
    setCreateSetorIds((prev) => {
      const next = toggleIdInList(prev, value, checked);
      setCreateServicoIds((servicosPrev) => filterServicoIdsBySetores(next, servicosPrev));
      return next;
    });
  }

  function handleEditSetorToggle(value: string, checked: boolean) {
    setEditSetorIds((prev) => {
      const next = toggleIdInList(prev, value, checked);
      setEditServicoIds((servicosPrev) => filterServicoIdsBySetores(next, servicosPrev));
      return next;
    });
  }

  function closeCreate() {
    setCreateOpen(false);
    setCreateRole("");
    setCreateSetorIds([]);
    setCreateServicoIds([]);
    router.refresh();
  }

  function closeEdit() {
    setEditingUser(null);
    setEditRole("solicitante");
    setEditSetorIds([]);
    setEditServicoIds([]);
    router.refresh();
  }

  const users = aba === "ativos" ? usersAtivos : usersDesativados;
  const totalPaginas = Math.max(1, Math.ceil(users.length / PAGINATION.DEFAULT_PER_PAGE));
  const paginaNormalizada = Math.min(paginaAtual, totalPaginas);
  const usersPaginados = useMemo(() => {
    const start = (paginaNormalizada - 1) * PAGINATION.DEFAULT_PER_PAGE;
    return users.slice(start, start + PAGINATION.DEFAULT_PER_PAGE);
  }, [paginaNormalizada, users]);

  useEffect(() => {
    setPaginaAtual(PAGINATION.DEFAULT_PAGE);
  }, [aba]);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-zinc-100/60 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Cadastro de Usuários
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Gerencie os usuários do sistema.
            </p>
          </div>
          {canEdit && (
            <Button onClick={() => setCreateOpen(true)} className="w-full justify-center sm:w-auto">
              <span className="material-symbols-outlined text-[18px]" title="Novo usuário" aria-hidden="true">
                person_add
              </span>
              Novo usuário
            </Button>
          )}
        </div>

        {/* Abas */}
        <div className="mt-4 flex gap-2 border-b border-zinc-200/80 dark:border-zinc-800">
          <button
            onClick={() => setAba("ativos")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              aba === "ativos"
                ? "border-b-2 border-primary text-primary dark:text-primary"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            Usuários Ativos
            <span className="ml-2 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
              {usersAtivos.length}
            </span>
          </button>
          <button
            onClick={() => setAba("desativados")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              aba === "desativados"
                ? "border-b-2 border-primary text-primary dark:text-primary"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            Usuários Desativados
            <span className="ml-2 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
              {usersDesativados.length}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {users.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Nenhum usuário cadastrado.
          </div>
        ) : (
          usersPaginados.map((user) => (
            <article key={user.id} className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{user.nome}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                </div>
                <Badge variant={ROLE_BADGE[user.role] ?? "default"}>
                  {ROLE_LABEL[user.role] ?? user.role}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-200/80 pt-3 text-xs dark:border-zinc-800">
                <div>
                  <p className="font-medium text-zinc-500 dark:text-zinc-400">Setor</p>
                  <p className="mt-0.5 text-zinc-700 dark:text-zinc-300">{user.setor ?? "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-zinc-500 dark:text-zinc-400">Serviços</p>
                  <p className="mt-0.5 text-zinc-700 dark:text-zinc-300">{user.servicos.length || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-zinc-500 dark:text-zinc-400">Cadastro</p>
                  <p className="mt-0.5 text-zinc-700 dark:text-zinc-300">{new Date(user.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                {canEdit && (
                  <div className="flex items-end justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={user.id === currentUserId}
                      aria-label={`Editar usuário ${user.nome}`}
                      title={`Editar usuário ${user.nome}`}
                      onClick={() => {
                        setEditingUser(user);
                        setEditRole(user.role);
                        const setoresFromServicos = deriveSetoresFromServicos(user.servico_ids);
                        const baseSetores = user.setor_id ? [String(user.setor_id)] : [];
                        setEditSetorIds(Array.from(new Set([...baseSetores, ...setoresFromServicos])));
                        setEditServicoIds(user.servico_ids.map((id) => String(id)));
                      }}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        edit
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={user.id === currentUserId}
                      aria-label={aba === "ativos" ? `Desativar usuário ${user.nome}` : `Reativar usuário ${user.nome}`}
                      title={aba === "ativos" ? `Desativar usuário ${user.nome}` : `Reativar usuário ${user.nome}`}
                      onClick={() => setToggleConfirm(user)}
                    >
                      <span className="material-symbols-outlined text-red-500" aria-hidden="true">
                        {aba === "ativos" ? "person_off" : "person_add"}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:block">
      <Table>
        <TableHead>
          <Tr>
            <Th>Usuário</Th>
            <Th>Perfil</Th>
            <Th>Setor</Th>
            <Th>Serviços</Th>
            <Th>Cadastrado</Th>
            {canEdit && <Th className="text-right">Ações</Th>}
          </Tr>
        </TableHead>
        <TableBody>
          {users.length === 0 ? (
            <TableEmpty colSpan={canEdit ? 6 : 5} message={aba === "ativos" ? "Nenhum usuário cadastrado." : "Nenhum usuário desativado."} />
          ) : (
            usersPaginados.map((user) => (
              <Tr key={user.id}>
                <Td>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-zinc-400">account_circle</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">{user.nome}</span>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                  </div>
                </Td>
                <Td>
                  <Badge variant={ROLE_BADGE[user.role] ?? "default"}>
                    {ROLE_LABEL[user.role] ?? user.role}
                  </Badge>
                </Td>
                <Td>
                  {user.setor ? (
                    <Badge variant="info">{user.setor}</Badge>
                  ) : (
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">—</span>
                  )}
                </Td>
                <Td>
                  {user.servicos.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.servicos.slice(0, 2).map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                      {user.servicos.length > 2 && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          +{user.servicos.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">—</span>
                  )}
                </Td>
                <Td className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </Td>
                {canEdit && (
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={user.id === currentUserId}
                        aria-label={`Editar usuário ${user.nome}`}
                        title={`Editar usuário ${user.nome}`}
                        onClick={() => {
                          setEditingUser(user);
                          setEditRole(user.role);
                          const setoresFromServicos = deriveSetoresFromServicos(user.servico_ids);
                          const baseSetores = user.setor_id ? [String(user.setor_id)] : [];
                          setEditSetorIds(Array.from(new Set([...baseSetores, ...setoresFromServicos])));
                          setEditServicoIds(user.servico_ids.map((id) => String(id)));
                        }}
                      >
                        <span className="material-symbols-outlined" title={`Editar usuário ${user.nome}`} aria-hidden="true">
                          edit
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={user.id === currentUserId}
                        aria-label={aba === "ativos" ? `Desativar usuário ${user.nome}` : `Reativar usuário ${user.nome}`}
                        title={aba === "ativos" ? `Desativar usuário ${user.nome}` : `Reativar usuário ${user.nome}`}
                        onClick={() => setToggleConfirm(user)}
                      >
                        <span className="material-symbols-outlined text-red-500" aria-hidden="true">
                          {aba === "ativos" ? "person_off" : "person_add"}
                        </span>
                      </Button>
                    </div>
                  </Td>
                )}
              </Tr>
            ))
          )}
        </TableBody>
      </Table>
      </div>

      <Pagination
        page={paginaNormalizada}
        totalPages={totalPaginas}
        totalItems={users.length}
        perPage={PAGINATION.DEFAULT_PER_PAGE}
        onPageChange={setPaginaAtual}
        label={aba === "ativos" ? "usuários ativos" : "usuários desativados"}
      />

      {/* Modal: Novo usuário */}
      {createOpen && (
        <Modal title="Novo usuário" onClose={closeCreate}>
          <Form action={createAction}>
            <Field label="Nome" htmlFor="c-name">
              <Input id="c-name" name="name" type="text" placeholder="Nome completo" required />
            </Field>
            <Field label="E-mail" htmlFor="c-email">
              <Input id="c-email" name="email" type="email" placeholder="email@nead.com" required />
            </Field>
            <Field label="Senha" htmlFor="c-password">
              <Input
                id="c-password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </Field>
            <Field label="Perfil" htmlFor="c-role">
              <Select
                id="c-role"
                name="role"
                value={createRole}
                options={roleOptions}
                placeholder="Selecione o perfil"
                required
                onChange={(e) => {
                  setCreateRole(e.target.value);
                  if (e.target.value === "solicitante" || e.target.value === "") {
                    setCreateSetorIds([]);
                    setCreateServicoIds([]);
                  }
                }}
              />
            </Field>
            {createRole !== "" && createRole !== "solicitante" && (
            <Field label="Setor" htmlFor="c-setor">
              <div id="c-setor" className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                {setorOptions.map((setor) => (
                  <label key={setor.value} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      name="setor_ids"
                      value={setor.value}
                      checked={createSetorIds.includes(setor.value)}
                      required={createSetorIds.length === 0}
                      onChange={(e) => handleCreateSetorToggle(setor.value, e.target.checked)}
                    />
                    <span>{setor.label}</span>
                  </label>
                ))}
              </div>
            </Field>
            )}
            {createRole !== "" && createRole !== "solicitante" && (
            <Field label="Serviços" htmlFor="c-servicos">
              <div
                id="c-servicos"
                className={`space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-3 transition-all duration-300 ease-out dark:border-zinc-700 ${
                  createFilteredServicoOptions.length === 0 ? "max-h-16 opacity-80" : "max-h-44 opacity-100"
                }`}
              >
                {createFilteredServicoOptions.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Selecione setor(es) para habilitar os serviços.</p>
                ) : (
                  createFilteredServicoOptions.map((servico, index) => (
                    <label
                      key={servico.value}
                      className="flex items-center gap-2 text-sm text-zinc-700 transition-all duration-300 ease-out dark:text-zinc-200"
                      style={{ transitionDelay: `${Math.min(index * 20, 180)}ms` }}
                    >
                      <input
                        type="checkbox"
                        name="servico_ids"
                        value={servico.value}
                        checked={createServicoIds.includes(servico.value)}
                        disabled={createSetorIds.length === 0}
                        required={createServicoIds.length === 0}
                        onChange={(e) => {
                          setCreateServicoIds((prev) => toggleIdInList(prev, servico.value, e.target.checked));
                        }}
                      />
                      <span>{servico.label}</span>
                    </label>
                  ))
                )}
              </div>
            </Field>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={closeCreate}>
                <span className="material-symbols-outlined text-[18px]" title="Cancelar" aria-hidden="true">
                  cancel
                </span>
                Cancelar
              </Button>
              <Button type="submit" loading={isCreating}>
                <span className="material-symbols-outlined text-[18px]" title="Cadastrar usuário" aria-hidden="true">
                  person_add
                </span>
                Cadastrar
              </Button>
            </div>
          </Form>
        </Modal>
      )}

      {/* Modal: Editar perfil */}
      {editingUser && (
        <Modal title="Editar perfil" onClose={closeEdit}>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            Alterando perfil de{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {editingUser.nome}
            </span>
          </p>
          <Form action={editAction}>
            <input type="hidden" name="userId" value={editingUser.id} />
            <Field label="Perfil" htmlFor="e-role">
              <Select
                id="e-role"
                name="role"
                value={editRole}
                options={roleOptions}
                onChange={(e) => {
                  setEditRole(e.target.value);
                  if (e.target.value === "solicitante") {
                    setEditSetorIds([]);
                    setEditServicoIds([]);
                  }
                }}
              />
            </Field>
            {editRole !== "solicitante" && (
            <Field label="Setor" htmlFor="e-setor">
              <div id="e-setor" className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                {setorOptions.map((setor) => (
                  <label key={setor.value} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      name="setor_ids"
                      value={setor.value}
                      checked={editSetorIds.includes(setor.value)}
                      required={editSetorIds.length === 0}
                      onChange={(e) => handleEditSetorToggle(setor.value, e.target.checked)}
                    />
                    <span>{setor.label}</span>
                  </label>
                ))}
              </div>
            </Field>
            )}
            {editRole !== "solicitante" && (
            <Field label="Serviços" htmlFor="e-servicos">
              <div
                id="e-servicos"
                className={`space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-3 transition-all duration-300 ease-out dark:border-zinc-700 ${
                  editFilteredServicoOptions.length === 0 ? "max-h-16 opacity-80" : "max-h-44 opacity-100"
                }`}
              >
                {editFilteredServicoOptions.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Selecione setor(es) para habilitar os serviços.</p>
                ) : (
                  editFilteredServicoOptions.map((servico, index) => (
                    <label
                      key={servico.value}
                      className="flex items-center gap-2 text-sm text-zinc-700 transition-all duration-300 ease-out dark:text-zinc-200"
                      style={{ transitionDelay: `${Math.min(index * 20, 180)}ms` }}
                    >
                      <input
                        type="checkbox"
                        name="servico_ids"
                        value={servico.value}
                        checked={editServicoIds.includes(servico.value)}
                        disabled={editSetorIds.length === 0}
                        required={editServicoIds.length === 0}
                        onChange={(e) => {
                          setEditServicoIds((prev) => toggleIdInList(prev, servico.value, e.target.checked));
                        }}
                      />
                      <span>{servico.label}</span>
                    </label>
                  ))
                )}
              </div>
            </Field>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={closeEdit}>
                <span className="material-symbols-outlined text-[18px]" title="Cancelar" aria-hidden="true">
                  cancel
                </span>
                Cancelar
              </Button>
              <Button type="submit" loading={isEditing}>
                <span className="material-symbols-outlined text-[18px]" title="Salvar alterações" aria-hidden="true">
                  save
                </span>
                Salvar
              </Button>
            </div>
          </Form>
        </Modal>
      )}

      {/* Modal: Confirmar Desativar/Reativar */}
      {toggleConfirm && (
        <Modal title={toggleConfirm.ativo ? "Desativar usuário" : "Reativar usuário"} onClose={() => setToggleConfirm(null)}>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Tem certeza que deseja {toggleConfirm.ativo ? "desativar" : "reativar"} o usuário{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-50">{toggleConfirm.nome}</span>?
          </p>
          {toggleConfirm.ativo && (
            <p className="mb-4 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-lg p-3">
              ⚠️ Usuários desativados não poderão acessar o sistema.
            </p>
          )}
          
          <Form action={toggleAction}>
            <input type="hidden" name="userId" value={toggleConfirm.id} />
            
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setToggleConfirm(null)}>
                <span className="material-symbols-outlined text-[18px]" title="Cancelar" aria-hidden="true">
                  cancel
                </span>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                loading={isToggling}
                className={toggleConfirm.ativo ? "bg-red-600 hover:bg-red-700" : ""}
                onClick={() => setToggleIntentAtivo(toggleConfirm.ativo)}
              >
                <span className="material-symbols-outlined text-[18px]" title={toggleConfirm.ativo ? "Desativar" : "Reativar"} aria-hidden="true">
                  {toggleConfirm.ativo ? "person_off" : "person_add"}
                </span>
                {toggleConfirm.ativo ? "Desativar" : "Reativar"}
              </Button>
            </div>
          </Form>
        </Modal>
      )}
    </div>
  );
}

"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserCheck2, UserPlus, UserX2, Wrench } from "lucide-react";
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
import { Modal } from "@/components/shared/modal";
import { formatDate } from "@/lib/utils";

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

const selectionPanelClasses =
  "rounded-[12px] border border-[#E9ECEF] bg-[#F7F9FB] p-3 dark:border-zinc-700 dark:bg-zinc-900/60";

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
  const [query, setQuery] = useState("");
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

  function openEdit(user: User) {
    setEditingUser(user);
    setEditRole(user.role);
    const setoresFromServicos = deriveSetoresFromServicos(user.servico_ids);
    const baseSetores = user.setor_id ? [String(user.setor_id)] : [];
    setEditSetorIds(Array.from(new Set([...baseSetores, ...setoresFromServicos])));
    setEditServicoIds(user.servico_ids.map((id) => String(id)));
  }

  function getUserInitials(nome: string) {
    return nome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? "")
      .join("");
  }

  function getServicesPreview(servicos: string[]) {
    if (servicos.length === 0) return "-";
    if (servicos.length <= 2) return servicos.join(", ");
    return `${servicos.slice(0, 2).join(", ")} +${servicos.length - 2}`;
  }

  const usersBase = aba === "ativos" ? usersAtivos : usersDesativados;
  const users = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return usersBase;
    }

    return usersBase.filter((user) => {
      const haystack = [
        user.nome,
        user.email,
        ROLE_LABEL[user.role] ?? user.role,
        user.setor ?? "",
        user.servicos.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [query, usersBase]);

  const totalPaginas = Math.max(1, Math.ceil(users.length / PAGINATION.DEFAULT_PER_PAGE));
  const paginaNormalizada = Math.min(paginaAtual, totalPaginas);
  const usersPaginados = useMemo(() => {
    const start = (paginaNormalizada - 1) * PAGINATION.DEFAULT_PER_PAGE;
    return users.slice(start, start + PAGINATION.DEFAULT_PER_PAGE);
  }, [paginaNormalizada, users]);

  return (
    <div className="w-full bg-[#F7F9FB] px-4 py-6 sm:px-6 lg:px-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <div className="rounded-[12px] border border-[#C3C6D7] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#737686] dark:text-zinc-500">
                Painel de controle
              </p>
              <div>
                <h1 className="text-[30px] font-bold tracking-[-0.02em] text-[#191C1E] dark:text-zinc-50">
                  Cadastro de Usuários
                </h1>
                <p className="mt-2 text-base text-[#434655] dark:text-zinc-400">
                  Gerencie os usuários do sistema, permissões e departamentos com facilidade.
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="w-full min-w-[260px] lg:w-[280px]">
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPaginaAtual(PAGINATION.DEFAULT_PAGE);
                  }}
                  placeholder="Buscar usuários..."
                  leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
                />
              </div>
              {canEdit && (
                <Button onClick={() => setCreateOpen(true)} className="w-full justify-center sm:w-auto">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Novo usuário
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8 border-b border-[#C3C6D7] dark:border-zinc-800">
            <div className="flex gap-6 overflow-x-auto">
              <button
                onClick={() => {
                  setAba("ativos");
                  setPaginaAtual(PAGINATION.DEFAULT_PAGE);
                }}
                className={`flex items-center gap-2 border-b-2 px-2 pb-4 text-sm transition-colors ${
                  aba === "ativos"
                    ? "border-[#004AC6] text-[#004AC6]"
                    : "border-transparent text-[#434655] hover:text-[#191C1E] dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <span>Usuários Ativos</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    aba === "ativos"
                      ? "bg-[rgba(0,74,198,0.1)] text-[#004AC6]"
                      : "bg-[#E6E8EA] text-[#434655] dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {usersAtivos.length}
                </span>
              </button>
              <button
                onClick={() => {
                  setAba("desativados");
                  setPaginaAtual(PAGINATION.DEFAULT_PAGE);
                }}
                className={`flex items-center gap-2 border-b-2 px-2 pb-4 text-sm transition-colors ${
                  aba === "desativados"
                    ? "border-[#004AC6] text-[#004AC6]"
                    : "border-transparent text-[#434655] hover:text-[#191C1E] dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <span>Usuários Desativados</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    aba === "desativados"
                      ? "bg-[rgba(0,74,198,0.1)] text-[#004AC6]"
                      : "bg-[#E6E8EA] text-[#434655] dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {usersDesativados.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {users.length === 0 ? (
            <div className="rounded-[12px] border border-[#C3C6D7] bg-white p-4 text-sm text-[#434655] shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              {aba === "ativos" ? "Nenhum usuário cadastrado." : "Nenhum usuário desativado."}
            </div>
          ) : (
            usersPaginados.map((user) => (
              <article key={user.id} className="rounded-[12px] border border-[#C3C6D7] bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(0,74,198,0.18)] bg-[rgba(37,99,235,0.1)] text-sm font-semibold text-[#004AC6] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                      {getUserInitials(user.nome)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#191C1E] dark:text-zinc-50">{user.nome}</p>
                      <p className="truncate font-mono text-[11px] text-[#434655] dark:text-zinc-400">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={ROLE_BADGE[user.role] ?? "default"}>
                    {ROLE_LABEL[user.role] ?? user.role}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E9ECEF] pt-4 text-xs dark:border-zinc-800">
                  <div>
                    <p className="font-semibold uppercase tracking-[0.08em] text-[#737686] dark:text-zinc-500">Setor</p>
                    <p className="mt-1 text-sm text-[#191C1E] dark:text-zinc-300">{user.setor ?? "-"}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-[0.08em] text-[#737686] dark:text-zinc-500">Serviços</p>
                    <p className="mt-1 text-sm text-[#191C1E] dark:text-zinc-300">{getServicesPreview(user.servicos)}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-[0.08em] text-[#737686] dark:text-zinc-500">Cadastrado</p>
                    <p className="mt-1 text-sm text-[#191C1E] dark:text-zinc-300">{formatDate(user.createdAt)}</p>
                  </div>
                  {canEdit && (
                    <div className="flex items-end justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={user.id === currentUserId}
                        aria-label={`Editar usuário ${user.nome}`}
                        title={`Editar usuário ${user.nome}`}
                        onClick={() => openEdit(user)}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">edit</span>
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

        <div className="hidden overflow-hidden rounded-[12px] border border-[#C3C6D7] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] dark:border-zinc-800 dark:bg-zinc-950 md:block">
          <Table>
            <TableHead className="bg-[#F2F4F6] text-[#737686] dark:bg-zinc-900">
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
                <TableEmpty
                  colSpan={canEdit ? 6 : 5}
                  message={aba === "ativos" ? "Nenhum usuário cadastrado." : "Nenhum usuário desativado."}
                />
              ) : (
                usersPaginados.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(0,74,198,0.18)] bg-[rgba(37,99,235,0.1)] text-sm font-semibold text-[#004AC6] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                          {getUserInitials(user.nome)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-base font-bold text-[#191C1E] dark:text-zinc-50">{user.nome}</div>
                          <div className="truncate font-mono text-[12px] text-[#434655] dark:text-zinc-400">{user.email}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge variant={ROLE_BADGE[user.role] ?? "default"}>
                        {ROLE_LABEL[user.role] ?? user.role}
                      </Badge>
                    </Td>
                    <Td>
                      <span className="text-sm text-[#191C1E] dark:text-zinc-300">{user.setor ?? "-"}</span>
                    </Td>
                    <Td>
                      <span className="text-sm text-[#191C1E] dark:text-zinc-300">{getServicesPreview(user.servicos)}</span>
                    </Td>
                    <Td>
                      <span className="font-mono text-sm text-[#191C1E] dark:text-zinc-300">{formatDate(user.createdAt)}</span>
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
                            onClick={() => openEdit(user)}
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
        <Modal title="Novo usuário" description="Cadastre um novo acesso e vincule os serviços necessários." size="lg" onClose={closeCreate}>
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
                      required={createRole === "atendente" && createSetorIds.length === 0}
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
                className={`${selectionPanelClasses} space-y-2 overflow-y-auto transition-all duration-300 ease-out ${
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
                        required={createRole === "atendente" && createServicoIds.length === 0}
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
        <Modal title="Editar perfil" description="Atualize permissões e vínculos operacionais do usuário selecionado." size="lg" onClose={closeEdit}>
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
              <div id="e-setor" className={`${selectionPanelClasses} max-h-36 space-y-2 overflow-y-auto`}>
                {setorOptions.map((setor) => (
                  <label key={setor.value} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      name="setor_ids"
                      value={setor.value}
                      checked={editSetorIds.includes(setor.value)}
                      required={editRole === "atendente" && editSetorIds.length === 0}
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
                className={`${selectionPanelClasses} space-y-2 overflow-y-auto transition-all duration-300 ease-out ${
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
                        required={editRole === "atendente" && editServicoIds.length === 0}
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
        <Modal
          title={toggleConfirm.ativo ? "Desativar usuário" : "Reativar usuário"}
          description="Confirme a alteração de acesso deste usuário ao sistema."
          onClose={() => setToggleConfirm(null)}
        >
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
                {toggleConfirm.ativo ? <UserX2 className="h-4 w-4" aria-hidden="true" /> : <UserCheck2 className="h-4 w-4" aria-hidden="true" />}
                {toggleConfirm.ativo ? "Desativar" : "Reativar"}
              </Button>
            </div>
          </Form>
        </Modal>
      )}
      </div>
    </div>
  );
}

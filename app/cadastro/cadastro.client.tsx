"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save, Search, UserCheck2, UserPlus, UserX, UserX2, X } from "lucide-react";
import { useSetorServico } from "@/hooks/use-setor-servico";
import {
  RoleBadge,
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

const selectionPanelClasses =
  "rounded-[9px] border border-[#E4E4DE] bg-[#FAFAF8] p-3";

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
  const [paginaAtual, setPaginaAtual] = useState<number>(PAGINATION.DEFAULT_PAGE);

  const createForm = useSetorServico(servicoOptions);
  const editForm = useSetorServico(servicoOptions);

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
        createForm.reset();
        router.refresh();
      }, 0);
    }
  }, [createState.error, createState.success, router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editState.error) {
      notifyError(editState.error);
    }
    if (editState.success) {
      notifySuccess("Perfil atualizado com sucesso.");
      setTimeout(() => {
        setEditingUser(null);
        setEditRole("solicitante");
        editForm.reset();
        router.refresh();
      }, 0);
    }
  }, [editState.error, editState.success, router]); // eslint-disable-line react-hooks/exhaustive-deps

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

  function deriveSetoresFromServicos(servicosIds: number[]) {
    const setorSet = new Set<string>();
    for (const servicoId of servicosIds) {
      const match = servicoOptions.find((opt) => Number(opt.value) === servicoId);
      if (match) setorSet.add(String(match.setor_id));
    }
    return Array.from(setorSet);
  }

  function closeCreate() {
    setCreateOpen(false);
    setCreateRole("");
    createForm.reset();
    router.refresh();
  }

  function closeEdit() {
    setEditingUser(null);
    setEditRole("solicitante");
    editForm.reset();
    router.refresh();
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setEditRole(user.role);
    const setoresFromServicos = deriveSetoresFromServicos(user.servico_ids);
    const baseSetores = user.setor_id ? [String(user.setor_id)] : [];
    editForm.init(
      Array.from(new Set([...baseSetores, ...setoresFromServicos])),
      user.servico_ids.map((id) => String(id)),
    );
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
        ({ admin: "Administrador", atendente: "Atendente", solicitante: "Solicitante" } as Record<string, string>)[user.role] ?? user.role,
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
    <div>
      <div className="space-y-[18px]">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-1 text-[25px] font-bold tracking-[-0.02em] text-[#1C1C1A]">
              Usuários
            </h1>
            <p className="text-[14px] text-[#86867D]">
              Gerencie perfis, vínculos e acessos dos colaboradores
            </p>
          </div>
          <div className="flex gap-2">
            <div className="w-[260px]">
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPaginaAtual(PAGINATION.DEFAULT_PAGE);
                }}
                placeholder="Buscar usuários..."
                leftIcon={<Search className="h-4 w-4 text-[#A8A89F]" aria-hidden="true" />}
              />
            </div>
            {canEdit && (
              <Button onClick={() => setCreateOpen(true)}>
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Novo usuário
              </Button>
            )}
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-[14px] border border-[#E8E8E3] bg-white shadow-[0_1px_2px_rgba(28,28,26,0.03)]">
          {/* Tabs */}
          <div className="flex items-center gap-0 border-b border-[#ECECE7] px-[18px]">
            {(["ativos", "desativados"] as const).map((tab) => {
              const active = aba === tab;
              const count = tab === "ativos" ? usersAtivos.length : usersDesativados.length;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setAba(tab); setPaginaAtual(PAGINATION.DEFAULT_PAGE); }}
                  className="relative mr-6 border-none bg-none py-[13px] text-[14px] font-medium transition-colors"
                  style={{
                    color: active ? "var(--color-accent-ink)" : "#86867D",
                    fontWeight: active ? 600 : 500,
                    boxShadow: active ? "inset 0 -2px 0 var(--color-accent)" : "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  {tab === "ativos" ? "Ativos" : "Desativados"}{" "}
                  <span
                    className="ml-[2px] rounded-[999px] px-[7px] py-[1px] text-[11.5px] font-semibold"
                    style={{
                      background: active ? "var(--color-accent-soft)" : "#F0F0EC",
                      color: active ? "var(--color-accent-ink)" : "#A0A099",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 md:hidden">
            {users.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#A8A89F]">
                {aba === "ativos" ? "Nenhum usuário cadastrado." : "Nenhum usuário desativado."}
              </div>
            ) : (
              usersPaginados.map((user) => (
                <article key={user.id} className="rounded-[11px] border border-[#E8E8E3] bg-[#FAFAF8] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#6E8B89] text-[13px] font-semibold text-white">
                        {getUserInitials(user.nome)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-semibold text-[#1C1C1A]">{user.nome}</p>
                        <p className="truncate text-[11.5px] text-[#A0A099]">{user.email}</p>
                      </div>
                    </div>
                    <RoleBadge role={user.role} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#F0F0EC] pt-3 text-xs">
                    <div>
                      <p className="font-semibold text-[#A8A89F]">Setor</p>
                      <p className="mt-0.5 text-[#56564F]">{user.setor ?? "-"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#A8A89F]">Serviços</p>
                      <p className="mt-0.5 text-[#56564F]">{getServicesPreview(user.servicos)}</p>
                    </div>
                    {canEdit && (
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" disabled={user.id === currentUserId} onClick={() => openEdit(user)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="sm" disabled={user.id === currentUserId} onClick={() => setToggleConfirm(user)}>
                          {aba === "ativos" ? <UserX className="h-4 w-4 text-[#9A463B]" aria-hidden="true" /> : <UserPlus className="h-4 w-4 text-[#9A463B]" aria-hidden="true" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
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
                  <TableEmpty
                    colSpan={canEdit ? 6 : 5}
                    message={aba === "ativos" ? "Nenhum usuário cadastrado." : "Nenhum usuário desativado."}
                  />
                ) : (
                  usersPaginados.map((user) => (
                    <Tr key={user.id}>
                      <Td>
                        <div className="flex items-center gap-[11px]">
                          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#6E8B89] text-[13px] font-semibold text-white">
                            {getUserInitials(user.nome)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13.5px] font-semibold text-[#1C1C1A]">{user.nome}</p>
                            <p className="truncate text-[11.5px] text-[#A0A099]">{user.email}</p>
                          </div>
                        </div>
                      </Td>
                      <Td><RoleBadge role={user.role} /></Td>
                      <Td><span className="text-[13px] text-[#56564F]">{user.setor ?? "—"}</span></Td>
                      <Td><span className="text-[13px] text-[#86867D]">{getServicesPreview(user.servicos)}</span></Td>
                      <Td mono>{formatDate(user.createdAt)}</Td>
                      {canEdit && (
                        <Td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" disabled={user.id === currentUserId} onClick={() => openEdit(user)}>
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button variant="ghost" size="sm" disabled={user.id === currentUserId} onClick={() => setToggleConfirm(user)}>
                              {aba === "ativos" ? <UserX className="h-4 w-4 text-[#9A463B]" aria-hidden="true" /> : <UserPlus className="h-4 w-4 text-[#9A463B]" aria-hidden="true" />}
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

          {/* Footer pagination */}
          <div className="flex items-center justify-between px-[18px] py-[13px]">
            <span className="text-[12.5px] text-[#A0A099]">Mostrando {usersPaginados.length} usuários</span>
          </div>
        </div>

        <Pagination
          page={paginaNormalizada}
          totalPages={totalPaginas}
          totalItems={users.length}
          perPage={PAGINATION.DEFAULT_PER_PAGE}
          onPageChange={setPaginaAtual}
          label={aba === "ativos" ? "usuários ativos" : "usuários desativados"}
        />
      </div>

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
                    createForm.reset();
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
                      checked={createForm.setorIds.includes(setor.value)}
                      required={createRole === "atendente" && createForm.setorIds.length === 0}
                      onChange={(e) => createForm.handleSetorToggle(setor.value, e.target.checked)}
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
                  createForm.filteredServicoOptions.length === 0 ? "max-h-16 opacity-80" : "max-h-44 opacity-100"
                }`}
              >
                {createForm.filteredServicoOptions.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Selecione setor(es) para habilitar os serviços.</p>
                ) : (
                  createForm.filteredServicoOptions.map((servico, index) => (
                    <label
                      key={servico.value}
                      className="flex items-center gap-2 text-sm text-zinc-700 transition-all duration-300 ease-out dark:text-zinc-200"
                      style={{ transitionDelay: `${Math.min(index * 20, 180)}ms` }}
                    >
                      <input
                        type="checkbox"
                        name="servico_ids"
                        value={servico.value}
                        checked={createForm.servicoIds.includes(servico.value)}
                        disabled={createForm.setorIds.length === 0}
                        required={createRole === "atendente" && createForm.servicoIds.length === 0}
                        onChange={(e) => createForm.toggleServico(servico.value, e.target.checked)}
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
                <X className="h-4 w-4" aria-hidden="true" />
                Cancelar
              </Button>
              <Button type="submit" loading={isCreating}>
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Cadastrar
              </Button>
            </div>
          </Form>
        </Modal>
      )}

      {/* Modal: Editar perfil */}
      {editingUser && (
        <Modal title="Editar perfil" description="Atualize permissões e vínculos operacionais do usuário selecionado." size="lg" onClose={closeEdit}>
          <p className="mb-4 text-[13px] text-[#86867D]">
            Alterando perfil de{" "}
            <span className="font-semibold text-[#1C1C1A]">{editingUser.nome}</span>
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
                    editForm.reset();
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
                      checked={editForm.setorIds.includes(setor.value)}
                      required={editRole === "atendente" && editForm.setorIds.length === 0}
                      onChange={(e) => editForm.handleSetorToggle(setor.value, e.target.checked)}
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
                  editForm.filteredServicoOptions.length === 0 ? "max-h-16 opacity-80" : "max-h-44 opacity-100"
                }`}
              >
                {editForm.filteredServicoOptions.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Selecione setor(es) para habilitar os serviços.</p>
                ) : (
                  editForm.filteredServicoOptions.map((servico, index) => (
                    <label
                      key={servico.value}
                      className="flex items-center gap-2 text-sm text-zinc-700 transition-all duration-300 ease-out dark:text-zinc-200"
                      style={{ transitionDelay: `${Math.min(index * 20, 180)}ms` }}
                    >
                      <input
                        type="checkbox"
                        name="servico_ids"
                        value={servico.value}
                        checked={editForm.servicoIds.includes(servico.value)}
                        disabled={editForm.setorIds.length === 0}
                        required={editRole === "atendente" && editForm.servicoIds.length === 0}
                        onChange={(e) => editForm.toggleServico(servico.value, e.target.checked)}
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
                <X className="h-4 w-4" aria-hidden="true" />
                Cancelar
              </Button>
              <Button type="submit" loading={isEditing}>
                <Save className="h-4 w-4" aria-hidden="true" />
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
          <p className="mb-4 text-[13px] text-[#56564F]">
            Tem certeza que deseja {toggleConfirm.ativo ? "desativar" : "reativar"} o usuário{" "}
            <span className="font-semibold text-[#1C1C1A]">{toggleConfirm.nome}</span>?
          </p>
          {toggleConfirm.ativo && (
            <p className="mb-4 rounded-[9px] bg-[#FAF1E2] p-3 text-[13px] text-[#946726]">
              ⚠️ Usuários desativados não poderão acessar o sistema.
            </p>
          )}
          
          <Form action={toggleAction}>
            <input type="hidden" name="userId" value={toggleConfirm.id} />
            
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setToggleConfirm(null)}>
                <X className="h-4 w-4" aria-hidden="true" />
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
  );
}

"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { criarUsuarioAction, editarUsuarioAction, toggleActivoUsuarioAction } from "./actions";
import { notifyError, notifySuccess } from "@/lib/toast";

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
type SetorOption = { id: number; name: string };
type ServicoOption = { value: string; label: string; setor_id: number };

type UsuariosClientProps = {
  usersAtivos: User[];
  usersDesativados: User[];
  roleOptions: RoleOption[];
  setorOptions: SetorOption[];
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


export function CadastroClient({
  usersAtivos,
  usersDesativados,
  roleOptions,
  setorOptions,
  canEdit,
  currentUserId,
}: UsuariosClientProps & { setorOptions: SetorOption[] }) {
  const router = useRouter();
  const [aba, setAba] = useState<"ativos" | "desativados">("ativos");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<User | null>(null);
  const [createRole, setCreateRole] = useState(roleOptions[0]?.value ?? "solicitante");
  const [editRole, setEditRole] = useState("solicitante");

  const [createState, createAction, isCreating] = useActionState(criarUsuarioAction, {});
  const [editState, editAction, isEditing] = useActionState(editarUsuarioAction, {});
  const [toggleState, toggleAction, isToggling] = useActionState(toggleActivoUsuarioAction, {});

  useEffect(() => {
    if (createState.error) {
      notifyError(createState.error);
    }
    if (createState.success) {
      notifySuccess("Usuário cadastrado com sucesso.");
    }
  }, [createState.error, createState.success]);

  useEffect(() => {
    if (editState.error) {
      notifyError(editState.error);
    }
    if (editState.success) {
      notifySuccess("Perfil atualizado com sucesso.");
    }
  }, [editState.error, editState.success]);

  useEffect(() => {
    if (toggleState.error) {
      notifyError(toggleState.error);
    }
    if (toggleState.success) {
      notifySuccess(toggleConfirm?.ativo ? "Usuário desativado com sucesso." : "Usuário reativado com sucesso.");
      setTimeout(() => {
        setToggleConfirm(null);
        router.refresh();
      }, 0); // Usa um timeout para evitar renderizações em cascata
    }
  }, [toggleState.error, toggleState.success, toggleConfirm, router]);

  function closeCreate() {
    setCreateOpen(false);
    setCreateRole(roleOptions[0]?.value ?? "solicitante");
    router.refresh();
  }

  function closeEdit() {
    setEditingUser(null);
    setEditRole("solicitante");
    router.refresh();
  }

  const users = aba === "ativos" ? usersAtivos : usersDesativados;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          users.map((user) => (
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
            users.map((user) => (
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
                defaultValue={roleOptions[0]?.value}
                options={roleOptions}
                onChange={(e) => {
                  setCreateRole(e.target.value);
                }}
              />
            </Field>
            <Field label="Setor" htmlFor="c-setor">
              <Select
                id="c-setor"
                name="setor_id"
                options={setorOptions.map((setor) => ({ value: String(setor.id), label: setor.name }))}
                placeholder="Selecione um setor"
                required
                onChange={(e) => handleSetorChange(e.target.value)}
              />
            </Field>
            <Field label="Serviços" htmlFor="c-servicos">
              <Select
                id="c-servicos"
                name="servico_ids"
                options={filteredServicoOptions}
                placeholder="Selecione os serviços"
                multiple
                required
              />
            </Field>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={closeCreate}>
                <span className="material-symbols-outlined text-[18px]" title={createState.success ? "Fechar" : "Cancelar"} aria-hidden="true">
                  {createState.success ? "close" : "cancel"}
                </span>
                {createState.success ? "Fechar" : "Cancelar"}
              </Button>
              {!createState.success && (
                <Button type="submit" loading={isCreating}>
                  <span className="material-symbols-outlined text-[18px]" title="Cadastrar usuário" aria-hidden="true">
                    person_add
                  </span>
                  Cadastrar
                </Button>
              )}
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
                }}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={closeEdit}>
                <span className="material-symbols-outlined text-[18px]" title={editState.success ? "Fechar" : "Cancelar"} aria-hidden="true">
                  {editState.success ? "close" : "cancel"}
                </span>
                {editState.success ? "Fechar" : "Cancelar"}
              </Button>
              {!editState.success && (
                <Button type="submit" loading={isEditing}>
                  <span className="material-symbols-outlined text-[18px]" title="Salvar alterações" aria-hidden="true">
                    save
                  </span>
                  Salvar
                </Button>
              )}
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

function handleSetorChange(setorId: string) {
  const filtered = setorOptions.filter((setor) => setor.id === Number(setorId));
  setFilteredServicoOptions(filtered.map((setor) => ({ value: String(setor.id), label: setor.name, setor_id: setor.id })));
}

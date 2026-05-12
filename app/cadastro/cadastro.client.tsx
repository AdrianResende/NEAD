"use client";

import { useActionState, useState } from "react";
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
import { criarUsuarioAction, editarUsuarioAction } from "./actions";

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
};

type RoleOption = { value: string; label: string };
type SetorOption = { value: string; label: string };
type ServicoOption = { value: string; label: string; setor_id: number };

type UsuariosClientProps = {
  users: User[];
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

export function CadastroClient({
  users,
  roleOptions,
  setorOptions,
  servicoOptions,
  canEdit,
  currentUserId,
}: UsuariosClientProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createRole, setCreateRole] = useState(roleOptions[0]?.value ?? "solicitante");
  const [createSetor, setCreateSetor] = useState("");
  const [createServicoIds, setCreateServicoIds] = useState<string[]>([]);
  const [editRole, setEditRole] = useState("solicitante");
  const [editSetor, setEditSetor] = useState("");
  const [editServicoIds, setEditServicoIds] = useState<string[]>([]);

  const [createState, createAction, isCreating] = useActionState(criarUsuarioAction, {});
  const [editState, editAction, isEditing] = useActionState(editarUsuarioAction, {});

  function closeCreate() {
    setCreateOpen(false);
    setCreateRole(roleOptions[0]?.value ?? "solicitante");
    setCreateSetor("");
    setCreateServicoIds([]);
    router.refresh();
  }

  function closeEdit() {
    setEditingUser(null);
    setEditRole("solicitante");
    setEditSetor("");
    setEditServicoIds([]);
    router.refresh();
  }

  function toggleService(list: string[], serviceId: string) {
    if (list.includes(serviceId)) {
      return list.filter((id) => id !== serviceId);
    }
    return [...list, serviceId];
  }

  const createFilteredServicoOptions = servicoOptions.filter((option) =>
    createSetor ? option.setor_id === Number(createSetor) : true,
  );

  const editFilteredServicoOptions = servicoOptions.filter((option) =>
    editSetor ? option.setor_id === Number(editSetor) : true,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Cadastro de Usuários
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gerencie os usuários do sistema.
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setCreateOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Novo usuário
          </Button>
        )}
      </div>

      <Table>
        <TableHead>
          <Tr>
            <Th>Nome</Th>
            <Th>E-mail</Th>
            <Th>Perfil</Th>
            <Th>Setor</Th>
            <Th>Serviços vinculados</Th>
            <Th>Cadastrado em</Th>
            {canEdit && <Th className="text-right">Ações</Th>}
          </Tr>
        </TableHead>
        <TableBody>
          {users.length === 0 ? (
            <TableEmpty colSpan={canEdit ? 7 : 6} message="Nenhum usuário cadastrado." />
          ) : (
            users.map((user) => (
              <Tr key={user.id}>
                <Td>{user.nome}</Td>
                <Td muted>{user.email}</Td>
                <Td>
                  <Badge variant={ROLE_BADGE[user.role] ?? "default"}>
                    {ROLE_LABEL[user.role] ?? user.role}
                  </Badge>
                </Td>
                <Td muted>{user.setor ?? "—"}</Td>
                <Td muted>{user.servicos.length > 0 ? user.servicos.join(", ") : "—"}</Td>
                <Td muted>
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </Td>
                {canEdit && (
                  <Td className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={user.id === currentUserId}
                      onClick={() => {
                        setEditingUser(user);
                        setEditRole(user.role);
                        setEditSetor(user.role === "solicitante" ? "" : user.setor_id ? String(user.setor_id) : "");
                        setEditServicoIds(user.servico_ids.map(String));
                      }}
                    >
                      Editar
                    </Button>
                  </Td>
                )}
              </Tr>
            ))
          )}
        </TableBody>
      </Table>

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
                  const roleSelecionado = e.target.value;
                  setCreateRole(roleSelecionado);
                  if (roleSelecionado === "solicitante") {
                    setCreateSetor("");
                    setCreateServicoIds([]);
                  }
                }}
              />
            </Field>
            {createRole !== "solicitante" && (
              <Field label="Setor" htmlFor="c-setor">
                <Select
                  id="c-setor"
                  name="setor_id"
                  options={setorOptions}
                  placeholder="Sem setor"
                  value={createSetor}
                  onChange={(e) => {
                    const setorSelecionado = e.target.value;
                    setCreateSetor(setorSelecionado);
                    setCreateServicoIds((current) =>
                      current.filter((id) => {
                        const servico = servicoOptions.find((option) => option.value === id);
                        if (!servico) return false;
                        if (!setorSelecionado) return true;
                        return servico.setor_id === Number(setorSelecionado);
                      }),
                    );
                  }}
                />
              </Field>
            )}

            {createRole === "atendente" && createSetor && (
              <Field
                label="Serviços vinculados"
                hint="Selecione um ou mais serviços que o atendente poderá atender."
              >
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  {createFilteredServicoOptions.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum serviço disponível para o setor selecionado.</p>
                  ) : (
                    createFilteredServicoOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          name="servico_ids"
                          value={option.value}
                          checked={createServicoIds.includes(option.value)}
                          onChange={() =>
                            setCreateServicoIds((current) => toggleService(current, option.value))
                          }
                          className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary dark:border-zinc-700"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))
                  )}
                </div>
              </Field>
            )}

            {createState.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {createState.error}
              </p>
            )}
            {createState.success && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
                Usuário cadastrado com sucesso!
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={closeCreate}>
                {createState.success ? "Fechar" : "Cancelar"}
              </Button>
              {!createState.success && (
                <Button type="submit" loading={isCreating}>
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
                  const roleSelecionado = e.target.value;
                  setEditRole(roleSelecionado);
                  if (roleSelecionado === "solicitante") {
                    setEditSetor("");
                    setEditServicoIds([]);
                  }
                }}
              />
            </Field>
            {editRole !== "solicitante" && (
              <Field label="Setor" htmlFor="e-setor">
                <Select
                  id="e-setor"
                  name="setor_id"
                  options={setorOptions}
                  value={editSetor}
                  placeholder="Sem setor"
                  onChange={(e) => {
                    const setorSelecionado = e.target.value;
                    setEditSetor(setorSelecionado);
                    setEditServicoIds((current) =>
                      current.filter((id) => {
                        const servico = servicoOptions.find((option) => option.value === id);
                        if (!servico) return false;
                        if (!setorSelecionado) return true;
                        return servico.setor_id === Number(setorSelecionado);
                      }),
                    );
                  }}
                />
              </Field>
            )}

            {editRole === "atendente" && editSetor && (
              <Field
                label="Serviços vinculados"
                hint="Selecione um ou mais serviços que o atendente poderá atender."
              >
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  {editFilteredServicoOptions.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum serviço disponível para o setor selecionado.</p>
                  ) : (
                    editFilteredServicoOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          name="servico_ids"
                          value={option.value}
                          checked={editServicoIds.includes(option.value)}
                          onChange={() =>
                            setEditServicoIds((current) => toggleService(current, option.value))
                          }
                          className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary dark:border-zinc-700"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))
                  )}
                </div>
              </Field>
            )}

            {editState.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {editState.error}
              </p>
            )}
            {editState.success && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
                Perfil atualizado com sucesso!
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={closeEdit}>
                {editState.success ? "Fechar" : "Cancelar"}
              </Button>
              {!editState.success && (
                <Button type="submit" loading={isEditing}>
                  Salvar
                </Button>
              )}
            </div>
          </Form>
        </Modal>
      )}
    </div>
  );
}

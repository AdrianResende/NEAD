import { requireAuth } from "@/lib/require-auth";
import { getAssignableRoles, ROLE_LABELS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { CadastroClient } from "./cadastro.client";

export default async function CadastroPage() {
  const currentUser = await requireAuth();

  // Uma única query para todos os usuários, com select específico (evita carregar
  // password, sessions, accounts e outros campos desnecessários)
  const [allUsers, setores, servicos] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        setor_id: true,
        ativo: true,
        created_at: true,
        setor: { select: { nome: true } },
        servicosAtendidos: {
          select: {
            servico_id: true,
            servico: { select: { nome: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.setor.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
    prisma.servico.findMany({
      select: { id: true, nome: true, setor_id: true, setor: { select: { nome: true } } },
      orderBy: [{ setor: { nome: "asc" } }, { nome: "asc" }],
    }),
  ]);

  const usersAtivos = allUsers.filter((u) => u.ativo);
  const usersDesativados = allUsers.filter((u) => !u.ativo);

  const roleOptions = getAssignableRoles(currentUser.role).map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  }));

  const setorOptions = setores.map((s) => ({ value: String(s.id), label: s.nome }));
  const servicoOptions = servicos.map((s) => ({
    value: String(s.id),
    label: `${s.nome} (${s.setor.nome})`,
    setor_id: s.setor_id,
  }));
  const canEdit = currentUser.role === "admin" || currentUser.role === "atendente";

  const mapUsers = (users: typeof usersAtivos) =>
    users.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      role: u.role,
      setor: u.role === "solicitante" ? null : u.setor?.nome ?? null,
      setor_id: u.role === "solicitante" ? null : u.setor_id ?? null,
      servico_ids: u.servicosAtendidos.map((v) => v.servico_id),
      servicos: u.servicosAtendidos.map((v) => v.servico.nome),
      createdAt: u.created_at.toISOString(),
      ativo: u.ativo,
    }));

  return (
    <CadastroClient
      currentUserId={currentUser.id}
      canEdit={canEdit}
      roleOptions={roleOptions}
      setorOptions={setorOptions}
      servicoOptions={servicoOptions}
      usersAtivos={mapUsers(usersAtivos)}
      usersDesativados={mapUsers(usersDesativados)}
    />
  );
}

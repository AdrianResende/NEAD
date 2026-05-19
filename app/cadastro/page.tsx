import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { getAssignableRoles, ROLE_LABELS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { CadastroClient } from "./cadastro.client";

export default async function CadastroPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const currentUser = token ? await validateSession(token) : null;

  if (!currentUser) {
    redirect(ROUTES.LOGIN);
  }

  const [usersAtivos, usersDesativados, setores, servicos] = await Promise.all([
    prisma.user.findMany({
      where: { ativo: true },
      include: {
        setor: true,
        servicosAtendidos: {
          include: {
            servico: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.user.findMany({
      where: { ativo: false },
      include: {
        setor: true,
        servicosAtendidos: {
          include: {
            servico: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.setor.findMany({ orderBy: { nome: "asc" } }),
    prisma.servico.findMany({
      include: { setor: true },
      orderBy: [{ setor: { nome: "asc" } }, { nome: "asc" }],
    }),
  ]);

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

  const mapUsers = (users: typeof usersAtivos) => users.map((u) => ({
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

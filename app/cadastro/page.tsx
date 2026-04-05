import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { getAssignableRoles, ROLE_LABELS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { UsuariosClient } from "./usuarios.client";

export default async function CadastroPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const currentUser = token ? await validateSession(token) : null;

  if (!currentUser) {
    redirect(ROUTES.LOGIN);
  }

  const users = await prisma.user.findMany({
    include: { setor: true },
    orderBy: { created_at: "desc" },
  });

  const roleOptions = getAssignableRoles(currentUser.role).map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  }));

  const canEdit = currentUser.role === "admin" || currentUser.role === "atendente";

  return (
    <UsuariosClient
      currentUserId={currentUser.id}
      canEdit={canEdit}
      roleOptions={roleOptions}
      users={users.map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        role: u.role,
        setor: u.setor?.nome ?? null,
        createdAt: u.created_at.toISOString(),
      }))}
    />
  );
}

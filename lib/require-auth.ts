import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getFirstMenuRouteByRole } from "@/lib/navigation";

/**
 * Valida a sessão do usuário. Redireciona para login se não autenticado.
 */
export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;
  if (!user) redirect(ROUTES.LOGIN);
  return user;
}

/**
 * Valida a sessão e exige que o usuário seja admin.
 * Redireciona para a rota padrão do perfil caso não seja.
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") redirect(getFirstMenuRouteByRole(user.role));
  return user;
}

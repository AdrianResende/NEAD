import { ROUTES } from "./constants";

export function getFirstMenuRouteByRole(role: string | null | undefined) {
  if (role === "admin") return ROUTES.CADASTRO;
  if (role === "atendente") return ROUTES.CHAMADOS;
  return ROUTES.CHAMADOS;
}

export function getPostLoginRoute(user: {
  role: string | null | undefined;
  mustChangePassword?: boolean | null;
}) {
  if (user.mustChangePassword) return ROUTES.ALTERAR_SENHA;
  return getFirstMenuRouteByRole(user.role);
}

import { ROUTES } from "@/lib/constants";

export function getFirstMenuRouteByRole(role: string | null | undefined) {
  if (role === "admin") return ROUTES.CADASTRO;
  if (role === "atendente") return ROUTES.CHAMADOS;
  return ROUTES.CHAMADOS;
}

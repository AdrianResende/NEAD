export const USER_ROLES = ["admin", "atendente", "solicitante"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  atendente: "Atendente",
  solicitante: "Solicitante",
};

export function normalizeRole(role: string | null | undefined): UserRole {
  const normalized = role?.trim().toLowerCase();
  if (normalized === "admin") return "admin";
  if (normalized === "atendente") return "atendente";
  return "solicitante";
}

export function getAssignableRoles(currentUserRole: string | null | undefined): UserRole[] {
  const role = normalizeRole(currentUserRole);
  if (role === "admin") {
    return [...USER_ROLES];
  }

  if (role === "atendente") {
    return ["atendente", "solicitante"];
  }

  return ["solicitante"];
}
export const APP_NAME = "NEAD";
export const APP_DESCRIPTION =
  "Núcleo de Educação a Distância — plataforma de ensino online.";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ALTERAR_SENHA: "/alterar-senha",
  CADASTRO: "/cadastro",
  COURSES: "/cursos",
  SETORES: "/admin/setores",
  SERVICOS: "/admin/servicos",
  CHAMADOS: "/chamados",
  CHAMADOS_NOVO: "/chamados/novo",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 12,
} as const;

export const CHAMADO_STATUS_LABELS: Record<string, string> = {
  aberto: "Aberto",
  atribuido: "Atribuído",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
  fechado: "Fechado",
  cancelado: "Cancelado",
};

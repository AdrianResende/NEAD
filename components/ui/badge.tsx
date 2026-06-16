import * as React from "react";
import { cn } from "@/lib/utils";

// --- Status badge (chamado status) ---
const STATUS_MAP: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  aberto:       { bg: "#EAF1F7", color: "#2F6593", dot: "#4189C4", label: "Aberto" },
  atribuido:    { bg: "#EEEDF8", color: "#56539B", dot: "#7A77C9", label: "Atribuído" },
  em_andamento: { bg: "#FAF1E2", color: "#946726", dot: "#D89B3B", label: "Em andamento" },
  resolvido:    { bg: "#EAF3EC", color: "#3A6B47", dot: "#5A9E6B", label: "Resolvido" },
  fechado:      { bg: "#EFEFEC", color: "#6B6B62", dot: "#A0A099", label: "Fechado" },
  cancelado:    { bg: "#F8ECEA", color: "#9A463B", dot: "#C9685A", label: "Cancelado" },
};

// --- Role badge ---
const ROLE_MAP: Record<string, { bg: string; color: string; label: string }> = {
  admin:       { bg: "#EDEAF6", color: "#5B4E9A", label: "Admin" },
  atendente:   { bg: "#E6F0EF", color: "#356561", label: "Atendente" },
  solicitante: { bg: "#F0F0EC", color: "#6B6B62", label: "Solicitante" },
};

// --- Priority badge ---
const PRIORITY_MAP: Record<string, { color: string; dot: string; label: string }> = {
  baixa:   { color: "#5E7A52", dot: "#8FB07E", label: "Baixa" },
  media:   { color: "#8A6A24", dot: "#D89B3B", label: "Média" },
  alta:    { color: "#A85C2E", dot: "#D97A3B", label: "Alta" },
  critica: { color: "#9A463B", dot: "#C9554A", label: "Crítica" },
};

// Generic badge variant (for backwards compat)
type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[#F0F0EC] text-[#6B6B62]",
  success: "bg-[#EAF3EC] text-[#3A6B47]",
  warning: "bg-[#FAF1E2] text-[#946726]",
  danger:  "bg-[#F8ECEA] text-[#9A463B]",
  info:    "bg-[#EAF1F7] text-[#2F6593]",
  outline: "border border-[#E4E4DE] bg-transparent text-[#56564F]",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[999px] px-[9px] py-[3px] text-xs font-semibold leading-[1.4]",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// --- StatusBadge: dot + label ---
export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.aberto;
  return (
    <span
      className="inline-flex items-center gap-[6px] rounded-[999px] px-[9px] py-[3px] text-xs font-semibold leading-[1.4] whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="inline-block h-[6px] w-[6px] shrink-0 rounded-full"
        style={{ background: s.dot }}
      />
      {s.label}
    </span>
  );
}

// --- RoleBadge ---
export function RoleBadge({ role }: { role: string }) {
  const r = ROLE_MAP[role] ?? ROLE_MAP.solicitante;
  return (
    <span
      className="inline-flex items-center rounded-[999px] px-[10px] py-[3px] text-xs font-semibold leading-[1.4]"
      style={{ background: r.bg, color: r.color }}
    >
      {r.label}
    </span>
  );
}

// --- PriorityBadge: dot + label, no background ---
export function PriorityBadge({ priority }: { priority: string }) {
  const p = PRIORITY_MAP[priority] ?? PRIORITY_MAP.baixa;
  return (
    <span
      className="inline-flex items-center gap-[7px] text-[13px] font-medium"
      style={{ color: p.color }}
    >
      <span
        className="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ background: p.dot }}
      />
      {p.label}
    </span>
  );
}

// --- UrgentBadge ---
export function UrgentBadge() {
  return (
    <span className="inline-flex items-center rounded-[999px] bg-[#F8ECEA] px-[9px] py-[3px] text-xs font-bold uppercase tracking-[0.05em] text-[#9A463B]">
      Urgente
    </span>
  );
}

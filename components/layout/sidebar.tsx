"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

function isPathMatch(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === ROUTES.HOME) return false;
  return pathname.startsWith(`${href}/`);
}

function getActiveHref(pathname: string, items: MenuItem[]) {
  const matches = items.filter((item) => isPathMatch(pathname, item.href));
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.href.length - a.href.length)[0].href;
}

function getMenuGroups(role: string | null): { label: string; items: MenuItem[] }[] {
  if (role === "admin") {
    return [
      {
        label: "Operação",
        items: [
          {
            label: "Chamados",
            href: ROUTES.CHAMADOS,
            icon: (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 6v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-6z" />
                <path d="M13 4v16" strokeDasharray="2 2" />
              </svg>
            ),
          },
        ],
      },
      {
        label: "Administração",
        items: [
          {
            label: "Usuários",
            href: ROUTES.CADASTRO,
            icon: (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="8" r="3.2" />
                <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
                <path d="M16 5.5a3 3 0 0 1 0 5.4M17.5 19a5 5 0 0 0-3-4.6" />
              </svg>
            ),
          },
          {
            label: "Setores & Serviços",
            href: ROUTES.SETORES,
            icon: (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3 21 8l-9 5-9-5z" />
                <path d="M3 13l9 5 9-5M3 16.5l9 5 9-5" opacity="0.55" />
              </svg>
            ),
          },
        ],
      },
    ];
  }

  if (role === "atendente") {
    return [
      {
        label: "Operação",
        items: [
          {
            label: "Chamados",
            href: ROUTES.CHAMADOS,
            icon: (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 6v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-6z" />
                <path d="M13 4v16" strokeDasharray="2 2" />
              </svg>
            ),
          },
        ],
      },
    ];
  }

  return [
    {
      label: "Minha área",
      items: [
        {
          label: "Meus Chamados",
          href: ROUTES.CHAMADOS,
          icon: (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 6v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-6z" />
              <path d="M13 4v16" strokeDasharray="2 2" />
            </svg>
          ),
        },
      ],
    },
  ];
}

export function Sidebar({
  role,
  currentUser,
}: {
  role: string | null;
  currentUser: { nome: string; role: string; setor: string | null } | null;
}) {
  const pathname = usePathname();
  const groups = getMenuGroups(role);
  const allItems = groups.flatMap((g) => g.items);
  const activeHref = getActiveHref(pathname, allItems);

  const initials = (currentUser?.nome ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const roleLabel =
    currentUser?.role === "admin"
      ? "Administrador"
      : currentUser?.role === "atendente"
        ? "Atendente"
        : "Solicitante";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-[#E8E8E3] bg-[#FBFBFA] md:flex" style={{ position: "sticky", top: 0, height: "100vh" }}>
        {/* Brand */}
        <div className="flex items-center gap-[11px] px-[18px] pb-[18px] pt-5">
          <div
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] text-base font-bold text-white"
            style={{ background: "var(--color-accent)", boxShadow: "0 2px 6px rgba(46,92,88,0.3)" }}
          >
            N
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-[#1C1C1A]">NEAD</p>
            <p className="text-[11.5px] font-medium text-[#97978F]">Central de Chamados</p>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex flex-col gap-[3px] px-3 pb-4" aria-label="Menu lateral">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-[10px] pb-[6px] pt-[10px] text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#A8A89F]">
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = item.href === activeHref;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex w-full items-center gap-[11px] rounded-[9px] px-[11px] py-[9px] text-[14px] font-medium transition-colors",
                      isActive
                        ? "bg-[#EAF2F1] font-semibold text-[#2E5C58]"
                        : "text-[#5C5C56] hover:bg-[#F4F4F1] hover:text-[#1C1C1A]"
                    )}
                  >
                    <span className={isActive ? "text-[#2E5C58]" : "text-[#86867D]"}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="mt-auto border-t border-[#ECECE7] px-[14px] py-[14px]">
          <div className="flex items-center gap-[10px] rounded-[11px] bg-[#F4F4F1] p-2">
            <div
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
              style={{ background: "#6E8B89" }}
            >
              {initials || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-[#1C1C1A]">
                {currentUser?.nome ?? "Usuário"}
              </p>
              <p className="text-[11.5px] text-[#97978F]">{roleLabel}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile nav bar */}
      <nav
        className="border-b border-[#E8E8E3] bg-[#FBFBFA] px-4 py-2.5 md:hidden"
        aria-label="Menu mobile"
      >
        <div className="flex gap-2 overflow-x-auto">
          {allItems.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-[20px] border px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[#3E6F6B] bg-[#EAF2F1] text-[#2E5C58]"
                    : "border-[#E8E8E3] text-[#5C5C56] hover:bg-[#F4F4F1]"
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

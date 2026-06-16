"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Layers3, Ticket } from "lucide-react";
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

function getMenuItems(role: string | null): MenuItem[] {
  if (role === "admin") {
    return [
      { label: "Usuários", href: ROUTES.CADASTRO, icon: <Users className="h-4 w-4" /> },
      { label: "Setores", href: ROUTES.SETORES, icon: <Layers3 className="h-4 w-4" /> },
      { label: "Chamados", href: ROUTES.CHAMADOS, icon: <Ticket className="h-4 w-4" /> },
    ];
  }
  if (role === "atendente") {
    return [
      { label: "Chamados", href: ROUTES.CHAMADOS, icon: <Ticket className="h-4 w-4" /> },
    ];
  }
  return [
    { label: "Meus Chamados", href: ROUTES.CHAMADOS, icon: <Ticket className="h-4 w-4" /> },
  ];
}

export function Sidebar({ role }: { role: string | null }) {
  const pathname = usePathname();
  const MENU_ITEMS = getMenuItems(role);
  const activeHref = getActiveHref(pathname, MENU_ITEMS);

  return (
    <>
      <aside className="hidden w-64 shrink-0 bg-[#15263A] p-4 md:block">
        <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
          Menu
        </p>
        <nav className="space-y-1" aria-label="Menu lateral">
          {MENU_ITEMS.map((item, index) => {
            const isActive = item.href === activeHref;

            return (
              <Link
                key={`${item.href}-${item.label}-${index}`}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[8px] px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/12 text-white"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                )}
              >
                <span className={isActive ? "text-white" : "text-white/50"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav
        className="border-b border-[#E9ECEF] bg-[#F7F9FB] px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60 md:hidden"
        aria-label="Menu mobile"
      >
        <div className="flex gap-2 overflow-x-auto">
          {MENU_ITEMS.map((item, index) => {
            const isActive = item.href === activeHref;

            return (
              <Link
                key={`${item.href}-${item.label}-${index}`}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-[20px] border px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-white"
                    : "border-[#E9ECEF] text-zinc-700 hover:bg-[#E8F4FF] hover:border-primary hover:text-primary dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                )}
              >
                <span className={isActive ? "text-white" : "text-zinc-500 dark:text-zinc-400"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

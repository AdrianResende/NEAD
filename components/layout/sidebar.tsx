"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MenuItem = {
  label: string;
  href: string;
};

function getMenuItems(role: string | null): MenuItem[] {
  if (role === "admin") {
    return [
      { label: "Usuários", href: ROUTES.CADASTRO },
      { label: "Setores", href: ROUTES.SETORES },
      { label: "Chamados", href: ROUTES.CHAMADOS },
    ];
  }
  if (role === "atendente") {
    return [
      { label: "Chamados", href: ROUTES.CHAMADOS },
    ];
  }
  // solicitante or null
  return [
    
    { label: "Meus Serviços", href: ROUTES.CHAMADOS },
    { label: "Solicitar Serviço", href: ROUTES.CHAMADOS_NOVO },
  ];
}

export function Sidebar({ role }: { role: string | null }) {
  const pathname = usePathname();
  const MENU_ITEMS = getMenuItems(role);

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-zinc-50/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 md:block">
        <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          Menu
        </p>
        <nav className="space-y-1" aria-label="Menu lateral">
          {MENU_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== ROUTES.HOME && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-zinc-700 hover:bg-zinc-200/70 dark:text-zinc-200 dark:hover:bg-zinc-800"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav
        className="border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60 md:hidden"
        aria-label="Menu mobile"
      >
        <div className="flex gap-2 overflow-x-auto">
          {MENU_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== ROUTES.HOME && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-white"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

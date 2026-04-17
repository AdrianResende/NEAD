"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { ROLE_LABELS, normalizeRole } from "@/lib/roles";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type HeaderProps = {
  currentUser: {
    nome: string;
    role: string;
    setor: string | null;
  } | null;
};

export function Header({ currentUser }: HeaderProps) {
  const router = useRouter();
  const role = normalizeRole(currentUser?.role);
  const subtitle = currentUser?.setor ?? ROLE_LABELS[role];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(ROUTES.LOGIN);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {currentUser?.nome ?? "Usuário"}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-transparent px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Sair
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

const navLinks = [
  { href: ROUTES.COURSES, label: "Cursos" },
  { href: ROUTES.DASHBOARD, label: "Dashboard" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={ROUTES.HOME}
          className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          NEAD
        </Link>

        {/* Navegação */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.LOGIN}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Entrar
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Começar
          </Link>
        </div>
      </div>
    </header>
  );
}

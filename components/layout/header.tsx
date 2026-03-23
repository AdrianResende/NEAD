"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { ROUTES } from "@/lib/constants";
import logo from "@/app/assets/logo.png";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
  const { data: session } = useSession();
  const isLogged = !!session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Image
          src={logo}
          alt="Logo do NEAD"
          width={180}
          height={90}
          className="h-10 w-auto object-contain"
        />

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLogged ? (
            <>
              <Link
                href={ROUTES.DASHBOARD}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-transparent px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => signOut({ redirectTo: ROUTES.LOGIN })}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-transparent px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-transparent px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

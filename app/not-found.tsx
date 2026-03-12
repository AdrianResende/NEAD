import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4 text-center dark:bg-zinc-950">
      <span className="text-7xl font-extrabold text-zinc-200 dark:text-zinc-800">
        404
      </span>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Página não encontrada
      </h1>
      <p className="max-w-sm text-zinc-500 dark:text-zinc-400">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        href={ROUTES.HOME}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Voltar para a página inicial
      </Link>
    </div>
  );
}

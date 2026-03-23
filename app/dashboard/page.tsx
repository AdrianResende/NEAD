import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        Dashboard
      </h1>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">
        Área inicial do sistema NEAD.
      </p>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Usuário autenticado: {session?.user?.email} (ID: {session?.user?.id})
      </p>
    </div>
  );
}

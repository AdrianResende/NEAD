"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Button, Field, Form, Input } from "@/components/ui";
import { notifyError } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
    const password = (formData.get("password") as string | null) ?? "";

    if (!email || !password) {
      const message = "Preencha e-mail e senha.";
      notifyError(message);
      setIsPending(false);
      return;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      const message = payload?.error ?? "E-mail ou senha inválidos.";
      notifyError(message);
      setIsPending(false);
      return;
    }

    const payload = (await response.json().catch(() => null)) as
      | { redirectTo?: string }
      | null;

    router.push(payload?.redirectTo ?? ROUTES.CHAMADOS);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Entrar</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Faça login para acessar o sistema.
        </p>

        <Form onSubmit={handleSubmit} className="mt-6">
          <Field label="E-mail" htmlFor="email">
            <Input id="email" name="email" type="email" placeholder="seuemail@nead.com" required />
          </Field>

          <Field label="Senha" htmlFor="password">
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
            <Link
              href={ROUTES.CADASTRO}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-zinc-300 bg-transparent px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Cadastrar
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

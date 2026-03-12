"use client";

import { useRouter } from "next/navigation";
import { Button, Field, Form, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Entrar</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Faça login para acessar o sistema.
        </p>

        <Form className="mt-6">
          <Field label="E-mail" htmlFor="email">
            <Input id="email" type="email" placeholder="seuemail@nead.com" />
          </Field>

          <Field label="Senha" htmlFor="password">
            <Input id="password" type="password" placeholder="••••••••" />
          </Field>

          <Button
            type="button"
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
            Entrar no sistema
          </Button>
        </Form>
      </div>
    </div>
  );
}

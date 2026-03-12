"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Button, Field, Form, Input } from "@/components/ui";

export default function CadastroPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Cadastrar</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Crie seu acesso para entrar no sistema.
        </p>

        <Form className="mt-6">
          <Field label="Nome" htmlFor="name">
            <Input id="name" type="text" placeholder="Seu nome completo" />
          </Field>

          <Field label="E-mail" htmlFor="email">
            <Input id="email" type="email" placeholder="seuemail@nead.com" />
          </Field>

          <Field label="Senha" htmlFor="password">
            <Input id="password" type="password" placeholder="••••••••" />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              className="w-full"
              onClick={() => router.push(ROUTES.DASHBOARD)}
            >
              Cadastrar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push(ROUTES.LOGIN)}
            >
              Entrar
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

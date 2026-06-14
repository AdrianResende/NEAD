"use client";

import { useActionState } from "react";
import { Button, Field, Form, Input } from "@/components/ui";
import { alterarSenhaAction, type AlterarSenhaState } from "./actions";

const initialState: AlterarSenhaState = {};

export function AlterarSenhaClient() {
  const [state, action, pending] = useActionState(alterarSenhaAction, initialState);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Trocar senha</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          No primeiro acesso, você precisa definir uma nova senha para continuar.
        </p>

        {state.error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {state.error}
          </p>
        ) : null}

        <Form action={action} className="mt-6">
          <Field label="Senha atual" htmlFor="currentPassword" required>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </Field>

          <Field label="Nova senha" htmlFor="password" required hint="Use pelo menos 6 caracteres.">
            <Input id="password" name="password" type="password" required />
          </Field>

          <Field label="Confirmar nova senha" htmlFor="confirmPassword" required>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
          </Field>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Atualizar senha"}
          </Button>
        </Form>
      </div>
    </div>
  );
}
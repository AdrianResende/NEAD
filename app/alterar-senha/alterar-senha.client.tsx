"use client";

import { useActionState } from "react";
import { Button, Field, Form, Input } from "@/components/ui";
import { alterarSenhaAction, type AlterarSenhaState } from "./actions";

const initialState: AlterarSenhaState = {};

export function AlterarSenhaClient() {
  const [state, action, pending] = useActionState(alterarSenhaAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F4F2] px-4">
      <div className="w-full max-w-[400px]">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-[14px] text-xl font-bold text-white"
            style={{ background: "var(--color-accent)", boxShadow: "0 4px 14px rgba(46,92,88,0.3)" }}
          >
            N
          </div>
          <div className="text-center">
            <p className="text-[17px] font-bold text-[#1C1C1A]">NEAD</p>
            <p className="text-[13px] text-[#86867D]">Central de Chamados</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-7 shadow-[0_4px_24px_rgba(28,28,26,0.07)]">
          <h1 className="mb-1 text-[20px] font-bold text-[#1C1C1A]">Definir nova senha</h1>
          <p className="mb-6 text-[13.5px] text-[#86867D]">
            No primeiro acesso, você precisa definir uma nova senha para continuar.
          </p>

          {state.error ? (
            <p className="mb-4 rounded-[9px] border border-[#F0D5D2] bg-[#FAF1F0] px-3 py-2 text-[13px] text-[#9A463B]">
              {state.error}
            </p>
          ) : null}

          <Form action={action}>
            <Field label="Senha atual" htmlFor="currentPassword" required>
              <Input id="currentPassword" name="currentPassword" type="password" required />
            </Field>

            <Field label="Nova senha" htmlFor="password" required hint="Use pelo menos 6 caracteres.">
              <Input id="password" name="password" type="password" required />
            </Field>

            <Field label="Confirmar nova senha" htmlFor="confirmPassword" required>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </Field>

            <Button type="submit" className="mt-1 w-full" loading={pending}>
              {pending ? "Salvando…" : "Atualizar senha"}
            </Button>
          </Form>
        </div>

        <p className="mt-5 text-center text-[12.5px] text-[#A8A89F]">
          NEAD — Central de Chamados
        </p>
      </div>
    </div>
  );
}

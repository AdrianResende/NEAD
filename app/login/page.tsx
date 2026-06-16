"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Button, Field, Form, Input } from "@/components/ui";
import { notifyError } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
    const password = (formData.get("password") as string | null) ?? "";

    if (!email || !password) {
      notifyError("Preencha e-mail e senha.");
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
      notifyError(payload?.error ?? "E-mail ou senha inválidos.");
      setIsPending(false);
      return;
    }

    const payload = (await response.json().catch(() => null)) as { redirectTo?: string } | null;
    router.push(payload?.redirectTo ?? ROUTES.CHAMADOS);
    router.refresh();
  }

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
          <h1 className="mb-1 text-[20px] font-bold text-[#1C1C1A]">Entrar</h1>
          <p className="mb-6 text-[13.5px] text-[#86867D]">Acesse sua conta para continuar.</p>

          <Form onSubmit={handleSubmit}>
            <Field label="E-mail" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seuemail@nead.com"
                required
                autoComplete="email"
              />
            </Field>

            <Field label="Senha" htmlFor="password">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </Field>

            <Button type="submit" className="mt-1 w-full" loading={isPending}>
              {isPending ? "Entrando…" : "Entrar"}
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

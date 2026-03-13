"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { ROUTES } from "@/lib/constants";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const senha = formData.get("senha") as string;

  if (!email || !senha) {
    return { error: "Preencha e-mail e senha." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { error: "E-mail ou senha inválidos." };
  }

  const senhaValida = await bcrypt.compare(senha, user.senha);

  if (!senhaValida) {
    return { error: "E-mail ou senha inválidos." };
  }

  await createSession({
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
  });

  redirect(ROUTES.DASHBOARD);
}

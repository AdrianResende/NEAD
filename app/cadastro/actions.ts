"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { ROUTES } from "@/lib/constants";

export type CadastroState = {
  error?: string;
};

export async function cadastroAction(
  _prevState: CadastroState,
  formData: FormData
): Promise<CadastroState> {
  const nome = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;

  if (!nome || !email || !password) {
    return { error: "Preencha nome, e-mail e senha." };
  }

  if (password.length < 6) {
    return { error: "A senha precisa ter no mínimo 6 caracteres." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Este e-mail já está em uso." };
  }

  const senhaHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      role: "solicitante",
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: ROUTES.DASHBOARD,
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: "Usuário criado, mas não foi possível autenticar. Tente entrar novamente." };
  }

  return {};
}

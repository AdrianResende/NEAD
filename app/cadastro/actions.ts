"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSession,
  getSessionMaxAge,
  hashPassword,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      nome,
      email,
      password: passwordHash,
      role: "solicitante",
    },
  });

  const token = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: getSessionMaxAge(),
    path: "/",
  });

  redirect(ROUTES.DASHBOARD);

  return {};
}

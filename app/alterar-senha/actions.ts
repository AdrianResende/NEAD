"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword, SESSION_COOKIE_NAME, validateSession, verifyPassword } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getPostLoginRoute } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";

export type AlterarSenhaState = {
  error?: string;
};

export async function alterarSenhaAction(
  _prevState: AlterarSenhaState,
  formData: FormData
): Promise<AlterarSenhaState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  if (!user.mustChangePassword) {
    redirect(getPostLoginRoute(user));
  }

  const senhaAtual = (formData.get("currentPassword") as string | null) ?? "";
  const novaSenha = (formData.get("password") as string | null) ?? "";
  const confirmarSenha = (formData.get("confirmPassword") as string | null) ?? "";

  if (!senhaAtual || !novaSenha || !confirmarSenha) {
    return { error: "Preencha a senha atual, a nova senha e a confirmação." };
  }

  const senhaAtualValida = await verifyPassword(senhaAtual, user.password);
  if (!senhaAtualValida) {
    return { error: "A senha atual está incorreta." };
  }

  if (novaSenha.length < 6) {
    return { error: "A nova senha precisa ter no mínimo 6 caracteres." };
  }

  if (novaSenha !== confirmarSenha) {
    return { error: "A confirmação da senha não confere." };
  }

  if (novaSenha === senhaAtual) {
    return { error: "A nova senha precisa ser diferente da senha atual." };
  }

  const passwordHash = await hashPassword(novaSenha);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: passwordHash,
      mustChangePassword: false,
    },
  });

  redirect(getPostLoginRoute({ role: user.role, mustChangePassword: false }));
}
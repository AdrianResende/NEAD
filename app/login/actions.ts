"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { ROUTES } from "@/lib/constants";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: ROUTES.DASHBOARD,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha inválidos." };
    }
    throw error;
  }
}

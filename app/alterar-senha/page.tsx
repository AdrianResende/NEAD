import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getPostLoginRoute } from "@/lib/navigation";
import { AlterarSenhaClient } from "./alterar-senha.client";

export default async function AlterarSenhaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  if (!user.mustChangePassword) {
    redirect(getPostLoginRoute(user));
  }

  return <AlterarSenhaClient />;
}
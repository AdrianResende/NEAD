import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { getFirstMenuRouteByRole } from "@/lib/navigation";

export default async function ServicosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) redirect(ROUTES.LOGIN);
  if (user.role !== "admin") redirect(getFirstMenuRouteByRole(user.role));

  redirect(ROUTES.SETORES);
}

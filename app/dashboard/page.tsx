import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getFirstMenuRouteByRole } from "@/lib/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;

  if (!user) redirect(ROUTES.LOGIN);
  redirect(getFirstMenuRouteByRole(user.role));
}

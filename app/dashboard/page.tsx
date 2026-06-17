import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/require-auth";
import { getFirstMenuRouteByRole } from "@/lib/navigation";

export default async function DashboardPage() {
  const user = await requireAuth();
  redirect(getFirstMenuRouteByRole(user.role));
}

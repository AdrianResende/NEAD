import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { requireAdmin } from "@/lib/require-auth";

export default async function ServicosPage() {
  await requireAdmin();
  redirect(ROUTES.SETORES);
}

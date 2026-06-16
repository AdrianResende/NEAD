"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ROUTES } from "@/lib/constants";

type LayoutShellProps = {
  children: React.ReactNode;
  role: string | null;
  currentUser: {
    nome: string;
    role: string;
    setor: string | null;
  } | null;
};

export function LayoutShell({ children, role, currentUser }: LayoutShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === ROUTES.LOGIN || pathname === ROUTES.ALTERAR_SENHA;

  if (isAuthPage) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} currentUser={currentUser} />
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top nav rendered inside sidebar, desktop sidebar is sticky */}
        <Header currentUser={currentUser} />
        <main className="flex-1 overflow-y-auto px-8 py-7">
          <div className="mx-auto max-w-[1180px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

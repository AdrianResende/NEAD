"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ROUTES } from "@/lib/constants";

type LayoutShellProps = {
  children: React.ReactNode;
};

export function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === ROUTES.LOGIN;

  if (isAuthPage) {
    return (
      <>
        <main className="flex-1">{children}</main>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}

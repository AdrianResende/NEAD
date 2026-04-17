import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LayoutShell } from "@/components/layout/layout-shell";
import { validateSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NEAD — Núcleo de Educação a Distância",
    template: "%s | NEAD",
  },
  description:
    "Plataforma de ensino a distância do Núcleo de Educação a Distância (NEAD).",
  keywords: ["educação", "EAD", "cursos online", "NEAD"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "NEAD",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await validateSession(token) : null;
  const role = user?.role ?? null;

  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-white font-sans antialiased dark:bg-zinc-950">
        <LayoutShell role={role}>{children}</LayoutShell>
      </body>
    </html>
  );
}

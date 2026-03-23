import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { auth } from "@/auth";
import { LayoutShell } from "@/components/layout/layout-shell";
import { AuthProvider } from "@/components/providers/auth-provider";
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
  const session = await auth();

  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-white font-sans antialiased dark:bg-zinc-950">
        <AuthProvider session={session}>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}

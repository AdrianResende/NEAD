import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { LayoutShell } from "@/components/layout/layout-shell";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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

  return (
    <html lang="pt-BR" className={hanken.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-[#F4F4F2] font-sans antialiased">
        <LayoutShell
          role={user?.role ?? null}
          currentUser={
            user
              ? {
                  nome: user.nome,
                  role: user.role,
                  setor: user.role === "solicitante" ? null : user.setor?.nome ?? null,
                }
              : null
          }
        >
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}

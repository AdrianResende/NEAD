import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-white font-sans antialiased dark:bg-zinc-950">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

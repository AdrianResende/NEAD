"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

type HeaderProps = {
  currentUser: {
    nome: string;
    role: string;
    setor: string | null;
  } | null;
};

export function Header({ currentUser }: HeaderProps) {
  const router = useRouter();
  const isSolicitante = currentUser?.role === "solicitante";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(ROUTES.LOGIN);
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-[#E8E8E3] px-7"
      style={{ background: "rgba(251,251,250,0.85)", backdropFilter: "blur(8px)" }}
    >
      {/* Search */}
      <div className="relative flex-1" style={{ maxWidth: 420 }}>
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A89F]"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          placeholder="Buscar chamados, usuários, serviços…"
          className="h-[38px] w-full rounded-[10px] border border-[#E4E4DE] bg-white pl-9 pr-3 text-[13.5px] text-[#1C1C1A] outline-none placeholder:text-[#A8A89F] focus:border-[#3E6F6B] focus:ring-2 focus:ring-[rgba(62,111,107,0.15)]"
        />
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notification bell */}
        <button
          type="button"
          className="relative flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#E4E4DE] bg-white text-[#56564F] transition-colors hover:bg-[#F4F4F1]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <span className="absolute right-[8px] top-[7px] h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-[#C9554A]" />
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-[38px] items-center gap-[6px] rounded-[10px] border border-[#E4E4DE] bg-white px-3 text-[13px] font-medium text-[#56564F] transition-colors hover:bg-[#F4F4F1]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2M10 17l5-5-5-5M15 12H3" />
          </svg>
          Sair
        </button>

        {/* Botão novo chamado — abre modal na página de chamados */}
        <Link
          href={`${ROUTES.CHAMADOS}?novo=1`}
          className="flex h-[38px] items-center gap-[7px] rounded-[10px] px-[15px] text-[13.5px] font-semibold transition-colors"
          style={{ background: "var(--color-accent)", color: "white", boxShadow: "0 1px 2px rgba(46,92,88,0.25)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-accent-h)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-accent)")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {isSolicitante ? "Solicitar Serviço" : "Novo chamado"}
        </Link>
      </div>
    </header>
  );
}

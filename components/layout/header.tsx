"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

type Notification = {
  id: number;
  titulo: string;
  descricao: string;
  href: string;
  data: string;
};

type HeaderProps = {
  currentUser: {
    nome: string;
    role: string;
    setor: string | null;
  } | null;
};

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export function Header({ currentUser }: HeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(ROUTES.LOGIN);
    router.refresh();
  }

  async function toggleNotifications() {
    if (!open && !fetched) {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data.notifications ?? []);
        setFetched(true);
      } finally {
        setLoading(false);
      }
    }
    setOpen((prev) => !prev);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={toggleNotifications}
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#E4E4DE] bg-white text-[#56564F] transition-colors hover:bg-[#F4F4F1]"
            aria-label="Notificações"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            <span className="absolute right-[8px] top-[7px] h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-[#C9554A]" />
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[340px] overflow-hidden rounded-[14px] border border-[#E8E8E3] bg-white shadow-[0_8px_24px_rgba(28,28,26,0.12)]">
              <div className="flex items-center justify-between border-b border-[#F0F0EC] px-4 py-3">
                <span className="text-[13px] font-semibold text-[#1C1C1A]">Notificações</span>
                <span className="text-[11px] text-[#A8A89F]">Últimas atividades</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8 text-[13px] text-[#A8A89F]">
                  Carregando...
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C4C4BC" strokeWidth="1.5" className="mb-2">
                    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                  </svg>
                  <p className="text-[13px] text-[#A8A89F]">Nenhuma atividade recente</p>
                </div>
              ) : (
                <ul className="max-h-[340px] overflow-y-auto divide-y divide-[#F0F0EC]">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <a
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-[#FAFAF8]"
                      >
                        <span className="truncate text-[13px] font-medium text-[#1C1C1A]">{n.titulo}</span>
                        <span className="truncate text-[11.5px] text-[#86867D]">{n.descricao}</span>
                        <span className="text-[11px] text-[#A8A89F]">{formatRelativeTime(n.data)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

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


      </div>
    </header>
  );
}

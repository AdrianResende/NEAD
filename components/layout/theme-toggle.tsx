"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "nead_theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return preferredDark ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const handleToggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex items-center justify-center rounded-lg border border-zinc-300 p-2 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      aria-label="Alternar tema"
      title={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M12 3a1 1 0 0 1 1 1v1.25a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm0 14a1 1 0 0 1 1 1V20a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm9-6a1 1 0 0 1-1 1h-1.25a1 1 0 1 1 0-2H20a1 1 0 0 1 1 1ZM6.25 12a1 1 0 1 1 0 2H5a1 1 0 1 1 0-2h1.25ZM18.364 5.636a1 1 0 0 1 0 1.414l-.884.884a1 1 0 1 1-1.414-1.414l.884-.884a1 1 0 0 1 1.414 0ZM7.818 16.182a1 1 0 0 1 0 1.414l-.884.884a1 1 0 1 1-1.414-1.414l.884-.884a1 1 0 0 1 1.414 0Zm10.546 2.298a1 1 0 0 1-1.414 0l-.884-.884a1 1 0 1 1 1.414-1.414l.884.884a1 1 0 0 1 0 1.414ZM7.818 7.818a1 1 0 0 1-1.414 0l-.884-.884A1 1 0 1 1 6.934 5.52l.884.884a1 1 0 0 1 0 1.414ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M14.768 3.96a1 1 0 0 1 .187 1.1A7.5 7.5 0 1 0 18.94 15.045a1 1 0 0 1 1.287 1.287A9.5 9.5 0 1 1 7.668 3.773a1 1 0 0 1 1.287 1.287A7.46 7.46 0 0 0 7.5 9.5c0 4.142 3.358 7.5 7.5 7.5 1.636 0 3.151-.524 4.386-1.414A9.46 9.46 0 0 1 14.768 3.96Z" />
        </svg>
      )}
    </button>
  );
}

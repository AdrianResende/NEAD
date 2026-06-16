"use client";

import * as React from "react";

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
);

export function Modal({ title, description, onClose, size = "md", children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full ${sizeClasses[size]} rounded-[12px] border border-[#E9ECEF] bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-[8px] p-1 text-zinc-400 hover:bg-[#F7F9FB] hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

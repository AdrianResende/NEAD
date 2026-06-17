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

export function Modal({ title, description, onClose, size = "md", children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: "rgba(28,28,26,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`flex w-full flex-col ${sizeClasses[size]} max-h-[90vh] rounded-[14px] border border-[#E8E8E3] bg-white shadow-[0_8px_40px_rgba(28,28,26,0.12)]`}
      >
        {/* Header fixo */}
        <div className="shrink-0 flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-[#F0F0EC]">
          <div>
            <h2 className="text-[17px] font-bold text-[#1C1C1A] leading-tight">{title}</h2>
            {description && (
              <p className="mt-1 text-[13px] text-[#86867D]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-[8px] p-1.5 text-[#A8A89F] transition-colors hover:bg-[#F4F4F1] hover:text-[#56564F]"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        {/* Corpo com scroll */}
        <div className="overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

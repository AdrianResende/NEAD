"use client";

import { Button } from "./button";

type PaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (nextPage: number) => void;
  label?: string;
};

export function Pagination({
  page,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  label = "itens",
}: PaginationProps) {
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);

  return (
    <div className="mt-4 flex flex-col gap-2 rounded-[10px] border border-[#E8E8E3] bg-white px-[18px] py-[13px] text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[12.5px] text-[#A0A099]">
        Mostrando {start}–{end} de {totalItems} {label}
      </p>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className="text-xs text-[#86867D]">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}

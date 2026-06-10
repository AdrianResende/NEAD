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
    <div className="mt-4 flex flex-col gap-2 rounded-xl border border-zinc-200/80 bg-white px-3 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-zinc-600 dark:text-zinc-300">
        Mostrando {start}-{end} de {totalItems} {label}
      </p>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Página {page} de {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
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

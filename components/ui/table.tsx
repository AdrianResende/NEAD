import * as React from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Wrapper                                                                    */
/* -------------------------------------------------------------------------- */

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table
        className={cn("w-full border-collapse text-sm", className)}
      >
        {children}
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Head                                                                       */
/* -------------------------------------------------------------------------- */

export function TableHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <thead
      className={cn(
        "bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400",
        className,
      )}
    >
      {children}
    </thead>
  );
}

/* -------------------------------------------------------------------------- */
/*  Th                                                                         */
/* -------------------------------------------------------------------------- */

interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
}

export function Th({ children, className, ...props }: ThProps) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-4 py-3 text-left font-semibold",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

/* -------------------------------------------------------------------------- */
/*  Body                                                                       */
/* -------------------------------------------------------------------------- */

export function TableBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tbody
      className={cn(
        "divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950",
        className,
      )}
    >
      {children}
    </tbody>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tr                                                                         */
/* -------------------------------------------------------------------------- */

interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  clickable?: boolean;
}

export function Tr({ children, clickable, className, ...props }: TrProps) {
  return (
    <tr
      className={cn(
        "transition-colors",
        clickable &&
          "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/*  Td                                                                         */
/* -------------------------------------------------------------------------- */

interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  muted?: boolean;
}

export function Td({ children, muted, className, ...props }: TdProps) {
  return (
    <td
      className={cn(
        "whitespace-nowrap px-4 py-3 text-zinc-900 dark:text-zinc-100",
        muted && "text-zinc-500 dark:text-zinc-400",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                                */
/* -------------------------------------------------------------------------- */

export function TableEmpty({
  colSpan,
  message = "Nenhum resultado encontrado.",
}: {
  colSpan: number;
  message?: string;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500"
      >
        {message}
      </td>
    </tr>
  );
}

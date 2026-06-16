import * as React from "react";
import { cn } from "@/lib/utils";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-[14px] border border-[#E8E8E3] bg-white shadow-[0_1px_2px_rgba(28,28,26,0.03)]">
      <table className={cn("w-full border-collapse text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <thead
      className={cn(
        "border-b border-[#ECECE7] bg-[#FAFAF8] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#A8A89F]",
        className,
      )}
    >
      {children}
    </thead>
  );
}

interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
}

export function Th({ children, className, ...props }: ThProps) {
  return (
    <th
      className={cn("whitespace-nowrap px-[18px] py-[11px] text-left font-semibold", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tbody className={cn("divide-y divide-[#F2F2EE] bg-white", className)}>
      {children}
    </tbody>
  );
}

interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  clickable?: boolean;
}

export function Tr({ children, clickable, className, ...props }: TrProps) {
  return (
    <tr
      className={cn(
        "transition-colors",
        clickable && "cursor-pointer hover:bg-[#FAFAF8]",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  muted?: boolean;
  mono?: boolean;
}

export function Td({ children, muted, mono, className, ...props }: TdProps) {
  return (
    <td
      className={cn(
        "whitespace-nowrap px-[18px] py-[13px] text-[#1C1C1A]",
        muted && "text-[#86867D]",
        mono && "font-mono text-[12.5px] text-[#86867D]",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableEmpty({ colSpan, message = "Nenhum resultado encontrado." }: { colSpan: number; message?: string }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="py-12 text-center text-sm text-[#A8A89F]"
      >
        {message}
      </td>
    </tr>
  );
}

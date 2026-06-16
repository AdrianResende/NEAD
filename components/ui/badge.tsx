import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-[#E9ECEF] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  success:
    "bg-[#DDEFE2] text-[#0D5A28] dark:bg-green-950 dark:text-green-400",
  warning:
    "bg-[#FFF3CD] text-[#856404] dark:bg-amber-950 dark:text-amber-400",
  danger:
    "bg-red-50 text-[#DC3545] dark:bg-red-950 dark:text-red-400",
  info:
    "bg-[#E8F4FF] text-[#0A53CA] dark:bg-blue-950 dark:text-blue-400",
  outline:
    "border border-zinc-300 bg-transparent text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[20px] px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

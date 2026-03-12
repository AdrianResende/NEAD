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
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  success:
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  danger:
    "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  info:
    "bg-primary-light text-primary dark:bg-[#3b0a0a] dark:text-[#f87171]",
  outline:
    "border border-zinc-300 bg-transparent text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

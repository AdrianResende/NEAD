import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#3E6F6B] text-white hover:bg-[#335C58] shadow-[0_1px_2px_rgba(46,92,88,0.25)] focus-visible:ring-[#3E6F6B]",
  secondary:
    "bg-white border border-[#E4E4DE] text-[#56564F] hover:bg-[#F4F4F1] focus-visible:ring-[#3E6F6B]",
  outline:
    "border border-[#3E6F6B] bg-transparent text-[#3E6F6B] hover:bg-[#EAF2F1] focus-visible:ring-[#3E6F6B]",
  ghost:
    "bg-transparent text-[#56564F] hover:bg-[#F4F4F1] focus-visible:ring-[#3E6F6B]",
  danger:
    "bg-[#9A463B] text-white hover:bg-[#7E3830] focus-visible:ring-[#9A463B]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-[8px]",
  md: "h-[38px] px-[15px] text-[13.5px] rounded-[10px] font-semibold",
  lg: "h-11 px-6 text-sm rounded-[10px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-[7px] font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

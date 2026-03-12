import * as React from "react";
import { cn } from "@/lib/utils";

type InputSize = "sm" | "md" | "lg";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-4 text-base",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { inputSize = "md", error, leftIcon, rightIcon, className, ...props },
    ref,
  ) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 flex items-center text-zinc-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg border bg-white text-zinc-900 outline-none transition-colors",
            "placeholder:text-zinc-400",
            "focus:ring-2 focus:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-900"
              : "border-zinc-300 focus:border-primary focus:ring-[color:var(--color-primary-ring)] dark:border-zinc-700 dark:focus:border-primary dark:focus:ring-[color:var(--color-primary-ring)]",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            sizeClasses[inputSize],
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 flex items-center text-zinc-400">
            {rightIcon}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

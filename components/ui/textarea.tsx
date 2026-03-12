import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={4}
        className={cn(
          "w-full resize-y rounded-lg border bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors",
          "placeholder:text-zinc-400",
          "focus:ring-2 focus:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-900"
            : "border-zinc-300 focus:border-primary focus:ring-[color:var(--color-primary-ring)] dark:border-zinc-700 dark:focus:border-primary dark:focus:ring-[color:var(--color-primary-ring)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

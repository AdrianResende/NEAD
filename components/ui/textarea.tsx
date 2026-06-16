import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={4}
        className={cn(
          "w-full resize-y rounded-[9px] border bg-white px-3 py-3 text-[13.5px] text-[#1C1C1A] outline-none transition-colors",
          "placeholder:text-[#A8A89F]",
          "focus:ring-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-[#C9554A] focus:border-[#9A463B] focus:ring-[rgba(201,85,74,0.15)]"
            : "border-[#E4E4DE] focus:border-[#3E6F6B] focus:ring-[rgba(62,111,107,0.15)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

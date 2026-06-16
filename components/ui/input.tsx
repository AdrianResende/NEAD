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
  md: "h-[38px] px-3 text-[13.5px]",
  lg: "h-11 px-4 text-sm",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ inputSize = "md", error, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 flex items-center text-[#A8A89F]">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-[9px] border bg-white text-[#1C1C1A] outline-none transition-colors",
            "placeholder:text-[#A8A89F]",
            "focus:ring-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-[#C9554A] focus:border-[#9A463B] focus:ring-[rgba(201,85,74,0.15)]"
              : "border-[#E4E4DE] focus:border-[#3E6F6B] focus:ring-[rgba(62,111,107,0.15)]",
            leftIcon && "pl-9",
            rightIcon && "pr-9",
            sizeClasses[inputSize],
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="pointer-events-none absolute right-3 flex items-center text-[#A8A89F]">
            {rightIcon}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, placeholder, options, className, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-lg border bg-white px-4 py-0 text-sm text-zinc-900 outline-none transition-colors",
            "h-10 pr-10",
            "focus:ring-2 focus:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-zinc-900 dark:text-zinc-50",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-900"
              : "border-zinc-300 focus:border-primary focus:ring-[color:var(--color-primary-ring)] dark:border-zinc-700 dark:focus:border-primary dark:focus:ring-[color:var(--color-primary-ring)]",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    );
  },
);

Select.displayName = "Select";

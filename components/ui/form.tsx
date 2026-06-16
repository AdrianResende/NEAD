import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-[12px] font-semibold text-[#86867D]"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {error ? (
        <p className="text-xs text-[#9A463B]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-[#A8A89F]">{hint}</p>
      ) : null}
    </div>
  );
}

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export function Form({ children, className, ...props }: FormProps) {
  return (
    <form
      className={cn("flex flex-col gap-5", className)}
      noValidate
      {...props}
    >
      {children}
    </form>
  );
}

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <fieldset
      className={cn(
        "rounded-[14px] border border-[#E8E8E3] p-6",
        className,
      )}
    >
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <legend className="text-[15.5px] font-bold text-[#1C1C1A]">
              {title}
            </legend>
          )}
          {description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="grid gap-4">{children}</div>
    </fieldset>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  align?: "left" | "right" | "between";
  className?: string;
}

export function FormActions({
  children,
  align = "right",
  className,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 pt-2",
        align === "right" && "justify-end",
        align === "left" && "justify-start",
        align === "between" && "justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

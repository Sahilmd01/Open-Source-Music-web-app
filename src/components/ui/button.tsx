import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary" | "accent" | "secondary" | "ghost" | "link"
  | "success" | "danger" | "warning" | "danger-outline" | "success-outline";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  block?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  block,
  loading,
  leadingIcon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "btn",
        `btn--${variant}`,
        size !== "md" && `btn--${size}`,
        block && "btn--block",
        loading && "is-loading",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {leadingIcon}
      {children}
    </button>
  );
}

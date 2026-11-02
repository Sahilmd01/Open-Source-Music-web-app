import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  size?: "md" | "lg";
  children: ReactNode;
}

export function IconButton({ label, title, size = "md", className, children, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={title ?? label}
      className={cn("btn-icon", size === "lg" && "btn-icon--lg", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

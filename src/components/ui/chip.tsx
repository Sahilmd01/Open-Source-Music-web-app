import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className, type = "button", ...rest }: ChipProps) {
  return <button type={type} aria-pressed={active} className={cn("chip", active && "is-active", className)} {...rest} />;
}

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface BadgeProps {
  tone?: "neutral" | "brand" | "accent" | "success" | "error" | "warning" | "info";
  children: ReactNode;
}

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={cn("badge", tone !== "neutral" && `badge--${tone}`)}>{children}</span>;
}

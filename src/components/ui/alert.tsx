import type { ReactNode } from "react";
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type AlertKind = "success" | "error" | "warning" | "info";

const ICONS = { success: CheckIcon, error: CloseIcon, warning: AlertIcon, info: InfoIcon } as const;

interface AlertProps {
  kind?: AlertKind;
  title: string;
  children?: ReactNode;
  className?: string;
}

export function Alert({ kind = "info", title, children, className }: AlertProps) {
  const Icon = ICONS[kind];
  return (
    <div className={cn("alert", `alert--${kind}`, className)} role={kind === "error" ? "alert" : "status"}>
      <Icon className="alert__icon" width={18} height={18} />
      <div>
        <div className="alert__title">{title}</div>
        {children ? <p className="alert__body">{children}</p> : null}
      </div>
    </div>
  );
}

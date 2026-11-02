"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CheckIcon, InfoIcon, AlertIcon, CloseIcon } from "@/components/icons";

export type ToastKind = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (input: { kind?: ToastKind; title: string; description?: string; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let nextId = 1;

const ICONS = { success: CheckIcon, error: CloseIcon, warning: AlertIcon, info: InfoIcon } as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    ({ kind = "info", title, description, duration = 1800 }) => {
      const id = nextId++;
      setItems((prev) => [...prev, { id, kind, title, description }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="false" suppressHydrationWarning>
        {items.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <div key={t.id} className={cn("toast", `toast--${t.kind}`)} role={t.kind === "error" ? "alert" : "status"}>
              <Icon width={15} height={15} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{t.title}</strong>
                {t.description ? <div className="text-caption">{t.description}</div> : null}
              </div>
              <button type="button" className="btn-icon" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
                <CloseIcon width={13} height={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

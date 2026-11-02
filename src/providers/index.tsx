"use client";

import { useEffect, type ReactNode } from "react";
import { ToastProvider } from "./toast-provider";
import { useUiStore } from "@/stores/ui-store";

function AuthSessionInitializer({ children }: { children: ReactNode }) {
  const checkAuthSession = useUiStore((s) => s.checkAuthSession);

  useEffect(() => {
    checkAuthSession();
  }, [checkAuthSession]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthSessionInitializer>{children}</AuthSessionInitializer>
    </ToastProvider>
  );
}

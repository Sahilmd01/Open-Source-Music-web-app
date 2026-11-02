"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  setTheme,
  subscribeTheme,
  type ResolvedTheme,
} from "@/lib/theme";

export function useTheme(): { theme: ResolvedTheme; toggleTheme: () => void } {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const toggleTheme = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme]);
  return { theme, toggleTheme };
}

"use client";

import { IconButton } from "@/components/ui/icon-button";
import { MoonIcon, SunIcon } from "@/components/icons";
import { useTheme } from "@/hooks/use-theme";
import type { MouseEvent } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // If browser supports document.startViewTransition, animate expanding circular clip-path
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      const doc = document as Document & {
        startViewTransition?: (callback: () => void) => { ready: Promise<void> };
      };
      const transition = doc.startViewTransition?.(() => {
        toggleTheme();
      });

      transition?.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];
        document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: 500,
            easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });
    } else {
      toggleTheme();
    }
  };

  return (
    <IconButton label={`Switch to ${next} mode`} onClick={handleClick} suppressHydrationWarning>
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}

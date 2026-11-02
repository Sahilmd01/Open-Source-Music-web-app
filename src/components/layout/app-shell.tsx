"use client";

import { type ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import { PlayerBar } from "@/components/player/player-bar";
import { AudioEngine } from "@/components/player/audio-engine";
import { NowPlayingPanel } from "./now-playing-panel";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isControlPage = pathname === "/control" || pathname?.startsWith("/control/");

  return (
    <>
      <a href="#content" className="skip-link">Skip to content</a>
      <div className="app" suppressHydrationWarning>
        <div className="window" suppressHydrationWarning>
          <Sidebar />
          <div
            className={`main ${isControlPage ? "main--full-width" : ""}`}
            style={isControlPage ? { gridTemplateColumns: "1fr" } : undefined}
            suppressHydrationWarning
          >
            <Suspense fallback={<header className="topbar" style={{ minHeight: "var(--topbar-height, 64px)" }} />}>
              <Topbar />
            </Suspense>
            <main
              id="content"
              className="content"
              tabIndex={-1}
              style={isControlPage ? { gridColumn: "1 / -1" } : undefined}
            >
              {children}
            </main>
            {!isControlPage && <NowPlayingPanel />}
          </div>
        </div>
      </div>
      <AudioEngine />
      <PlayerBar />
    </>
  );
}


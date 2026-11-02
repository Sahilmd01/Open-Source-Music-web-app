"use client";

import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/cn";

const BAR_COUNT = 64;

/** Deterministic pseudo-random heights so server and client render the same markup. */
const HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const wave = Math.sin(i * 0.55) * 0.25 + Math.sin(i * 1.7) * 0.2;
  return Math.round(Math.min(1, Math.max(0.15, 0.55 + wave)) * 100);
});

interface WaveformProps {
  /** 0 – 1 */
  ratio: number;
  duration: number;
  current: number;
  onSeek: (seconds: number) => void;
}

export function Waveform({ ratio, duration, current, onSeek }: WaveformProps) {
  const playedBars = Math.round(ratio * BAR_COUNT);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const doSeek = (clientX: number) => {
      const rect = target.getBoundingClientRect();
      if (rect.width <= 0) return;
      const r = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onSeek(r * duration);
    };
    doSeek(e.clientX);

    const onPointerMove = (ev: PointerEvent) => {
      doSeek(ev.clientX);
    };

    const onPointerUp = (ev: PointerEvent) => {
      try {
        target.releasePointerCapture(ev.pointerId);
      } catch {}
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") onSeek(Math.min(duration, current + 5));
    if (e.key === "ArrowLeft") onSeek(Math.max(0, current - 5));
  };

  return (
    <div
      className="wave"
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={Math.floor(current)}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKey}
      suppressHydrationWarning
    >
      {HEIGHTS.map((h, i) => (
        <i key={i} className={cn(i < playedBars && "is-played")} style={{ "--h": `${h}%` } as React.CSSProperties} />
      ))}
    </div>
  );
}

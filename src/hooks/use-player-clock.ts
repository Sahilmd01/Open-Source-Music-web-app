"use client";

/**
 * usePlayerClock — no-op now that AudioEngine drives real playback via timeupdate.
 * Kept as a hook stub so existing imports don't break.
 */
export function usePlayerClock(): void {
  // Real time is pushed into the store by AudioEngine's timeupdate listener.
}

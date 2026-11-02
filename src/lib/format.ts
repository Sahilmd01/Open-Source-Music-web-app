/** 192 -> "3:12" (or "03:12" when padMinutes is true) */
export function formatTime(totalSeconds: number, padMinutes = false): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  const mm = padMinutes ? String(m).padStart(2, "0") : String(m);
  return `${mm}:${String(s).padStart(2, "0")}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

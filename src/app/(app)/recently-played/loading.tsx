import { SongsTableSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div style={{ display: "grid", gap: "var(--space-6)" }} aria-busy="true">
      <div style={{ height: 32, width: 220, borderRadius: 6, background: "var(--bg-surface-2)" }} />
      <SongsTableSkeleton count={8} />
    </div>
  );
}

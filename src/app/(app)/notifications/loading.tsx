import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }} aria-busy="true">
      {/* Banner Skeleton */}
      <Skeleton style={{ height: 200, borderRadius: "var(--radius-xl)" }} />

      {/* Controls Skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton style={{ width: 240, height: 40, borderRadius: "var(--radius-pill)" }} />
        <Skeleton style={{ width: 220, height: 40, borderRadius: "var(--radius-pill)" }} />
      </div>

      {/* List Skeletons */}
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-surface-2)",
            }}
          >
            <Skeleton style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "grid", gap: "var(--space-2)" }}>
              <Skeleton style={{ width: 140, height: 16, borderRadius: 4 }} />
              <Skeleton style={{ width: "80%", height: 14, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

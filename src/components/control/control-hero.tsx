"use client";

import { SettingsIcon, AlertIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { ReportItem } from "./control-types";

interface ControlHeroProps {
  pendingReportsCount: number;
  onAddArtist: () => void;
  onViewReports: () => void;
}

export function ControlHero({ pendingReportsCount, onAddArtist, onViewReports }: ControlHeroProps) {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, rgba(255, 92, 0, 0.12), rgba(20, 20, 30, 0.85))",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--space-5)",
        boxShadow: "var(--shadow-md)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 540 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "rgba(255, 92, 0, 0.2)",
              color: "var(--brand)",
              padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              fontSize: "0.72rem",
              fontWeight: "var(--fw-bold)",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            <SettingsIcon width={13} height={13} />
            Command Center
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: pendingReportsCount > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
              color: pendingReportsCount > 0 ? "#ef4444" : "#22c55e",
              padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              fontSize: "0.72rem",
              fontWeight: "var(--fw-bold)",
            }}
          >
            {pendingReportsCount} Pending Reports
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)",
            fontWeight: "var(--fw-bold)",
            color: "var(--text-primary)",
          }}
        >
          All Control &amp; Moderation
        </h1>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: "var(--fs-sm)",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          Central administration dashboard to activate/deactivate tracks, onboard artists, manage playlist artwork &amp; banners, and moderate inbound community reports.
        </p>
      </div>

      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <Button
          variant="primary"
          size="md"
          leadingIcon={<PlusIcon width={16} height={16} />}
          onClick={onAddArtist}
        >
          Add Artist
        </Button>
        <Button
          variant="secondary"
          size="md"
          leadingIcon={<AlertIcon width={16} height={16} />}
          onClick={onViewReports}
        >
          View Reports ({pendingReportsCount})
        </Button>
      </div>
    </section>
  );
}

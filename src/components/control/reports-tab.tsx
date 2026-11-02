"use client";

import { Button } from "@/components/ui/button";
import type { ReportItem } from "./control-types";

interface ReportsTabProps {
  reports: ReportItem[];
  searchQuery: string;
  onResolveReport: (id: string, action: "resolve" | "dismiss") => void;
}

export function ReportsTab({ reports, searchQuery, onResolveReport }: ReportsTabProps) {
  const filtered = reports.filter(
    (r) =>
      r.targetTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <div
        style={{
          background: "var(--bg-surface-2)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4) var(--space-5)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-semibold)", margin: 0, color: "var(--text-primary)" }}>
            Incoming Reports &amp; Moderation
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
            Review copyright, explicit content, metadata disputes, and user grievances.
          </p>
        </div>
        <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
          {pendingCount} tickets requiring review
        </span>
      </div>

      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        {filtered.map((rep) => (
          <div
            key={rep.id}
            style={{
              background: "var(--bg-surface-2)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              padding: "var(--space-4)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--space-3)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    padding: "2px 7px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: "var(--fw-bold)",
                    background:
                      rep.severity === "high"
                        ? "rgba(239, 68, 68, 0.2)"
                        : rep.severity === "medium"
                          ? "rgba(234, 179, 8, 0.2)"
                          : "rgba(100, 116, 139, 0.2)",
                    color:
                      rep.severity === "high"
                        ? "#ef4444"
                        : rep.severity === "medium"
                          ? "#eab308"
                          : "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  {rep.severity}
                </span>
                <strong style={{ fontSize: "var(--fs-sm)", color: "var(--text-primary)" }}>
                  {rep.targetType}: {rep.targetTitle}
                </strong>
              </div>

              <p style={{ margin: "6px 0 2px", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
                Reason: <em>"{rep.reason}"</em>
              </p>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Filed by {rep.reportedBy} • {rep.date} • Status: <strong style={{ textTransform: "capitalize" }}>{rep.status}</strong>
              </span>
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              {rep.status === "pending" ? (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onResolveReport(rep.id, "resolve")}
                  >
                    Resolve &amp; Take Action
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onResolveReport(rep.id, "dismiss")}
                  >
                    Dismiss
                  </Button>
                </>
              ) : (
                <span
                  style={{
                    fontSize: "var(--fs-xs)",
                    color: rep.status === "resolved" ? "#22c55e" : "var(--text-muted)",
                    fontWeight: "var(--fw-medium)",
                  }}
                >
                  ✓ {rep.status === "resolved" ? "Action Taken" : "Dismissed"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

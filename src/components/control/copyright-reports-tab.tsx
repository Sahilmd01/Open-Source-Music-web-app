"use client";

import { CopyrightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { ReportItem } from "./control-types";

interface CopyrightReportsTabProps {
  reports: ReportItem[];
  searchQuery: string;
  onResolveReport: (id: string, action: "resolve" | "dismiss") => void;
}

export function CopyrightReportsTab({
  reports,
  searchQuery,
  onResolveReport,
}: CopyrightReportsTabProps) {
  // Filter exclusively for copyright dispute tickets
  const copyrightReports = reports.filter((r) => r.isCopyright);

  const filtered = copyrightReports.filter(
    (r) =>
      r.targetTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.claimantName && r.claimantName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pendingCount = copyrightReports.filter((r) => r.status === "pending").length;

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      {/* Header card with distinct copyright styling */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08), var(--bg-surface-2))",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4) var(--space-5)",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <CopyrightIcon width={20} height={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-semibold)", margin: 0, color: "var(--text-primary)" }}>
              Copyright &amp; DMCA Infringement Reports
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
              Verified legal claims, unauthorized song master uploads, and DMCA takedown requests.
            </p>
          </div>
        </div>

        <span
          style={{
            padding: "4px 10px",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--fs-xs)",
            fontWeight: "var(--fw-bold)",
            background: pendingCount > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
            color: pendingCount > 0 ? "#ef4444" : "#22c55e",
          }}
        >
          {pendingCount} urgent DMCA claim{pendingCount === 1 ? "" : "s"}
        </span>
      </div>

      {/* Reports List */}
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-8) 0" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-sm)" }}>
              No copyright reports matching your filter.
            </p>
          </div>
        ) : (
          filtered.map((rep) => (
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      padding: "2px 7px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: "var(--fw-bold)",
                      background: "rgba(239, 68, 68, 0.2)",
                      color: "#ef4444",
                      textTransform: "uppercase",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CopyrightIcon width={12} height={12} />
                    DMCA / Copyright
                  </span>

                  <strong style={{ fontSize: "var(--fs-sm)", color: "var(--text-primary)" }}>
                    {rep.targetType}: {rep.targetTitle}
                  </strong>
                </div>

                <p style={{ margin: "6px 0 2px", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
                  Claim: <em>"{rep.reason}"</em>
                </p>

                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  Claimant: <strong style={{ color: "var(--text-primary)" }}>{rep.claimantName || rep.reportedBy}</strong> • {rep.date} • Severity: <span style={{ textTransform: "uppercase", color: "#ef4444", fontWeight: "bold" }}>{rep.severity}</span>
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
                      Deactivate &amp; Take Down
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onResolveReport(rep.id, "dismiss")}
                    >
                      Dismiss Claim
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
                    ✓ {rep.status === "resolved" ? "Content Taken Down" : "Claim Dismissed"}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

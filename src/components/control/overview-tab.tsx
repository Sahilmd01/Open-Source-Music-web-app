"use client";

import { MusicNoteIcon, UserIcon, PlaylistIcon, AlertIcon, CopyrightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { SongItem, ArtistItem, PlaylistItem, ReportItem } from "./control-types";

interface OverviewTabProps {
  songs: SongItem[];
  artists: ArtistItem[];
  playlists: PlaylistItem[];
  reports: ReportItem[];
  onViewAllReports: () => void;
  onViewCopyrightReports: () => void;
  onResolveReport: (id: string, action: "resolve" | "dismiss") => void;
}

export function OverviewTab({
  songs,
  artists,
  playlists,
  reports,
  onViewAllReports,
  onViewCopyrightReports,
  onResolveReport,
}: OverviewTabProps) {
  const activeSongsCount = songs.filter((s) => s.status === "active").length;
  const activePlaylistsCount = playlists.filter((p) => p.status === "active").length;
  const disabledPlaylistsCount = playlists.filter((p) => p.status === "inactive").length;
  const pendingReports = reports.filter((r) => r.status === "pending");
  const pendingCopyrightCount = reports.filter((r) => r.isCopyright && r.status === "pending").length;

  return (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      {/* 1. Compact Metrics Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
          gap: "var(--space-2)",
        }}
      >
        {/* Metric: Songs */}
        <div
          style={{
            background: "var(--bg-surface-2)",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "var(--fw-medium)" }}>Tracks</span>
            <MusicNoteIcon width={13} height={13} style={{ color: "var(--brand)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)", lineHeight: 1.2 }}>
              {activeSongsCount}
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>/ {songs.length}</span>
            <span style={{ fontSize: "10px", color: "#22c55e", marginLeft: "auto", fontWeight: "var(--fw-semibold)" }}>
              {Math.round((activeSongsCount / (songs.length || 1)) * 100)}%
            </span>
          </div>
        </div>

        {/* Metric: Artists */}
        <div
          style={{
            background: "var(--bg-surface-2)",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "var(--fw-medium)" }}>Artists</span>
            <UserIcon width={13} height={13} style={{ color: "#38bdf8" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)", lineHeight: 1.2 }}>
              {artists.length}
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>profiles</span>
          </div>
        </div>

        {/* Metric: Playlists */}
        <div
          style={{
            background: "var(--bg-surface-2)",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "var(--fw-medium)" }}>Playlists</span>
            <PlaylistIcon width={13} height={13} style={{ color: "#a855f7" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)", lineHeight: 1.2 }}>
              {activePlaylistsCount}
            </span>
            {disabledPlaylistsCount > 0 && (
              <span style={{ fontSize: "10px", color: "#ef4444", marginLeft: "auto" }}>
                {disabledPlaylistsCount} off
              </span>
            )}
          </div>
        </div>

        {/* Metric: Reports Queue */}
        <div
          style={{
            background: pendingReports.length > 0 ? "rgba(239, 68, 68, 0.06)" : "var(--bg-surface-2)",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            border: pendingReports.length > 0 ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: pendingReports.length > 0 ? "#ef4444" : "var(--text-muted)", fontWeight: "var(--fw-medium)" }}>
              Pending Tickets
            </span>
            <AlertIcon width={13} height={13} style={{ color: pendingReports.length > 0 ? "#ef4444" : "var(--text-muted)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", color: pendingReports.length > 0 ? "#ef4444" : "var(--text-primary)", lineHeight: 1.2 }}>
              {pendingReports.length}
            </span>
            {pendingCopyrightCount > 0 && (
              <span style={{ fontSize: "10px", color: "#ef4444", marginLeft: "auto", fontWeight: "var(--fw-bold)" }}>
                {pendingCopyrightCount} DMCA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Compact Priority Reports Section */}
      <div
        style={{
          background: "var(--bg-surface-2)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-3) var(--space-4)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* Compact Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-2)",
            flexWrap: "wrap",
            gap: "var(--space-2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <h2 style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", margin: 0, color: "var(--text-primary)" }}>
              Urgent Reports
            </h2>
            <span
              style={{
                fontSize: "11px",
                padding: "1px 6px",
                borderRadius: "var(--radius-pill)",
                background: pendingReports.length > 0 ? "rgba(239,68,68,0.15)" : "var(--bg-surface-3)",
                color: pendingReports.length > 0 ? "#ef4444" : "var(--text-muted)",
                fontWeight: "var(--fw-semibold)",
              }}
            >
              {pendingReports.length}
            </span>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {pendingCopyrightCount > 0 && (
              <Button
                variant="danger"
                size="sm"
                leadingIcon={<CopyrightIcon width={12} height={12} />}
                onClick={onViewCopyrightReports}
                style={{ height: 28, fontSize: "11px", padding: "0 8px" }}
              >
                DMCA Claims ({pendingCopyrightCount})
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAllReports}
              style={{ height: 28, fontSize: "11px", padding: "0 8px" }}
            >
              All Reports →
            </Button>
          </div>
        </div>

        {/* Compact Ticket Rows */}
        <div style={{ display: "grid", gap: "6px" }}>
          {pendingReports.length === 0 ? (
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", margin: "4px 0" }}>
              All tickets resolved. System is clear.
            </p>
          ) : (
            pendingReports.map((report) => {
              const isDMCA = report.isCopyright || report.severity === "high";

              return (
                <div
                  key={report.id}
                  style={{
                    background: isDMCA ? "rgba(239, 68, 68, 0.04)" : "var(--bg-surface)",
                    padding: "6px 10px",
                    borderRadius: "var(--radius-sm)",
                    border: isDMCA ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  {/* Left: Tag + Target + Detail */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 240px", minWidth: 0 }}>
                    <span
                      style={{
                        padding: "1px 5px",
                        borderRadius: "3px",
                        fontSize: "9px",
                        fontWeight: "var(--fw-bold)",
                        background: isDMCA ? "rgba(239, 68, 68, 0.15)" : "rgba(234, 179, 8, 0.15)",
                        color: isDMCA ? "#ef4444" : "#eab308",
                        textTransform: "uppercase",
                        flexShrink: 0,
                      }}
                    >
                      {report.isCopyright ? "DMCA" : report.severity}
                    </span>

                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "var(--fw-medium)",
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      [{report.targetType}] {report.targetTitle}
                    </span>

                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 320,
                      }}
                    >
                      • {report.claimantName || report.reportedBy}: <em>"{report.reason}"</em>
                    </span>
                  </div>

                  {/* Right: Quick actions */}
                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onResolveReport(report.id, "resolve")}
                      style={{ height: 26, fontSize: "11px", padding: "0 8px" }}
                    >
                      {report.isCopyright ? "Take Down" : "Resolve"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onResolveReport(report.id, "dismiss")}
                      style={{ height: 26, fontSize: "11px", padding: "0 8px" }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

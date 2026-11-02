"use client";

import { SearchIcon } from "@/components/icons";
import type { ControlTab } from "./control-types";

interface ControlHeaderProps {
  activeTab: ControlTab;
  onTabChange: (tab: ControlTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  songsCount: number;
  artistsCount: number;
  playlistsCount: number;
  albumsCount: number;
  pendingReportsCount: number;
  pendingCopyrightCount: number;
}

export function ControlHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  songsCount,
  artistsCount,
  playlistsCount,
  albumsCount,
  pendingReportsCount,
  pendingCopyrightCount,
}: ControlHeaderProps) {
  return (
    <div
      className="control-nav-bar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--space-3)",
        borderBottom: "1px solid var(--border-subtle)",
        paddingBottom: "var(--space-3)",
      }}
    >
      <div
        className="control-segmented-scroll"
        style={{
          maxWidth: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 2,
        }}
      >
        <div className="segmented" role="tablist" style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "songs"}
            className={activeTab === "songs" ? "is-active" : ""}
            onClick={() => onTabChange("songs")}
          >
            Songs ({songsCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "artists"}
            className={activeTab === "artists" ? "is-active" : ""}
            onClick={() => onTabChange("artists")}
          >
            Artists ({artistsCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "playlists"}
            className={activeTab === "playlists" ? "is-active" : ""}
            onClick={() => onTabChange("playlists")}
          >
            Playlists ({playlistsCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "albums"}
            className={activeTab === "albums" ? "is-active" : ""}
            onClick={() => onTabChange("albums")}
          >
            Albums ({albumsCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "reports"}
            className={activeTab === "reports" ? "is-active" : ""}
            onClick={() => onTabChange("reports")}
            style={{ position: "relative" }}
          >
            Reports
            {pendingReportsCount > 0 && (
              <span
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: "bold",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  marginLeft: 6,
                }}
              >
                {pendingReportsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "copyright-reports"}
            className={activeTab === "copyright-reports" ? "is-active" : ""}
            onClick={() => onTabChange("copyright-reports")}
            style={{ position: "relative" }}
          >
            Copyright Reports
            {pendingCopyrightCount > 0 && (
              <span
                style={{
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: "bold",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  marginLeft: 6,
                  boxShadow: "0 0 8px rgba(239,68,68,0.5)",
                }}
              >
                {pendingCopyrightCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="control-search-wrapper" style={{ position: "relative", minWidth: 200, flex: "1 1 200px", maxWidth: 360 }}>
        <span
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            pointerEvents: "none",
          }}
        >
          <SearchIcon width={15} height={15} />
        </span>
        <input
          type="text"
          className="input"
          placeholder="Search records..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ height: 36, paddingLeft: 32, fontSize: "var(--fs-xs)", width: "100%" }}
        />
      </div>
    </div>
  );
}

"use client";

import { PlayIcon, PauseIcon, PlusIcon, SearchIcon } from "@/components/icons";

interface SongsControlsProps {
  isPlaying: boolean;
  onPlayAll: () => void;
  onAddSong: () => void;
  activeTab: "all" | "favorites";
  onTabChange: (tab: "all" | "favorites") => void;
  searchFilter: string;
  onSearchChange: (value: string) => void;
}

export function SongsControls({
  isPlaying,
  onPlayAll,
  onAddSong,
  activeTab,
  onTabChange,
  searchFilter,
  onSearchChange,
}: SongsControlsProps) {
  return (
    <div
      className="songs-controls"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-4)",
      }}
    >
      {/* Left Action Controls */}
      <div className="songs-controls__left" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        {/* Big Circular Play Button */}
        <button
          type="button"
          className="btn-play"
          aria-label={isPlaying ? "Pause songs" : "Play all songs"}
          title={isPlaying ? "Pause" : "Play all songs"}
          onClick={onPlayAll}
          style={{
            width: 52,
            height: 52,
            flexShrink: 0,
          }}
        >
          {isPlaying ? (
            <PauseIcon width={22} height={22} />
          ) : (
            <PlayIcon width={22} height={22} />
          )}
        </button>

        {/* Add Song Button */}
        <button
          type="button"
          className="songs-controls__add-btn"
          title="Add a new song to library"
          onClick={onAddSong}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 20px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--border-default)",
            background: "transparent",
            color: "var(--text-primary)",
            fontSize: "var(--fs-sm)",
            fontWeight: "var(--fw-semibold)",
            cursor: "pointer",
            transition: "border-color 0.15s ease, background 0.15s ease, transform 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--text-primary)";
            e.currentTarget.style.transform = "scale(1.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <PlusIcon width={16} height={16} />
          <span>Add Song</span>
        </button>

        {/* Tabs: All / Favorites */}
        <div
          className="songs-controls__tabs"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px",
            background: "var(--bg-surface-2)",
            borderRadius: "var(--radius-pill)",
          }}
        >
          <button
            type="button"
            onClick={() => onTabChange("all")}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              fontSize: "var(--fs-xs)",
              fontWeight: activeTab === "all" ? "var(--fw-bold)" : "var(--fw-medium)",
              background: activeTab === "all" ? "var(--bg-surface)" : "transparent",
              color: activeTab === "all" ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: activeTab === "all" ? "0 2px 8px rgba(0, 0, 0, 0.12)" : "none",
              cursor: "pointer",
              transition: "all var(--dur-fast)",
            }}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onTabChange("favorites")}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              fontSize: "var(--fs-xs)",
              fontWeight: activeTab === "favorites" ? "var(--fw-bold)" : "var(--fw-medium)",
              background: activeTab === "favorites" ? "var(--bg-surface)" : "transparent",
              color: activeTab === "favorites" ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: activeTab === "favorites" ? "0 2px 8px rgba(0, 0, 0, 0.12)" : "none",
              cursor: "pointer",
              transition: "all var(--dur-fast)",
            }}
          >
            Favorites
          </button>
        </div>
      </div>

      {/* Right: Search Input */}
      <div className="songs-controls__search" style={{ position: "relative", minWidth: 220, maxWidth: 300, flex: "1 1 200px" }}>
        <span
          style={{
            position: "absolute",
            left: "var(--space-3)",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <SearchIcon width={15} height={15} />
        </span>
        <input
          type="text"
          className="input"
          placeholder="Search in songs..."
          value={searchFilter}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            paddingLeft: "calc(var(--space-3) + 20px)",
            height: 36,
            fontSize: "var(--fs-xs)",
            borderRadius: "var(--radius-pill)",
            background: "var(--bg-surface-2)",
          }}
        />
      </div>
    </div>
  );
}

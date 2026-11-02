"use client";

import { useState, useMemo, useEffect } from "react";
import { PlusIcon, CameraIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { MediaCard } from "@/components/features/media-card";
import type { PlaylistItem } from "./control-types";

const PLAYLISTS_PER_PAGE = 12;

interface PlaylistsTabProps {
  playlists: PlaylistItem[];
  searchQuery: string;
  onOpenCreateModal: () => void;
  onEditMedia: (playlist: PlaylistItem) => void;
  onTogglePlaylist: (id: string) => void;
}

export function PlaylistsTab({
  playlists,
  searchQuery,
  onOpenCreateModal,
  onEditMedia,
  onTogglePlaylist,
}: PlaylistsTabProps) {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Base list depending on active tab
  const tabPlaylists = useMemo(() => {
    if (activeTab === "active") return playlists.filter((p) => p.status === "active");
    if (activeTab === "inactive") return playlists.filter((p) => p.status === "inactive");
    return playlists;
  }, [playlists, activeTab]);

  // Apply search query filter
  const filteredPlaylists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return tabPlaylists;
    return tabPlaylists.filter(
      (pl) =>
        pl.title.toLowerCase().includes(query) ||
        pl.creator.toLowerCase().includes(query) ||
        (pl.description && pl.description.toLowerCase().includes(query))
    );
  }, [tabPlaylists, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPlaylists.length / PLAYLISTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PLAYLISTS_PER_PAGE;
  const endIndex = startIndex + PLAYLISTS_PER_PAGE;
  const paginatedPlaylists = filteredPlaylists.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Handle pagination
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    // Scroll to top of grid
    const gridElement = document.querySelector('[data-playlists-grid]');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Tabs and Search Bar Controls Toolbar - Exact same structure and classes as /playlists */}
      <div
        className="playlists-toolbar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
          marginBottom: "var(--space-5)",
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ maxWidth: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div className="segmented" role="tablist" style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "all"}
            className={activeTab === "all" ? "is-active" : ""}
            onClick={() => setActiveTab("all")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            All Playlists ({playlists.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "active"}
            className={activeTab === "active" ? "is-active" : ""}
            onClick={() => setActiveTab("active")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            Active ({playlists.filter((p) => p.status === "active").length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "inactive"}
            className={activeTab === "inactive" ? "is-active" : ""}
            onClick={() => setActiveTab("inactive")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            Disabled ({playlists.filter((p) => p.status === "inactive").length})
          </button>
        </div>
        </div>

        {/* Action button */}
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<PlusIcon width={16} height={16} />}
          onClick={onOpenCreateModal}
        >
          Create playlist
        </Button>
      </div>

      {/* Playlists Grid or Empty State - Exact same .media-grid and MediaCard from /playlists */}
      {filteredPlaylists.length > 0 ? (
        <div data-playlists-grid>
          <div className="control-playlists-grid">
            {paginatedPlaylists.map((pl) => {
              const isActive = pl.status === "active";
              return (
                <MediaCard
                  key={pl.id}
                  title={pl.title}
                  subtitle={`${pl.songsCount} songs · ${pl.creator}`}
                  hue={pl.hue ?? 24}
                  src={pl.coverUrl}
                  href={`/playlists/${encodeURIComponent(pl.id)}`}
                  badge={!isActive ? "Disabled" : undefined}
                  className={!isActive ? "opacity-60" : ""}
                  actions={
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        leadingIcon={<CameraIcon width={13} height={13} />}
                        onClick={() => onEditMedia(pl)}
                        style={{
                          flex: 1,
                          height: 30,
                          fontSize: "var(--fs-xs)",
                          whiteSpace: "nowrap",
                          padding: "0 8px",
                        }}
                      >
                        Media
                      </Button>
                      <Button
                        variant={isActive ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => onTogglePlaylist(pl.id)}
                        style={{
                          height: 30,
                          padding: "0 10px",
                          fontSize: "var(--fs-xs)",
                          minWidth: 68,
                          background: !isActive ? "#22c55e" : undefined,
                          borderColor: !isActive ? "#22c55e" : undefined,
                          color: !isActive ? "#ffffff" : undefined,
                        }}
                      >
                        {isActive ? "Disable" : "Enable"}
                      </Button>
                    </>
                  }
                />
              );
            })}
          </div>

          {/* Pagination Controls */}
          {filteredPlaylists.length > PLAYLISTS_PER_PAGE && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "var(--space-4)",
                padding: "var(--space-4)",
                marginTop: "var(--space-4)",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-surface-2)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
                Page {currentPage} of {totalPages} • Showing {startIndex + 1}–{Math.min(endIndex, filteredPlaylists.length)} of {filteredPlaylists.length}
              </div>

              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                <IconButton
                  label="Previous page"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                  style={{
                    opacity: currentPage <= 1 ? 0.5 : 1,
                    cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <ChevronLeftIcon width={16} height={16} />
                </IconButton>

                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    const isCurrentPageBtn = page === currentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid",
                          borderColor: isCurrentPageBtn ? "var(--brand)" : "var(--border-subtle)",
                          background: isCurrentPageBtn ? "var(--brand)" : "transparent",
                          color: isCurrentPageBtn ? "#ffffff" : "var(--text-secondary)",
                          fontSize: "var(--fs-xs)",
                          fontWeight: "var(--fw-medium)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        title={`Go to page ${page}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <IconButton
                  label="Next page"
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  style={{
                    opacity: currentPage >= totalPages ? 0.5 : 1,
                    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  <ChevronRightIcon width={16} height={16} />
                </IconButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            padding: "var(--space-10) var(--space-4)",
            textAlign: "center",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--border-default)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "var(--bg-surface-2)",
              display: "grid",
              placeItems: "center",
              color: "var(--text-muted)",
            }}
          >
            <SearchIcon width={24} height={24} />
          </div>

          <div>
            <h3
              style={{
                fontSize: "var(--fs-lg)",
                fontWeight: "var(--fw-semibold)",
                marginBottom: 4,
              }}
            >
              No playlists found
            </h3>
            <p className="text-muted text-small" style={{ margin: 0, maxWidth: 380 }}>
              {searchQuery
                ? `No playlists matching "${searchQuery}". Try searching with a different term.`
                : "No playlists match the selected filter."}
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leadingIcon={<PlusIcon width={16} height={16} />}
            onClick={onOpenCreateModal}
            style={{ marginTop: "var(--space-2)" }}
          >
            Create first playlist
          </Button>
        </div>
      )}
    </>
  );
}

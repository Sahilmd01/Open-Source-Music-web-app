"use client";

import { useState, useMemo, useEffect } from "react";
import { PlusIcon, CameraIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { ArtistRowList } from "@/components/features/artist-row-list";
import type { ArtistItem } from "./control-types";
import type { Artist } from "@/types/music";

const ARTISTS_PER_PAGE = 12;

interface ArtistsTabProps {
  artists: ArtistItem[];
  searchQuery: string;
  onOpenAddModal: () => void;
  onToggleArtist: (id: string) => void;
  onEditMedia: (artist: ArtistItem) => void;
}

export function ArtistsTab({
  artists,
  searchQuery,
  onOpenAddModal,
  onToggleArtist,
  onEditMedia,
}: ArtistsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter based on sub-tab
  const tabArtists = useMemo(() => {
    if (activeSubTab === "active") return artists.filter((a) => a.status === "active");
    if (activeSubTab === "inactive") return artists.filter((a) => a.status === "inactive");
    return artists;
  }, [artists, activeSubTab]);

  // Apply search query filter
  const filteredArtists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tabArtists;
    return tabArtists.filter((a) =>
      a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q)
    );
  }, [tabArtists, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredArtists.length / ARTISTS_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTISTS_PER_PAGE;
  const endIndex = startIndex + ARTISTS_PER_PAGE;
  const paginatedArtists = filteredArtists.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab, searchQuery]);

  // Handle pagination
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    // Scroll to top of list
    const listElement = document.querySelector('[data-artists-list]');
    if (listElement) {
      listElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Convert ArtistItem[] to Artist[] format accepted by ArtistRowList (PAGINATED)
  const rowListArtists: Artist[] = useMemo(() => {
    return paginatedArtists.map((a) => ({
      id: a.id,
      name: a.name,
      hue: a.hue || 220,
      image: a.avatarUrl,
    }));
  }, [paginatedArtists]);

  // Lookup map for fast lookup of control state
  const artistsMap = useMemo(() => {
    return new Map(artists.map((a) => [a.id, a]));
  }, [artists]);

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      {/* Top action header */}
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
        {/* Navigation sub-tabs (All / Active / Disabled) */}
        <div style={{ maxWidth: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div className="segmented" role="tablist" style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === "all"}
            className={activeSubTab === "all" ? "is-active" : ""}
            onClick={() => setActiveSubTab("all")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            All ({artists.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === "active"}
            className={activeSubTab === "active" ? "is-active" : ""}
            onClick={() => setActiveSubTab("active")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            Active ({artists.filter((a) => a.status === "active").length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === "inactive"}
            className={activeSubTab === "inactive" ? "is-active" : ""}
            onClick={() => setActiveSubTab("inactive")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            Disabled ({artists.filter((a) => a.status === "inactive").length})
          </button>
        </div>
        </div>

        {/* Add Artist Button */}
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<PlusIcon width={14} height={14} />}
          onClick={onOpenAddModal}
        >
          Add Artist
        </Button>
      </div>

      {/* Reusing exact ArtistRowList UI from /artists */}
      {rowListArtists.length > 0 ? (
        <div data-artists-list>
          <div
            style={{
              background: "var(--bg-surface-1)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              padding: "var(--space-2)",
            }}
          >
            <ArtistRowList
              artists={rowListArtists}
              renderActions={(artist) => {
                const item = artistsMap.get(artist.id);
                if (!item) return null;
                const isActive = item.status === "active";

                return (
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    {/* Banner & Avatar change media button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      title="Edit Avatar & Banner"
                      onClick={() => onEditMedia(item)}
                      leadingIcon={<CameraIcon width={14} height={14} />}
                      style={{
                        height: 32,
                        padding: "0 10px",
                        fontSize: "var(--fs-xs)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Edit Media
                    </Button>

                    {/* Enable / Disable toggle button */}
                    <Button
                      variant={isActive ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => onToggleArtist(item.id)}
                      style={{
                        height: 32,
                        padding: "0 12px",
                        fontSize: "var(--fs-xs)",
                        minWidth: 74,
                        background: !isActive ? "#22c55e" : undefined,
                        borderColor: !isActive ? "#22c55e" : undefined,
                        color: !isActive ? "#ffffff" : undefined,
                      }}
                    >
                      {isActive ? "Disable" : "Enable"}
                    </Button>
                  </div>
                );
              }}
            />
          </div>

          {/* Pagination Controls */}
          {filteredArtists.length > ARTISTS_PER_PAGE && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "var(--space-4)",
                padding: "var(--space-4)",
                marginTop: "var(--space-3)",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-surface-2)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
                Page {currentPage} of {totalPages} • Showing {startIndex + 1}–{Math.min(endIndex, filteredArtists.length)} of {filteredArtists.length}
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
            textAlign: "center",
            padding: "var(--space-10) var(--space-4)",
            color: "var(--text-muted)",
            fontSize: "var(--fs-sm)",
            background: "var(--bg-surface-1)",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--border-subtle)",
          }}
        >
          No artists matching your filters or search query.
        </div>
      )}
    </div>
  );
}

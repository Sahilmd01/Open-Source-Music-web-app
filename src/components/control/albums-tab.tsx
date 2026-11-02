"use client";

import { useState, useMemo, useEffect } from "react";
import { PlusIcon, CameraIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { MediaCard } from "@/components/features/media-card";
import type { AlbumItem } from "./control-types";

const ALBUMS_PER_PAGE = 12;

interface AlbumsTabProps {
  albums: AlbumItem[];
  searchQuery: string;
  onOpenCreateModal: () => void;
  onEditMedia: (album: AlbumItem) => void;
  onToggleAlbum: (id: string) => void;
}

export function AlbumsTab({
  albums,
  searchQuery,
  onOpenCreateModal,
  onEditMedia,
  onToggleAlbum,
}: AlbumsTabProps) {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Base list depending on active tab
  const tabAlbums = useMemo(() => {
    if (activeTab === "active") return albums.filter((a) => a.status === "active");
    if (activeTab === "inactive") return albums.filter((a) => a.status === "inactive");
    return albums;
  }, [albums, activeTab]);

  // Apply search query filter
  const filteredAlbums = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tabAlbums;
    return tabAlbums.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.artist.toLowerCase().includes(q) ||
        a.year.toString().includes(q)
    );
  }, [tabAlbums, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAlbums.length / ALBUMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ALBUMS_PER_PAGE;
  const endIndex = startIndex + ALBUMS_PER_PAGE;
  const paginatedAlbums = filteredAlbums.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Handle pagination
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    // Scroll to top of grid
    const gridElement = document.querySelector('[data-albums-grid]');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Tabs and Search Bar Controls Toolbar - Exact same structure as /albums */}
      <div
        className="albums-toolbar"
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
            All Albums ({albums.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "active"}
            className={activeTab === "active" ? "is-active" : ""}
            onClick={() => setActiveTab("active")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            Active ({albums.filter((a) => a.status === "active").length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "inactive"}
            className={activeTab === "inactive" ? "is-active" : ""}
            onClick={() => setActiveTab("inactive")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            Disabled ({albums.filter((a) => a.status === "inactive").length})
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
          Create album
        </Button>
      </div>

      {/* Albums Grid or Empty State - Exact same .media-grid and MediaCard from /albums */}
      {filteredAlbums.length > 0 ? (
        <div data-albums-grid>
          <div className="control-albums-grid">
            {paginatedAlbums.map((a) => {
              const isActive = a.status === "active";
              return (
                <MediaCard
                  key={a.id}
                  title={a.title}
                  subtitle={`${a.artist} · ${a.year}`}
                  hue={a.hue ?? 200}
                  src={a.coverUrl}
                  href={`/albums/${encodeURIComponent(a.id)}`}
                  badge={!isActive ? "Disabled" : undefined}
                  className={!isActive ? "opacity-60" : ""}
                  actions={
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        leadingIcon={<CameraIcon width={13} height={13} />}
                        onClick={() => onEditMedia(a)}
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
                        onClick={() => onToggleAlbum(a.id)}
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
          {filteredAlbums.length > ALBUMS_PER_PAGE && (
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
                Page {currentPage} of {totalPages} • Showing {startIndex + 1}–{Math.min(endIndex, filteredAlbums.length)} of {filteredAlbums.length}
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
              No albums found
            </h3>
            <p className="text-muted text-small" style={{ margin: 0, maxWidth: 380 }}>
              {searchQuery
                ? `No albums matching "${searchQuery}". Try searching with a different term.`
                : "No albums match the selected filter."}
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leadingIcon={<PlusIcon width={16} height={16} />}
            onClick={onOpenCreateModal}
            style={{ marginTop: "var(--space-2)" }}
          >
            Create first album
          </Button>
        </div>
      )}
    </>
  );
}

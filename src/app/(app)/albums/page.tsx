"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { MediaCard } from "@/components/features/media-card";
import { PageHeader } from "@/components/layout/page-header";
import { AlbumsPageSkeleton } from "@/components/skeletons";
import type { Album } from "@/types/music";
import { CreateAlbumModal } from "./create-album-modal";
import { useUiStore } from "@/stores/ui-store";

export default function AlbumsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, openLoginModal, user } = useUiStore();

  // Load real albums from backend database
  const fetchAlbums = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/control/albums");
      const data = await res.json();
      if (data.success && Array.isArray(data.albums)) {
        const liveAlbums: Album[] = data.albums.map((al: any) => ({
          id: al.id,
          title: al.title,
          artist: al.artist || "Various Artists",
          year: al.year || new Date().getFullYear(),
          coverImage: al.coverUrl,
          avatarUrl: al.coverUrl,
          bannerUrl: al.bannerUrl,
          createdBy: al.createdBy,
          isCustom: Boolean(al.createdBy),
          hue: al.hue || 220,
        }));
        setAlbums(liveAlbums);
      }
    } catch (err) {
      console.error("Failed to fetch albums:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleCreate = async (newAlbum: Album) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    try {
      const res = await fetch("/api/control/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAlbum.title,
          artist: newAlbum.artist,
          artistIds: newAlbum.artistIds || [],
          year: newAlbum.year,
          coverUrl: newAlbum.coverImage || newAlbum.avatarUrl,
          bannerUrl: newAlbum.bannerUrl,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) {
          openLoginModal();
        }
        throw new Error(data.error || "Failed to create album");
      }
      if (data.success && data.album) {
        const created: Album = {
          id: data.album.id,
          title: data.album.title,
          artist: data.album.artist,
          year: data.album.year,
          coverImage: data.album.coverUrl,
          bannerUrl: data.album.bannerUrl,
          avatarUrl: data.album.coverUrl,
          createdBy: user?.id,
          isCustom: true,
          hue: newAlbum.hue,
        };
        try {
          const stored = localStorage.getItem("my_created_album_ids_v1");
          const ids: string[] = stored ? JSON.parse(stored) : [];
          if (!ids.includes(created.id)) {
            localStorage.setItem("my_created_album_ids_v1", JSON.stringify([created.id, ...ids]));
          }
        } catch {
          // ignore
        }
        setAlbums((prev) => [created, ...prev]);
        setIsModalOpen(false);
        return;
      }
    } catch (err) {
      console.error("Failed to create album:", err);
    }
  };

  // Filter based on active tab
  const tabAlbums = useMemo(() => {
    if (activeTab === "all") return albums;

    // "my" tab: only show albums created by the current user
    let locallyCreatedIds: string[] = [];
    try {
      const stored = localStorage.getItem("my_created_album_ids_v1");
      if (stored) locallyCreatedIds = JSON.parse(stored);
    } catch {
      // ignore
    }

    return albums.filter((alb) => {
      if (user?.id && alb.createdBy && alb.createdBy === user.id) return true;
      if (locallyCreatedIds.includes(alb.id)) return true;
      return false;
    });
  }, [albums, activeTab, user?.id]);

  // Apply search query filter
  const filteredAlbums = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tabAlbums;
    return tabAlbums.filter(
      (a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    );
  }, [tabAlbums, searchQuery]);

  if (isLoading) {
    return <AlbumsPageSkeleton />;
  }

  return (
    <div className="albums-page">
      <PageHeader
        title="Albums"
        description="Records you've saved, uploaded, or created recently"
        action={
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<PlusIcon width={16} height={16} />}
            onClick={() => {
              if (!isAuthenticated) {
                openLoginModal();
                return;
              }
              setIsModalOpen(true);
            }}
          >
            Create album
          </Button>
        }
      />

      {/* Tabs and Search Bar Controls Toolbar */}
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
        {/* Navigation Tabs (No number counts) */}
        <div className="segmented" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "all"}
            className={activeTab === "all" ? "is-active" : ""}
            onClick={() => setActiveTab("all")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            All Albums
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "my"}
            className={activeTab === "my" ? "is-active" : ""}
            onClick={() => setActiveTab("my")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            My Albums
          </button>
        </div>

        {/* Search Input Bar */}
        <div
          className="albums-toolbar__search"
          style={{
            position: "relative",
            minWidth: 240,
            maxWidth: 320,
            flex: "1 1 240px",
          }}
        >
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
            <SearchIcon width={16} height={16} />
          </span>
          <input
            type="text"
            className="input"
            placeholder={
              activeTab === "my" ? "Search my albums..." : "Search all albums..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: "calc(var(--space-3) + 22px)",
              height: 38,
              fontSize: "var(--fs-sm)",
              borderRadius: "var(--radius-pill)",
              background: "var(--bg-surface-2)",
            }}
          />
        </div>
      </div>

      {/* Albums Grid or Empty State */}
      {filteredAlbums.length > 0 ? (
        <div className="media-grid">
          {filteredAlbums.map((a) => (
            <MediaCard
              key={a.id}
              title={a.title}
              subtitle={
                a.isCustom
                  ? `Created by you · ${a.year}`
                  : `${a.artist} · ${a.year}`
              }
              hue={a.hue}
              src={a.coverImage}
              href={`/albums/${encodeURIComponent(a.id)}`}
            />
          ))}
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
              {activeTab === "my" && tabAlbums.length === 0
                ? "No created albums yet"
                : "No albums found"}
            </h3>
            <p className="text-muted text-small" style={{ margin: 0, maxWidth: 380 }}>
              {activeTab === "my" && tabAlbums.length === 0
                ? "Create your personal album with custom artwork, artist name, and release year."
                : `No albums matching "${searchQuery}". Try searching with a different term.`}
            </p>
          </div>

          {activeTab === "my" && tabAlbums.length === 0 && (
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<PlusIcon width={16} height={16} />}
              onClick={() => {
                if (!isAuthenticated) {
                  openLoginModal();
                  return;
                }
                setIsModalOpen(true);
              }}
              style={{ marginTop: "var(--space-2)" }}
            >
              Create first album
            </Button>
          )}
        </div>
      )}

      {/* Album Creation Modal */}
      <CreateAlbumModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}

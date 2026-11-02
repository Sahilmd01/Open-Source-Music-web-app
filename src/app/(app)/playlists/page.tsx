"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { MediaCard } from "@/components/features/media-card";
import { PageHeader } from "@/components/layout/page-header";
import { PlaylistsPageSkeleton } from "@/components/skeletons";
import type { Playlist } from "@/types/music";
import { getPlaylistSongCount } from "@/hooks/use-playlist-track-manager";
import { CreatePlaylistModal } from "./create-playlist-modal";
import { useUiStore } from "@/stores/ui-store";

export default function PlaylistsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, openLoginModal, user } = useUiStore();

  // Load real playlists from backend database
  const fetchPlaylists = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/control/playlists");
      const data = await res.json();
      if (data.success && Array.isArray(data.playlists)) {
        const livePlaylists: Playlist[] = data.playlists.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description || "",
          logo: p.coverUrl,           // coverUrl = avatar/logo
          coverImage: p.bannerUrl,    // bannerUrl = banner
          songCount: getPlaylistSongCount(p.id, p.songsCount || 0),
          likes: p.likes || 0,
          isPublic: p.visibility === "public",
          isCustom: Boolean(p.ownerId),
          ownerId: p.ownerId,
          hue: p.hue || 280,
        }));
        setPlaylists(livePlaylists);
      }
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handleCreate = async (newPlaylist: Playlist) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    try {
      const res = await fetch("/api/control/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPlaylist.title,
          description: newPlaylist.description,
          coverUrl: newPlaylist.logo,         // logo = avatar → coverUrl
          bannerUrl: newPlaylist.coverImage,  // coverImage = banner → bannerUrl
          isPublic: newPlaylist.isPublic !== false,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) {
          openLoginModal();
        }
        throw new Error(data.error || "Failed to create playlist");
      }
      if (data.success && data.playlist) {
        const created: Playlist = {
          id: data.playlist.id,
          title: data.playlist.title,
          description: newPlaylist.description || "",
          logo: data.playlist.coverUrl,        // coverUrl = avatar/logo
          coverImage: data.playlist.bannerUrl, // bannerUrl = banner
          songCount: 0,
          likes: 0,
          durationLabel: "0 min",
          isPublic: data.playlist.visibility === "public",
          isCustom: true,
          ownerId: user?.id,
          hue: newPlaylist.hue || 280,
        };
        try {
          const stored = localStorage.getItem("my_created_playlist_ids_v1");
          const ids: string[] = stored ? JSON.parse(stored) : [];
          if (!ids.includes(created.id)) {
            localStorage.setItem("my_created_playlist_ids_v1", JSON.stringify([created.id, ...ids]));
          }
        } catch {
          // ignore
        }
        setPlaylists((prev) => [created, ...prev]);
        setIsModalOpen(false);
        return;
      }
    } catch (err) {
      console.error("Failed to create playlist:", err);
    }
  };

  // Filter based on active tab
  const tabPlaylists = useMemo(() => {
    if (activeTab === "all") return playlists;

    // "my" tab: only show playlists created by the currently logged-in user
    let locallyCreatedIds: string[] = [];
    try {
      const stored = localStorage.getItem("my_created_playlist_ids_v1");
      if (stored) locallyCreatedIds = JSON.parse(stored);
    } catch {
      // ignore
    }

    return playlists.filter((pl) => {
      if (user?.id && pl.ownerId && pl.ownerId === user.id) return true;
      if (locallyCreatedIds.includes(pl.id)) return true;
      return false;
    });
  }, [playlists, activeTab, user?.id]);

  // Apply search query filter
  const filteredPlaylists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return tabPlaylists;
    return tabPlaylists.filter(
      (pl) =>
        pl.title.toLowerCase().includes(query) ||
        (pl.description && pl.description.toLowerCase().includes(query))
    );
  }, [tabPlaylists, searchQuery]);

  if (isLoading) {
    return <PlaylistsPageSkeleton />;
  }

  return (
    <>
      <PageHeader
        title="Playlists"
        description="Curated playlists, mood mixes, and your personal collections"
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
            Create playlist
          </Button>
        }
      />

      {/* Tabs and Search Bar Controls Toolbar */}
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
        <div className="segmented" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "all"}
            className={activeTab === "all" ? "is-active" : ""}
            onClick={() => setActiveTab("all")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            All Playlists
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "my"}
            className={activeTab === "my" ? "is-active" : ""}
            onClick={() => setActiveTab("my")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            My Playlists
          </button>
        </div>

        {/* Search Input Bar */}
        <div
          className="playlists-toolbar__search"
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
              activeTab === "my" ? "Search my playlists..." : "Search all playlists..."
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

      {/* Playlists Grid or Empty State */}
      {filteredPlaylists.length > 0 ? (
        <div className="media-grid">
          {filteredPlaylists.map((pl) => (
            <MediaCard
              key={pl.id}
              title={pl.title}
              subtitle={
                pl.isCustom
                  ? `Created by you · ${pl.songCount} songs`
                  : `${pl.songCount} songs · ${pl.durationLabel}`
              }
              hue={pl.hue ?? 24}
              src={pl.logo || pl.coverImage}
              href={`/playlists/${encodeURIComponent(pl.id)}`}
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
              {activeTab === "my" && tabPlaylists.length === 0
                ? "No created playlists yet"
                : "No playlists found"}
            </h3>
            <p className="text-muted text-small" style={{ margin: 0, maxWidth: 380 }}>
              {activeTab === "my" && tabPlaylists.length === 0
                ? "Create your personal playlist with custom artwork, title, and mood description."
                : `No playlists matching "${searchQuery}". Try searching with a different term.`}
            </p>
          </div>

          {activeTab === "my" && tabPlaylists.length === 0 && (
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
              Create first playlist
            </Button>
          )}
        </div>
      )}

      {/* Playlist Creation Modal */}
      <CreatePlaylistModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}

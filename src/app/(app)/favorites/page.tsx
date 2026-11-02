"use client";

import { useState, useMemo, useEffect } from "react";
import { SearchIcon, HeartFilledIcon } from "@/components/icons";
import { PageHeader } from "@/components/layout/page-header";
import { MediaCard } from "@/components/features/media-card";
import { TrackList } from "@/components/features/track-list";
import { usePlayerStore } from "@/stores/player-store";
import { getPlaylistSongCount } from "@/hooks/use-playlist-track-manager";
import type { Playlist, Album, Track } from "@/types/music";

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "songs" | "albums" | "playlists">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const likedTrackIds = usePlayerStore((s) => s.likedIds);

  const [allCatalogSongs, setAllCatalogSongs] = useState<Track[]>([]);
  const [likedPlaylists, setLikedPlaylists] = useState<Playlist[]>([]);
  const [likedAlbums, setLikedAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load real playlists, albums, and songs from database backend
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      fetch("/api/control/songs").then((r) => r.json()).catch(() => ({ songs: [] })),
      fetch("/api/control/albums").then((r) => r.json()).catch(() => ({ albums: [] })),
      fetch("/api/control/playlists").then((r) => r.json()).catch(() => ({ playlists: [] })),
    ]).then(([songsData, albumsData, playlistsData]) => {
      if (!isMounted) return;

      // 1. Process Songs
      if (songsData.success && Array.isArray(songsData.songs)) {
        const liveSongs: Track[] = songsData.songs.map((s: any) => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          album: s.album,
          duration: s.duration || 180,
          coverImage: s.coverImage,
          hue: s.hue || 24,
          uploadedBy: s.uploadedBy,
          audioUrl: s.audioUrl,
          audioSrc: s.audioUrl,
        }));
        setAllCatalogSongs(liveSongs);
      }

      // 2. Process Albums
      if (albumsData.success && Array.isArray(albumsData.albums)) {
        const liveAlbums: Album[] = albumsData.albums.map((al: any) => ({
          id: al.id,
          title: al.title,
          artist: al.artist || "Various Artists",
          year: al.year || new Date().getFullYear(),
          coverImage: al.coverUrl,
          hue: al.hue || 220,
        }));
        const userLikedAlbums = liveAlbums.filter((alb) => {
          try {
            return localStorage.getItem(`album_liked_${alb.id}`) === "true";
          } catch {
            return false;
          }
        });
        setLikedAlbums(userLikedAlbums);
      }

      // 3. Process Playlists
      if (playlistsData.success && Array.isArray(playlistsData.playlists)) {
        const livePlaylists: Playlist[] = playlistsData.playlists.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description || "",
          logo: p.coverUrl,        // coverUrl = avatar/logo
          coverImage: p.bannerUrl, // bannerUrl = banner
          songCount: getPlaylistSongCount(p.id, p.songsCount || 0),
          isPublic: p.visibility === "public",
          isCustom: true,
          hue: p.hue || 280,
        }));
        const userLikedPlaylists = livePlaylists.filter((pl) => {
          try {
            return localStorage.getItem(`playlist_liked_${pl.id}`) === "true";
          } catch {
            return false;
          }
        });
        setLikedPlaylists(userLikedPlaylists);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered favorite songs from real catalog
  const favoriteSongs = useMemo(() => {
    return allCatalogSongs.filter((t) => likedTrackIds.includes(t.id));
  }, [allCatalogSongs, likedTrackIds]);

  const q = searchQuery.trim().toLowerCase();

  const filteredSongs = useMemo(() => {
    if (!q) return favoriteSongs;
    return favoriteSongs.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
  }, [favoriteSongs, q]);

  const filteredAlbums = useMemo(() => {
    if (!q) return likedAlbums;
    return likedAlbums.filter(
      (a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    );
  }, [likedAlbums, q]);

  const filteredPlaylists = useMemo(() => {
    if (!q) return likedPlaylists;
    return likedPlaylists.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    );
  }, [likedPlaylists, q]);

  const totalCount = favoriteSongs.length + likedAlbums.length + likedPlaylists.length;

  return (
    <>
      <PageHeader
        title="Favorites"
        description="All your favorite songs, albums, and playlists in one place"
      />

      {/* Tabs and Search Bar Controls Toolbar */}
      <div
        className="favorites-toolbar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
          marginBottom: "var(--space-6)",
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
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "songs"}
            className={activeTab === "songs" ? "is-active" : ""}
            onClick={() => setActiveTab("songs")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            Songs
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "albums"}
            className={activeTab === "albums" ? "is-active" : ""}
            onClick={() => setActiveTab("albums")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            Albums
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "playlists"}
            className={activeTab === "playlists" ? "is-active" : ""}
            onClick={() => setActiveTab("playlists")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            Playlists
          </button>
        </div>

        {/* Search Bar */}
        <div className="favorites-toolbar__search" style={{ position: "relative", minWidth: 240, maxWidth: 320, flex: "1 1 240px" }}>
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
            placeholder="Search favorites..."
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

      {/* Main Content Sections */}
      {totalCount === 0 ? (
        <div
          style={{
            padding: "var(--space-12) var(--space-4)",
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
              color: "var(--brand)",
            }}
          >
            <HeartFilledIcon width={24} height={24} />
          </div>
          <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-semibold)", margin: 0 }}>
            No favorites yet
          </h3>
          <p className="text-muted text-small" style={{ margin: 0, maxWidth: 380 }}>
            Tap the heart icon on any song, album, or playlist and it will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "var(--space-8)" }}>
          {/* Songs Section */}
          {(activeTab === "all" || activeTab === "songs") && filteredSongs.length > 0 && (
            <section aria-labelledby="fav-songs">
              <h2
                id="fav-songs"
                style={{
                  fontSize: "var(--fs-lg)",
                  fontWeight: "var(--fw-semibold)",
                  marginBottom: "var(--space-3)",
                  color: "var(--text-primary)",
                }}
              >
                Favorite Songs
              </h2>
              <TrackList tracks={filteredSongs} label="Favorite songs" />
            </section>
          )}

          {/* Albums Section */}
          {(activeTab === "all" || activeTab === "albums") && filteredAlbums.length > 0 && (
            <section aria-labelledby="fav-albums">
              <h2
                id="fav-albums"
                style={{
                  fontSize: "var(--fs-lg)",
                  fontWeight: "var(--fw-semibold)",
                  marginBottom: "var(--space-3)",
                  color: "var(--text-primary)",
                }}
              >
                Favorite Albums
              </h2>
              <div className="media-grid">
                {filteredAlbums.map((a) => (
                  <MediaCard
                    key={a.id}
                    title={a.title}
                    subtitle={`${a.artist} · ${a.year}`}
                    hue={a.hue}
                    src={a.coverImage}
                    href={`/albums/${encodeURIComponent(a.id)}`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Playlists Section */}
          {(activeTab === "all" || activeTab === "playlists") && filteredPlaylists.length > 0 && (
            <section aria-labelledby="fav-playlists">
              <h2
                id="fav-playlists"
                style={{
                  fontSize: "var(--fs-lg)",
                  fontWeight: "var(--fw-semibold)",
                  marginBottom: "var(--space-3)",
                  color: "var(--text-primary)",
                }}
              >
                Favorite Playlists
              </h2>
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
            </section>
          )}
        </div>
      )}
    </>
  );
}

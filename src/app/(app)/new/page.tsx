"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { MediaCard } from "@/components/features/media-card";
import { SongsTable } from "@/components/songs";
import { SearchIcon, PlayIcon, PauseIcon, ChevronRightIcon } from "@/components/icons";
import { usePlayerStore } from "@/stores/player-store";
import { getPlaylistSongCount } from "@/hooks/use-playlist-track-manager";
import type { Track, Album, Playlist } from "@/types/music";

export default function NewReleasesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "songs" | "albums" | "playlists">("all");
  const [searchFilter, setSearchFilter] = useState("");

  // Live state from database
  const [songs, setSongs] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const queue = usePlayerStore((s) => s.queue);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const currentTrackId = queue[currentIndex]?.id;
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playContextTrack = usePlayerStore((s) => s.playContextTrack);
  const togglePlay = usePlayerStore((s) => s.toggle);
  const likedIds = usePlayerStore((s) => s.likedIds);
  const toggleLike = usePlayerStore((s) => s.toggleLike);

  // Fetch real releases from live database APIs
  const fetchReleases = useCallback(async () => {
    setIsLoading(true);
    try {
      const [songsRes, albumsRes, playlistsRes] = await Promise.all([
        fetch("/api/control/songs?limit=30").then((r) => r.json()).catch(() => ({ songs: [] })),
        fetch("/api/control/albums?limit=20").then((r) => r.json()).catch(() => ({ albums: [] })),
        fetch("/api/control/playlists?limit=20").then((r) => r.json()).catch(() => ({ playlists: [] })),
      ]);

      if (songsRes.success && Array.isArray(songsRes.songs)) {
        setSongs(
          songsRes.songs.slice(0, 30).map((s: any) => ({
            id: s.id,
            title: s.title,
            artist: s.artist,
            album: s.album,
            duration: s.duration || 180,
            coverImage: s.coverImage,
            hue: s.hue || 24,
            uploadedBy: s.uploadedBy,
            audioUrl: s.audioUrl,
            likesCount: Number(s.likesCount || 0),
            playsCount: Number(s.plays || 0),
          }))
        );
      }

      if (albumsRes.success && Array.isArray(albumsRes.albums)) {
        setAlbums(
          albumsRes.albums.map((al: any) => ({
            id: al.id,
            title: al.title,
            artist: al.artist || "Various Artists",
            year: al.year || new Date().getFullYear(),
            coverImage: al.coverUrl,
            hue: al.hue || 220,
          }))
        );
      }

      if (playlistsRes.success && Array.isArray(playlistsRes.playlists)) {
        setPlaylists(
          playlistsRes.playlists.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description || "",
            logo: p.coverUrl,        // coverUrl = avatar/logo
            coverImage: p.bannerUrl, // bannerUrl = banner
            songCount: getPlaylistSongCount(p.id, p.songsCount || 0),
            likes: 0,
            durationLabel: "0 min",
            isCustom: true,
            hue: p.hue || 280,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch new releases from database:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  // Filter songs
  const filteredSongs = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );
  }, [songs, searchFilter]);

  // Filter albums
  const filteredAlbums = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return albums;
    return albums.filter(
      (a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    );
  }, [albums, searchFilter]);

  // Filter playlists
  const filteredPlaylists = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return playlists;
    return playlists.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    );
  }, [playlists, searchFilter]);

  const isAnyPlaying = isPlaying && filteredSongs.some((t) => t.id === currentTrackId);

  const handlePlayAll = () => {
    if (isAnyPlaying) {
      togglePlay();
    } else {
      const first = filteredSongs[0];
      if (first) {
        playContextTrack(first, filteredSongs);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* 3D Elevated Hero Banner */}
      <section
        className="new-hero"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-8) var(--space-6)",
          minHeight: 220,
          display: "flex",
          alignItems: "center",
          gap: "var(--space-6)",
          background:
            "url('/default/default-new-music-banner.png') center/cover no-repeat",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Cover Art Preview */}
        <div
          className="new-hero__cover"
          style={{
            width: 150,
            height: 150,
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            flexShrink: 0,
            boxShadow: "0 10px 24px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <img
            src="/default/default-new-music-avatar.png"
            alt="New Releases Cover"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Banner Details */}
        <div className="new-hero__content" style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", zIndex: 1 }}>
          <span
            className="new-hero__badge"
            style={{
              fontSize: "var(--fs-xs)",
              fontWeight: "var(--fw-bold)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#000000",
              padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              background: "rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.15)",
              width: "fit-content",
            }}
          >
            Fresh Music Feed · 2026
          </span>

          <h1
            className="new-hero__title"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: "var(--fw-bold)",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              margin: 0,
              color: "#000000",
            }}
          >
            New Releases
          </h1>

          <p className="new-hero__desc text-muted" style={{ margin: 0, fontSize: "var(--fs-sm)", maxWidth: 500 }}>
            Discover the latest songs, newly dropped albums, and freshly curated playlists with exact release dates.
          </p>

          <div
            className="new-hero__meta"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
              fontSize: "var(--fs-xs)",
              color: "var(--text-secondary)",
              marginTop: "var(--space-1)",
            }}
          >
            <span>{filteredSongs.length} New Songs</span>
            <span>•</span>
            <span>{filteredAlbums.length} Albums</span>
            <span>•</span>
            <span>{filteredPlaylists.length} Playlists</span>
          </div>
        </div>
      </section>

      {/* Filter Tabs and Search Bar */}
      <div
        className="new-controls"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        {/* Play Button & Filter Pills */}
        <div className="new-controls__left" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn-play"
            aria-label={isAnyPlaying ? "Pause releases" : "Play all releases"}
            title={isAnyPlaying ? "Pause" : "Play all releases"}
            onClick={handlePlayAll}
            style={{ width: 44, height: 44, flexShrink: 0 }}
          >
            {isAnyPlaying ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
          </button>

          <div className="segmented new-controls__tabs" role="tablist">
            {(["all", "songs", "albums", "playlists"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={activeTab === tab ? "is-active" : ""}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontWeight: "var(--fw-medium)",
                  textTransform: "capitalize",
                }}
              >
                {tab === "all" ? "All Releases" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="new-controls__search" style={{ position: "relative", minWidth: 220, maxWidth: 300, flex: "1 1 200px" }}>
          <span
            style={{
              position: "absolute",
              left: "var(--space-3)",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          >
            <SearchIcon width={16} height={16} />
          </span>
          <input
            type="search"
            placeholder="Search new releases…"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="input"
            style={{
              paddingLeft: "var(--space-8)",
              height: 38,
              fontSize: "var(--fs-sm)",
              borderRadius: "var(--radius-pill)",
              background: "var(--bg-surface-2)",
            }}
          />
        </div>
      </div>

      {/* 1. New Songs Section */}
      {(activeTab === "all" || activeTab === "songs") && (
        <section aria-labelledby="new-songs-heading">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <h2 id="new-songs-heading" style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-semibold)", margin: 0 }}>
              New Songs
            </h2>
            <span className="text-muted text-small">{filteredSongs.length} tracks</span>
          </div>

          <SongsTable
            tracks={filteredSongs}
            searchFilter={searchFilter}
            currentTrackId={currentTrackId}
            isPlaying={isPlaying}
            likedIds={likedIds}
            onPlayTrack={(t) => playContextTrack(t, filteredSongs)}
            onToggleLike={toggleLike}
            label="New Songs Table"
          />
        </section>
      )}

      {/* 2. New Albums Section */}
      {(activeTab === "all" || activeTab === "albums") && (
        <section aria-labelledby="new-albums-heading" style={{ marginTop: "var(--space-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
              <h2 id="new-albums-heading" style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-semibold)", margin: 0 }}>
                Newly Dropped Albums
              </h2>
              <span className="text-muted text-small">{filteredAlbums.length} albums</span>
            </div>
            <Link
              href="/albums"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "var(--fs-xs)",
                fontWeight: "var(--fw-semibold)",
                color: "var(--brand)",
                textDecoration: "none",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              View all
              <ChevronRightIcon width={14} height={14} />
            </Link>
          </div>

          <div className="media-grid media-grid--albums">
            {filteredAlbums.map((al) => (
              <div key={al.id} className="media-item">
                <MediaCard
                  title={al.title}
                  subtitle={`${al.artist} · ${al.year}`}
                  badge={al.releaseDate?.replace("Released ", "")}
                  hue={al.hue}
                  src={al.coverImage}
                  href={`/albums/${encodeURIComponent(al.id.replace(/^nr-/, ""))}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. New & Updated Playlists Section */}
      {(activeTab === "all" || activeTab === "playlists") && (
        <section aria-labelledby="new-playlists-heading" style={{ marginTop: "var(--space-4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
              <h2 id="new-playlists-heading" style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-semibold)", margin: 0 }}>
                Fresh Playlists
              </h2>
              <span className="text-muted text-small">{filteredPlaylists.length} playlists</span>
            </div>
            <Link
              href="/playlists"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "var(--fs-xs)",
                fontWeight: "var(--fw-semibold)",
                color: "var(--brand)",
                textDecoration: "none",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              View all
              <ChevronRightIcon width={14} height={14} />
            </Link>
          </div>

          <div className="media-grid media-grid--playlists">
            {filteredPlaylists.map((pl) => (
              <div key={pl.id} className="media-item">
                <MediaCard
                  title={pl.title}
                  subtitle={`${pl.songCount} songs · ${pl.durationLabel}`}
                  badge={pl.releaseDate?.replace("Updated ", "")}
                  hue={pl.hue ?? 24}
                  src={pl.logo || pl.coverImage}
                  href={`/playlists/${encodeURIComponent(pl.id.replace(/^nr-/, ""))}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

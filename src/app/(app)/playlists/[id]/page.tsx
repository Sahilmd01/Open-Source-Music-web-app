"use client";

import { use, useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  PlayIcon,
  PauseIcon,
  HeartIcon,
  HeartFilledIcon,
  SearchIcon,
  ChevronRightIcon,
  PlusIcon,
  PlaylistAddIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { CoverArt } from "@/components/ui/cover-art";
import { formatTime, formatNumber } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";
import { AddMusicModal } from "@/components/features/add-music-modal";
import { AddToPlaylistModal } from "@/components/features/add-to-playlist-modal";
import { SongsTable } from "@/components/songs";
import { DetailPageSkeleton } from "@/components/skeletons";
import { getPlaylistSongCount } from "@/hooks/use-playlist-track-manager";
import type { Playlist, Track } from "@/types/music";

interface PlaylistPageProps {
  params: Promise<{ id: string }>;
}

export default function PlaylistViewPage({ params }: PlaylistPageProps) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null);
  const { isAuthenticated, openLoginModal } = useUiStore();

  // Load liked state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`playlist_liked_${decodedId}`);
      if (stored) {
        setIsLiked(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [decodedId]);

  const togglePlaylistLike = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setIsLiked((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`playlist_liked_${decodedId}`, JSON.stringify(next));
      } catch {
        // ignore
      }

      if (playlist) {
        setPlaylist({
          ...playlist,
          likes: Math.max(0, (playlist.likes || 0) + (next ? 1 : -1)),
        });
      }

      // Sync with DB
      fetch("/api/control/playlists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: decodedId,
          likeAction: next ? "increment" : "decrement",
        }),
      }).catch((err) => console.warn("Failed to sync playlist like to DB:", err));

      return next;
    });
  };

  const queue = usePlayerStore((s) => s.queue);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const currentTrackId = queue[currentIndex]?.id;
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playContextTrack = usePlayerStore((s) => s.playContextTrack);
  const togglePlay = usePlayerStore((s) => s.toggle);
  const likedIds = usePlayerStore((s) => s.likedIds);
  const toggleLike = usePlayerStore((s) => s.toggleLike);
  const setSelectedContext = usePlayerStore((s) => s.setSelectedContext);

  // Load playlist metadata & tracks from database backend
  const loadPlaylistData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch playlists from backend database
      const res = await fetch("/api/control/playlists");
      const data = await res.json();
      let foundPl: Playlist | null = null;

      if (data.success && Array.isArray(data.playlists)) {
        const matched = data.playlists.find(
          (p: any) => p.id === decodedId || p.title.toLowerCase() === decodedId.toLowerCase()
        );
        if (matched) {
          foundPl = {
            id: matched.id,
            title: matched.title,
            description: matched.description || "Curated playlist",
            likes: typeof matched.likes === "number" ? matched.likes : (matched.like_count || 0),
            songCount: getPlaylistSongCount(matched.id, matched.songsCount || 0),
            durationLabel: "0 min",
            logo: matched.coverUrl,           // coverUrl = avatar/logo (small left image)
            coverImage: matched.bannerUrl,    // bannerUrl = banner (background image)
            isPublic: matched.visibility === "public",
            isCustom: Boolean(matched.ownerId),
            hue: matched.hue || 280,
          };
        }
      }

      if (!foundPl) {
        foundPl = {
          id: decodedId,
          title: decodedId.replace(/^pl-/, "").replace(/-/g, " ") || "Playlist",
          description: "Curated collection",
          likes: 0,
          songCount: 0,
          durationLabel: "0 min",
          hue: 280,
          isCustom: true,
        };
      }
      setPlaylist(foundPl);

      // 2. Fetch tracks belonging to this playlist from the database
      let playlistTracks: Track[] = [];
      try {
        const ptRes = await fetch(`/api/control/playlists/${encodeURIComponent(decodedId)}/tracks`);
        const ptData = await ptRes.json();
        if (ptData.success && Array.isArray(ptData.tracks) && ptData.tracks.length > 0) {
          playlistTracks = ptData.tracks.map((s: any) => ({
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

          // Cache DB tracks to localStorage so offline/instant reloads work
          try {
            localStorage.setItem(`playlist_tracks_v1_${decodedId}`, JSON.stringify(playlistTracks));
            localStorage.setItem(`playlist_track_ids_v1_${decodedId}`, JSON.stringify(playlistTracks.map((t) => t.id)));
          } catch {
            // ignore
          }
        }
      } catch (e) {
        console.warn("Failed to fetch playlist tracks from DB:", e);
      }

      // If DB returned nothing or failed, fallback to local cache
      if (playlistTracks.length === 0) {
        try {
          const tracksKey = `playlist_tracks_v1_${decodedId}`;
          const storedTracksJson = localStorage.getItem(tracksKey);
          if (storedTracksJson) {
            const storedList: Track[] = JSON.parse(storedTracksJson);
            if (Array.isArray(storedList) && storedList.length > 0) {
              playlistTracks = storedList;
            }
          }
        } catch {
          // ignore
        }
      }

      // Compute duration from loaded tracks
      const totalSecs = playlistTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
      const mins = Math.round(totalSecs / 60);
      const computedDurationLabel = mins > 0 ? `${mins} min` : `${totalSecs} sec`;

      foundPl.durationLabel = computedDurationLabel;
      foundPl.songCount = playlistTracks.length;
      setPlaylist({ ...foundPl });
      setTracks(playlistTracks);
    } catch (err) {
      console.error("Failed to load playlist data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [decodedId]);

  useEffect(() => {
    loadPlaylistData();
  }, [loadPlaylistData]);

  // Update right-side panel selectedContext for this playlist
  useEffect(() => {
    if (playlist) {
      const totalSecs = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
      const mins = Math.round(totalSecs / 60);
      const currentDuration = mins > 0 ? `${mins} min` : `${totalSecs} sec`;

      setSelectedContext({
        type: "playlist",
        id: playlist.id,
        title: playlist.title,
        subtitle: `${tracks.length} songs • ${currentDuration || "Playlist"}`,
        image: playlist.logo || playlist.coverImage,
        hue: playlist.hue || 200,
        tracks: tracks,
      });
    }
  }, [playlist, tracks, setSelectedContext]);

  const handleAddTrack = (newTrack: Track) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const updated = [newTrack, ...tracks];
    setTracks(updated);

    // Sync to DB
    fetch(`/api/control/playlists/${encodeURIComponent(decodedId)}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: newTrack.id }),
    }).catch((err) => console.warn("Failed to sync new track to DB:", err));

    try {
      const idsKey = `playlist_track_ids_v1_${decodedId}`;
      const ids = updated.map((t) => t.id);
      localStorage.setItem(idsKey, JSON.stringify(ids));

      const tracksKey = `playlist_tracks_v1_${decodedId}`;
      localStorage.setItem(tracksKey, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Also update parent playlist song count in state
    if (playlist) {
      setPlaylist({
        ...playlist,
        songCount: updated.length,
      });
    }
  };

  const filteredTracks = useMemo(() => {
    if (!searchFilter.trim()) return tracks;
    const q = searchFilter.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.uploadedBy && t.uploadedBy.toLowerCase().includes(q))
    );
  }, [tracks, searchFilter]);

  const isPlaylistPlaying =
    isPlaying && filteredTracks.some((t) => t.id === currentTrackId);

  const handlePlayAll = () => {
    if (isPlaylistPlaying) {
      togglePlay();
    } else {
      const first = filteredTracks[0];
      if (first) {
        playContextTrack(first, filteredTracks);
      }
    }
  };

  const totalDurationLabel = useMemo(() => {
    const totalSecs = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
    const mins = Math.round(totalSecs / 60);
    return mins > 0 ? `${mins} min` : totalSecs > 0 ? `${totalSecs} sec` : "0 min";
  }, [tracks]);

  if (!playlist) {
    return <DetailPageSkeleton />;
  }

  const artworkSrc = playlist.logo || playlist.coverImage;
  const bannerBg = playlist.coverImage || playlist.logo;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--fs-sm)" }}>
        <Link href="/playlists" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
          Playlists
        </Link>
        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
          <ChevronRightIcon width={14} height={14} />
        </span>
        <span style={{ color: "var(--text-primary)", fontWeight: "var(--fw-medium)" }}>
          {playlist.title}
        </span>
      </nav>

      {/* Playlist Hero Header */}
      <header
        className="playlist-detail-header"
        style={{
          position: "relative",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          padding: "var(--space-8) var(--space-6)",
          background: bannerBg
            ? `linear-gradient(to right, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.78) 50%, rgba(0, 0, 0, 0.45) 100%), url(${bannerBg}) center/cover no-repeat`
            : "linear-gradient(135deg, var(--bg-surface-2) 0%, var(--bg-surface-3) 100%)",
          border: "1px solid var(--border-default)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: "var(--space-6)",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Large Artwork */}
        <div
          className="playlist-detail-header__cover"
          style={{
            width: 170,
            height: 170,
            flexShrink: 0,
            borderRadius: playlist.logo && !playlist.coverImage ? "50%" : "var(--radius-md)",
            overflow: "hidden",
            boxShadow: "0 10px 24px rgba(0, 0, 0, 0.5)",
            background: "var(--bg-surface-3)",
          }}
        >
          {artworkSrc ? (
            <img
              src={artworkSrc}
              alt={playlist.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <CoverArt hue={playlist.hue ?? 24} style={{ width: "100%", height: "100%" }} />
          )}
        </div>

        {/* Playlist Information */}
        <div className="playlist-detail-header__info" style={{ flex: "1 1 320px", display: "grid", gap: "var(--space-2)" }}>
          <span
            className="playlist-detail-header__tag"
            style={{
              textTransform: "uppercase",
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              fontWeight: "var(--fw-bold)",
              color: "var(--accent)",
            }}
          >
            {playlist.isCustom ? "Personal Playlist" : "Curated Playlist"}
          </span>

          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: "var(--fw-bold)",
              letterSpacing: "-0.02em",
              margin: 0,
              color: "#ffffff",
              lineHeight: 1.15,
            }}
          >
            {playlist.title}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "var(--fs-sm)",
              color: "rgba(255, 255, 255, 0.75)",
              maxWidth: "60ch",
              lineHeight: 1.5,
            }}
          >
            {playlist.description}
          </p>

          {/* Meta details */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              fontSize: "var(--fs-xs)",
              color: "rgba(255, 255, 255, 0.65)",
              marginTop: "var(--space-2)",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--brand)" }}>
              <HeartFilledIcon width={14} height={14} />
              <strong style={{ color: "#fff" }}>{formatNumber(playlist.likes)}</strong> likes
            </span>
            <span>•</span>
            <span>{tracks.length} tracks</span>
            <span>•</span>
            <span>{totalDurationLabel}</span>
          </div>
        </div>
      </header>

      {/* Action Controls & Track Search Bar */}
      <div
        className="playlist-detail-controls"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
        }}
      >
        <div className="playlist-detail-controls__actions" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          {/* Big Play Button */}
          <Button
            variant="accent"
            size="md"
            leadingIcon={isPlaylistPlaying ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
            onClick={handlePlayAll}
            style={{ fontWeight: "var(--fw-semibold)", padding: "10px 24px" }}
          >
            {isPlaylistPlaying ? "Pause" : "Play Playlist"}
          </Button>

          {/* Add Music Option */}
          <Button
            variant="secondary"
            size="md"
            leadingIcon={<PlusIcon width={16} height={16} />}
            onClick={() => {
              if (!isAuthenticated) {
                openLoginModal();
                return;
              }
              setIsAddMusicOpen(true);
            }}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            Add Music
          </Button>

          <IconButton
            label={isLiked ? "Unlike this playlist" : "Like this playlist"}
            onClick={togglePlaylistLike}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: isLiked ? "var(--brand-soft)" : "var(--bg-surface-2)",
              border: isLiked ? "1px solid var(--brand)" : "1px solid var(--border-default)",
              color: isLiked ? "var(--brand)" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            {isLiked ? (
              <HeartFilledIcon width={20} height={20} style={{ color: "var(--brand)" }} />
            ) : (
              <HeartIcon width={20} height={20} />
            )}
          </IconButton>
        </div>

        {/* Filter songs inside playlist */}
        <div className="playlist-detail-controls__search" style={{ position: "relative", minWidth: 220, maxWidth: 300, flex: "1 1 200px" }}>
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
            placeholder="Search tracks or artists..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{
              paddingLeft: "calc(var(--space-3) + 20px)",
              height: 38,
              fontSize: "var(--fs-sm)",
              borderRadius: "var(--radius-pill)",
              background: "var(--bg-surface-2)",
            }}
          />
        </div>
      </div>

      {/* Track List Table - Reusing standard SongsTable with Title, Artist, Album, Uploaded By, Duration, Playlist Add & Like */}
      <SongsTable
        tracks={filteredTracks}
        searchFilter={searchFilter}
        currentTrackId={currentTrackId}
        isPlaying={isPlaying}
        likedIds={likedIds}
        onPlayTrack={(track) => playContextTrack(track, filteredTracks)}
        onToggleLike={toggleLike}
        onAddToPlaylist={(track) => setTrackToAddToPlaylist(track)}
        label="Playlist tracks"
        emptyMessage="No songs in this playlist yet. Click 'Add Music' or add songs from your library."
      />

      {/* Add Music Modal */}
      <AddMusicModal
        open={isAddMusicOpen}
        containerTitle={playlist.title}
        onClose={() => setIsAddMusicOpen(false)}
        onAddTrack={handleAddTrack}
      />

      {/* Add To Playlist Picker Modal */}
      <AddToPlaylistModal
        open={Boolean(trackToAddToPlaylist)}
        track={trackToAddToPlaylist}
        onClose={() => setTrackToAddToPlaylist(null)}
      />
    </div>
  );
}

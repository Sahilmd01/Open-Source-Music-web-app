"use client";

import { use, useEffect, useState, useMemo } from "react";
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
import { formatTime } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";
import { AddMusicModal } from "@/components/features/add-music-modal";
import { AddToPlaylistModal } from "@/components/features/add-to-playlist-modal";
import { SongsTable } from "@/components/songs";
import { DetailPageSkeleton } from "@/components/skeletons";
import type { Album, Track } from "@/types/music";

const ALBUMS_TRACKS_PREFIX = "album_tracks_v1_";

interface AlbumPageProps {
  params: Promise<{ id: string }>;
}

export default function AlbumViewPage({ params }: AlbumPageProps) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);

  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null);

  const [isLiked, setIsLiked] = useState(false);

  // Load liked state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`album_liked_${decodedId}`);
      if (stored) {
        setIsLiked(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [decodedId]);

  const toggleAlbumLike = () => {
    setIsLiked((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`album_liked_${decodedId}`, JSON.stringify(next));
      } catch {
        // ignore
      }
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

  // Load album details from database / localStorage
  useEffect(() => {
    let isMounted = true;

    async function loadAlbumData() {
      try {
        const [albumRes, artistRes] = await Promise.all([
          fetch("/api/control/albums"),
          fetch("/api/control/artists"),
        ]);
        const data = await albumRes.json();
        const artistData = await artistRes.json().catch(() => ({ success: false, artists: [] }));
        const allArtists: any[] = (artistData.success && Array.isArray(artistData.artists)) ? artistData.artists : [];

        if (data.success && Array.isArray(data.albums)) {
          const found = data.albums.find(
            (a: any) => String(a.id) === decodedId || String(a.title).toLowerCase() === decodedId.toLowerCase()
          );
          if (found && isMounted) {
            const rawArtistIds: string[] = Array.isArray(found.artistIds)
              ? found.artistIds
              : (found.artistId ? [found.artistId] : []);

            const resolvedArtists = rawArtistIds
              .map((aId) => {
                const match = allArtists.find((art: any) => String(art.id) === String(aId));
                return match ? { id: match.id, name: match.name, avatarUrl: match.avatarUrl } : null;
              })
              .filter(Boolean) as Array<{ id: string; name: string; avatarUrl?: string }>;

            setAlbum({
              id: String(found.id),
              title: found.title,
              artist: found.artist || "Various Artists",
              artistIds: rawArtistIds,
              artists: resolvedArtists,
              year: found.year || new Date().getFullYear(),
              coverImage: found.coverUrl,
              avatarUrl: found.coverUrl,
              bannerUrl: found.bannerUrl,
              hue: found.hue || 210,
            });
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch albums:", err);
      }

      // Check custom user-created albums from localStorage
      try {
        const stored = localStorage.getItem("my_custom_albums_v1");
        if (stored) {
          const customList: Album[] = JSON.parse(stored);
          const foundCustom = customList.find((a) => a.id === decodedId);
          if (foundCustom && isMounted) {
            setAlbum(foundCustom);
            return;
          }
        }
      } catch {
        // ignore
      }

      // Fallback album info if not found
      if (isMounted) {
        setAlbum({
          id: decodedId,
          title: decodedId.replace(/^al-?/, "").replace(/-/g, " "),
          artist: "Various Artists",
          year: new Date().getFullYear(),
          hue: 210,
        });
      }
    }

    loadAlbumData();
    return () => {
      isMounted = false;
    };
  }, [decodedId]);

  // Load album tracks from localStorage or database songs matching this album
  useEffect(() => {
    let isMounted = true;

    async function loadAlbumTracks() {
      // 1. Fetch real tracks belonging to this album from database API
      try {
        const atRes = await fetch(`/api/control/albums/${encodeURIComponent(decodedId)}/tracks`);
        const atData = await atRes.json();
        if (atData.success && Array.isArray(atData.tracks) && atData.tracks.length > 0) {
          const list = atData.tracks.map((s: any) => ({
            id: String(s.id),
            title: s.title,
            artist: s.artist,
            album: s.album || album?.title || "Album",
            duration: s.duration || 180,
            coverImage: s.coverImage || album?.coverImage,
            audioUrl: s.audioUrl,
            hue: s.hue || 210,
            uploadedBy: s.uploadedBy,
          }));
          if (isMounted) {
            setTracks(list);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch album tracks from DB API:", err);
      }

      // 2. Check custom tracks added to album in localStorage
      try {
        const albumTracksKey = `${ALBUMS_TRACKS_PREFIX}${decodedId}`;
        const stored = localStorage.getItem(albumTracksKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (isMounted) setTracks(parsed);
            return;
          }
        }
      } catch {
        // ignore
      }

      // 3. Fallback: match by album title or albumId from songs catalog
      try {
        const res = await fetch("/api/control/songs");
        const data = await res.json();
        if (data.success && Array.isArray(data.songs)) {
          const matchingSongs = data.songs
            .filter((s: any) => {
              if (String(s.albumId) === decodedId) return true;
              if (album && s.album && s.album.toLowerCase() === album.title.toLowerCase()) return true;
              return false;
            })
            .map((s: any) => ({
              id: String(s.id),
              title: s.title,
              artist: s.artist,
              album: s.album || album?.title || "Album",
              duration: s.duration || 180,
              coverImage: s.coverUrl,
              audioUrl: s.audioUrl || s.fileUrl,
              hue: s.hue || 210,
              uploadedBy: s.uploadedBy,
            }));

          if (isMounted) {
            setTracks(matchingSongs);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch songs for album:", err);
      }

      if (isMounted) {
        setTracks([]);
      }
    }

    loadAlbumTracks();
    return () => {
      isMounted = false;
    };
  }, [decodedId, album]);

  // Update right-side panel selectedContext for this album
  useEffect(() => {
    if (album) {
      setSelectedContext({
        type: "album",
        id: album.id,
        title: album.title,
        subtitle: `${album.artist} • ${album.year}`,
        image: album.coverImage,
        hue: album.hue || 210,
        tracks: tracks,
      });
    }
  }, [album, tracks, setSelectedContext]);

  const handleAddTrack = (newTrack: Track) => {
    const updated = [newTrack, ...tracks];
    setTracks(updated);

    // Sync to DB
    fetch(`/api/control/albums/${encodeURIComponent(decodedId)}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: newTrack.id }),
    }).catch((err) => console.warn("Failed to sync new track to album in DB:", err));

    try {
      const albumTracksKey = `${ALBUMS_TRACKS_PREFIX}${decodedId}`;
      localStorage.setItem(albumTracksKey, JSON.stringify(updated));
    } catch {
      // ignore
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

  const isAlbumPlaying = isPlaying && filteredTracks.some((t) => t.id === currentTrackId);

  const handlePlayAll = () => {
    if (isAlbumPlaying) {
      togglePlay();
    } else {
      const first = filteredTracks[0];
      if (first) {
        playContextTrack(first, filteredTracks);
      }
    }
  };

  const totalDuration = useMemo(() => {
    const totalSecs = tracks.reduce((acc, t) => acc + t.duration, 0);
    const mins = Math.floor(totalSecs / 60);
    return `${mins} min`;
  }, [tracks]);

  if (!album) {
    return <DetailPageSkeleton />;
  }

  const artworkSrc = album.avatarUrl || album.coverImage;
  const bannerBg = album.bannerUrl || album.coverImage;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--fs-sm)" }}>
        <Link href="/albums" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
          Albums
        </Link>
        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
          <ChevronRightIcon width={14} height={14} />
        </span>
        <span style={{ color: "var(--text-primary)", fontWeight: "var(--fw-medium)" }}>
          {album.title}
        </span>
      </nav>

      {/* Album Hero Header */}
      <header
        className="album-detail-header"
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
        {/* Cover Art / Avatar */}
        <div
          className="album-detail-header__cover"
          style={{
            width: 170,
            height: 170,
            flexShrink: 0,
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            boxShadow: "0 10px 24px rgba(0, 0, 0, 0.5)",
            background: "var(--bg-surface-3)",
          }}
        >
          {artworkSrc ? (
            <img
              src={artworkSrc}
              alt={album.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <CoverArt hue={album.hue} style={{ width: "100%", height: "100%" }} />
          )}
        </div>

        {/* Album Info */}
        <div className="album-detail-header__info" style={{ flex: "1 1 320px", display: "grid", gap: "var(--space-2)" }}>
          <span
            className="album-detail-header__tag"
            style={{
              textTransform: "uppercase",
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              fontWeight: "var(--fw-bold)",
              color: "var(--accent)",
            }}
          >
            {album.isCustom ? "Personal Album" : "Studio Album"}
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
            {album.title}
          </h1>

          <div
            style={{
              margin: 0,
              fontSize: "var(--fs-md)",
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: "var(--fw-medium)",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {album.artists && album.artists.length > 0 ? (
              album.artists.map((art, idx) => (
                <span key={art.id} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  {art.avatarUrl && (
                    <img
                      src={art.avatarUrl}
                      alt={art.name}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        objectFit: "cover",
                        display: "inline-block",
                      }}
                    />
                  )}
                  <Link
                    href={`/artists/${art.id}`}
                    style={{
                      color: "#ffffff",
                      textDecoration: "none",
                      fontWeight: "var(--fw-semibold)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >
                    {art.name}
                  </Link>
                  {idx < (album.artists?.length || 0) - 1 && (
                    <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>•</span>
                  )}
                </span>
              ))
            ) : (
              <span>{album.artist}</span>
            )}
          </div>

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
            <span style={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: "var(--fw-semibold)" }}>
              {album.year}
            </span>
            <span>•</span>
            <span>{tracks.length} songs</span>
            <span>•</span>
            <span>{totalDuration}</span>
          </div>
        </div>
      </header>

      {/* Action Controls & Song Filter Bar */}
      <div
        className="album-detail-controls"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
        }}
      >
        <div className="album-detail-controls__actions" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <Button
            variant="accent"
            size="md"
            leadingIcon={isAlbumPlaying ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
            onClick={handlePlayAll}
            style={{ fontWeight: "var(--fw-semibold)", padding: "10px 24px" }}
          >
            {isAlbumPlaying ? "Pause" : "Play Album"}
          </Button>

          {/* Add Music Option */}
          <Button
            variant="secondary"
            size="md"
            leadingIcon={<PlusIcon width={16} height={16} />}
            onClick={() => setIsAddMusicOpen(true)}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            Add Music
          </Button>

          <IconButton
            label={isLiked ? "Remove album from favorites" : "Save album to favorites"}
            onClick={toggleAlbumLike}
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

        {/* Filter songs inside album */}
        <div className="album-detail-controls__search" style={{ position: "relative", minWidth: 220, maxWidth: 300, flex: "1 1 200px" }}>
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
            placeholder="Search in album..."
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

      {/* Tracklist Table - Reusing standard SongsTable with Title, Artist, Album, Uploaded By, Duration, Playlist Add & Like */}
      <SongsTable
        tracks={filteredTracks}
        searchFilter={searchFilter}
        currentTrackId={currentTrackId}
        isPlaying={isPlaying}
        likedIds={likedIds}
        onPlayTrack={(track) => playContextTrack(track, filteredTracks)}
        onToggleLike={toggleLike}
        onAddToPlaylist={(track) => setTrackToAddToPlaylist(track)}
        label="Album tracks"
      />

      {/* Add Music Modal */}
      <AddMusicModal
        open={isAddMusicOpen}
        containerTitle={album.title}
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

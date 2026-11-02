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
import { formatTime } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";
import { AddMusicModal } from "@/components/features/add-music-modal";
import { AddToPlaylistModal } from "@/components/features/add-to-playlist-modal";
import { SongsTable } from "@/components/songs";
import { MediaCard } from "@/components/features/media-card";
import { DetailPageSkeleton } from "@/components/skeletons";
import { useUiStore } from "@/stores/ui-store";
import type { Artist, Track, Album } from "@/types/music";

const ARTIST_FAVS_STORAGE_KEY = "my_favorite_artists_v1";

interface ArtistPageProps {
  params: Promise<{ id: string }>;
}

export default function ArtistViewPage({ params }: ArtistPageProps) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);

  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artistAlbums, setArtistAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null);
  const { isAuthenticated, openLoginModal } = useUiStore();

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

  // Load artist metadata and catalog from database
  const loadArtistData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch artists from backend
      const artistRes = await fetch("/api/control/artists");
      const artistData = await artistRes.json();
      let foundArtist: Artist | null = null;
      if (artistData.success && Array.isArray(artistData.artists)) {
        const matched = artistData.artists.find(
          (a: any) => a.id === decodedId || a.name.toLowerCase() === decodedId.toLowerCase()
        );
        if (matched) {
          foundArtist = {
            id: matched.id,
            name: matched.name,
            hue: matched.hue || 220,
            image: matched.avatarUrl || undefined,
            bannerUrl: matched.bannerUrl || undefined,
            bio: matched.genre || matched.bio || undefined,
            followers: matched.followers || 0,
          };
        }
      }

      if (!foundArtist) {
        foundArtist = {
          id: decodedId,
          name: decodedId.replace(/^a\d*-?/, "").replace(/-/g, " ") || "Artist",
          hue: 220,
        };
      }
      setArtist(foundArtist);

      // 2. Fetch tracks for this artist
      const songsRes = await fetch("/api/control/songs");
      const songsData = await songsRes.json();
      if (songsData.success && Array.isArray(songsData.songs)) {
        const liveTracks: Track[] = songsData.songs
          .filter(
            (s: any) =>
              s.artist?.toLowerCase() === foundArtist!.name.toLowerCase() ||
              s.artistId === foundArtist!.id
          )
          .map((s: any) => ({
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
        setTracks(liveTracks);
      }

      // 3. Fetch albums for this artist
      const albumsRes = await fetch("/api/control/albums");
      const albumsData = await albumsRes.json();
      if (albumsData.success && Array.isArray(albumsData.albums)) {
        const liveAlbums: Album[] = albumsData.albums
          .filter(
            (al: any) =>
              al.artist?.toLowerCase() === foundArtist!.name.toLowerCase() ||
              al.artistId === foundArtist!.id
          )
          .map((al: any) => ({
            id: al.id,
            title: al.title,
            artist: al.artist,
            year: al.year || new Date().getFullYear(),
            hue: al.hue || 220,
            coverImage: al.coverUrl || al.coverImage,
            bannerUrl: al.bannerUrl,
            description: al.description,
          }));
        setArtistAlbums(liveAlbums);
      }
    } catch (err) {
      console.error("Failed to load artist data from database:", err);
    } finally {
      setIsLoading(false);
    }
  }, [decodedId]);

  useEffect(() => {
    loadArtistData();
  }, [loadArtistData]);

  // Check favorite status from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ARTIST_FAVS_STORAGE_KEY);
      if (stored) {
        const favs: string[] = JSON.parse(stored);
        setIsLiked(favs.includes(decodedId));
      }
    } catch {
      // ignore
    }
  }, [decodedId]);

  // Update right-side panel selectedContext for this artist
  useEffect(() => {
    if (artist) {
      setSelectedContext({
        type: "artist",
        id: artist.id,
        title: artist.name,
        subtitle: `${tracks.length} Songs • Verified Artist`,
        image: artist.image,
        hue: artist.hue || 220,
        tracks: tracks,
      });
    }
  }, [artist, tracks, setSelectedContext]);

  const toggleArtistLike = () => {
    setIsLiked((prev) => {
      const next = !prev;
      try {
        const stored = localStorage.getItem(ARTIST_FAVS_STORAGE_KEY);
        const currentFavs: string[] = stored ? JSON.parse(stored) : [];
        const updated = next
          ? Array.from(new Set([...currentFavs, decodedId]))
          : currentFavs.filter((id) => id !== decodedId);
        localStorage.setItem(ARTIST_FAVS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleAddTrack = async (newTrack: Track) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    try {
      const res = await fetch("/api/control/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTrack.title,
          artist: artist?.name || newTrack.artist,
          album: newTrack.album,
          duration: newTrack.duration,
          coverImage: newTrack.coverImage,
          hue: newTrack.hue,
          uploadedBy: newTrack.uploadedBy,
          audioUrl: (newTrack as any).audioSrc || (newTrack as any).audioUrl,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) {
          openLoginModal();
        }
        throw new Error(data.error || "Failed to add song");
      }
      if (data.success && data.song) {
        const addedTrack: Track = {
          id: data.song.id,
          title: data.song.title,
          artist: data.song.artist,
          album: data.song.album,
          duration: data.song.duration,
          coverImage: data.song.coverImage,
          hue: data.song.hue,
          uploadedBy: data.song.uploadedBy,
          audioSrc: data.song.audioUrl,
          audioUrl: data.song.audioUrl,
        };
        setTracks((prev) => [addedTrack, ...prev]);
        setIsAddMusicOpen(false);
        return;
      }
    } catch (err) {
      console.error("Failed to add track to database:", err);
    }
  };

  const filteredTracks = useMemo(() => {
    if (!searchFilter.trim()) return tracks;
    const q = searchFilter.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        (t.uploadedBy && t.uploadedBy.toLowerCase().includes(q))
    );
  }, [tracks, searchFilter]);

  const isArtistPlaying = isPlaying && filteredTracks.some((t) => t.id === currentTrackId);

  const handlePlayAll = () => {
    if (isArtistPlaying) {
      togglePlay();
    } else {
      const first = filteredTracks[0];
      if (first) {
        playContextTrack(first, filteredTracks);
      }
    }
  };

  if (isLoading || !artist) {
    return <DetailPageSkeleton />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--fs-sm)" }}>
        <Link href="/artists" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
          Artists
        </Link>
        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
          <ChevronRightIcon width={14} height={14} />
        </span>
        <span style={{ color: "var(--text-primary)", fontWeight: "var(--fw-medium)" }}>
          {artist.name}
        </span>
      </nav>

      {/* Artist Hero Header */}
      <header
        className="artist-detail-header"
        style={{
          position: "relative",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          padding: "var(--space-8) var(--space-6)",
          background: (artist.bannerUrl || artist.image)
            ? `linear-gradient(to right, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.78) 50%, rgba(0, 0, 0, 0.45) 100%), url(${artist.bannerUrl || artist.image}) center/cover no-repeat`
            : "linear-gradient(135deg, var(--bg-surface-2) 0%, var(--bg-surface-3) 100%)",
          border: "1px solid var(--border-default)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "var(--space-6)",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Circular Artist Avatar */}
        <div
          className="artist-detail-header__cover"
          style={{
            width: 190,
            height: 190,
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.6)",
            background: "var(--bg-surface-3)",
            border: "none",
            flexShrink: 0,
          }}
        >
          {artist.image ? (
            <img
              src={artist.image}
              alt={artist.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <CoverArt hue={artist.hue} initials={artist.name} rounded="full" style={{ width: "100%", height: "100%" }} />
          )}
        </div>

        {/* Artist Information */}
        <div className="artist-detail-header__info" style={{ flex: "1 1 320px", display: "grid", gap: "var(--space-2)" }}>
          <span
            className="artist-detail-header__tag"
            style={{
              textTransform: "uppercase",
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              fontWeight: "var(--fw-bold)",
              color: "var(--accent)",
            }}
          >
            Verified Artist
          </span>

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: "var(--fw-bold)",
              letterSpacing: "-0.02em",
              margin: 0,
              color: "#ffffff",
              lineHeight: 1.15,
            }}
          >
            {artist.name}
          </h1>

          <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "rgba(255, 255, 255, 0.75)" }}>
            Monthly listeners · 1,482,900
          </p>

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
              {tracks.length} Songs
            </span>
            <span>•</span>
            <span>{artistAlbums.length} Albums</span>
          </div>
        </div>
      </header>

      {/* Action Controls & Song Filter Bar */}
      <div
        className="artist-detail-controls"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
        }}
      >
        <div className="artist-detail-controls__actions" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          {/* Big Play Button */}
          <Button
            variant="accent"
            size="md"
            leadingIcon={isArtistPlaying ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
            onClick={handlePlayAll}
            style={{ fontWeight: "var(--fw-semibold)", padding: "10px 24px" }}
          >
            {isArtistPlaying ? "Pause" : "Play Songs"}
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
            Add Song
          </Button>

          {/* Follow / Like Artist */}
          <IconButton
            label={isLiked ? "Unfollow artist" : "Follow artist"}
            onClick={toggleArtistLike}
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

        {/* Filter songs inside artist */}
        <div className="artist-detail-controls__search" style={{ position: "relative", minWidth: 220, maxWidth: 300, flex: "1 1 200px" }}>
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
            placeholder="Search artist songs..."
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

      {/* Songs Section */}
      <section aria-label="Artist songs">
        <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-semibold)", marginBottom: "var(--space-3)" }}>
          Popular Songs
        </h2>

        <SongsTable
          tracks={filteredTracks}
          searchFilter={searchFilter}
          currentTrackId={currentTrackId}
          isPlaying={isPlaying}
          likedIds={likedIds}
          onPlayTrack={(track) => playContextTrack(track, filteredTracks)}
          onToggleLike={toggleLike}
          onAddToPlaylist={(track) => setTrackToAddToPlaylist(track)}
          label="Artist songs"
        />
      </section>

      {/* Albums by this Artist */}
      {artistAlbums.length > 0 && (
        <section aria-label="Discography">
          <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-semibold)", marginBottom: "var(--space-3)" }}>
            Discography
          </h2>
          <div className="media-grid">
            {artistAlbums.map((alb) => (
              <MediaCard
                key={alb.id}
                title={alb.title}
                subtitle={`${alb.artist} · ${alb.year}`}
                hue={alb.hue}
                src={alb.coverImage}
                href={`/albums/${encodeURIComponent(alb.id)}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Add Music Modal */}
      <AddMusicModal
        open={isAddMusicOpen}
        containerTitle={artist.name}
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

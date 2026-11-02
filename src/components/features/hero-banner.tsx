"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { HeartFilledIcon, PauseIcon, PlayIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";
import type { Playlist, Track } from "@/types/music";

interface HeroBannerProps {
  playlists?: Playlist[];
  playlist?: Playlist;
}

export function HeroBanner({ playlists, playlist }: HeroBannerProps) {
  const items = playlists && playlists.length > 0 ? playlists : (playlist ? [playlist] : []);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [paused, setPaused] = useState(false);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goToNext = () => {
    if (items.length <= 1) return;
    setDirection("next");
    setIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrev = () => {
    if (items.length <= 1) return;
    setDirection("prev");
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToIndex = (target: number) => {
    if (target === index) return;
    setDirection(target > index ? "next" : "prev");
    setIndex(target);
  };

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    const interval = setInterval(() => {
      goToNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [items.length, paused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Detect horizontal swipe if deltaX is sufficiently larger than deltaY
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swiped left -> next slide
        goToNext();
      } else {
        // Swiped right -> previous slide
        goToPrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const router = useRouter();
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.toggle);
  const playContextTrack = usePlayerStore((s) => s.playContextTrack);
  const selectedContext = usePlayerStore((s) => s.selectedContext);
  const setSelectedContext = usePlayerStore((s) => s.setSelectedContext);

  if (items.length === 0) return null;
  const current = items[index] ?? items[0]!;
  const coverUrl = current.coverImage ?? "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80";

  const isCurrentPlaylistPlaying =
    isPlaying && selectedContext?.type === "playlist" && selectedContext?.id === current.id;

  const handlePlayPlaylist = () => {
    // 1. If this exact playlist is already active, navigate and toggle play if paused
    if (selectedContext?.type === "playlist" && selectedContext?.id === current.id) {
      if (!isPlaying) {
        togglePlay();
      }
      router.push(`/playlists/${encodeURIComponent(current.id)}`);
      return;
    }

    // 2. Fetch tracks from localStorage for this playlist
    let playlistTracks: Track[] = [];
    try {
      const stored = localStorage.getItem(`playlist_tracks_v1_${current.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          playlistTracks = parsed;
        }
      }
    } catch {
      // ignore
    }

    // 3. Set the active context for right-side drawer and now-playing
    setSelectedContext({
      type: "playlist",
      id: current.id,
      title: current.title,
      subtitle: `${current.songCount || playlistTracks.length} songs • ${current.durationLabel || "Playlist"}`,
      image: current.coverImage || current.logo,
      hue: current.hue || 200,
      tracks: playlistTracks,
    });

    // 4. Play the first track in the playlist if it contains tracks
    const firstTrack = playlistTracks[0];
    if (firstTrack) {
      playContextTrack(firstTrack, playlistTracks);
    }

    // 5. Open the playlist detail page
    router.push(`/playlists/${encodeURIComponent(current.id)}`);
  };

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <section
        className="hero"
        aria-labelledby="hero-title"
      >
        {/* Animated Background Cover Image - Real <img> element that moves right-to-left */}
        <div className="hero__art-container" aria-hidden="true">
          <img
            key={`${current.id}-${index}`}
            src={coverUrl}
            alt={current.title}
            className={`hero__img-moving ${direction === "prev" ? "hero__img-moving--prev" : ""}`}
          />
        </div>

        {/* Stable dark gradient overlay for text readability */}
        <div className="hero__gradient" aria-hidden="true" />

        {/* Fixed Content - Box & text remain stable, unaffected by the image slide */}
        <span className="eyebrow">Trending Playlist</span>
        <h1 id="hero-title" className="hero__title display">{current.title}</h1>
        <p>{current.description}</p>
        <div className="hero__meta">
          <HeartFilledIcon width={18} height={18} style={{ color: "var(--brand)" }} aria-hidden="true" />
          <strong>{formatNumber(current.likes)} Likes</strong>
          <span>•</span>
          <span>{current.songCount} songs, {current.durationLabel}</span>
        </div>
        <Button
          variant="accent"
          leadingIcon={
            isCurrentPlaylistPlaying ? (
              <PauseIcon width={16} height={16} />
            ) : (
              <PlayIcon width={16} height={16} />
            )
          }
          className="hero__cta"
          onClick={handlePlayPlaylist}
        >
          {isCurrentPlaylistPlaying ? "Pause playlist" : "Play playlist"}
        </Button>
      </section>

      {items.length > 1 && (
        <div className="hero-carousel__dots" aria-label="Playlist navigation">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`hero-carousel__dot ${i === index ? "is-active" : ""}`}
              aria-label={`Go to ${item.title}`}
              onClick={() => goToIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

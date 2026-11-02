"use client";

import Link from "next/link";
import { CoverArt } from "@/components/ui/cover-art";
import { IconButton } from "@/components/ui/icon-button";
import { PlayIcon, PauseIcon, HeartIcon, HeartFilledIcon, ChevronRightIcon } from "@/components/icons";
import { usePlayerStore } from "@/stores/player-store";
import type { Artist, Track } from "@/types/music";

interface ArtistRowListProps {
  artists: Artist[];
  likedIds?: string[];
  onToggleLike?: (id: string) => void;
  renderActions?: (artist: Artist) => React.ReactNode;
}

export function ArtistRowList({
  artists,
  likedIds = [],
  onToggleLike,
  renderActions,
}: ArtistRowListProps) {
  const queue = usePlayerStore((s) => s.queue);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const currentTrack = queue[currentIndex];
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.toggle);

  const handlePlayToggle = (artist: Artist) => {
    const isCurrentArtist =
      currentTrack && currentTrack.artist.toLowerCase() === artist.name.toLowerCase();

    if (isCurrentArtist) {
      togglePlay();
    } else {
      // Find track by this artist from current loaded queue, or create radio context
      const existing = queue.find(
        (t) => t.artist.toLowerCase() === artist.name.toLowerCase()
      );
      if (existing) {
        playTrack(existing.id, existing);
      } else {
        const dynamicTrack: Track = {
          id: `artist-play-${artist.id}`,
          title: `${artist.name} Radio`,
          artist: artist.name,
          album: "Top Tracks",
          duration: 180,
          hue: artist.hue || 220,
          coverImage: artist.image,
        };
        playTrack(dynamicTrack.id, dynamicTrack);
      }
    }
  };

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "4px" }}>
      {artists.map((artist) => {
        const isLiked = likedIds.includes(artist.id);
        const isThisArtistPlaying =
          isPlaying &&
          currentTrack &&
          currentTrack.artist.toLowerCase() === artist.name.toLowerCase();

        return (
          <li
            key={artist.id}
            className="artist-row-item"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius-md)",
              transition: "background var(--dur-fast)",
              flexWrap: "wrap",
              gap: "var(--space-2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-surface-2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Left Side: Profile Icon (Round Avatar) + Name & Role */}
            <Link
              href={`/artists/${encodeURIComponent(artist.id)}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                textDecoration: "none",
                color: "inherit",
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* Profile Icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "var(--bg-surface-3)",
                }}
              >
                {artist.image ? (
                  <img
                    src={artist.image}
                    alt={artist.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <CoverArt
                    hue={artist.hue}
                    initials={artist.name}
                    rounded="full"
                    style={{ width: "100%", height: "100%" }}
                  />
                )}
              </div>

              {/* Name & Details */}
              <div style={{ minWidth: 0, overflow: "hidden" }}>
                <h3
                  style={{
                    fontSize: "var(--fs-md)",
                    fontWeight: "var(--fw-medium)",
                    color: isThisArtistPlaying ? "var(--brand)" : "var(--text-primary)",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {artist.name}
                </h3>
                <span
                  style={{
                    fontSize: "var(--fs-xs)",
                    color: "var(--text-muted)",
                  }}
                >
                  Artist
                </span>
              </div>
            </Link>

            {/* Right Side: Play/Pause Toggle & Fav Icon grouped together, then View Songs Link */}
            <div
              className="artist-row-actions"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                flexWrap: "wrap",
              }}
            >
              {/* Play/Pause & Favorite Group */}
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                {/* Play / Pause Toggle Button (Reusing existing .btn-play yellow circle UI) */}
                <button
                  type="button"
                  className="btn-play"
                  aria-label={isThisArtistPlaying ? `Pause ${artist.name}` : `Play ${artist.name}`}
                  title={isThisArtistPlaying ? `Pause ${artist.name}` : `Play ${artist.name}`}
                  onClick={() => handlePlayToggle(artist)}
                  style={{
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                  }}
                >
                  {isThisArtistPlaying ? (
                    <PauseIcon width={16} height={16} />
                  ) : (
                    <PlayIcon width={16} height={16} />
                  )}
                </button>

                {/* Fav / Unfav Icon Button (Reusing IconButton with identical style from view artist page) */}
                {onToggleLike && (
                  <IconButton
                    label={isLiked ? `Unfollow ${artist.name}` : `Follow ${artist.name}`}
                    onClick={() => onToggleLike(artist.id)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: isLiked ? "var(--brand-soft)" : "var(--bg-surface-2)",
                      border: isLiked ? "1px solid var(--brand)" : "1px solid var(--border-default)",
                      color: isLiked ? "var(--brand)" : "var(--text-secondary)",
                      transition: "all 0.15s ease",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isLiked ? (
                      <HeartFilledIcon width={18} height={18} style={{ color: "var(--brand)" }} />
                    ) : (
                      <HeartIcon width={18} height={18} />
                    )}
                  </IconButton>
                )}
              </div>

              {/* Custom Control Actions Slot (Enable/Disable, Edit Banner/Avatar) */}
              {renderActions && renderActions(artist)}

              {/* View Songs Link */}
              <Link
                href={`/artists/${encodeURIComponent(artist.id)}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "var(--text-secondary)",
                  fontSize: "var(--fs-xs)",
                  fontWeight: "var(--fw-medium)",
                  textDecoration: "none",
                  marginLeft: "var(--space-1)",
                  transition: "color var(--dur-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--brand)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <span>View Songs</span>
                <ChevronRightIcon width={14} height={14} />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

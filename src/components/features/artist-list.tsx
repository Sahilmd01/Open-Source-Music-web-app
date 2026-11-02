"use client";

import Link from "next/link";
import { CoverArt } from "@/components/ui/cover-art";
import { PlayIcon, HeartIcon, HeartFilledIcon } from "@/components/icons";
import type { Artist } from "@/types/music";

interface ArtistListProps {
  artists: Artist[];
  likedIds?: string[];
  onToggleLike?: (id: string) => void;
}

export function ArtistList({ artists, likedIds = [], onToggleLike }: ArtistListProps) {
  return (
    <ul className="grid-artists" role="list">
      {artists.map((artist) => {
        const isLiked = likedIds.includes(artist.id);

        return (
          <li key={artist.id}>
            <Link
              href={`/artists/${encodeURIComponent(artist.id)}`}
              className="artist-card"
              style={{ position: "relative", textDecoration: "none", color: "inherit", display: "flex" }}
            >
              <div className="artist-card__avatar-wrap">
                <CoverArt
                  hue={artist.hue}
                  initials={artist.name}
                  src={artist.image}
                  rounded="full"
                  className="artist-card__img"
                />

                {/* Play Button */}
                <button
                  type="button"
                  className="artist-card__play"
                  aria-label={`Play ${artist.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <PlayIcon width={16} height={16} />
                </button>

                {/* Like Favorite Toggle Button */}
                {onToggleLike && (
                  <button
                    type="button"
                    aria-label={isLiked ? `Remove ${artist.name} from favorites` : `Add ${artist.name} to favorites`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleLike(artist.id);
                    }}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: isLiked ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.55)",
                      border: "none",
                      display: "grid",
                      placeItems: "center",
                      color: isLiked ? "var(--brand)" : "rgba(255,255,255,0.85)",
                      cursor: "pointer",
                      zIndex: 2,
                      transition: "transform 0.15s ease, background 0.15s ease",
                    }}
                  >
                    {isLiked ? (
                      <HeartFilledIcon width={14} height={14} style={{ color: "var(--brand)" }} />
                    ) : (
                      <HeartIcon width={14} height={14} />
                    )}
                  </button>
                )}
              </div>
              <div className="artist-card__info">
                <span className="artist-card__name">{artist.name}</span>
                <span className="artist-card__role">
                  {typeof artist.totalLikes === 'number' && artist.totalLikes > 0
                    ? `${artist.totalLikes} ${artist.totalLikes === 1 ? 'like' : 'likes'}`
                    : typeof artist.songCount === 'number' && artist.songCount > 0
                    ? `${artist.songCount} ${artist.songCount === 1 ? 'song' : 'songs'}`
                    : "Artist"}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}


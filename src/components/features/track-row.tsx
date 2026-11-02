"use client";

import { useState } from "react";
import { HeartFilledIcon, HeartIcon, PlaylistAddIcon } from "@/components/icons";
import { CoverArt } from "@/components/ui/cover-art";
import { IconButton } from "@/components/ui/icon-button";
import { AddToPlaylistModal } from "@/components/features/add-to-playlist-modal";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { usePlayerStore } from "@/stores/player-store";
import type { Track } from "@/types/music";

export function TrackRow({ track }: { track: Track }) {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const toggleLike = usePlayerStore((s) => s.toggleLike);
  const isCurrent = usePlayerStore((s) => s.queue[s.currentIndex]?.id === track.id);
  const liked = usePlayerStore((s) => s.likedIds.includes(track.id));
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <li className={cn("track", isCurrent && "is-playing")}>
        <CoverArt hue={track.hue} className="track__cover" />
        <button type="button" className="track__play" onClick={() => playTrack(track.id)} aria-label={`Play ${track.title} by ${track.artist}`}>
          <span className="track__title">{track.title}</span>
        </button>
        <span className="track__artist">{track.artist}</span>
        <span className="track__time">{formatTime(track.duration)}</span>
        <div className="track__actions" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <IconButton
            label={liked ? `Remove ${track.title} from favorites` : `Add ${track.title} to favorites`}
            title={liked ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={liked}
            onClick={() => toggleLike(track.id)}
            style={{ width: 32, height: 32 }}
          >
            {liked ? <HeartFilledIcon width={16} height={16} style={{ color: "var(--brand)" }} /> : <HeartIcon width={16} height={16} />}
          </IconButton>
          <IconButton
            label={`Add ${track.title} to playlist`}
            title="Add to playlist"
            onClick={() => setIsAddOpen(true)}
            style={{ width: 32, height: 32 }}
          >
            <PlaylistAddIcon width={17} height={17} />
          </IconButton>
        </div>
      </li>

      <AddToPlaylistModal
        open={isAddOpen}
        track={track}
        onClose={() => setIsAddOpen(false)}
      />
    </>
  );
}

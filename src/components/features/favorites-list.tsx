"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { usePlayerStore } from "@/stores/player-store";
import { TrackList } from "./track-list";
import type { Track } from "@/types/music";

export function FavoritesList() {
  const likedIds = usePlayerStore((s) => s.likedIds);
  const [allSongs, setAllSongs] = useState<Track[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/control/songs")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.songs) && isMounted) {
          const list: Track[] = data.songs.map((s: any) => ({
            id: String(s.id),
            title: s.title,
            artist: s.artist,
            album: s.album,
            duration: s.duration || 180,
            coverImage: s.coverUrl,
            audioUrl: s.audioUrl || s.fileUrl,
            hue: s.hue || 24,
            uploadedBy: s.uploadedBy,
          }));
          setAllSongs(list);
        }
      })
      .catch((err) => console.error("Failed to load songs:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const tracks = allSongs.filter((t) => likedIds.includes(t.id));

  if (tracks.length === 0) {
    return <EmptyState title="No favorites yet" description="Tap the heart on any song and it will show up here." />;
  }
  return <TrackList tracks={tracks} label="Favorite songs" />;
}

"use client";

import type { Track } from "@/types/music";
import { SongsTable } from "@/components/songs";

export function TrackList({
  tracks,
  label,
  showHeader = true,
  showLikesCount = false,
}: {
  tracks: Track[];
  label: string;
  showHeader?: boolean;
  showLikesCount?: boolean;
}) {
  return <SongsTable tracks={tracks} label={label} showHeader={showHeader} showLikesCount={showLikesCount} />;
}

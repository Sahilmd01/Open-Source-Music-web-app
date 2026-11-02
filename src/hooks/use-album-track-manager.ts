"use client";

import { useCallback } from "react";
import type { Track } from "@/types/music";

const ALBUM_TRACKS_KEY = (albumId: string) => `album_tracks_v1_${albumId}`;
const ALBUM_IDS_KEY = (albumId: string) => `album_track_ids_v1_${albumId}`;

/** Read cached tracks for an album from localStorage */
export function getAlbumTracks(albumId: string): Track[] {
  try {
    const raw = localStorage.getItem(ALBUM_TRACKS_KEY(albumId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

/** Check if track is in album */
export function isTrackInAlbum(albumId: string, trackId: string, currentTrackAlbumId?: string): boolean {
  if (currentTrackAlbumId && currentTrackAlbumId === albumId) return true;
  try {
    const raw = localStorage.getItem(ALBUM_TRACKS_KEY(albumId));
    if (raw) {
      const list: Track[] = JSON.parse(raw);
      if (Array.isArray(list) && list.some((t) => t.id === trackId)) return true;
    }
    const rawIds = localStorage.getItem(ALBUM_IDS_KEY(albumId));
    if (rawIds) {
      const ids: string[] = JSON.parse(rawIds);
      if (Array.isArray(ids) && ids.includes(trackId)) return true;
    }
  } catch {
    // ignore
  }
  return false;
}

/** Add track to album in DB and cache */
export function addTrackToAlbum(albumId: string, track: Track): Track[] {
  const existing = getAlbumTracks(albumId);
  const updated = existing.some((t) => t.id === track.id) ? existing : [track, ...existing];
  persistAlbum(albumId, updated);

  fetch(`/api/control/albums/${encodeURIComponent(albumId)}/tracks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trackId: track.id }),
  }).catch((err) => console.warn("Failed to sync add track to album DB:", err));

  return updated;
}

/** Remove track from album in DB and cache */
export function removeTrackFromAlbum(albumId: string, trackId: string): Track[] {
  const existing = getAlbumTracks(albumId);
  const updated = existing.filter((t) => t.id !== trackId);
  persistAlbum(albumId, updated);

  fetch(`/api/control/albums/${encodeURIComponent(albumId)}/tracks?trackId=${encodeURIComponent(trackId)}`, {
    method: "DELETE",
  }).catch((err) => console.warn("Failed to sync remove track from album DB:", err));

  return updated;
}

function persistAlbum(albumId: string, tracks: Track[]) {
  try {
    localStorage.setItem(ALBUM_TRACKS_KEY(albumId), JSON.stringify(tracks));
    localStorage.setItem(ALBUM_IDS_KEY(albumId), JSON.stringify(tracks.map((t) => t.id)));
  } catch {
    // ignore
  }
}

export function useAlbumTrackManager() {
  const addTrack = useCallback(
    (albumId: string, track: Track): Track[] => addTrackToAlbum(albumId, track),
    []
  );

  const removeTrack = useCallback(
    (albumId: string, trackId: string): Track[] => removeTrackFromAlbum(albumId, trackId),
    []
  );

  const isInAlbum = useCallback(
    (albumId: string, trackId: string, trackAlbumId?: string): boolean =>
      isTrackInAlbum(albumId, trackId, trackAlbumId),
    []
  );

  return { addTrack, removeTrack, isInAlbum };
}

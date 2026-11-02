"use client";

/**
 * usePlaylistTrackManager
 * Manages adding and removing tracks from playlists via localStorage.
 * Source of truth is localStorage (playlist_tracks_v1_* and playlist_track_ids_v1_*).
 */

import { useCallback } from "react";
import type { Track } from "@/types/music";

const TRACKS_KEY = (playlistId: string) => `playlist_tracks_v1_${playlistId}`;
const IDS_KEY = (playlistId: string) => `playlist_track_ids_v1_${playlistId}`;

/** Read the full track list for a playlist from localStorage */
export function getPlaylistTracks(playlistId: string): Track[] {
  try {
    const raw = localStorage.getItem(TRACKS_KEY(playlistId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

/** Get the real song count for a playlist from localStorage (falls back to dbCount) */
export function getPlaylistSongCount(playlistId: string, dbCount = 0): number {
  try {
    const raw = localStorage.getItem(TRACKS_KEY(playlistId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.length;
    }
    const rawIds = localStorage.getItem(IDS_KEY(playlistId));
    if (rawIds) {
      const ids = JSON.parse(rawIds);
      if (Array.isArray(ids) && ids.length > 0) return ids.length;
    }
  } catch {
    // ignore
  }
  return dbCount;
}

/** Check if a track is already in a playlist */
export function isTrackInPlaylist(playlistId: string, trackId: string): boolean {
  try {
    const raw = localStorage.getItem(TRACKS_KEY(playlistId));
    if (raw) {
      const list: Track[] = JSON.parse(raw);
      if (Array.isArray(list) && list.some((t) => t.id === trackId)) return true;
    }
    const rawIds = localStorage.getItem(IDS_KEY(playlistId));
    if (rawIds) {
      const ids: string[] = JSON.parse(rawIds);
      if (Array.isArray(ids) && ids.includes(trackId)) return true;
    }
  } catch {
    // ignore
  }
  return false;
}

/** Add a track to a playlist in DB and cache. Returns the updated track list. */
export function addTrackToPlaylist(playlistId: string, track: Track): Track[] {
  const existing = getPlaylistTracks(playlistId);
  const updated = existing.some((t) => t.id === track.id) ? existing : [track, ...existing];
  persist(playlistId, updated);

  // Sync with DB asynchronously
  fetch(`/api/control/playlists/${encodeURIComponent(playlistId)}/tracks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trackId: track.id }),
  }).catch((err) => console.warn("Failed to sync add track to DB:", err));

  return updated;
}

/** Remove a track from a playlist in DB and cache. Returns the updated track list. */
export function removeTrackFromPlaylist(playlistId: string, trackId: string): Track[] {
  const existing = getPlaylistTracks(playlistId);
  const updated = existing.filter((t) => t.id !== trackId);
  persist(playlistId, updated);

  // Sync with DB asynchronously
  fetch(`/api/control/playlists/${encodeURIComponent(playlistId)}/tracks?trackId=${encodeURIComponent(trackId)}`, {
    method: "DELETE",
  }).catch((err) => console.warn("Failed to sync remove track from DB:", err));

  return updated;
}

/** Persist both storage keys */
function persist(playlistId: string, tracks: Track[]) {
  try {
    localStorage.setItem(TRACKS_KEY(playlistId), JSON.stringify(tracks));
    localStorage.setItem(IDS_KEY(playlistId), JSON.stringify(tracks.map((t) => t.id)));
  } catch {
    // ignore
  }
}

/**
 * Hook version — use inside React components for memoized callbacks.
 */
export function usePlaylistTrackManager() {
  const addTrack = useCallback(
    (playlistId: string, track: Track): Track[] => addTrackToPlaylist(playlistId, track),
    []
  );

  const removeTrack = useCallback(
    (playlistId: string, trackId: string): Track[] => removeTrackFromPlaylist(playlistId, trackId),
    []
  );

  const isInPlaylist = useCallback(
    (playlistId: string, trackId: string): boolean => isTrackInPlaylist(playlistId, trackId),
    []
  );

  return { addTrack, removeTrack, isInPlaylist };
}


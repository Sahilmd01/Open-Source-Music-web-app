"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { AddMusicModal } from "@/components/features/add-music-modal";
import { AddToPlaylistModal } from "@/components/features/add-to-playlist-modal";
import { SongsBanner, SongsControls, SongsTable } from "@/components/songs";
import { SongsPageSkeleton } from "@/components/skeletons";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";
import { useToast } from "@/providers/toast-provider";
import { uploadMediaToStorage } from "@/lib/storage-upload";
import type { Track } from "@/types/music";

const PAGE_SIZE = 30;

export default function SongsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null);

  const queue = usePlayerStore((s) => s.queue);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const currentTrackId = queue[currentIndex]?.id;
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playContextTrack = usePlayerStore((s) => s.playContextTrack);
  const togglePlay = usePlayerStore((s) => s.toggle);
  const likedIds = usePlayerStore((s) => s.likedIds);
  const toggleLike = usePlayerStore((s) => s.toggleLike);

  // Fetch real songs from database backend in batches of 30
  const fetchSongs = useCallback(async (isInitial = false, currentOffset = 0, query = searchFilter) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const q = query.trim();
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(currentOffset),
      });
      if (q) params.set("search", q);

      const res = await fetch(`/api/control/songs?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.songs)) {
        // Map database records to Track type
        const liveTracks: Track[] = data.songs.map((s: any) => ({
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

        setTracks((prev) => (isInitial ? liveTracks : [...prev, ...liveTracks]));
        setHasMore(data.hasMore ?? liveTracks.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Failed to fetch songs from database:", err);
    } finally {
      if (isInitial) setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchFilter]);

  // Initial fetch and search filter change (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSongs(true, 0, searchFilter);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchFilter, fetchSongs]);

  // Load next 30 songs
  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;
    fetchSongs(false, tracks.length, searchFilter);
  }, [isLoading, isLoadingMore, hasMore, tracks.length, searchFilter, fetchSongs]);

  // IntersectionObserver for songs bottom sentinel
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;

    const sentinel = document.getElementById("songs-bottom-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  const { isAuthenticated, openLoginModal } = useUiStore();
  const { toast } = useToast();

  const handleAddTrack = async (newTrack: Track) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const tempId = `temp-upload-${Date.now()}`;
    const optimisticTrack: Track = {
      ...newTrack,
      id: tempId,
      isUploading: true,
    };

    // Close modal immediately and show uploading track row in table
    setIsAddMusicOpen(false);
    setTracks((prev) => [optimisticTrack, ...prev]);

    try {
      // 1. If audio file or base64 audio is present, upload it directly via binary storage endpoint
      // This avoids Vercel's 4.5MB FUNCTION_PAYLOAD_TOO_LARGE limit on JSON API routes
      let finalAudioUrl = newTrack.audioUrl;
      const rawAudioSource = newTrack.audioFile || newTrack.audioSrc;
      if (rawAudioSource) {
        if (typeof rawAudioSource !== "string" || rawAudioSource.startsWith("data:")) {
          finalAudioUrl = await uploadMediaToStorage(
            rawAudioSource,
            newTrack.audioFile?.name || `${newTrack.title}.mp3`,
            'audio',
            newTrack.duration
          );
        } else {
          finalAudioUrl = rawAudioSource;
        }
      }

      // 2. Upload cover image if it's base64 or file
      let finalCoverUrl = newTrack.coverImage;
      const rawCoverSource = newTrack.coverImageFile || newTrack.coverImage;
      if (rawCoverSource && (typeof rawCoverSource !== "string" || rawCoverSource.startsWith("data:"))) {
        try {
          finalCoverUrl = await uploadMediaToStorage(
            rawCoverSource,
            newTrack.coverImageFile?.name || `${newTrack.title}-cover.jpg`
          );
        } catch (imgErr) {
          console.warn("Cover image upload failed, proceeding without cover:", imgErr);
        }
      }

      // 3. Send lightweight JSON metadata to control API (under 10KB, will never hit 4.5MB limit)
      const res = await fetch("/api/control/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTrack.title,
          artist: newTrack.artist,
          artistId: newTrack.artistId,
          album: newTrack.album,
          duration: newTrack.duration,
          coverImage: finalCoverUrl,
          hue: newTrack.hue,
          uploadedBy: newTrack.uploadedBy,
          audioUrl: finalAudioUrl,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) {
          openLoginModal();
        }
        const errorMsg = data.error || "Failed to upload song";
        const isDuplicate = res.status === 409 || errorMsg.toLowerCase().includes("already exists");
        toast({
          kind: isDuplicate ? "warning" : "error",
          title: isDuplicate ? "Duplicate Song" : "Upload Failed",
          description: errorMsg,
          duration: 4000,
        });
        setTracks((prev) => prev.filter((t) => t.id !== tempId));
        return;
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
          isUploading: false,
        };
        setTracks((prev) =>
          prev.map((t) => (t.id === tempId ? addedTrack : t))
        );
        toast({
          kind: "success",
          title: "Song Uploaded",
          description: `"${newTrack.title}" was added successfully.`,
        });
        return;
      }
    } catch (err: any) {
      console.error("Failed to add track to database:", err);
      toast({
        kind: "error",
        title: "Upload Failed",
        description: err?.message || "Something went wrong while uploading the song.",
        duration: 4000,
      });
      // Remove failed optimistic track
      setTracks((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  // Filter tracks
  const filteredTracks = useMemo(() => {
    let list = tracks;
    if (activeTab === "favorites") {
      list = list.filter((t) => likedIds.includes(t.id));
    }

    if (!searchFilter.trim()) return list;
    const q = searchFilter.toLowerCase();
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        (t.uploadedBy && t.uploadedBy.toLowerCase().includes(q))
    );
  }, [tracks, activeTab, searchFilter, likedIds]);

  const isSongsPlaying = isPlaying && filteredTracks.some((t) => t.id === currentTrackId);

  const handlePlayAll = () => {
    if (isSongsPlaying) {
      togglePlay();
    } else {
      const first = filteredTracks[0];
      if (first) {
        playContextTrack(first, filteredTracks);
      }
    }
  };

  const totalDurationSeconds = useMemo(() => {
    return filteredTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  }, [filteredTracks]);

  const durationFormatted = useMemo(() => {
    const mins = Math.floor(totalDurationSeconds / 60);
    const secs = totalDurationSeconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hrs} hr ${remainingMins} min`;
    }
    return `${mins} min ${secs} sec`;
  }, [totalDurationSeconds]);

  if (isLoading) {
    return <SongsPageSkeleton />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Top Banner Header */}
      <SongsBanner
        activeTab={activeTab}
        songCount={filteredTracks.length}
        durationFormatted={durationFormatted}
      />

      {/* Action Controls (Play, Add Song, Tabs, Search) */}
      <SongsControls
        isPlaying={isSongsPlaying}
        onPlayAll={handlePlayAll}
        onAddSong={() => {
          if (!isAuthenticated) {
            openLoginModal();
            return;
          }
          setIsAddMusicOpen(true);
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchFilter={searchFilter}
        onSearchChange={setSearchFilter}
      />

      {/* Tracklist Table */}
      <SongsTable
        tracks={filteredTracks}
        searchFilter={searchFilter}
        activeTab={activeTab}
        currentTrackId={currentTrackId}
        isPlaying={isPlaying}
        likedIds={likedIds}
        onPlayTrack={(track) => playContextTrack(track, filteredTracks)}
        onToggleLike={toggleLike}
        onAddToPlaylist={(track) => setTrackToAddToPlaylist(track)}
      />

      {/* Infinite Scroll Bottom Sentinel */}
      <div
        id="songs-bottom-sentinel"
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "var(--space-2)",
        }}
      >
        {isLoadingMore && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: "var(--text-muted)",
              fontSize: "var(--fs-sm)",
            }}
          >
            <div
              className="loading-spinner"
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "2px solid var(--border-subtle)",
                borderTopColor: "var(--brand)",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span>Loading more songs...</span>
          </div>
        )}
      </div>

      {/* Add Song to Library Modal */}
      <AddMusicModal
        open={isAddMusicOpen}
        containerTitle="Music Library"
        onClose={() => setIsAddMusicOpen(false)}
        onAddTrack={handleAddTrack}
      />

      {/* Add Song to Playlist Picker Modal */}
      <AddToPlaylistModal
        open={Boolean(trackToAddToPlaylist)}
        track={trackToAddToPlaylist}
        onClose={() => setTrackToAddToPlaylist(null)}
      />
    </div>
  );
}

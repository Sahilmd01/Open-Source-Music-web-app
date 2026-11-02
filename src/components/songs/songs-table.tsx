"use client";

import { useState } from "react";
import { ClockIcon } from "@/components/icons";
import { SongRowItem } from "./song-row-item";
import { ReportSongModal } from "./report-song-modal";
import { CopyrightReportModal } from "./copyright-report-modal";
import { usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";
import { AddToPlaylistModal } from "@/components/features/add-to-playlist-modal";
import { AddToAlbumModal } from "@/components/features/add-to-album-modal";
import type { Track } from "@/types/music";

interface SongsTableProps {
  tracks: Track[];
  searchFilter?: string;
  activeTab?: "all" | "favorites";
  currentTrackId?: string;
  isPlaying?: boolean;
  likedIds?: string[];
  onPlayTrack?: (track: Track) => void;
  onToggleLike?: (id: string) => void;
  onAddToPlaylist?: (track: Track) => void;
  onAddToAlbum?: (track: Track) => void;
  showHeader?: boolean;
  label?: string;
  emptyMessage?: string;
  showLikesCount?: boolean;
}

export function SongsTable({
  tracks,
  searchFilter = "",
  activeTab = "all",
  currentTrackId: propTrackId,
  isPlaying: propIsPlaying,
  likedIds: propLikedIds,
  onPlayTrack,
  onToggleLike,
  onAddToPlaylist,
  onAddToAlbum,
  showHeader = true,
  label = "Songs list",
  emptyMessage,
  showLikesCount = false,
}: SongsTableProps) {
  const { isAuthenticated, openLoginModal } = useUiStore();
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const [albumModalTrack, setAlbumModalTrack] = useState<Track | null>(null);
  const [reportTrack, setReportTrack] = useState<Track | null>(null);
  const [reportReason, setReportReason] = useState<string | undefined>(undefined);
  const [copyrightTrack, setCopyrightTrack] = useState<Track | null>(null);

  // Store fallbacks when not explicitly passed
  const storeQueue = usePlayerStore((s) => s.queue);
  const storeIndex = usePlayerStore((s) => s.currentIndex);
  const storeTrackId = storeQueue[storeIndex]?.id;
  const storeIsPlaying = usePlayerStore((s) => s.isPlaying);
  const storeIsBuffering = usePlayerStore((s) => s.isBuffering);
  const storeLikedIds = usePlayerStore((s) => s.likedIds);
  const storePlayTrack = usePlayerStore((s) => s.playTrack);
  const storePlayContextTrack = usePlayerStore((s) => s.playContextTrack);
  const storeToggleLike = usePlayerStore((s) => s.toggleLike);

  const activeTrackId = propTrackId !== undefined ? propTrackId : storeTrackId;
  const activeIsPlaying = propIsPlaying !== undefined ? propIsPlaying : storeIsPlaying;
  const activeIsBuffering = storeIsBuffering;
  const activeLikedIds = propLikedIds !== undefined ? propLikedIds : storeLikedIds;
  const handlePlay = (t: Track) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (onPlayTrack) {
      onPlayTrack(t);
    } else {
      storePlayContextTrack(t, tracks);
    }
  };
  const handleLike = onToggleLike || storeToggleLike;
  const handleAdd = (t: Track) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (onAddToPlaylist) {
      onAddToPlaylist(t);
    } else {
      setModalTrack(t);
    }
  };

  const handleAddAlbum = (t: Track) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (onAddToAlbum) {
      onAddToAlbum(t);
    } else {
      setAlbumModalTrack(t);
    }
  };

  return (
    <>
      <section aria-label={label}>
        {/* Table Column Headers */}
        {showHeader && (
          <div
            className="song-table-header"
            style={{
              display: "grid",
              gridTemplateColumns: "36px 40px 1.4fr 1fr 1fr 1fr 36px 36px 50px 32px",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "8px 12px",
              fontSize: "var(--fs-xs)",
              fontWeight: "var(--fw-semibold)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <span data-col="index">#</span>
            <span data-col="cover"></span>
            <span data-col="title">Title</span>
            <span data-col="artist">Artist</span>
            <span data-col="album">Album</span>
            <span data-col="uploader">Uploaded By</span>
            <span data-col="add"></span>
            <span data-col="like"></span>
            <span data-col="duration" style={{ display: "flex", justifyContent: "flex-end" }}>
              <ClockIcon width={15} height={15} />
            </span>
            <span data-col="more"></span>
          </div>
        )}

        {/* Tracks List */}
        {tracks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-8) 0" }}>
            <p className="text-muted" style={{ fontSize: "var(--fs-sm)" }}>
              {searchFilter
                ? `No songs found matching "${searchFilter}"`
                : emptyMessage
                ? emptyMessage
                : activeTab === "favorites"
                ? "No favorite songs added yet."
                : "No songs available."}
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "2px" }}>
            {tracks.map((track, i) => (
              <SongRowItem
                key={track.id}
                track={track}
                index={i}
                isCurrent={activeTrackId === track.id}
                isPlaying={activeIsPlaying}
                isBuffering={activeTrackId === track.id && activeIsBuffering}
                isHovered={hoveredRowId === track.id}
                isLiked={activeLikedIds.includes(track.id)}
                onHover={setHoveredRowId}
                onPlay={handlePlay}
                onToggleLike={handleLike}
                onAddToPlaylist={handleAdd}
                onAddToAlbum={handleAddAlbum}
                showLikesCount={showLikesCount}
                onReport={(t, reason) => {
                  if (reason === "Copyright / IP infringement") {
                    setCopyrightTrack(t);
                  } else {
                    setReportTrack(t);
                    setReportReason(reason);
                  }
                }}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Standalone Add To Playlist Modal when no parent handler provided */}
      {!onAddToPlaylist && (
        <AddToPlaylistModal
          open={Boolean(modalTrack)}
          track={modalTrack}
          onClose={() => setModalTrack(null)}
        />
      )}

      {/* Standalone Add To Album Modal */}
      <AddToAlbumModal
        open={Boolean(albumModalTrack)}
        track={albumModalTrack}
        onClose={() => setAlbumModalTrack(null)}
      />

      {/* Report Song Modal */}
      <ReportSongModal
        track={reportTrack}
        isOpen={Boolean(reportTrack)}
        initialReason={reportReason}
        onClose={() => {
          setReportTrack(null);
          setReportReason(undefined);
        }}
        onSwitchToCopyright={() => {
          if (reportTrack) {
            const current = reportTrack;
            setReportTrack(null);
            setReportReason(undefined);
            setCopyrightTrack(current);
          }
        }}
      />

      {/* Copyright Infringement Report Modal */}
      <CopyrightReportModal
        track={copyrightTrack}
        isOpen={Boolean(copyrightTrack)}
        onClose={() => setCopyrightTrack(null)}
      />
    </>
  );
}

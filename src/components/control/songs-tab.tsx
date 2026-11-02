"use client";

import { useState, useMemo, useEffect } from "react";
import { PlayIcon, PauseIcon, ClockIcon, PlaylistAddIcon, PlusIcon, SpinnerIcon, UploadCloudIcon, CameraIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { CoverArt } from "@/components/ui/cover-art";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { formatTime } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";
import { AddToPlaylistModal } from "@/components/features/add-to-playlist-modal";
import type { SongItem } from "./control-types";
import type { Track } from "@/types/music";

const SONGS_PER_PAGE = 25;

interface SongsTabProps {
  songs: SongItem[];
  searchQuery: string;
  onToggleSong: (id: string) => void;
  onOpenAddSong?: () => void;
  onEditMedia?: (song: SongItem) => void;
  isLoading?: boolean;
}

export function SongsTab({
  songs,
  searchQuery,
  onToggleSong,
  onOpenAddSong,
  onEditMedia,
  isLoading = false,
}: SongsTabProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<Track | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.toggle);
  const currentTrackId = queue[currentIndex]?.id;

  // Filter songs based on search query
  const filtered = useMemo(
    () =>
      songs.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.album.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [songs, searchQuery]
  );

  // Calculate pagination
  const totalPages = Math.ceil(filtered.length / SONGS_PER_PAGE);
  const startIndex = (currentPage - 1) * SONGS_PER_PAGE;
  const endIndex = startIndex + SONGS_PER_PAGE;
  const paginatedSongs = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  const handleSearchChange = () => {
    setCurrentPage(1);
  };

  // Handle pagination
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    // Scroll to top of table
    const tableElement = document.querySelector('[data-songs-table]');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toTrackObject = (song: SongItem): Track => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    duration: song.duration,
    hue: song.hue || 24,
    coverImage: song.coverImage,
    uploadedBy: song.uploadedBy,
  });

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePlaySong = (song: SongItem) => {
    if (song.id === currentTrackId) {
      togglePlay();
      return;
    }
    playTrack(song.id, toTrackObject(song));
  };

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      {/* Header controls count */}
      <div
        style={{
          background: "var(--bg-surface-2)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4) var(--space-5)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-semibold)", margin: 0, color: "var(--text-primary)" }}>
            Song Library Control
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
            Manage catalog audio, preview real artwork, add tracks to playlists, and toggle active/inactive status.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
            Showing {filtered.length} of {songs.length} audio tracks
          </span>

          {onOpenAddSong && (
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<PlusIcon width={14} height={14} />}
              onClick={onOpenAddSong}
              title="Add a new song to catalog"
            >
              Add Song
            </Button>
          )}
        </div>
      </div>

      {/* Styled Songs Table Reusing Platform Grid & CoverArt (Mobile Responsive) */}
      <div
        data-songs-table
        style={{
          background: "var(--bg-surface-2)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ minWidth: 680 }}>
          {/* Table Column Header */}
          <div
            className="song-table-header"
            style={{
              display: "grid",
              gridTemplateColumns: "36px 42px 1.4fr 1fr 1fr 85px 40px 65px 110px",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "10px 16px",
              fontSize: "var(--fs-xs)",
              fontWeight: "var(--fw-semibold)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              borderBottom: "1px solid var(--border-subtle)",
              background: "rgba(255, 255, 255, 0.02)",
            }}
          >
          <span>#</span>
          <span>Cover</span>
          <span>Title</span>
          <span>Artist</span>
          <span>Album</span>
          <span>Streams</span>
          <span style={{ textAlign: "center" }} title="Add to Playlist">Add</span>
          <span style={{ display: "flex", justifyContent: "flex-end" }}>
            <ClockIcon width={14} height={14} />
          </span>
          <span style={{ textAlign: "right" }}>Moderation</span>
        </div>

        {/* Track Rows */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "var(--space-8) 0" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-sm)" }}>Loading catalog from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-8) 0" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-sm)" }}>
              {searchQuery ? "No tracks matching your search." : "No songs found in the database yet."}
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {paginatedSongs.map((song, idx) => {
              const isCurrent = song.id === currentTrackId;
              const isCurrentPlaying = isCurrent && isPlaying;
              const isHovered = hoveredId === song.id;

              return (
                <li
                  key={song.id}
                  onMouseEnter={() => setHoveredId(song.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 42px 1.4fr 1fr 1fr 85px 40px 65px 110px",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "8px 16px",
                    borderBottom: idx === paginatedSongs.length - 1 ? "none" : "1px solid var(--border-subtle)",
                    background: isCurrent
                      ? "rgba(255, 255, 255, 0.08)"
                      : isHovered
                      ? "var(--bg-surface-3, rgba(255, 255, 255, 0.04))"
                      : "transparent",
                    opacity: song.status === "inactive" ? 0.6 : 1,
                    transition: "background var(--dur-fast)",
                  }}
                >
                  {/* Number / Play Button / Uploading Spinner */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "var(--fs-xs)",
                      color: song.isUploading ? "var(--brand)" : isCurrent ? "var(--brand)" : "var(--text-muted)",
                      fontWeight: isCurrent ? "var(--fw-bold)" : "normal",
                      cursor: song.isUploading ? "default" : "pointer",
                    }}
                    onClick={() => !song.isUploading && handlePlaySong(song)}
                  >
                    {song.isUploading ? (
                      <span title="Uploading song to cloud..." style={{ color: "var(--brand)", display: "flex", alignItems: "center" }}>
                        <SpinnerIcon width={16} height={16} />
                      </span>
                    ) : isHovered || isCurrent ? (
                      <span
                        title={isCurrentPlaying ? "Pause" : "Play"}
                        style={{
                          color: isCurrent ? "var(--brand)" : "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {isCurrentPlaying ? (
                          <PauseIcon width={14} height={14} />
                        ) : (
                          <PlayIcon width={14} height={14} />
                        )}
                      </span>
                    ) : (
                      startIndex + idx + 1
                    )}
                  </div>

                  {/* Album Cover Art with Edit Overlay */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      flexShrink: 0,
                      background: "var(--bg-surface-3)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                      cursor: song.isUploading ? "default" : "pointer",
                      position: "relative",
                    }}
                    title={onEditMedia ? "Click to change cover image" : undefined}
                    onClick={(e) => {
                      if (song.isUploading) return;
                      if (onEditMedia) {
                        e.stopPropagation();
                        onEditMedia(song);
                      } else {
                        handlePlaySong(song);
                      }
                    }}
                  >
                    {song.coverImage ? (
                      <img
                        src={song.coverImage}
                        alt={song.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <CoverArt
                        hue={song.hue || ((idx * 47) % 360) + 1}
                        size={40}
                        style={{ width: "100%", height: "100%" }}
                      />
                    )}
                    {/* Hover Camera Overlay for changing cover */}
                    {!song.isUploading && isHovered && onEditMedia && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          transition: "opacity 0.15s ease",
                        }}
                        title="Change cover artwork"
                      >
                        <CameraIcon width={16} height={16} />
                      </div>
                    )}
                    {song.isUploading && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.55)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                        }}
                      >
                        <UploadCloudIcon width={18} height={18} style={{ animation: "pulse 1.5s infinite" }} />
                      </div>
                    )}
                  </div>

                  {/* Title & Reports Badge */}
                  <div style={{ minWidth: 0, display: "grid", gap: "2px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          fontSize: "var(--fs-sm)",
                          fontWeight: "var(--fw-medium)",
                          color: isCurrent ? "var(--brand)" : "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: song.isUploading ? "default" : "pointer",
                        }}
                        onClick={() => !song.isUploading && handlePlaySong(song)}
                      >
                        {song.title}
                      </span>
                      {song.isUploading && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "var(--fw-semibold)",
                            padding: "1px 6px",
                            borderRadius: "var(--radius-pill)",
                            background: "rgba(255, 124, 59, 0.15)",
                            color: "var(--brand)",
                            border: "1px solid rgba(255, 124, 59, 0.3)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <SpinnerIcon width={10} height={10} />
                          Uploading...
                        </span>
                      )}
                    </div>
                    {song.reportsCount > 0 ? (
                      <span style={{ fontSize: "10px", color: "#ef4444", fontWeight: "bold" }}>
                        {song.reportsCount} open reports
                      </span>
                    ) : (
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                        {song.uploadedBy || "Official"}
                      </span>
                    )}
                  </div>

                  {/* Artist */}
                  <div
                    style={{
                      fontSize: "var(--fs-sm)",
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {song.artist}
                  </div>

                  {/* Album */}
                  <div
                    style={{
                      fontSize: "var(--fs-sm)",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {song.album}
                  </div>

                  {/* Streams */}
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
                    {song.plays.toLocaleString()}
                  </div>

                  {/* Add to Playlist Action */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <IconButton
                      label="Add to playlist"
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrackForPlaylist(toTrackObject(song));
                      }}
                      style={{
                        color: "var(--text-secondary)",
                        opacity: isHovered ? 1 : 0.6,
                        transition: "opacity 0.15s ease, transform 0.15s ease",
                      }}
                    >
                      <PlaylistAddIcon width={17} height={17} />
                    </IconButton>
                  </div>

                  {/* Duration */}
                  <div
                    style={{
                      fontSize: "var(--fs-xs)",
                      color: "var(--text-muted)",
                      textAlign: "right",
                    }}
                  >
                    {formatTime(song.duration)}
                  </div>

                  {/* Toggle Status Button */}
                  <div style={{ textAlign: "right" }}>
                    <Button
                      variant={song.status === "active" ? "danger" : "primary"}
                      size="sm"
                      style={{ minWidth: 92, height: 30, fontSize: "11px", fontWeight: "var(--fw-medium)" }}
                      onClick={() => onToggleSong(song.id)}
                    >
                      {song.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Pagination Controls */}
        {!isLoading && filtered.length > SONGS_PER_PAGE && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "var(--space-4)",
              padding: "var(--space-4) 16px",
              borderTop: "1px solid var(--border-subtle)",
              background: "rgba(255, 255, 255, 0.02)",
            }}
          >
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
              Page {currentPage} of {totalPages} • Showing {startIndex + 1}–{Math.min(endIndex, filtered.length)} of {filtered.length}
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
              <IconButton
                label="Previous page"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
                style={{
                  opacity: currentPage <= 1 ? 0.5 : 1,
                  cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                }}
              >
                <ChevronLeftIcon width={16} height={16} />
              </IconButton>

              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  const isCurrentPageBtn = page === currentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid",
                        borderColor: isCurrentPageBtn ? "var(--brand)" : "var(--border-subtle)",
                        background: isCurrentPageBtn ? "var(--brand)" : "transparent",
                        color: isCurrentPageBtn ? "#ffffff" : "var(--text-secondary)",
                        fontSize: "var(--fs-xs)",
                        fontWeight: "var(--fw-medium)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      title={`Go to page ${page}`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <IconButton
                label="Next page"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
                style={{
                  opacity: currentPage >= totalPages ? 0.5 : 1,
                  cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                }}
              >
                <ChevronRightIcon width={16} height={16} />
              </IconButton>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Add To Playlist Modal Component */}
      <AddToPlaylistModal
        open={Boolean(selectedTrackForPlaylist)}
        track={selectedTrackForPlaylist}
        onClose={() => setSelectedTrackForPlaylist(null)}
      />
    </div>
  );
}

"use client";

import { IconButton } from "@/components/ui/icon-button";
import { CoverArt } from "@/components/ui/cover-art";
import { PlayIcon, PauseIcon, HeartIcon, HeartFilledIcon, PlaylistAddIcon, SpinnerIcon, UploadCloudIcon } from "@/components/icons";
import { formatTime } from "@/lib/format";
import { SongActionsMenu } from "./song-actions-menu";
import type { Track } from "@/types/music";

interface SongRowItemProps {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  isBuffering?: boolean;
  isHovered: boolean;
  isLiked: boolean;
  onHover: (id: string | null) => void;
  onPlay: (track: Track) => void;
  onToggleLike: (id: string) => void;
  onAddToPlaylist?: (track: Track) => void;
  onAddToAlbum?: (track: Track) => void;
  onReport?: (track: Track, reason?: string) => void;
  showLikesCount?: boolean;
}

export function SongRowItem({
  track,
  index,
  isCurrent,
  isPlaying,
  isBuffering,
  isHovered,
  isLiked,
  onHover,
  onPlay,
  onToggleLike,
  onAddToPlaylist,
  onAddToAlbum,
  onReport,
  showLikesCount = false,
}: SongRowItemProps) {
  const isCurrentPlaying = isCurrent && isPlaying;
  const isUploading = !!track.isUploading;

  return (
    <li
      className="song-table-row"
      onMouseEnter={() => !isUploading && onHover(track.id)}
      onMouseLeave={() => !isUploading && onHover(null)}
      onClick={() => {
        if (!isUploading) onPlay(track);
      }}
      style={{
        display: "grid",
        gridTemplateColumns: "36px 40px 1.4fr 1fr 1fr 1fr 36px 36px 50px 32px",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "8px 12px",
        borderRadius: "var(--radius-sm)",
        background: isUploading
          ? "rgba(227, 245, 96, 0.05)"
          : isCurrent
          ? "rgba(255, 255, 255, 0.08)"
          : isHovered
          ? "var(--bg-surface-2)"
          : "transparent",
        opacity: isUploading ? 0.85 : 1,
        transition: "background var(--dur-fast), opacity var(--dur-fast)",
        cursor: isUploading ? "wait" : "pointer",
        position: "relative",
      }}
    >
      {/* Number or Hover Play Button or Uploading Spinner */}
      <div
        className="col-index"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          fontSize: "var(--fs-xs)",
          color: isUploading ? "var(--brand)" : isCurrent ? "var(--brand)" : "var(--text-muted)",
          fontWeight: isCurrent ? "var(--fw-bold)" : "normal",
          width: 20,
        }}
      >
        {isUploading ? (
          <span title="Uploading..." style={{ color: "var(--brand)", display: "flex", alignItems: "center" }}>
            <SpinnerIcon width={16} height={16} />
          </span>
        ) : isCurrent && isBuffering ? (
          <span title="Loading audio..." style={{ color: "var(--brand)", display: "flex", alignItems: "center" }}>
            <SpinnerIcon width={14} height={14} />
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
          index + 1
        )}
      </div>

      {/* Small Album Artwork */}
      <div
        className="col-cover"
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          flexShrink: 0,
          background: "var(--bg-surface-3)",
          position: "relative",
        }}
      >
        {track.coverImage ? (
          <img
            src={track.coverImage}
            alt={track.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              // Hide broken image and fall back to visual background
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <CoverArt
            hue={((index * 47) % 360) + 1}
            size={40}
            style={{ width: "100%", height: "100%" }}
          />
        )}
        {isUploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--brand)",
            }}
          >
            <UploadCloudIcon width={18} height={18} />
          </div>
        )}
      </div>

      {/* Title + Badges */}
      <div className="col-title" style={{ minWidth: 0, display: "grid", gap: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span
            style={{
              fontSize: "var(--fs-sm)",
              fontWeight: "var(--fw-medium)",
              color: isUploading ? "var(--text-primary)" : isCurrent ? "var(--brand)" : "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {track.title}
          </span>
          {isUploading && (
            <span
              style={{
                fontSize: "0.65rem",
                padding: "1px 6px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(227, 245, 96, 0.2)",
                color: "var(--brand)",
                border: "1px solid rgba(227, 245, 96, 0.4)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                flexShrink: 0,
              }}
            >
              <SpinnerIcon width={10} height={10} />
              Uploading...
            </span>
          )}
        </div>
        <span
          className="col-title__mobile-artist"
          style={{
            fontSize: "var(--fs-xs)",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {track.artist}
        </span>
        {track.isCustom && (
          <span
            style={{
              fontSize: "0.65rem",
              padding: "1px 6px",
              borderRadius: "var(--radius-pill)",
              background: "rgba(227, 245, 96, 0.15)",
              color: "var(--brand)",
              width: "fit-content",
            }}
          >
            Custom
          </span>
        )}
      </div>

      {/* Artist */}
      <span
        className="col-artist"
        style={{
          fontSize: "var(--fs-xs)",
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {track.artist}
      </span>

      {/* Album + Release Date */}
      <div className="col-album" style={{ minWidth: 0, display: "grid", gap: "1px" }}>
        <span
          style={{
            fontSize: "var(--fs-xs)",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {track.album}
        </span>
        {track.releaseDate && (
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: "var(--fw-medium)",
              color: "var(--info-text)",
              background: "var(--info-soft)",
              border: "1px solid var(--info-border)",
              padding: "1px 6px",
              borderRadius: "var(--radius-pill)",
              width: "fit-content",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {track.releaseDate}
          </span>
        )}
      </div>

      {/* Uploaded By */}
      <span
        className="col-uploader"
        style={{
          fontSize: "var(--fs-xs)",
          color: track.uploadedBy ? "var(--brand)" : "var(--text-muted)",
          fontWeight: track.uploadedBy ? "var(--fw-medium)" : "normal",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {track.uploadedBy || "Curator"}
      </span>

      {/* Add to Playlist Button */}
      <div
        className="col-add"
        style={{ display: "flex", justifyContent: "center" }}
        onClick={(e) => {
          e.stopPropagation();
          if (onAddToPlaylist) onAddToPlaylist(track);
        }}
      >
        <IconButton
          label={`Add ${track.title} to playlist`}
          title="Add to playlist"
          style={{
            width: 32,
            height: 32,
            opacity: 1,
            color: isHovered ? "var(--text-primary)" : "var(--text-muted)",
            transition: "color 0.15s ease",
          }}
        >
          <PlaylistAddIcon width={18} height={18} />
        </IconButton>
      </div>

      {/* Favorite Button & Count */}
      <div
        className="col-like"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleLike(track.id);
        }}
      >
        <IconButton
          label={isLiked ? "Remove from favorites" : "Add to favorites"}
          title={isLiked ? "Remove from favorites" : "Add to favorites"}
          style={{
            width: 32,
            height: 32,
            opacity: isLiked || isHovered || showLikesCount ? 1 : 0,
            transition: "opacity 0.15s ease",
          }}
        >
          {isLiked ? (
            <HeartFilledIcon width={16} height={16} style={{ color: "var(--brand)" }} />
          ) : (
            <HeartIcon width={16} height={16} />
          )}
        </IconButton>
        {showLikesCount && (
          <span
            style={{
              fontSize: "var(--fs-xs)",
              color: isLiked ? "var(--brand)" : "var(--text-muted)",
              fontVariantNumeric: "tabular-nums",
              minWidth: 16,
              fontWeight: isLiked ? "var(--fw-medium)" : "normal",
            }}
          >
            {Math.max(0, (track.likesCount || 0) + (isLiked && !track.likesCount ? 1 : 0))}
          </span>
        )}
      </div>

      {/* Duration */}
      <span
        className="col-duration"
        style={{
          fontSize: "var(--fs-xs)",
          color: "var(--text-muted)",
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatTime(track.duration)}
      </span>

      {/* 3-Dot More Menu Component */}
      <SongActionsMenu
        track={track}
        isHovered={isHovered}
        onAddToPlaylist={onAddToPlaylist}
        onAddToAlbum={onAddToAlbum}
        onReport={onReport}
      />
    </li>
  );
}

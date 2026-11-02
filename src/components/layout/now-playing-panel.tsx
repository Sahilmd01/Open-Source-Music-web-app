"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CoverArt } from "@/components/ui/cover-art";
import { EqualizerIcon, QueueIcon, PlaylistAddIcon, MusicNoteIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { AddToPlaylistModal } from "@/components/features/add-to-playlist-modal";
import { formatTime } from "@/lib/format";
import { selectCurrentTrack, usePlayerStore } from "@/stores/player-store";
import { useUiStore } from "@/stores/ui-store";
import type { Track } from "@/types/music";

export function NowPlayingPanel() {
  const pathname = usePathname();
  const { isAuthenticated, openLoginModal } = useUiStore();
  const track = usePlayerStore(selectCurrentTrack);
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playContextTrack = usePlayerStore((s) => s.playContextTrack);
  const selectedContext = usePlayerStore((s) => s.selectedContext);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null);

  const handleOpenAddToPlaylist = (t: Track) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setTrackToAddToPlaylist(t);
  };

  // Do not show the right Now Playing panel on the All Control page
  if (pathname === "/control" || pathname?.startsWith("/control/")) {
    return null;
  }

  // If a context (album, playlist, artist) is selected, show its header and track list
  if (selectedContext) {
    const contextTracks = selectedContext.tracks || [];
    const isArtist = selectedContext.type === "artist";

    return (
      <aside className="now-playing" aria-label={selectedContext.title} suppressHydrationWarning>
        <div className="now-playing__head" suppressHydrationWarning>
          <EqualizerIcon />{" "}
          <span style={{ textTransform: "capitalize" }}>
            {selectedContext.type === "playlist"
              ? "Playlist"
              : selectedContext.type === "album"
              ? "Album"
              : "Artist"}
          </span>
        </div>

        {/* Selected Context Avatar / Cover */}
        <div
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: isArtist ? "50%" : "var(--radius-lg)",
            overflow: "hidden",
            background: "var(--bg-surface-3)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
            border: isArtist ? "3px solid var(--accent)" : "none",
            flexShrink: 0,
          }}
        >
          {selectedContext.image ? (
            <img
              src={selectedContext.image}
              alt={selectedContext.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <CoverArt
              hue={selectedContext.hue || 200}
              initials={selectedContext.title}
              rounded={isArtist ? "full" : "md"}
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </div>

        {/* Context Title & Subtitle */}
        <div className="now-playing__meta" suppressHydrationWarning>
          <div suppressHydrationWarning style={{ minWidth: 0, overflow: "hidden" }}>
            <div
              className="now-playing__title"
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              suppressHydrationWarning
            >
              {selectedContext.title}
            </div>
            {selectedContext.subtitle && (
              <div
                className="text-muted text-small"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                suppressHydrationWarning
              >
                {selectedContext.subtitle}
              </div>
            )}
          </div>
          <IconButton label="Queue">
            <QueueIcon />
          </IconButton>
        </div>

        <hr />

        {/* Songs List Below - Scrollable independently while image & header stay fixed */}
        <ul className="now-playing__queue">
          {contextTracks.map((t) => {
            const isThisTrackPlaying = isPlaying && track?.id === t.id;
            return (
              <li
                key={t.id}
                className="queue-item"
                style={{
                  background: track?.id === t.id ? "var(--accent-soft)" : "transparent",
                  borderRadius: "var(--radius-sm)",
                  padding: "6px 8px",
                  transition: "background var(--dur-fast)",
                }}
              >
                <CoverArt hue={t.hue} src={t.coverImage} size={40} className="track__cover" />
                <button
                  type="button"
                  className="queue-item__main"
                  onClick={() => playContextTrack(t, contextTracks)}
                  style={{ textAlign: "left", cursor: "pointer" }}
                >
                  <span
                    style={{
                      color: isThisTrackPlaying ? "var(--brand)" : "inherit",
                      fontWeight: isThisTrackPlaying ? "var(--fw-semibold)" : "normal",
                    }}
                  >
                    {t.title}
                  </span>
                  <span className="text-muted text-small">{t.artist}</span>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <IconButton
                    label={`Add ${t.title} to playlist`}
                    title="Add to playlist"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAddToPlaylist(t);
                    }}
                    style={{ width: 28, height: 28 }}
                  >
                    <PlaylistAddIcon width={15} height={15} />
                  </IconButton>
                  <span className="track__time">{formatTime(t.duration)}</span>
                </div>
              </li>
            );
          })}
        </ul>

        <AddToPlaylistModal
          open={Boolean(trackToAddToPlaylist)}
          track={trackToAddToPlaylist}
          onClose={() => setTrackToAddToPlaylist(null)}
        />
      </aside>
    );
  }

  // Fallback: standard Now Playing track & Up Next queue
  if (!track) {
    return (
      <aside className="now-playing" aria-label="Now playing" suppressHydrationWarning>
        <div className="now-playing__head" suppressHydrationWarning>
          <EqualizerIcon /> <span>Now Playing</span>
        </div>
        <div
          style={{
            flex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "var(--space-6) var(--space-4)",
            border: "1px dashed var(--border-default)",
            borderRadius: "var(--radius-lg)",
            background: "var(--bg-surface-2)",
            gap: "var(--space-3)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--bg-surface-3)",
              display: "grid",
              placeItems: "center",
              color: "var(--text-muted)",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
            }}
          >
            <MusicNoteIcon width={28} height={28} />
          </div>
          <div>
            <div style={{ fontWeight: "var(--fw-medium)", fontSize: "var(--fs-sm)", color: "var(--text-primary)" }}>
              No track playing
            </div>
            <p
              className="text-muted text-small"
              style={{ margin: "var(--space-1) 0 0", maxWidth: "200px", lineHeight: 1.4 }}
            >
              Select a song, album, or playlist to start listening
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const upNext = Array.from(
    { length: 4 },
    (_, i) => queue[(currentIndex + 1 + i) % queue.length]
  ).filter((t): t is NonNullable<typeof t> => Boolean(t))
   .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i); // deduplicate

  return (
    <aside className="now-playing" aria-label="Now playing" suppressHydrationWarning>
      <div className="now-playing__head" suppressHydrationWarning>
        <EqualizerIcon /> <span>Now Playing</span>
      </div>
      <CoverArt hue={track.hue} src={track.coverImage} className="now-playing__cover" />
      <div className="now-playing__meta" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <div className="now-playing__title" suppressHydrationWarning>
            {track.title}
          </div>
          <div className="text-muted text-small" suppressHydrationWarning>
            {track.artist}
          </div>
        </div>
        <IconButton label="Open queue">
          <QueueIcon />
        </IconButton>
      </div>
      <hr />
      <ul className="now-playing__queue">
        {upNext.map((t, i) => (
          <li key={`${t.id}-${i}`} className="queue-item">
            <CoverArt hue={t.hue} src={t.coverImage} size={44} className="track__cover" />
            <button type="button" className="queue-item__main" onClick={() => playTrack(t.id)}>
              <span>{t.title}</span>
              <span className="text-muted text-small">{t.artist}</span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <IconButton
                label={`Add ${t.title} to playlist`}
                title="Add to playlist"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAddToPlaylist(t);
                }}
                style={{ width: 28, height: 28 }}
              >
                <PlaylistAddIcon width={15} height={15} />
              </IconButton>
              <span className="track__time">{formatTime(t.duration)}</span>
            </div>
          </li>
        ))}
      </ul>

      <AddToPlaylistModal
        open={Boolean(trackToAddToPlaylist)}
        track={trackToAddToPlaylist}
        onClose={() => setTrackToAddToPlaylist(null)}
      />
    </aside>
  );
}

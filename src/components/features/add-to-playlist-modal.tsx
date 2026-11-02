"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloseIcon, PlusIcon, CheckIcon, SearchIcon } from "@/components/icons";
import { CoverArt } from "@/components/ui/cover-art";
import { CreatePlaylistModal } from "@/app/(app)/playlists/create-playlist-modal";
import { useUiStore } from "@/stores/ui-store";
import {
  usePlaylistTrackManager,
  isTrackInPlaylist,
  getPlaylistSongCount,
} from "@/hooks/use-playlist-track-manager";
import type { Playlist, Track } from "@/types/music";

interface AddToPlaylistModalProps {
  open: boolean;
  track: Track | null;
  onClose: () => void;
  onAdded?: (playlist: Playlist) => void;
  onRemoved?: (playlist: Playlist) => void;
}

export function AddToPlaylistModal({
  open,
  track,
  onClose,
  onAdded,
  onRemoved,
}: AddToPlaylistModalProps) {
  const { isAuthenticated, openLoginModal, user } = useUiStore();
  const { addTrack, removeTrack } = usePlaylistTrackManager();

  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [addedPlaylistIds, setAddedPlaylistIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastKind, setToastKind] = useState<"add" | "remove">("add");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load playlists and detect which already contain this track
  const loadUserPlaylists = async () => {
    if (!track) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/control/playlists");
      const data = await res.json();
      let allPlaylists: Playlist[] = [];

      if (data.success && Array.isArray(data.playlists)) {
        allPlaylists = data.playlists.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description || "",
          logo: p.coverUrl,
          coverImage: p.bannerUrl,
          songCount: getPlaylistSongCount(p.id, p.songsCount || 0),
          isPublic: p.visibility === "public",
          isCustom: Boolean(p.ownerId),
          ownerId: p.ownerId,
          hue: p.hue || 280,
          likes: 0,
          durationLabel: "0 min",
        }));
      }

      // Role check: If role is "admin" or "moderator", show full playlists.
      // Otherwise, only show playlists created by the user.
      const canManageAll = user?.role === "admin" || user?.role === "moderator";
      let locallyCreatedIds: string[] = [];
      try {
        const stored = localStorage.getItem("my_created_playlist_ids_v1");
        if (stored) locallyCreatedIds = JSON.parse(stored);
      } catch {
        // ignore
      }

      const visiblePlaylists = canManageAll
        ? allPlaylists
        : allPlaylists.filter((pl) => {
            if (user?.id && pl.ownerId && pl.ownerId === user.id) return true;
            if (locallyCreatedIds.includes(pl.id)) return true;
            return false;
          });

      setUserPlaylists(visiblePlaylists);

      // Detect which playlists already contain this track
      const existing = visiblePlaylists
        .filter((pl) => isTrackInPlaylist(pl.id, track.id))
        .map((pl) => pl.id);
      setAddedPlaylistIds(existing);
    } catch (err) {
      console.error("Failed to load playlists:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && track) {
      setSearchQuery("");
      loadUserPlaylists();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, track]);

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  if (!open || !track) return null;

  const showToast = (msg: string, kind: "add" | "remove") => {
    setToastMessage(msg);
    setToastKind(kind);
  };

  const handleAddToPlaylist = (playlist: Playlist) => {
    if (!isAuthenticated) {
      onClose();
      openLoginModal();
      return;
    }
    const updated = addTrack(playlist.id, track);
    setUserPlaylists((prev) =>
      prev.map((p) => (p.id === playlist.id ? { ...p, songCount: updated.length } : p))
    );
    setAddedPlaylistIds((prev) => [...prev, playlist.id]);
    showToast(`Added to "${playlist.title}"`, "add");
    if (onAdded) onAdded(playlist);
  };

  const handleRemoveFromPlaylist = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onClose();
      openLoginModal();
      return;
    }
    const updated = removeTrack(playlist.id, track.id);
    setUserPlaylists((prev) =>
      prev.map((p) => (p.id === playlist.id ? { ...p, songCount: updated.length } : p))
    );
    setAddedPlaylistIds((prev) => prev.filter((id) => id !== playlist.id));
    showToast(`Removed from "${playlist.title}"`, "remove");
    if (onRemoved) onRemoved(playlist);
  };

  const handlePlaylistRowClick = (playlist: Playlist) => {
    if (!isAuthenticated) {
      onClose();
      openLoginModal();
      return;
    }
    if (!addedPlaylistIds.includes(playlist.id)) {
      handleAddToPlaylist(playlist);
    }
    // If already added, clicking the row does nothing — user must click ✕ to remove
  };

  const handleCreatedPlaylist = (newPl: Playlist) => {
    setUserPlaylists((prev) => [newPl, ...prev]);
    setIsCreateOpen(false);
    handleAddToPlaylist(newPl);
  };

  const filtered = userPlaylists.filter((pl) =>
    pl.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <>
      {/* Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10001,
            background: "rgba(20, 20, 20, 0.95)",
            border: "1px solid var(--border-default)",
            color: "#ffffff",
            padding: "10px 22px",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--fs-xs)",
            fontWeight: "var(--fw-medium)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeSlideDown 0.25s ease-out",
          }}
        >
          <span style={{ color: toastKind === "remove" ? "var(--text-muted)" : "var(--brand)" }}>
            {toastKind === "remove" ? "−" : "✓"}
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backdrop & Dialog */}
      {!isCreateOpen && (
        <div
          className="add-to-playlist-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-to-playlist-title"
            className="add-to-playlist-dialog"
          >
            <div className="modal-handle-bar" />

            {/* Header */}
            <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ minWidth: 0 }}>
                <h2 id="add-to-playlist-title" style={{ fontSize: "var(--fs-base)", fontWeight: "var(--fw-semibold)", margin: 0, color: "var(--text-primary)" }}>
                  Add to Playlist
                </h2>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {track.title} • {track.artist}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", display: "grid", placeItems: "center", borderRadius: "var(--radius-full)", transition: "color var(--dur-fast)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none", display: "flex", alignItems: "center" }}>
                  <SearchIcon width={15} height={15} />
                </span>
                <input
                  type="text"
                  className="input"
                  placeholder="Search playlists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ height: 36, paddingLeft: 32, fontSize: "var(--fs-xs)", width: "100%", background: "var(--bg-surface)" }}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ padding: "var(--space-3)", overflowY: "auto", flex: 1, display: "grid", gap: "4px" }}>
              {isLoading ? (
                <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)", fontSize: "var(--fs-xs)" }}>
                  Loading playlists...
                </div>
              ) : userPlaylists.length === 0 ? (
                /* Empty state */
                <div style={{ textAlign: "center", padding: "var(--space-8) var(--space-4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-surface-2)", display: "grid", placeItems: "center", color: "var(--text-muted)", border: "1px dashed var(--border-default)" }}>
                    <PlusIcon width={22} height={22} />
                  </div>
                  <div>
                    <p style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", margin: 0 }}>No playlists yet</p>
                    <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", margin: "4px 0 0" }}>Create a playlist to save songs.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        onClose();
                        openLoginModal();
                        return;
                      }
                      setIsCreateOpen(true);
                    }}
                    style={{ marginTop: "var(--space-2)", display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "var(--radius-pill)", border: "none", background: "var(--brand)", color: "#000000", fontSize: "var(--fs-xs)", fontWeight: "var(--fw-bold)", cursor: "pointer" }}
                  >
                    <PlusIcon width={14} height={14} />
                    Create Playlist
                  </button>
                </div>
              ) : (
                <>
                  {/* Create new playlist row */}
                  <div
                    onClick={() => {
                      if (!isAuthenticated) {
                        onClose();
                        openLoginModal();
                        return;
                      }
                      setIsCreateOpen(true);
                    }}
                    style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "10px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", borderBottom: "1px solid var(--border-subtle)", marginBottom: "4px", color: "var(--brand)", transition: "background var(--dur-fast)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: "rgba(227, 245, 96, 0.1)", border: "1px dashed var(--brand)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <PlusIcon width={18} height={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)" }}>New Playlist</div>
                      <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>Create a new custom playlist</div>
                    </div>
                  </div>

                  {/* Playlist rows */}
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "var(--space-6) var(--space-3)" }}>
                      <p style={{ margin: 0, fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>No playlists found matching "{searchQuery}".</p>
                    </div>
                  ) : (
                    filtered.map((pl) => {
                      const isAdded = addedPlaylistIds.includes(pl.id);
                      return (
                        <div
                          key={pl.id}
                          onClick={() => handlePlaylistRowClick(pl)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            borderRadius: "var(--radius-sm)",
                            cursor: isAdded ? "default" : "pointer",
                            transition: "background var(--dur-fast)",
                            background: isAdded ? "rgba(255,255,255,0.04)" : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (!isAdded) e.currentTarget.style.background = "var(--bg-surface-2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isAdded ? "rgba(255,255,255,0.04)" : "transparent";
                          }}
                        >
                          {/* Thumbnail + info */}
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minWidth: 0 }}>
                            <div style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0, background: "var(--bg-surface-3)" }}>
                              {pl.logo ? (
                                <img src={pl.logo} alt={pl.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <CoverArt hue={pl.hue ?? 24} size={44} style={{ width: "100%", height: "100%" }} />
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {pl.title}
                              </div>
                              <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
                                {pl.songCount} {pl.songCount === 1 ? "song" : "songs"}
                                {isAdded && (
                                  <span style={{ marginLeft: 6, color: "var(--brand)", fontWeight: "var(--fw-medium)" }}>
                                    · Added
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action button: ✓ + × to remove, or + to add */}
                          {isAdded ? (
                            <button
                              type="button"
                              onClick={(e) => handleRemoveFromPlaylist(pl, e)}
                              aria-label={`Remove from ${pl.title}`}
                              title="Remove from playlist"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 10px",
                                borderRadius: "var(--radius-pill)",
                                border: "1px solid var(--border-default)",
                                background: "var(--bg-surface-2)",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                fontSize: "var(--fs-xs)",
                                fontWeight: "var(--fw-medium)",
                                flexShrink: 0,
                                marginLeft: "var(--space-3)",
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#ef4444";
                                e.currentTarget.style.color = "#ef4444";
                                e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "var(--border-default)";
                                e.currentTarget.style.color = "var(--text-muted)";
                                e.currentTarget.style.background = "var(--bg-surface-2)";
                              }}
                            >
                              <CheckIcon width={12} height={12} />
                              <span>Added</span>
                              <span style={{ fontSize: "0.9rem", lineHeight: 1 }}>×</span>
                            </button>
                          ) : (
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                display: "grid",
                                placeItems: "center",
                                border: "1px solid var(--border-default)",
                                background: "transparent",
                                color: "var(--text-secondary)",
                                flexShrink: 0,
                                marginLeft: "var(--space-3)",
                                transition: "all var(--dur-fast)",
                              }}
                            >
                              <PlusIcon width={14} height={14} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreatedPlaylist}
      />
    </>
  );
}

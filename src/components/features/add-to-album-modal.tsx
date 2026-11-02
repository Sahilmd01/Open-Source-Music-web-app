"use client";

import { useEffect, useState } from "react";
import { CloseIcon, PlusIcon, CheckIcon, SearchIcon, DiscIcon } from "@/components/icons";
import { CoverArt } from "@/components/ui/cover-art";
import { CreateAlbumModal } from "@/app/(app)/albums/create-album-modal";
import { useUiStore } from "@/stores/ui-store";
import {
  useAlbumTrackManager,
  isTrackInAlbum,
} from "@/hooks/use-album-track-manager";
import type { Album, Track } from "@/types/music";

interface AddToAlbumModalProps {
  open: boolean;
  track: Track | null;
  onClose: () => void;
  onAdded?: (album: Album) => void;
  onRemoved?: (album: Album) => void;
}

export function AddToAlbumModal({
  open,
  track,
  onClose,
  onAdded,
  onRemoved,
}: AddToAlbumModalProps) {
  const { isAuthenticated, openLoginModal, user } = useUiStore();
  const { addTrack, removeTrack } = useAlbumTrackManager();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [addedAlbumIds, setAddedAlbumIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastKind, setToastKind] = useState<"add" | "remove">("add");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load albums from backend
  const loadAlbums = async () => {
    if (!track) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/control/albums");
      const data = await res.json();
      let allAlbums: Album[] = [];

      if (data.success && Array.isArray(data.albums)) {
        allAlbums = data.albums.map((al: any) => ({
          id: String(al.id),
          title: al.title,
          artist: al.artist || "Various Artists",
          year: al.year || new Date().getFullYear(),
          coverImage: al.coverUrl,
          avatarUrl: al.coverUrl,
          bannerUrl: al.bannerUrl,
          createdBy: al.createdBy,
          isCustom: Boolean(al.createdBy),
          hue: al.hue || 210,
        }));
      }

      // Role check: If role is "admin" or "moderator", show full albums.
      // Otherwise, only show albums created by the user.
      const canManageAll = user?.role === "admin" || user?.role === "moderator";
      let locallyCreatedIds: string[] = [];
      try {
        const stored = localStorage.getItem("my_custom_albums_v1");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) locallyCreatedIds = parsed.map((a: any) => String(a.id));
        }
      } catch {
        // ignore
      }

      const visibleAlbums = canManageAll
        ? allAlbums
        : allAlbums.filter((al) => {
            if (user?.id && al.createdBy && al.createdBy === user.id) return true;
            if (locallyCreatedIds.includes(al.id)) return true;
            return false;
          });

      setAlbums(visibleAlbums);

      // Detect which albums already contain this track
      const existing = visibleAlbums
        .filter((al) => isTrackInAlbum(al.id, track.id, (track as any).albumId))
        .map((al) => al.id);
      setAddedAlbumIds(existing);
    } catch (err) {
      console.error("Failed to load albums:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && track) {
      setSearchQuery("");
      loadAlbums();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, track]);

  // Auto-dismiss toast
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

  const handleAddToAlbum = (album: Album) => {
    if (!isAuthenticated) {
      onClose();
      openLoginModal();
      return;
    }
    addTrack(album.id, track);
    setAddedAlbumIds((prev) => [...prev, album.id]);
    showToast(`Added to "${album.title}"`, "add");
    if (onAdded) onAdded(album);
  };

  const handleRemoveFromAlbum = (album: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onClose();
      openLoginModal();
      return;
    }
    removeTrack(album.id, track.id);
    setAddedAlbumIds((prev) => prev.filter((id) => id !== album.id));
    showToast(`Removed from "${album.title}"`, "remove");
    if (onRemoved) onRemoved(album);
  };

  const handleAlbumRowClick = (album: Album) => {
    if (!isAuthenticated) {
      onClose();
      openLoginModal();
      return;
    }
    if (!addedAlbumIds.includes(album.id)) {
      handleAddToAlbum(album);
    }
  };

  const handleCreatedAlbum = (newAl: Album) => {
    setAlbums((prev) => [newAl, ...prev]);
    setIsCreateOpen(false);
    handleAddToAlbum(newAl);
  };

  const filtered = albums.filter((al) =>
    al.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    al.artist.toLowerCase().includes(searchQuery.toLowerCase().trim())
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
            aria-labelledby="add-to-album-title"
            className="add-to-playlist-dialog"
          >
            <div className="modal-handle-bar" />

            {/* Header */}
            <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ minWidth: 0 }}>
                <h2 id="add-to-album-title" style={{ fontSize: "var(--fs-base)", fontWeight: "var(--fw-semibold)", margin: 0, color: "var(--text-primary)" }}>
                  Add to Album
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
                  placeholder="Search albums..."
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
                  Loading albums...
                </div>
              ) : albums.length === 0 ? (
                /* Empty state */
                <div style={{ textAlign: "center", padding: "var(--space-8) var(--space-4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-surface-2)", display: "grid", placeItems: "center", color: "var(--text-muted)", border: "1px dashed var(--border-default)" }}>
                    <DiscIcon width={22} height={22} />
                  </div>
                  <div>
                    <p style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", margin: 0 }}>No albums available</p>
                    <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", margin: "4px 0 0" }}>Create an album to organize your tracks.</p>
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
                    Create Album
                  </button>
                </div>
              ) : (
                <>
                  {/* Create new album row */}
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
                      <div style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)" }}>New Album</div>
                      <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>Create a new album</div>
                    </div>
                  </div>

                  {/* Album rows */}
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "var(--space-6) var(--space-3)" }}>
                      <p style={{ margin: 0, fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>No albums found matching "{searchQuery}".</p>
                    </div>
                  ) : (
                    filtered.map((al) => {
                      const isAdded = addedAlbumIds.includes(al.id);
                      return (
                        <div
                          key={al.id}
                          onClick={() => handleAlbumRowClick(al)}
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
                              {al.coverImage || al.avatarUrl ? (
                                <img src={al.coverImage || al.avatarUrl} alt={al.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <CoverArt hue={al.hue ?? 210} size={44} style={{ width: "100%", height: "100%" }} />
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {al.title}
                              </div>
                              <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
                                {al.artist} • {al.year}
                                {isAdded && (
                                  <span style={{ marginLeft: 6, color: "var(--brand)", fontWeight: "var(--fw-medium)" }}>
                                    · Added
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action button */}
                          {isAdded ? (
                            <button
                              type="button"
                              onClick={(e) => handleRemoveFromAlbum(al, e)}
                              aria-label={`Remove from ${al.title}`}
                              title="Remove from album"
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

      {/* Create Album Modal */}
      <CreateAlbumModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreatedAlbum}
      />
    </>
  );
}

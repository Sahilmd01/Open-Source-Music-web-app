"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreVerticalIcon,
  PlaylistAddIcon,
  DiscIcon,
  Share2Icon,
  FlagIcon,
  CopyrightIcon,
} from "@/components/icons";
import { useToast } from "@/providers/toast-provider";
import type { Track } from "@/types/music";

interface SongActionsMenuProps {
  track: Track;
  isHovered: boolean;
  onAddToPlaylist?: (track: Track) => void;
  onAddToAlbum?: (track: Track) => void;
  onReport?: (track: Track, reason?: string) => void;
}

export function SongActionsMenu({
  track,
  isHovered,
  onAddToPlaylist,
  onAddToAlbum,
  onReport,
}: SongActionsMenuProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const handleShareSong = () => {
    setIsOpen(false);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(
        `${window.location.origin}/songs?id=${encodeURIComponent(track.id)}`
      );
      toast({
        kind: "info",
        title: "Link Copied",
        description: `Share link for "${track.title}" copied to clipboard!`,
      });
    } else {
      toast({
        kind: "info",
        title: "Share Song",
        description: `Now sharing "${track.title}" by ${track.artist}`,
      });
    }
  };

  return (
    <div
      className="col-more"
      ref={menuRef}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label={`More options for ${track.title}`}
        title="More options"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          background: isOpen ? "var(--bg-surface-3)" : "transparent",
          border: "none",
          color: isOpen || isHovered ? "var(--text-primary)" : "var(--text-muted)",
          opacity: isOpen || isHovered ? 1 : 0,
          cursor: "pointer",
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.15s ease, background 0.15s ease",
        }}
      >
        <MoreVerticalIcon width={16} height={16} />
      </button>

      {/* Floating Dropdown Menu - Styled with platform design tokens */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 4px)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            padding: "4px",
            width: 250,
            maxWidth: "88vw",
            zIndex: "var(--z-dropdown, 100)",
            animation: "modalFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
            textAlign: "left",
          }}
        >
          {/* Add to playlist */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (onAddToPlaylist) onAddToPlaylist(track);
            }}
            style={{
              width: "100%",
              padding: "6px 8px",
              display: "flex",
              alignItems: "flex-start",
              gap: "9px",
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius-xs)",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.12s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ color: "var(--text-primary)", marginTop: 1, display: "flex" }}>
              <PlaylistAddIcon width={15} height={15} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", lineHeight: 1.2 }}>
                Add to playlist
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.2 }}>
                Save to a playlist
              </span>
            </div>
          </button>

          {/* Add to album */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (onAddToAlbum) onAddToAlbum(track);
            }}
            style={{
              width: "100%",
              padding: "6px 8px",
              display: "flex",
              alignItems: "flex-start",
              gap: "9px",
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius-xs)",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.12s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ color: "var(--text-primary)", marginTop: 1, display: "flex" }}>
              <DiscIcon width={15} height={15} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", lineHeight: 1.2 }}>
                Add to album
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.2 }}>
                Add track into an album
              </span>
            </div>
          </button>

          {/* Share song */}
          <button
            type="button"
            onClick={handleShareSong}
            style={{
              width: "100%",
              padding: "6px 8px",
              display: "flex",
              alignItems: "center",
              gap: "9px",
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius-xs)",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.12s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ color: "var(--text-primary)", display: "flex" }}>
              <Share2Icon width={15} height={15} />
            </div>
            <span style={{ fontSize: "12.5px", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>
              Share song
            </span>
          </button>

          {/* Subtle Divider */}
          <div
            style={{
              height: "1px",
              background: "var(--border-subtle)",
              margin: "3px 0",
            }}
          />

          {/* Report song */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (onReport) onReport(track, "Spam or misleading content");
            }}
            style={{
              width: "100%",
              padding: "6px 8px",
              display: "flex",
              alignItems: "flex-start",
              gap: "9px",
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius-xs)",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.12s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ color: "var(--text-primary)", marginTop: 1, display: "flex" }}>
              <FlagIcon width={14} height={14} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", lineHeight: 1.2 }}>
                Report song
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.2 }}>
                Spam, harmful content, impersonation, etc.
              </span>
            </div>
          </button>

          {/* Report copyright infringement */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (onReport) onReport(track, "Copyright / IP infringement");
            }}
            style={{
              width: "100%",
              padding: "6px 8px",
              display: "flex",
              alignItems: "flex-start",
              gap: "9px",
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius-xs)",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.12s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ color: "var(--text-primary)", marginTop: 1, display: "flex" }}>
              <CopyrightIcon width={15} height={15} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: "12.5px", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", lineHeight: 1.2 }}>
                Report copyright infringement
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.25 }}>
                For artists & authorized representatives
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

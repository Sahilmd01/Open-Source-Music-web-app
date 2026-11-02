"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { CloseIcon, PlaylistIcon } from "@/components/icons";
import { MediaCard } from "@/components/features/media-card";

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const userPlaylists = user.playlists || [];

  return (
    <div
      className="modal-backdrop"
      style={{
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-4)",
      }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-modal-name"
        style={{
          width: "100%",
          maxWidth: 620,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-xl)",
          position: "relative",
          animation: "fadeScaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Banner with close button */}
        <div
          style={{
            height: 140,
            width: "100%",
            background: `url('${user.bannerUrl || "/default/default-user-banner.png"}') center/cover no-repeat`,
            position: "relative",
          }}
        >
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <CloseIcon width={14} height={14} />
          </button>
        </div>

        {/* Content body */}
        <div style={{ padding: "0 var(--space-6) var(--space-6)" }}>
          {/* Avatar floating overlapping the banner */}
          <div
            style={{
              marginTop: -42,
              marginBottom: "var(--space-3)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "4px solid var(--bg-surface)",
                overflow: "hidden",
                background: "var(--bg-muted)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <img
                src={user.avatarUrl || "/default/default-user-avatar.avif"}
                alt={user.name}
                style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
              />
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Link href={`/users/${encodeURIComponent(user.id)}`} onClick={onClose}>
                <Button variant="secondary" size="sm">
                  Full Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Name & Verification */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h3
              id="user-profile-modal-name"
              style={{
                margin: 0,
                fontSize: "var(--fs-xl)",
                fontWeight: "var(--fw-bold)",
                color: "var(--text-primary)",
              }}
            >
              {user.name}
            </h3>
            {user.isVerified && (
              <img
                src="/verification.gif"
                alt="Verified"
                title="Verified User"
                style={{
                  width: 20,
                  height: 20,
                  objectFit: "contain",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
              />
            )}
          </div>

          <div style={{ color: "var(--text-muted)", fontSize: "var(--fs-sm)", marginTop: 2 }}>
            @{user.username} {user.email ? `• ${user.email}` : ""}
          </div>

          {/* Bio */}
          <p
            style={{
              margin: "var(--space-3) 0 var(--space-4)",
              fontSize: "var(--fs-sm)",
              lineHeight: 1.5,
              color: user.bio ? "var(--text-secondary)" : "var(--text-muted)",
              fontStyle: user.bio ? "normal" : "italic",
            }}
          >
            {user.bio || "No bio written yet."}
          </p>

          {/* Quick Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--space-3)",
              background: "var(--bg-muted)",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              marginBottom: "var(--space-4)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)" }}>
                {user.playlistsCount || userPlaylists.length}
              </div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Playlists
              </div>
            </div>
            <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)" }}>
                {user.followersCount || 0}
              </div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Followers
              </div>
            </div>
            <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)" }}>
                {user.role === "admin" ? "Admin" : "Member"}
              </div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Role
              </div>
            </div>
          </div>

          {/* User's Playlists */}
          {userPlaylists.length > 0 && (
            <div style={{ marginTop: "var(--space-4)", marginBottom: "var(--space-4)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-3)",
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: "var(--fs-sm)",
                    fontWeight: "var(--fw-bold)",
                    color: "var(--text-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <PlaylistIcon width={16} height={16} />
                  Playlists by {user.name}
                </h4>
                <Link
                  href="/playlists"
                  onClick={onClose}
                  style={{
                    fontSize: "var(--fs-xs)",
                    color: "var(--accent-500, #ff7c3b)",
                    textDecoration: "none",
                    fontWeight: "var(--fw-medium)",
                  }}
                >
                  View all playlists →
                </Link>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "var(--space-3)",
                }}
              >
                {userPlaylists.map((pl) => (
                  <div key={pl.id} onClick={onClose}>
                    <MediaCard
                      title={pl.title}
                      subtitle={`${pl.songCount} songs · ${pl.durationLabel}`}
                      hue={pl.hue ?? 24}
                      src={pl.coverImage}
                      href={`/playlists/${encodeURIComponent(pl.id)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

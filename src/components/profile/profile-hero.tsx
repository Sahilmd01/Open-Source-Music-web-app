"use client";

import { ImageIcon, CheckIcon } from "@/components/icons";
import { type ProfileData, DEFAULT_AVATAR_PATH, DEFAULT_BANNER_PATH } from "./profile-types";

interface ProfileHeroProps {
  profile: ProfileData;
  onVerifyClick?: () => void;
}

export function ProfileHero({ profile, onVerifyClick }: ProfileHeroProps) {
  const avatarSrc = profile.avatarUrl && profile.avatarUrl.trim() !== "" ? profile.avatarUrl : DEFAULT_AVATAR_PATH;
  const bannerSrc = profile.bannerUrl && profile.bannerUrl.trim() !== "" ? profile.bannerUrl : DEFAULT_BANNER_PATH;

  const displayName = profile.name && profile.name.trim() !== "" ? profile.name : "Not set yet";
  const displayUsername = profile.username && profile.username.trim() !== "" ? `@${profile.username}` : "@not_set";
  const displayJoined = profile.joinedDate && profile.joinedDate.trim() !== "" ? profile.joinedDate : "Joined recently";

  return (
    <section
      className="profile-hero"
      style={{
        position: "relative",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Banner Artwork Area */}
      <div
        className="profile-hero__banner"
        style={{
          width: "100%",
          height: 200,
          background: `url('${bannerSrc}') center/cover no-repeat`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "var(--space-4)",
            right: "var(--space-4)",
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(10px)",
            padding: "5px 12px",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--fs-xs)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          <ImageIcon width={14} height={14} />
          Profile Header
        </div>
      </div>

      {/* Identity & Stats Strip (Clean Surface Container) */}
      <div
        className="profile-hero__strip"
        style={{
          padding: "var(--space-4) var(--space-6) var(--space-5)",
          background: "var(--bg-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          position: "relative",
        }}
      >
        {/* Left: Avatar overlapping banner + Clean User info */}
        <div
          className="profile-hero__user"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-5)",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar positioned with margin-top offset */}
          <div
            className="profile-hero__avatar"
            style={{
              position: "relative",
              marginTop: -56,
              flexShrink: 0,
            }}
          >
            <img
              src={avatarSrc}
              alt={displayName}
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid var(--bg-surface)",
                boxShadow: "var(--shadow-lg)",
                background: "var(--bg-surface-3)",
                display: "block",
              }}
            />
          </div>

          {/* User Details */}
          <div className="profile-hero__info" style={{ display: "grid", gap: "2px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h1
                style={{
                  fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
                  fontWeight: "var(--fw-bold)",
                  margin: 0,
                  color: profile.name && profile.name.trim() !== "" ? "var(--text-primary)" : "var(--text-muted)",
                  lineHeight: 1.2,
                }}
              >
                {displayName}
              </h1>

              {profile.isVerified ? (
                <img
                  src="/verification.gif"
                  alt="Verified"
                  title="Verified Account"
                  style={{
                    width: 22,
                    height: 22,
                    objectFit: "contain",
                    display: "inline-block",
                    verticalAlign: "middle",
                    flexShrink: 0,
                  }}
                />
              ) : (
                onVerifyClick && (
                  <button
                    type="button"
                    onClick={onVerifyClick}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "rgba(255, 124, 59, 0.15)",
                      color: "var(--accent-500, #ff7c3b)",
                      border: "1px solid rgba(255, 124, 59, 0.35)",
                      padding: "3px 10px",
                      borderRadius: "var(--radius-pill)",
                      fontSize: "0.72rem",
                      fontWeight: "var(--fw-bold)",
                      cursor: "pointer",
                      transition: "background 0.15s ease, transform 0.15s ease",
                    }}
                  >
                    Verify Account
                  </button>
                )
              )}
            </div>
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
              {displayUsername} • {displayJoined}
            </span>
          </div>
        </div>

        {/* Right: Stats Counters */}
        <div
          className="profile-hero__stats"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-5)",
            padding: "var(--space-2) var(--space-4)",
            background: "var(--bg-surface-2)",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <strong style={{ display: "block", fontSize: "var(--fs-base)", color: "var(--text-primary)", lineHeight: 1.2 }}>
              {profile.playlistsCount || 0}
            </strong>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Playlists</span>
          </div>

          <div style={{ width: 1, height: 24, background: "var(--border-subtle)" }} />

          <div style={{ textAlign: "center" }}>
            <strong style={{ display: "block", fontSize: "var(--fs-base)", color: "var(--text-primary)", lineHeight: 1.2 }}>
              {profile.followersCount || 0}
            </strong>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Followers</span>
          </div>

          <div style={{ width: 1, height: 24, background: "var(--border-subtle)" }} />

          <div style={{ textAlign: "center" }}>
            <strong style={{ display: "block", fontSize: "var(--fs-base)", color: "var(--text-primary)", lineHeight: 1.2 }}>
              {profile.followingCount || 0}
            </strong>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Following</span>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@/types/user";
import { MediaCard } from "@/components/features/media-card";
import { PlaylistIcon, ArrowLeftIcon, AlertIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

import { UserProfilePageSkeleton } from "@/components/skeletons";

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const router = useRouter();
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadUser() {
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(decodedId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user && isMounted) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [decodedId]);

  if (isLoading) {
    return <UserProfilePageSkeleton />;
  }

  if (!user) {
    return (
      <div className="page-container" style={{ padding: "var(--space-8) 0", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-base)" }}>User not found.</p>
        <Button variant="secondary" onClick={() => router.push("/users")} style={{ marginTop: "var(--space-4)" }}>
          Back to All Users
        </Button>
      </div>
    );
  }

  const userPlaylists = user.playlists || [];

  return (
    <div className="page-container" style={{ paddingBottom: "var(--space-10)" }}>
      {/* Full-width Native Page Hero Banner */}
      <section
        style={{
          width: "100%",
          height: 220,
          background: `url('${user.bannerUrl || "/default/default-user-banner.png"}') center/cover no-repeat`,
          borderRadius: "var(--radius-xl)",
          position: "relative",
          overflow: "hidden",
          boxShadow: "var(--shadow-md)",
          border: "1px solid var(--border-subtle)",
          marginBottom: "var(--space-6)",
        }}
      >
        {/* Soft bottom vignette overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)",
            zIndex: 1,
          }}
        />

        {/* Top Controls Row */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 2,
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/users")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(10px)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "6px 14px",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--fs-xs)",
              fontWeight: "var(--fw-medium)",
              cursor: "pointer",
            }}
          >
            <ArrowLeftIcon width={14} height={14} />
            <span>All Members</span>
          </button>

          <div style={{ display: "flex", gap: "6px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "var(--fw-bold)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)",
                background: user.role === "admin" ? "var(--yellow-500)" : "rgba(0, 0, 0, 0.65)",
                color: user.role === "admin" ? "#000" : "#fff",
                backdropFilter: "blur(6px)",
              }}
            >
              {user.role}
            </span>

            {user.isBanned && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "var(--fw-bold)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "#dc2626",
                  color: "#fff",
                }}
              >
                BANNED
              </span>
            )}
          </div>
        </div>

        {/* Floating Avatar & Title aligned naturally inside hero bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 24,
            right: 24,
            display: "flex",
            alignItems: "flex-end",
            gap: "var(--space-4)",
            zIndex: 3,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              border: user.isBanned ? "3.5px solid #dc2626" : "3.5px solid rgba(255,255,255,0.85)",
              overflow: "hidden",
              background: "var(--bg-muted)",
              flexShrink: 0,
            }}
          >
            <img
              src={user.avatarUrl || "/default/default-user-avatar.avif"}
              alt={user.name}
              style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
            />
          </div>

          {/* User Name & Handle on Banner */}
          <div style={{ flex: 1, minWidth: 0, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "var(--fs-2xl)",
                  fontWeight: "var(--fw-bold)",
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {user.name}
              </h1>
              {user.isVerified && (
                <img
                  src="/verification.gif"
                  alt="Verified"
                  title="Verified User"
                  style={{
                    width: 22,
                    height: 22,
                    objectFit: "contain",
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                />
              )}
            </div>
            <div style={{ fontSize: "var(--fs-sm)", opacity: 0.9, marginTop: 2 }}>
              @{user.username} {user.email ? `• ${user.email}` : ""}
            </div>
          </div>
        </div>
      </section>

      {/* Main Page Flow */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {/* User Bio and Warnings if any */}
        <div>
          {user.warnings && user.warnings.length > 0 && (
            <div
              style={{
                marginBottom: "var(--space-3)",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: "11px",
                color: "#f59e0b",
                background: "rgba(245, 158, 11, 0.12)",
                padding: "3px 10px",
                borderRadius: "var(--radius-pill)",
                width: "fit-content",
              }}
            >
              <AlertIcon width={12} height={12} />
              <span>{user.warnings.length} warning{user.warnings.length > 1 ? "s" : ""} received</span>
            </div>
          )}

          <p
            style={{
              margin: 0,
              fontSize: "var(--fs-sm)",
              lineHeight: 1.5,
              color: user.bio ? "var(--text-secondary)" : "var(--text-muted)",
              maxWidth: 720,
              fontStyle: user.bio ? "normal" : "italic",
            }}
          >
            {user.bio || "No bio written yet."}
          </p>
        </div>

        {/* Flat Overview Details Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--space-4)",
            padding: "var(--space-3) 0",
            borderTop: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Playlists</div>
            <div style={{ fontSize: "var(--fs-base)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)", marginTop: 2 }}>
              {user.playlistsCount || userPlaylists.length} Created
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Followers</div>
            <div style={{ fontSize: "var(--fs-base)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)", marginTop: 2 }}>
              {user.followersCount || 0}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Following</div>
            <div style={{ fontSize: "var(--fs-base)", fontWeight: "var(--fw-bold)", color: "var(--text-primary)", marginTop: 2 }}>
              {user.followingCount || 0}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Joined</div>
            <div style={{ fontSize: "var(--fs-base)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", marginTop: 2 }}>
              {user.joinedDate.replace("Member since ", "")}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Account Type</div>
            <div style={{ fontSize: "var(--fs-base)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", marginTop: 2 }}>
              {user.role === "admin" ? "Administrator" : "Member"}
            </div>
          </div>

          {user.phone ? (
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Contact</div>
              <div style={{ fontSize: "var(--fs-base)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", marginTop: 2 }}>
                {user.phone}
              </div>
            </div>
          ) : null}
        </div>

        {/* Playlists by this User */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-4)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "var(--fs-lg)",
                fontWeight: "var(--fw-bold)",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <PlaylistIcon width={18} height={18} />
              Playlists by {user.name}
            </h2>
            <Link
              href="/playlists"
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

          {userPlaylists.length === 0 ? (
            <div
              style={{
                padding: "var(--space-8)",
                textAlign: "center",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-lg)",
                border: "1px dashed var(--border-subtle)",
                color: "var(--text-muted)",
                fontSize: "var(--fs-sm)",
              }}
            >
              {user.name} hasn&apos;t published any public playlists yet.
            </div>
          ) : (
            <div className="media-grid">
              {userPlaylists.map((pl) => (
                <MediaCard
                  key={pl.id}
                  title={pl.title}
                  subtitle={`${pl.songCount} songs · ${pl.durationLabel}`}
                  hue={pl.hue ?? 24}
                  src={pl.coverImage}
                  href={`/playlists/${encodeURIComponent(pl.id)}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

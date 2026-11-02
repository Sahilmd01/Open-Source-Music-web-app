"use client";

import { useState } from "react";
import Link from "next/link";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { AlertIcon } from "@/components/icons";

interface UserCardProps {
  user: User;
  isAdmin: boolean;
  onViewDetails: (user: User) => void;
  onToggleBan: (userId: string, shouldBan: boolean) => void;
  onSendWarning: (userId: string, warningText: string) => void;
}

export function UserCard({
  user,
  isAdmin,
  onViewDetails,
  onToggleBan,
  onSendWarning,
}: UserCardProps) {
  // Warn interactive state
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // Ban confirmation state
  const [isBanConfirmOpen, setIsBanConfirmOpen] = useState(false);

  const handleSendWarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warningMessage.trim()) return;
    onSendWarning(user.id, warningMessage.trim());
    setWarningMessage("");
    setIsWarningOpen(false);
  };

  const handleConfirmBanToggle = () => {
    onToggleBan(user.id, !user.isBanned);
    setIsBanConfirmOpen(false);
  };

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: user.isBanned
          ? "1.5px solid rgba(239, 68, 68, 0.45)"
          : "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: user.isBanned
          ? "0 4px 16px rgba(239, 68, 68, 0.12)"
          : "var(--shadow-sm)",
        opacity: user.isBanned ? 0.88 : 1,
      }}
      className="user-card"
    >
      {/* Banner & Role header */}
      <div
        style={{
          width: "100%",
          height: 80,
          background: `url('${user.bannerUrl}') center/cover no-repeat`,
          position: "relative",
          filter: user.isBanned ? "grayscale(50%)" : "none",
        }}
      >
        <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: "6px" }}>
          {user.isBanned && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: "var(--fw-bold)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "2px 8px",
                borderRadius: "var(--radius-pill)",
                background: "#dc2626",
                color: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
            >
              BANNED
            </span>
          )}

          <span
            style={{
              fontSize: "10px",
              fontWeight: "var(--fw-bold)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              background: user.role === "admin" ? "var(--yellow-500)" : "rgba(0, 0, 0, 0.65)",
              color: user.role === "admin" ? "#000" : "#fff",
              backdropFilter: "blur(6px)",
            }}
          >
            {user.role}
          </span>
        </div>
      </div>

      {/* Main Info */}
      <div
        style={{
          padding: "0 var(--space-4) var(--space-4)",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* Avatar floating */}
        <div
          style={{
            marginTop: -32,
            marginBottom: "var(--space-2)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: user.isBanned ? "3px solid #dc2626" : "3px solid var(--bg-surface)",
              overflow: "hidden",
              position: "relative",
              background: "var(--bg-muted)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              filter: user.isBanned ? "grayscale(60%)" : "none",
            }}
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
            />
          </div>

          <span
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--text-muted)",
              paddingBottom: 4,
            }}
          >
            {user.playlistsCount} Playlists
          </span>
        </div>

        {/* Name and verified badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <h4
            style={{
              margin: 0,
              fontSize: "var(--fs-base)",
              fontWeight: "var(--fw-bold)",
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.name}
          </h4>
          {user.isVerified && (
            <img
              src="/verification.gif"
              alt="Verified"
              title="Verified User"
              style={{
                width: 18,
                height: 18,
                objectFit: "contain",
                flexShrink: 0,
                display: "inline-block",
                verticalAlign: "middle",
              }}
            />
          )}
        </div>

        {/* Username & Email */}
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)", marginTop: 2 }}>
          @{user.username}
        </div>
        <div
          style={{
            fontSize: "var(--fs-xs)",
            color: "var(--text-secondary)",
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {user.email}
        </div>

        {/* Warnings badge counter if any */}
        {user.warnings && user.warnings.length > 0 && (
          <div
            style={{
              marginTop: "var(--space-2)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: "11px",
              color: "#f59e0b",
              background: "rgba(245, 158, 11, 0.12)",
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              width: "fit-content",
            }}
          >
            <AlertIcon width={12} height={12} />
            <span>{user.warnings.length} warning{user.warnings.length > 1 ? "s" : ""} received</span>
          </div>
        )}

        {/* Short bio */}
        <p
          style={{
            fontSize: "var(--fs-xs)",
            color: "var(--text-muted)",
            margin: "var(--space-2) 0",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flex: 1,
          }}
        >
          {user.bio}
        </p>

        {/* Genre / Joined info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "var(--text-muted)",
            padding: "8px 0",
            borderTop: "1px solid var(--border-subtle)",
            marginBottom: "var(--space-3)",
          }}
        >
          <span>{user.favoriteGenre}</span>
          <span>{user.joinedDate}</span>
        </div>

        {/* Action: View Profile Details */}
        <Link
          href={`/users/${encodeURIComponent(user.id)}`}
          style={{ textDecoration: "none", width: "100%", marginBottom: isAdmin ? "var(--space-3)" : "0" }}
        >
          <Button
            variant="secondary"
            size="sm"
            style={{ width: "100%" }}
          >
            View Profile Details
          </Button>
        </Link>

        {/* ============================================================ */}
        {/* ADMIN MODERATION CONTROLS (Only visible for Admins)           */}
        {/* ============================================================ */}
        {isAdmin && (
          <div
            style={{
              marginTop: "auto",
              paddingTop: "var(--space-3)",
              borderTop: "1px dashed var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-2)",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "var(--fw-bold)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                }}
              >
                Admin Moderation
              </span>

              <div style={{ display: "flex", gap: "6px" }}>
                {/* Warn Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsWarningOpen(!isWarningOpen);
                    setIsBanConfirmOpen(false);
                  }}
                  style={{
                    padding: "3px 8px",
                    fontSize: "11px",
                    fontWeight: "var(--fw-medium)",
                    borderRadius: "var(--radius-sm)",
                    background: isWarningOpen ? "rgba(245, 158, 11, 0.25)" : "rgba(245, 158, 11, 0.12)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="Send warning to user"
                >
                  <AlertIcon width={11} height={11} />
                  Warn
                </button>

                {/* Ban Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsBanConfirmOpen(!isBanConfirmOpen);
                    setIsWarningOpen(false);
                  }}
                  style={{
                    padding: "3px 8px",
                    fontSize: "11px",
                    fontWeight: "var(--fw-medium)",
                    borderRadius: "var(--radius-sm)",
                    background: user.isBanned
                      ? "rgba(34, 197, 94, 0.12)"
                      : "rgba(239, 68, 68, 0.12)",
                    color: user.isBanned ? "#22c55e" : "#ef4444",
                    border: user.isBanned
                      ? "1px solid rgba(34, 197, 94, 0.3)"
                      : "1px solid rgba(239, 68, 68, 0.3)",
                    cursor: "pointer",
                  }}
                >
                  {user.isBanned ? "Unban" : "Ban"}
                </button>
              </div>
            </div>

            {/* Inline Warning Message Field Panel */}
            {isWarningOpen && (
              <form
                onSubmit={handleSendWarning}
                style={{
                  background: "var(--bg-muted)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  animation: "modalFadeIn 0.15s ease",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "var(--fw-medium)" }}>
                  Send official warning to {user.name}:
                </div>
                <textarea
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="Reason (e.g. Terms violation, inappropriate playlist content)..."
                  rows={2}
                  required
                  style={{
                    width: "100%",
                    fontSize: "12px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px",
                    color: "var(--text-primary)",
                    resize: "none",
                    outline: "none",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setIsWarningOpen(false)}
                    style={{
                      padding: "3px 8px",
                      fontSize: "11px",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: "var(--fw-bold)",
                      borderRadius: "var(--radius-sm)",
                      background: "#f59e0b",
                      color: "#000",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Send Warning
                  </button>
                </div>
              </form>
            )}

            {/* Inline Ban Confirmation Dialog Box */}
            {isBanConfirmOpen && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  animation: "modalFadeIn 0.15s ease",
                }}
              >
                <div style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.4 }}>
                  {user.isBanned ? (
                    <>Are you sure you want to <strong>unban</strong> @{user.username}?</>
                  ) : (
                    <>Are you sure you want to <strong>ban</strong> @{user.username}? They won&apos;t be able to log in or stream music.</>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setIsBanConfirmOpen(false)}
                    style={{
                      padding: "4px 10px",
                      fontSize: "11px",
                      background: "transparent",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmBanToggle}
                    style={{
                      padding: "4px 12px",
                      fontSize: "11px",
                      fontWeight: "var(--fw-bold)",
                      borderRadius: "var(--radius-sm)",
                      background: user.isBanned ? "#22c55e" : "#dc2626",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {user.isBanned ? "Yes, Unban" : "Yes, Ban User"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

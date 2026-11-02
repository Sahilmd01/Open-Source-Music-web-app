"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  MusicNoteIcon,
  PlaylistIcon,
  InfoIcon,
  SearchIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { INITIAL_NOTIFICATIONS, type NotificationItem } from "@/data/notifications";

const NOTIFICATIONS_STORAGE_KEY = "wavelength_notifications_v1";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "release" | "playlist">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load from localStorage if user marked items as read
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const toggleReadStatus = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: !n.read } : n
    );
    saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let list = notifications;

    if (filterTab === "unread") {
      list = list.filter((n) => !n.read);
    } else if (filterTab === "release") {
      list = list.filter((n) => n.category === "release");
    } else if (filterTab === "playlist") {
      list = list.filter((n) => n.category === "playlist");
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      );
    }

    return list;
  }, [notifications, filterTab, searchQuery]);

  // Category Icon & Color Helper matching CSS design tokens
  const getCategoryMeta = (category: NotificationItem["category"]) => {
    switch (category) {
      case "release":
        return {
          icon: <MusicNoteIcon width={16} height={16} />,
          badgeColor: "var(--brand)",
          badgeBg: "var(--brand-soft)",
          badgeBorder: "var(--border-default)",
          label: "Music Drop",
        };
      case "playlist":
        return {
          icon: <PlaylistIcon width={16} height={16} />,
          badgeColor: "var(--text-on-accent)",
          badgeBg: "var(--accent)",
          badgeBorder: "transparent",
          label: "Playlist Update",
        };
      case "social":
        return {
          icon: <BellIcon width={16} height={16} />,
          badgeColor: "var(--info-text)",
          badgeBg: "var(--info-soft)",
          badgeBorder: "var(--info-border)",
          label: "Music Radar",
        };
      default:
        return {
          icon: <InfoIcon width={16} height={16} />,
          badgeColor: "var(--text-secondary)",
          badgeBg: "var(--bg-surface-3)",
          badgeBorder: "var(--border-subtle)",
          label: "System",
        };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Hero Banner with Clean, Non-Faded Internet Image */}
      <section
        className="notif-hero"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5) var(--space-6)",
          minHeight: 140,
          display: "flex",
          alignItems: "center",
          gap: "var(--space-5)",
          background: "url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat",
          boxShadow: "var(--shadow-brand)",
          border: "1px solid var(--border-subtle)",
          color: "#ffffff",
        }}
      >
        {/* Glow / Icon Avatar Card */}
        <div
          className="notif-hero__icon"
          style={{
            width: 82,
            height: 82,
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            flexShrink: 0,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            background: "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(12px)",
            display: "grid",
            placeItems: "center",
            position: "relative",
          }}
        >
          <BellIcon width={36} height={36} style={{ color: "var(--accent)" }} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 10px var(--accent)",
                border: "2px solid rgba(0, 0, 0, 0.6)",
              }}
            />
          )}
        </div>

        {/* Text Details */}
        <div className="notif-hero__content" style={{ display: "flex", flexDirection: "column", gap: "2px", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: "var(--fw-bold)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-on-accent)",
                padding: "2px 8px",
                borderRadius: "var(--radius-pill)",
                background: "var(--accent)",
                width: "fit-content",
              }}
            >
              Activity & Updates
            </span>
            <span style={{ fontSize: "var(--fs-xs)", color: "rgba(255, 255, 255, 0.9)" }}>
              <strong style={{ color: "var(--accent)" }}>{unreadCount} unread</strong> • {notifications.length} total
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(1.4rem, 2.8vw, 1.85rem)",
              fontWeight: "var(--fw-bold)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              margin: "2px 0 0",
              color: "#ffffff",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
            }}
          >
            Notifications
          </h1>

          <p style={{ margin: "2px 0 0", fontSize: "var(--fs-xs)", maxWidth: 520, lineHeight: 1.4, color: "rgba(255, 255, 255, 0.88)" }}>
            Stay tuned with fresh song drops from artists you follow, playlist updates, and community activity.
          </p>
        </div>
      </section>

      {/* Control Actions Bar: Filter Tabs, Mark Read, Search */}
      <div
        className="notif-controls"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        {/* Left: Standard Segmented Tabs */}
        <div className="notif-controls__left" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <div className="segmented notif-controls__tabs" role="tablist">
            {(["all", "unread", "release", "playlist"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={filterTab === tab}
                className={filterTab === tab ? "is-active" : ""}
                onClick={() => setFilterTab(tab)}
                style={{ fontWeight: "var(--fw-medium)", textTransform: "capitalize" }}
              >
                {tab === "all" ? "All" : tab === "unread" ? `Unread (${unreadCount})` : tab === "release" ? "Releases" : "Playlists"}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="notif-controls__mark-btn"
              leadingIcon={<CheckIcon width={14} height={14} />}
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Right: Search Input */}
        <div className="notif-controls__search" style={{ position: "relative", minWidth: 220, maxWidth: 300, flex: "1 1 200px" }}>
          <span
            style={{
              position: "absolute",
              left: "var(--space-3)",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          >
            <SearchIcon width={16} height={16} />
          </span>
          <input
            type="search"
            placeholder="Search updates…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{
              paddingLeft: "var(--space-8)",
              height: 38,
              fontSize: "var(--fs-sm)",
              borderRadius: "var(--radius-pill)",
              background: "var(--bg-surface-2)",
            }}
          />
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-12) var(--space-4)",
            background: "var(--bg-surface-2)",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--border-default)",
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
              margin: "0 auto var(--space-3)",
              color: "var(--text-muted)",
            }}
          >
            <BellIcon width={24} height={24} />
          </div>
          <h3 style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-semibold)", margin: "0 0 6px" }}>
            No notifications found
          </h3>
          <p className="text-muted text-small" style={{ margin: 0 }}>
            {searchQuery
              ? `No updates matching "${searchQuery}"`
              : filterTab === "unread"
              ? "You are all caught up! No unread notifications."
              : "You have no notifications in this category yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {filteredNotifications.map((notif) => {
            const meta = getCategoryMeta(notif.category);
            return (
              <div
                key={notif.id}
                className="notif-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  background: notif.read ? "transparent" : "rgba(251, 255, 122, 0.06)",
                  border: "none",
                  boxShadow: "none",
                  transition: "background var(--dur-fast)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                {/* Avatar / Category Badge */}
                <div className="notif-item__avatar" style={{ position: "relative", flexShrink: 0 }}>
                  {notif.avatar ? (
                    <img
                      src={notif.avatar}
                      alt={notif.title}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-sm)",
                        objectFit: "cover",
                        boxShadow: "none",
                        border: "none",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-sm)",
                        background: meta.badgeBg,
                        border: "none",
                        display: "grid",
                        placeItems: "center",
                        color: meta.badgeColor,
                      }}
                    >
                      {meta.icon}
                    </div>
                  )}

                  {/* Unread Indicator Dot */}
                  {!notif.read && (
                    <span
                      style={{
                        position: "absolute",
                        top: -3,
                        right: -3,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--brand)",
                        boxShadow: "0 0 4px var(--brand)",
                        border: "1.5px solid var(--bg-surface)",
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="notif-item__content" style={{ flex: 1, minWidth: 0, display: "grid", gap: "1px" }}>
                  <div className="notif-item__top" style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", flexWrap: "wrap" }}>
                    <span
                      className="notif-item__badge"
                      style={{
                        fontSize: "0.60rem",
                        fontWeight: "var(--fw-semibold)",
                        color: meta.badgeColor,
                        background: "transparent",
                        border: "none",
                        padding: "0",
                        borderRadius: "0",
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                        opacity: 0.7,
                      }}
                    >
                      {meta.label}
                    </span>
                    <span
                      className="notif-item__title"
                      style={{
                        fontSize: "var(--fs-xs)",
                        fontWeight: notif.read ? "var(--fw-regular)" : "var(--fw-semibold)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {notif.title}
                    </span>
                  </div>

                  <p
                    className="notif-item__desc"
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      lineHeight: 1.3,
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {notif.message}
                  </p>
                </div>

                {/* Age / Time */}
                <div
                  className="notif-item__time-badge"
                  style={{
                    fontSize: "0.70rem",
                    color: "var(--text-muted)",
                    fontWeight: "var(--fw-medium)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    padding: "2px 6px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-surface-3)",
                  }}
                >
                  {notif.timestamp}
                </div>

                {/* Right Action Link button — hidden on mobile */}
                {notif.actionHref && (
                  <div className="notif-item__action" style={{ flexShrink: 0 }}>
                    <Link
                      href={notif.actionHref}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.72rem",
                        fontWeight: "var(--fw-semibold)",
                        color: "var(--brand)",
                        textDecoration: "none",
                        padding: "4px 8px",
                        borderRadius: "var(--radius-sm)",
                        background: "transparent",
                        border: "none",
                        transition: "all var(--dur-fast)",
                      }}
                    >
                      {notif.actionLabel || "View"}
                      <ChevronRightIcon width={12} height={12} />
                    </Link>
                  </div>
                )}

                {/* Mark Read / Unread Toggle & Dismiss */}
                <div className="notif-item__controls" style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => toggleReadStatus(notif.id)}
                    title={notif.read ? "Mark as unread" : "Mark as read"}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: notif.read ? "var(--text-muted)" : "var(--brand)",
                      cursor: "pointer",
                      padding: "4px 6px",
                      borderRadius: "var(--radius-sm)",
                      display: "grid",
                      placeItems: "center",
                      transition: "color var(--dur-fast)",
                    }}
                  >
                    <CheckIcon width={14} height={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteNotification(notif.id)}
                    title="Remove notification"
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "4px 6px",
                      borderRadius: "var(--radius-sm)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "16px",
                      lineHeight: 1,
                      transition: "color var(--dur-fast)",
                    }}
                  >
                    &times;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

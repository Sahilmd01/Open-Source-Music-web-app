"use client";

import type { UserPreferences } from "./settings-types";

interface NotificationSettingsTabProps {
  prefs: UserPreferences;
  onUpdatePref: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
}

export function NotificationSettingsTab({ prefs, onUpdatePref }: NotificationSettingsTabProps) {
  const channels = [
    {
      key: "pushNewReleases" as const,
      title: "New Releases from Followed Artists",
      desc: "Instant push alert whenever artists you follow drop new singles or albums.",
    },
    {
      key: "pushPlaylistUpdates" as const,
      title: "Curated Playlist Refreshes",
      desc: "Weekly notifications when your subscribed playlists update track lineups.",
    },
    {
      key: "emailDigest" as const,
      title: "Weekly Listening Digest",
      desc: "An editorial email summary of your top played tracks and discovery radar.",
    },
  ];

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <div
        style={{
          background: "var(--bg-surface-2)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          border: "1px solid var(--border-subtle)",
          display: "grid",
          gap: "var(--space-5)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-semibold)", margin: 0, color: "var(--text-primary)" }}>
            Notification Channels
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
            Decide which updates trigger in-app alerts and mobile pushes.
          </p>
        </div>

        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          {channels.map((item) => (
            <div
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-surface-3)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <strong style={{ fontSize: "var(--fs-sm)", color: "var(--text-primary)" }}>
                  {item.title}
                </strong>
                <p style={{ margin: "2px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
                  {item.desc}
                </p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(prefs[item.key])}
                  onChange={(e) => onUpdatePref(item.key, e.target.checked)}
                />
                <span className="switch__track" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

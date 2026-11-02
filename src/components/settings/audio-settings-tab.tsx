"use client";

import type { UserPreferences } from "./settings-types";

interface AudioSettingsTabProps {
  prefs: UserPreferences;
  onUpdatePref: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
}

export function AudioSettingsTab({ prefs, onUpdatePref }: AudioSettingsTabProps) {
  const options = [
    {
      key: "normalizeAudio" as const,
      title: "Loudness Normalization",
      desc: "Set the same volume level across songs for balanced listening.",
    },
    {
      key: "gaplessPlayback" as const,
      title: "Gapless Playback",
      desc: "Eliminates silence between live concert cuts and concept album tracks.",
    },
    {
      key: "autoplayRelated" as const,
      title: "Autoplay Similar Tracks",
      desc: "Keeps the music going by automatically queueing similar artist recommendations.",
    },
    {
      key: "downloadsOverWifiOnly" as const,
      title: "Download Over Wi-Fi Only",
      desc: "Avoid cellular data usage for caching lossless master files.",
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
            Audio & Playback Controls
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
            Configure loudness normalization, continuous album playback, and network caching.
          </p>
        </div>

        {/* Toggle Options */}
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          {options.map((item) => (
            <div
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-3) var(--space-4)",
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

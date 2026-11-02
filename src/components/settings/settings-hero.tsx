"use client";

import { SettingsIcon } from "@/components/icons";

export function SettingsHero() {
  return (
    <section
      className="settings-hero"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6) var(--space-8)",
        minHeight: 150,
        display: "flex",
        alignItems: "center",
        gap: "var(--space-6)",
        background:
          "url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat",
        boxShadow: "var(--shadow-brand)",
        border: "1px solid var(--border-subtle)",
        color: "#ffffff",
      }}
    >
      <div
        className="settings-hero__icon"
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
        <SettingsIcon width={36} height={36} style={{ color: "var(--accent)" }} />
      </div>

      <div className="settings-hero__content" style={{ display: "flex", flexDirection: "column", gap: "4px", zIndex: 1 }}>
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
          Preferences & Configuration
        </span>
        <h1
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: "var(--fw-bold)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            margin: "2px 0 0",
            color: "#ffffff",
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
          }}
        >
          Settings
        </h1>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "var(--fs-xs)",
            maxWidth: 580,
            lineHeight: 1.45,
            color: "rgba(255, 255, 255, 0.9)",
          }}
        >
          Customize your playback acoustics, notification triggers, and data privacy options.
        </p>
      </div>
    </section>
  );
}

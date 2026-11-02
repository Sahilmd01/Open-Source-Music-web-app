"use client";

interface SongsBannerProps {
  activeTab: "all" | "favorites";
  songCount: number;
  durationFormatted: string;
}

export function SongsBanner({ activeTab, songCount, durationFormatted }: SongsBannerProps) {
  const isFavorites = activeTab === "favorites";
  const title = isFavorites ? "Favorite Songs" : "All Songs";

  return (
    <header
      className="songs-banner"
      style={{
        position: "relative",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        padding: "var(--space-8) var(--space-6)",
        background:
          "url('/default/default-songs-banner.png') center/cover no-repeat",
        border: "1px solid var(--border-default)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        gap: "var(--space-6)",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Cover Art Artwork with 3D Depth Shadow */}
      <div
        className="songs-banner__cover"
        style={{
          width: 170,
          height: 170,
          flexShrink: 0,
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.5)",
          background: "var(--bg-surface-3)",
        }}
      >
        <img
          src="/default/default-songs-avatar.png"
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Info Details */}
      <div className="songs-banner__info" style={{ flex: "1 1 320px", display: "grid", gap: "var(--space-2)" }}>
        <span
          className="songs-banner__tag"
          style={{
            textTransform: "uppercase",
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            fontWeight: "var(--fw-bold)",
            color: "#000000",
            padding: "3px 10px",
            borderRadius: "var(--radius-pill)",
            background: "rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0, 0, 0, 0.15)",
            width: "fit-content",
          }}
        >
          {isFavorites ? "Personal Collection" : "Music Library"}
        </span>

        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            fontWeight: "var(--fw-bold)",
            letterSpacing: "-0.02em",
            margin: 0,
            color: "#000000",
            lineHeight: 1.15,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: "var(--fs-md)",
            color: "#000000",
            fontWeight: "var(--fw-medium)",
          }}
        >
          Your complete personal sound library and curated tracks.
        </p>

        {/* Meta details */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            fontSize: "var(--fs-xs)",
            color: "#000000",
            marginTop: "var(--space-2)",
          }}
        >
          <span style={{ color: "#000000", fontWeight: "var(--fw-semibold)" }}>
            You
          </span>
          <span>•</span>
          <span>{songCount} songs</span>
          <span>•</span>
          <span>{durationFormatted}</span>
        </div>
      </div>
    </header>
  );
}

"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton for song rows (used in Songs page, Playlist detail, Album detail, etc.) */
export function SongRowSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 40px 1.4fr 1fr 1fr 1fr 36px 36px 50px",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "8px 12px",
        borderRadius: "var(--radius-sm)",
      }}
    >
      <Skeleton style={{ width: 18, height: 14, borderRadius: 4 }} />
      <Skeleton style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)" }} />
      <Skeleton style={{ width: "65%", height: 16, borderRadius: 4 }} />
      <Skeleton style={{ width: "50%", height: 14, borderRadius: 4 }} />
      <Skeleton style={{ width: "45%", height: 14, borderRadius: 4 }} />
      <Skeleton style={{ width: "40%", height: 14, borderRadius: 4 }} />
      <Skeleton style={{ width: 20, height: 20, borderRadius: 6, margin: "0 auto" }} />
      <Skeleton style={{ width: 20, height: 20, borderRadius: 6, margin: "0 auto" }} />
      <Skeleton style={{ width: 36, height: 14, borderRadius: 4, marginLeft: "auto" }} />
    </div>
  );
}

/** Skeleton for full Songs table with header */
export function SongsTableSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div style={{ display: "grid", gap: "var(--space-2)" }}>
      {/* Table header skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "36px 40px 1.4fr 1fr 1fr 1fr 36px 36px 50px",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "8px 12px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <Skeleton style={{ width: 14, height: 12, borderRadius: 3 }} />
        <span />
        <Skeleton style={{ width: 45, height: 12, borderRadius: 3 }} />
        <Skeleton style={{ width: 45, height: 12, borderRadius: 3 }} />
        <Skeleton style={{ width: 45, height: 12, borderRadius: 3 }} />
        <Skeleton style={{ width: 80, height: 12, borderRadius: 3 }} />
        <span />
        <span />
        <Skeleton style={{ width: 16, height: 16, borderRadius: 4, marginLeft: "auto" }} />
      </div>

      {/* Row skeletons */}
      <div style={{ display: "grid", gap: "2px" }}>
        {Array.from({ length: count }, (_, i) => (
          <SongRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton for Songs Page */
export function SongsPageSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }} aria-busy="true">
      {/* Hero Banner skeleton */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-6)",
          padding: "var(--space-8) var(--space-6)",
          borderRadius: "var(--radius-xl)",
          background: "var(--bg-surface-2)",
          minHeight: 220,
        }}
      >
        <Skeleton style={{ width: 170, height: 170, borderRadius: "var(--radius-lg)", flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "100%", maxWidth: 500 }}>
          <Skeleton style={{ width: 90, height: 18, borderRadius: "var(--radius-pill)" }} />
          <Skeleton style={{ width: "80%", height: 38, borderRadius: 8 }} />
          <Skeleton style={{ width: "60%", height: 16, borderRadius: 6 }} />
          <Skeleton style={{ width: 160, height: 14, borderRadius: 4 }} />
        </div>
      </div>

      {/* Controls Bar skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <Skeleton style={{ width: 52, height: 52, borderRadius: "50%" }} />
          <Skeleton style={{ width: 120, height: 38, borderRadius: "var(--radius-pill)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Skeleton style={{ width: 160, height: 38, borderRadius: "var(--radius-pill)" }} />
          <Skeleton style={{ width: 220, height: 38, borderRadius: "var(--radius-pill)" }} />
        </div>
      </div>

      {/* Songs Table Skeleton */}
      <SongsTableSkeleton count={8} />
    </div>
  );
}

/** Skeleton for Media Cards (Playlists / Albums grid) */
export function MediaCardSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        padding: "var(--space-3)",
        borderRadius: "var(--radius-lg)",
        background: "var(--bg-surface)",
      }}
    >
      <Skeleton style={{ width: "100%", aspectRatio: "1", borderRadius: "var(--radius-md)" }} />
      <Skeleton style={{ width: "75%", height: 16, borderRadius: 4 }} />
      <Skeleton style={{ width: "50%", height: 13, borderRadius: 4 }} />
    </div>
  );
}

/** Skeleton for Media Grid (Playlists / Albums Browse Page) */
export function MediaGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="media-grid" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for Playlists list page */
export function PlaylistsPageSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }} aria-busy="true">
      {/* Header Skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Skeleton style={{ width: 180, height: 32, borderRadius: 6 }} />
          <Skeleton style={{ width: 260, height: 14, borderRadius: 4 }} />
        </div>
        <Skeleton style={{ width: 150, height: 42, borderRadius: "var(--radius-pill)" }} />
      </div>

      {/* Search and Filter Skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Skeleton style={{ width: 90, height: 36, borderRadius: "var(--radius-pill)" }} />
          <Skeleton style={{ width: 120, height: 36, borderRadius: "var(--radius-pill)" }} />
        </div>
        <Skeleton style={{ width: 240, height: 40, borderRadius: "var(--radius-pill)" }} />
      </div>

      {/* Cards Grid */}
      <MediaGridSkeleton count={8} />
    </div>
  );
}

/** Skeleton for Albums list page */
export function AlbumsPageSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }} aria-busy="true">
      {/* Header Skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Skeleton style={{ width: 180, height: 32, borderRadius: 6 }} />
          <Skeleton style={{ width: 280, height: 14, borderRadius: 4 }} />
        </div>
        <Skeleton style={{ width: 140, height: 42, borderRadius: "var(--radius-pill)" }} />
      </div>

      {/* Search and Filter Skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Skeleton style={{ width: 90, height: 36, borderRadius: "var(--radius-pill)" }} />
          <Skeleton style={{ width: 110, height: 36, borderRadius: "var(--radius-pill)" }} />
        </div>
        <Skeleton style={{ width: 240, height: 40, borderRadius: "var(--radius-pill)" }} />
      </div>

      {/* Cards Grid */}
      <MediaGridSkeleton count={8} />
    </div>
  );
}

/** Skeleton for Artists Media Grid (5 per row) */
export function ArtistsMediaGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="media-grid media-grid--artists" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for Artists list page */
export function ArtistsPageSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }} aria-busy="true">
      {/* Header Skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Skeleton style={{ width: 180, height: 32, borderRadius: 6 }} />
          <Skeleton style={{ width: 320, height: 14, borderRadius: 4 }} />
        </div>
      </div>

      {/* Search and Filter Skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Skeleton style={{ width: 90, height: 36, borderRadius: "var(--radius-pill)" }} />
          <Skeleton style={{ width: 90, height: 36, borderRadius: "var(--radius-pill)" }} />
        </div>
        <Skeleton style={{ width: 240, height: 40, borderRadius: "var(--radius-pill)" }} />
      </div>

      {/* Artists Grid */}
      <ArtistsMediaGridSkeleton count={10} />
    </div>
  );
}

/** Skeleton for Detail Pages (Playlist detail, Album detail, Artist detail) */
export function DetailPageSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }} aria-busy="true">
      {/* Hero Banner Skeleton */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-6)",
          padding: "var(--space-8) var(--space-6)",
          borderRadius: "var(--radius-xl)",
          background: "var(--bg-surface-2)",
          minHeight: 220,
        }}
      >
        <Skeleton style={{ width: 170, height: 170, borderRadius: "var(--radius-lg)", flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "100%", maxWidth: 500 }}>
          <Skeleton style={{ width: 80, height: 16, borderRadius: "var(--radius-pill)" }} />
          <Skeleton style={{ width: "80%", height: 38, borderRadius: 8 }} />
          <Skeleton style={{ width: "60%", height: 16, borderRadius: 6 }} />
          <Skeleton style={{ width: 180, height: 14, borderRadius: 4 }} />
        </div>
      </div>

      {/* Action Controls Skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Skeleton style={{ width: 130, height: 42, borderRadius: "var(--radius-pill)" }} />
          <Skeleton style={{ width: 110, height: 42, borderRadius: "var(--radius-pill)" }} />
          <Skeleton style={{ width: 42, height: 42, borderRadius: "50%" }} />
        </div>
        <Skeleton style={{ width: 240, height: 38, borderRadius: "var(--radius-pill)" }} />
      </div>

      {/* Songs Table Skeleton */}
      <SongsTableSkeleton count={6} />
    </div>
  );
}

/** Skeleton for Home / Browse Page */
export function BrowsePageSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }} aria-busy="true">
      {/* Hero banner skeleton */}
      <Skeleton style={{ height: 260, borderRadius: "var(--radius-xl)" }} />

      {/* Popular Artists */}
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Skeleton style={{ width: 140, height: 24, borderRadius: 6 }} />
          <Skeleton style={{ width: 60, height: 16, borderRadius: 4 }} />
        </div>
        <div className="grid-artists">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
              <Skeleton style={{ width: 100, height: 100, borderRadius: "50%" }} />
              <Skeleton style={{ width: 70, height: 14, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Trending Playlists */}
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Skeleton style={{ width: 160, height: 24, borderRadius: 6 }} />
          <Skeleton style={{ width: 60, height: 16, borderRadius: 4 }} />
        </div>
        <MediaGridSkeleton count={5} />
      </div>

      {/* Popular Songs Table */}
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Skeleton style={{ width: 130, height: 24, borderRadius: 6 }} />
          <Skeleton style={{ width: 60, height: 16, borderRadius: 4 }} />
        </div>
        <SongsTableSkeleton count={4} />
      </div>
    </div>
  );
}

/** Skeleton for single user card */
export function UserCardSkeleton() {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Banner */}
      <Skeleton style={{ width: "100%", height: 80, borderRadius: 0 }} />

      {/* Body */}
      <div style={{ padding: "0 var(--space-4) var(--space-4)", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Floating Avatar + stats */}
        <div style={{ marginTop: -32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Skeleton style={{ width: 64, height: 64, borderRadius: "50%", border: "3px solid var(--bg-surface)" }} />
          <Skeleton style={{ width: 70, height: 14, borderRadius: 4 }} />
        </div>

        {/* Name */}
        <Skeleton style={{ width: "60%", height: 18, borderRadius: 4 }} />
        {/* Username */}
        <Skeleton style={{ width: "35%", height: 12, borderRadius: 4 }} />
        {/* Bio */}
        <Skeleton style={{ width: "90%", height: 12, borderRadius: 4, marginTop: 4 }} />

        {/* Action Button */}
        <Skeleton style={{ width: "100%", height: 34, borderRadius: "var(--radius-pill)", marginTop: 8 }} />
      </div>
    </div>
  );
}

/** Grid of user card skeletons */
export function UsersGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
        gap: "var(--space-5)",
      }}
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Full page skeleton for user details profile page */
export function UserProfilePageSkeleton() {
  return (
    <div className="page-container" style={{ paddingBottom: "var(--space-10)" }} aria-busy="true">
      {/* Hero Banner Skeleton */}
      <div
        style={{
          width: "100%",
          height: 220,
          borderRadius: "var(--radius-xl)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid var(--border-subtle)",
          marginBottom: "var(--space-6)",
        }}
      >
        <Skeleton style={{ width: "100%", height: "100%", borderRadius: 0 }} />
        {/* Floating Avatar + Name Placeholder */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 24,
            right: 24,
            display: "flex",
            alignItems: "flex-end",
            gap: "var(--space-4)",
            zIndex: 2,
          }}
        >
          <Skeleton
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              border: "3.5px solid var(--bg-surface)",
              flexShrink: 0,
            }}
          />
          <div style={{ display: "grid", gap: "6px", flex: 1 }}>
            <Skeleton style={{ width: 180, height: 26, borderRadius: 6 }} />
            <Skeleton style={{ width: 140, height: 16, borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {/* Bio */}
        <div style={{ display: "grid", gap: "6px", maxWidth: 650 }}>
          <Skeleton style={{ width: "100%", height: 14, borderRadius: 4 }} />
          <Skeleton style={{ width: "80%", height: 14, borderRadius: 4 }} />
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--space-4)",
            padding: "var(--space-4) 0",
            borderTop: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{ display: "grid", gap: "6px" }}>
              <Skeleton style={{ width: 60, height: 12, borderRadius: 3 }} />
              <Skeleton style={{ width: 90, height: 20, borderRadius: 4 }} />
            </div>
          ))}
        </div>

        {/* Playlists Grid Skeleton */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <Skeleton style={{ width: 160, height: 22, borderRadius: 6 }} />
            <Skeleton style={{ width: 90, height: 14, borderRadius: 4 }} />
          </div>
          <div className="media-grid">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} style={{ display: "grid", gap: "8px" }}>
                <Skeleton style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: "var(--radius-lg)" }} />
                <Skeleton style={{ width: "70%", height: 14, borderRadius: 4 }} />
                <Skeleton style={{ width: "50%", height: 12, borderRadius: 4 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



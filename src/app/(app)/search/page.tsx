"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { CoverArt } from "@/components/ui/cover-art";
import { SongsTable } from "@/components/songs";
import { MediaCard } from "@/components/features/media-card";
import { PlayIcon, SearchIcon, SpinnerIcon } from "@/components/icons";
import { usePlayerStore } from "@/stores/player-store";
import { formatTime } from "@/lib/format";
import type { Track, Artist, Album, Playlist } from "@/types/music";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "songs" | "artists" | "albums" | "playlists">("all");

  const playTrack = usePlayerStore((s) => s.playTrack);
  const playContextTrack = usePlayerStore((s) => s.playContextTrack);
  const toggleLike = usePlayerStore((s) => s.toggleLike);
  const likedIds = usePlayerStore((s) => s.likedIds);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const currentTrackId = queue[currentIndex]?.id;

  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSongs([]);
      setArtists([]);
      setAlbums([]);
      setPlaylists([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.success) {
        setSongs(data.songs || []);
        setArtists(
          (data.artists || []).map((a: any) => ({
            id: a.id,
            name: a.name,
            image: a.avatarUrl || a.image,
            bannerUrl: a.bannerUrl,
            bio: a.bio,
            followers: a.followers,
            hue: a.hue || 220,
          }))
        );
        setAlbums(
          (data.albums || []).map((al: any) => ({
            id: al.id,
            title: al.title,
            artist: al.artist,
            year: al.year || new Date().getFullYear(),
            coverImage: al.coverUrl || al.coverImage,
            bannerUrl: al.bannerUrl,
            hue: al.hue || 200,
          }))
        );
        setPlaylists(
          (data.playlists || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description || "",
            coverImage: p.coverUrl || p.coverImage,
            logo: p.bannerUrl || p.logo,
            songCount: p.songsCount || 0,
            likes: p.likes || 0,
            durationLabel: "",
            hue: p.hue || 280,
            creator: p.creator || "Listenify",
          }))
        );
      }
    } catch (e) {
      console.error("Search fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const hasResults = songs.length > 0 || artists.length > 0 || albums.length > 0 || playlists.length > 0;
  const topResult = songs[0] || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", paddingBottom: "var(--space-8)" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)", margin: 0 }}>
          {query ? `Search results for "${query}"` : "Search"}
        </h1>
        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "var(--fs-sm)" }}>
          {loading ? "Searching catalog..." : query ? `Found matches across songs, artists, albums, and playlists` : "Type a query in the top search bar to find songs, artists, and albums"}
        </p>
      </div>

      {/* Tabs */}
      {query && (
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", overflowX: "auto" }}>
          {[
            { id: "all", label: "All" },
            { id: "songs", label: `Songs (${songs.length})` },
            { id: "artists", label: `Artists (${artists.length})` },
            { id: "albums", label: `Albums (${albums.length})` },
            { id: "playlists", label: `Playlists (${playlists.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className="btn btn--sm"
              style={{
                borderRadius: "var(--radius-pill)",
                background: activeTab === tab.id ? "var(--brand)" : "var(--bg-surface-2)",
                color: activeTab === tab.id ? "var(--text-on-brand)" : "var(--text-primary)",
                border: "1px solid " + (activeTab === tab.id ? "var(--brand)" : "var(--border-default)"),
                fontWeight: activeTab === tab.id ? "var(--fw-bold)" : "var(--fw-medium)",
                cursor: "pointer",
                padding: "6px 16px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "260px", gap: "10px" }}>
          <SpinnerIcon width={24} height={24} style={{ color: "var(--brand)" }} />
          <span style={{ color: "var(--text-muted)", fontSize: "var(--fs-sm)" }}>Loading results...</span>
        </div>
      ) : !query ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "280px", textAlign: "center", gap: "12px" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-surface-2)", display: "grid", placeItems: "center", color: "var(--text-muted)" }}>
            <SearchIcon width={26} height={26} />
          </div>
          <h2 style={{ fontSize: "var(--fs-lg)", margin: 0 }}>Search Listenify</h2>
          <p className="text-muted" style={{ maxWidth: 400, fontSize: "var(--fs-sm)", margin: 0 }}>
            Find your favorite songs, artists, albums, and curated playlists using the search bar above.
          </p>
        </div>
      ) : !hasResults ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "280px", textAlign: "center", gap: "12px" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-surface-2)", display: "grid", placeItems: "center", color: "var(--text-muted)" }}>
            <SearchIcon width={26} height={26} />
          </div>
          <h2 style={{ fontSize: "var(--fs-lg)", margin: 0 }}>No results found for &ldquo;{query}&rdquo;</h2>
          <p className="text-muted" style={{ maxWidth: 440, fontSize: "var(--fs-sm)", margin: 0 }}>
            Please make sure words are spelled correctly or try using different or fewer keywords.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
          {/* Top Result + Songs (when on 'all' tab) */}
          {(activeTab === "all" || activeTab === "songs") && (
            <section>
              <div style={{ display: "grid", gridTemplateColumns: activeTab === "all" && topResult ? "300px 1fr" : "1fr", gap: "var(--space-5)" }}>
                {activeTab === "all" && topResult && (
                  <div>
                    <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", marginBottom: "var(--space-3)" }}>Top Result</h2>
                    <div
                      style={{
                        background: "var(--bg-surface-2)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-4)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        position: "relative",
                        transition: "background var(--dur-fast)",
                      }}
                    >
                      <div style={{ width: 92, height: 92, borderRadius: "var(--radius-sm)", overflow: "hidden", position: "relative" }}>
                        <CoverArt src={topResult.coverImage} size={92} hue={topResult.hue || 24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", margin: "0 0 4px" }}>{topResult.title}</h3>
                        <p className="text-muted" style={{ fontSize: "var(--fs-sm)", margin: 0 }}>
                          Song • <Link href={`/artists/${encodeURIComponent(topResult.artist)}`} style={{ color: "var(--text-primary)", textDecoration: "none" }}>{topResult.artist}</Link>
                        </p>
                      </div>
                      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          style={{ borderRadius: "var(--radius-pill)", display: "inline-flex", alignItems: "center", gap: "6px" }}
                          onClick={() => playContextTrack(topResult, songs)}
                        >
                          <PlayIcon width={14} height={14} /> Play
                        </button>
                        <span className="text-muted" style={{ fontSize: "var(--fs-xs)" }}>{formatTime(topResult.duration)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", marginBottom: "var(--space-3)" }}>Songs</h2>
                  {songs.length > 0 ? (
                    <SongsTable
                      tracks={activeTab === "all" ? songs.slice(0, 5) : songs}
                      currentTrackId={currentTrackId}
                      isPlaying={isPlaying}
                      likedIds={likedIds}
                      onPlayTrack={(track) => playContextTrack(track, activeTab === "all" ? songs.slice(0, 5) : songs)}
                      onToggleLike={toggleLike}
                    />
                  ) : (
                    <p className="text-muted" style={{ fontSize: "var(--fs-sm)" }}>No songs match your query.</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Artists */}
          {(activeTab === "all" || activeTab === "artists") && artists.length > 0 && (
            <section>
              <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", marginBottom: "var(--space-3)" }}>Artists</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "var(--space-4)" }}>
                {artists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artists/${encodeURIComponent(artist.id)}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      style={{
                        background: "var(--bg-surface-2)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-4)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: "10px",
                        transition: "transform var(--dur-fast), background var(--dur-fast)",
                      }}
                    >
                      <div style={{ width: 100, height: 100, borderRadius: "50%", overflow: "hidden", position: "relative" }}>
                        <CoverArt src={artist.image} rounded="full" size={100} hue={artist.hue || 220} />
                      </div>
                      <div style={{ width: "100%", overflow: "hidden" }}>
                        <p style={{ fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)", margin: 0, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {artist.name}
                        </p>
                        <p className="text-muted" style={{ fontSize: "var(--fs-xs)", margin: "2px 0 0" }}>Artist</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {(activeTab === "all" || activeTab === "albums") && albums.length > 0 && (
            <section>
              <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", marginBottom: "var(--space-3)" }}>Albums</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "var(--space-4)" }}>
                {albums.map((al) => (
                  <MediaCard
                    key={al.id}
                    title={al.title}
                    subtitle={al.artist}
                    src={al.coverImage}
                    hue={al.hue || 200}
                    href={`/albums/${encodeURIComponent(al.id)}`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {(activeTab === "all" || activeTab === "playlists") && playlists.length > 0 && (
            <section>
              <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", marginBottom: "var(--space-3)" }}>Playlists</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "var(--space-4)" }}>
                {playlists.map((pl) => (
                  <MediaCard
                    key={pl.id}
                    title={pl.title}
                    subtitle={`By ${(pl as any).creator || "Listenify"}`}
                    src={pl.coverImage}
                    hue={pl.hue || 280}
                    href={`/playlists/${encodeURIComponent(pl.id)}`}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: "var(--space-6)" }}>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}

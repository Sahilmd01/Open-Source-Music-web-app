"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { SearchIcon, HeartFilledIcon, SpinnerIcon, HeartIcon } from "@/components/icons";
import { MediaCard } from "@/components/features/media-card";
import { PageHeader } from "@/components/layout/page-header";
import { usePlayerStore } from "@/stores/player-store";
import Loading from "./loading";
import type { Artist } from "@/types/music";

const ARTIST_FAVS_STORAGE_KEY = "my_favorite_artists_v1";

const PAGE_SIZE = 30;

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "fav">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedArtistIds, setLikedArtistIds] = useState<string[]>([]);
  const playTrack = usePlayerStore((s) => s.playTrack);

  // Fetch initial batch of 30 artists or on search change
  const fetchArtists = useCallback(async (isInitial = false, currentOffset = 0, query = "") => {
    if (isInitial) {
      if (currentOffset === 0 && !query) {
        // Only show initial skeleton on brand new first mount with no query
        setIsInitialLoading((prev) => prev);
      } else {
        setIsSearching(true);
      }
    } else {
      setIsLoadingMore(true);
    }

    try {
      const q = query.trim();
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(currentOffset),
      });
      if (q) params.set("search", q);

      const res = await fetch(`/api/control/artists?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.artists)) {
        const liveArtists: Artist[] = data.artists.map((a: any) => ({
          id: a.id,
          name: a.name,
          hue: a.hue || 220,
          image: a.avatarUrl || undefined,
          bannerUrl: a.bannerUrl || undefined,
          bio: a.genre || a.bio || undefined,
          followers: a.followers || 0,
        }));

        setArtists((prev) => (isInitial ? liveArtists : [...prev, ...liveArtists]));
        setHasMore(data.hasMore ?? liveArtists.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Failed to fetch artists from database:", err);
    } finally {
      setIsInitialLoading(false);
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial load and whenever search query changes (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchArtists(true, 0, searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery, fetchArtists]);

  // Trigger loading next 30 items
  const loadMore = useCallback(() => {
    if (isInitialLoading || isSearching || isLoadingMore || !hasMore) return;
    fetchArtists(false, artists.length, searchQuery);
  }, [isInitialLoading, isSearching, isLoadingMore, hasMore, artists.length, searchQuery, fetchArtists]);

  // IntersectionObserver to detect when bottom sentinel comes into view
  useEffect(() => {
    if (!hasMore || isInitialLoading || isSearching || isLoadingMore) return;

    const sentinel = document.getElementById("artists-bottom-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isInitialLoading, isSearching, isLoadingMore, loadMore]);

  // Load liked artist IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ARTIST_FAVS_STORAGE_KEY);
      if (stored) {
        setLikedArtistIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleLike = (artistId: string) => {
    setLikedArtistIds((prev) => {
      const next = prev.includes(artistId)
        ? prev.filter((id) => id !== artistId)
        : [...prev, artistId];
      try {
        localStorage.setItem(ARTIST_FAVS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Base list depending on active tab
  const tabArtists = useMemo(() => {
    if (activeTab === "fav") {
      return artists.filter((a) => likedArtistIds.includes(a.id));
    }
    return artists;
  }, [artists, activeTab, likedArtistIds]);

  // Apply search query filter
  const filteredArtists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tabArtists;
    return tabArtists.filter((a) => a.name.toLowerCase().includes(q));
  }, [tabArtists, searchQuery]);

  if (isInitialLoading) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader
        title="Artists"
        description="Explore artists you follow and discover new voices"
      />

      {/* Tabs and Search Bar Controls Toolbar */}
      <div
        className="artists-toolbar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
          marginBottom: "var(--space-6)",
        }}
      >
        {/* Navigation Tabs (No number counts) */}
        <div className="segmented" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "all"}
            className={activeTab === "all" ? "is-active" : ""}
            onClick={() => setActiveTab("all")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            All Artists
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "fav"}
            className={activeTab === "fav" ? "is-active" : ""}
            onClick={() => setActiveTab("fav")}
            style={{ fontWeight: "var(--fw-medium)" }}
          >
            My Fav
          </button>
        </div>

        {/* Search Input Bar */}
        <div
          className="artists-toolbar__search"
          style={{
            position: "relative",
            minWidth: 240,
            maxWidth: 320,
            flex: "1 1 240px",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "var(--space-3)",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <SearchIcon width={16} height={16} />
          </span>
          <input
            type="text"
            className="input"
            placeholder={
              activeTab === "fav" ? "Search favorite artists..." : "Search artists..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: "calc(var(--space-3) + 22px)",
              paddingRight: isSearching ? "calc(var(--space-3) + 22px)" : "var(--space-3)",
              height: 38,
              fontSize: "var(--fs-sm)",
              borderRadius: "var(--radius-pill)",
              background: "var(--bg-surface-2)",
            }}
          />
          {isSearching && (
            <span
              style={{
                position: "absolute",
                right: "var(--space-3)",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--brand)",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              <SpinnerIcon width={16} height={16} />
            </span>
          )}
        </div>
      </div>

      {/* Artists Grid or Empty State */}
      {isSearching && filteredArtists.length === 0 ? (
        <div style={{ padding: "var(--space-10) var(--space-4)", textAlign: "center", color: "var(--text-muted)" }}>
          <div
            className="loading-spinner"
            style={{
              width: 24,
              height: 24,
              margin: "0 auto var(--space-3)",
              borderRadius: "50%",
              border: "2px solid var(--border-subtle)",
              borderTopColor: "var(--brand)",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p className="text-small" style={{ margin: 0 }}>Searching artists...</p>
        </div>
      ) : filteredArtists.length > 0 ? (
        <div style={{ opacity: isSearching ? 0.6 : 1, transition: "opacity 0.15s ease" }}>
          <div className="media-grid media-grid--artists">
            {filteredArtists.map((artist) => (
              <MediaCard
                key={artist.id}
                title={artist.name}
                subtitle={artist.bio || `${artist.followers || 0} followers`}
                hue={artist.hue}
                src={artist.image}
                href={`/artists/${encodeURIComponent(artist.id)}`}
                actions={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleLike(artist.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "var(--space-1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: likedArtistIds.includes(artist.id)
                        ? "var(--brand)"
                        : "var(--text-muted)",
                      transition: "color 0.2s ease",
                    }}
                    title={
                      likedArtistIds.includes(artist.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {likedArtistIds.includes(artist.id) ? (
                      <HeartFilledIcon width={18} height={18} />
                    ) : (
                      <HeartIcon width={18} height={18} />
                    )}
                  </button>
                }
              />
            ))}
          </div>

          {/* Infinite Scroll Bottom Sentinel */}
          <div
            id="artists-bottom-sentinel"
            style={{
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "var(--space-4)",
            }}
          >
            {isLoadingMore && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  color: "var(--text-muted)",
                  fontSize: "var(--fs-sm)",
                }}
              >
                <div
                  className="loading-spinner"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: "2px solid var(--border-subtle)",
                    borderTopColor: "var(--brand)",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span>Loading more artists...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "var(--space-10) var(--space-4)",
            textAlign: "center",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--border-default)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "var(--bg-surface-2)",
              display: "grid",
              placeItems: "center",
              color: "var(--brand)",
            }}
          >
            {activeTab === "fav" ? (
              <HeartFilledIcon width={24} height={24} />
            ) : (
              <SearchIcon width={24} height={24} />
            )}
          </div>

          <div>
            <h3
              style={{
                fontSize: "var(--fs-lg)",
                fontWeight: "var(--fw-semibold)",
                marginBottom: 4,
              }}
            >
              {activeTab === "fav" && likedArtistIds.length === 0
                ? "No favorite artists yet"
                : "No artists found"}
            </h3>
            <p className="text-muted text-small" style={{ margin: 0, maxWidth: 380 }}>
              {activeTab === "fav" && likedArtistIds.length === 0
                ? "Click the heart on any artist avatar to add them to your favorites."
                : `No artists matching "${searchQuery}". Try searching with a different name.`}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { ArtistList } from "@/components/features/artist-list";
import { HeroBanner } from "@/components/features/hero-banner";
import { MediaCard } from "@/components/features/media-card";
import { SectionHeader } from "@/components/features/section-header";
import { TrackList } from "@/components/features/track-list";
import { BrowsePageSkeleton } from "@/components/skeletons";
import { getPlaylistSongCount } from "@/hooks/use-playlist-track-manager";
import type { Artist, Album, Playlist, Track } from "@/types/music";

export default function BrowsePage() {
  const [songs, setSongs] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBrowseData = useCallback(async () => {
    try {
      const [songsRes, artistsRes, albumsRes, playlistsRes] = await Promise.all([
        fetch("/api/control/songs?sortBy=likes&limit=30").then((r) => r.json()).catch(() => ({ songs: [] })),
        fetch("/api/control/artists?sortBy=likes&limit=20").then((r) => r.json()).catch(() => ({ artists: [] })),
        fetch("/api/control/albums?sortBy=likes&limit=20").then((r) => r.json()).catch(() => ({ albums: [] })),
        fetch("/api/control/playlists?sortBy=likes&limit=20").then((r) => r.json()).catch(() => ({ playlists: [] })),
      ]);

      if (songsRes.success && Array.isArray(songsRes.songs)) {
        setSongs(
          songsRes.songs.map((s: any) => ({
            id: s.id,
            title: s.title,
            artist: s.artist,
            album: s.album,
            duration: s.duration || 180,
            coverImage: s.coverImage,
            hue: s.hue || 24,
            uploadedBy: s.uploadedBy,
            audioUrl: s.audioUrl,
            likesCount: Number(s.likesCount || 0),
            playsCount: Number(s.plays || 0),
          }))
        );
      }

      if (artistsRes.success && Array.isArray(artistsRes.artists)) {
        setArtists(
          artistsRes.artists.map((a: any) => ({
            id: a.id,
            name: a.name,
            hue: a.hue || 220,
            image: a.avatarUrl,
            songCount: Number(a.songsCount || 0),
            totalLikes: Number(a.totalLikes || 0),
          }))
        );
      }

      if (albumsRes.success && Array.isArray(albumsRes.albums)) {
        setAlbums(
          albumsRes.albums.map((al: any) => ({
            id: al.id,
            title: al.title,
            artist: al.artist || "Various Artists",
            year: al.year || new Date().getFullYear(),
            coverImage: al.coverUrl,
            hue: al.hue || 220,
            songCount: Number(al.songsCount || 0),
            totalLikes: Number(al.totalLikes || 0),
          }))
        );
      }

      if (playlistsRes.success && Array.isArray(playlistsRes.playlists)) {
        setPlaylists(
          playlistsRes.playlists.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description || "",
            logo: p.coverUrl,        // coverUrl = avatar/logo
            coverImage: p.bannerUrl, // bannerUrl = banner
            songCount: getPlaylistSongCount(p.id, p.songsCount || 0),
            likes: Number(p.totalLikes || p.likes || 0),
            durationLabel: "0 min",
            isCustom: true,
            hue: p.hue || 280,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch browse page data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);

  const loadRecentlyPlayed = useCallback(() => {
    try {
      const stored = localStorage.getItem("recently_played_tracks_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Strictly deduplicate by ID and Title+Artist
          const seen = new Set<string>();
          const unique: Track[] = [];

          for (const item of parsed) {
            if (!item) continue;
            const keyById = item.id ? `id:${item.id}` : null;
            const keyByName = item.title && item.artist
              ? `name:${item.title.trim().toLowerCase()}:${item.artist.trim().toLowerCase()}`
              : null;

            if ((keyById && seen.has(keyById)) || (keyByName && seen.has(keyByName))) {
              continue; // duplicate found, skip it
            }

            if (keyById) seen.add(keyById);
            if (keyByName) seen.add(keyByName);
            unique.push(item);
          }

          // If duplicates were found in storage, clean them up in localStorage
          if (unique.length !== parsed.length) {
            localStorage.setItem("recently_played_tracks_v1", JSON.stringify(unique));
          }

          setRecentlyPlayed(unique.slice(0, 10));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchBrowseData();
    loadRecentlyPlayed();

    // Listen for storage changes across tabs or window focus
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "recently_played_tracks_v1") {
        loadRecentlyPlayed();
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", loadRecentlyPlayed);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", loadRecentlyPlayed);
    };
  }, [fetchBrowseData, loadRecentlyPlayed]);

  if (isLoading) {
    return <BrowsePageSkeleton />;
  }

  return (
    <>
      {playlists.length > 0 && <HeroBanner playlists={playlists.slice(0, 10)} />}

      {/* Recently Played (Top 10) */}
      {recentlyPlayed.length > 0 && (
        <section className="section" aria-labelledby="recently-played">
          <SectionHeader title="Recently played" href="/recently-played" />
          <TrackList tracks={recentlyPlayed} label="Recently played" />
        </section>
      )}

      {/* Trending Artists */}
      {artists.length > 0 && (
        <section className="section" aria-labelledby="trending-artists">
          <SectionHeader title="Trending artists" href="/artists" />
          <ArtistList artists={artists.slice(0, 10)} />
        </section>
      )}

      {/* Trending Playlists */}
      {playlists.length > 0 && (
        <section className="section" aria-labelledby="trending-playlists">
          <SectionHeader title="Trending playlists" href="/playlists" />
          <div className="media-grid media-grid--playlists">
            {playlists.slice(0, 10).map((pl, idx) => (
              <div key={pl.id} className="media-item">
                <MediaCard
                  title={pl.title}
                  subtitle={
                    pl.likes > 0
                      ? `${pl.likes} ${pl.likes === 1 ? 'like' : 'likes'} · ${pl.songCount} songs`
                      : `${pl.songCount} songs · ${pl.durationLabel}`
                  }
                  hue={pl.hue ?? 24}
                  src={pl.logo || pl.coverImage}
                  href={`/playlists/${encodeURIComponent(pl.id)}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Albums */}
      {albums.length > 0 && (
        <section className="section" aria-labelledby="trending-albums">
          <SectionHeader title="Trending albums" href="/albums" />
          <div className="media-grid media-grid--albums">
            {albums.slice(0, 10).map((al, idx) => (
              <div key={al.id} className="media-item">
                <MediaCard
                  title={al.title}
                  subtitle={
                    (al.totalLikes ?? 0) > 0
                      ? `${al.totalLikes} ${(al.totalLikes === 1 ? 'like' : 'likes')} · ${al.artist}`
                      : `${al.artist} · ${al.year}`
                  }
                  hue={al.hue}
                  src={al.coverImage}
                  href={`/albums/${encodeURIComponent(al.id)}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Songs */}
      {songs.length > 0 && (
        <section className="section" aria-labelledby="trending-songs">
          <SectionHeader title="Trending songs" href="/songs" />
          <TrackList tracks={songs.slice(0, 30)} label="Trending songs" showLikesCount={true} />
        </section>
      )}

      {!isLoading && songs.length === 0 && artists.length === 0 && albums.length === 0 && playlists.length === 0 && (
        <div style={{ textAlign: "center", padding: "var(--space-12) var(--space-4)" }}>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)" }}>
            Welcome to Listenify
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-sm)", maxWidth: 440, margin: "8px auto 0" }}>
            Your platform library is ready. Use the Control Center to publish songs, artists, albums, and playlists.
          </p>
        </div>
      )}
    </>
  );
}

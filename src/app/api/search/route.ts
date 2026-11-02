import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({
        success: true,
        songs: [],
        artists: [],
        albums: [],
        playlists: [],
      });
    }

    const pattern = `%${q}%`;

    // 1. Search Songs
    const songsSql = `
      SELECT 
        t.id,
        t.title,
        COALESCE(a.name, 'Unknown Artist') AS artist,
        COALESCE(al.title, 'Single') AS album,
        COALESCE(t.duration, 180) AS duration,
        COALESCE(t.cover_image_url, al.cover_image_url) AS coverImage,
        t.audio_url AS audioUrl,
        COALESCE(t.hue, 24) AS hue,
        COALESCE(u.name, 'Official') AS uploadedBy
      FROM LI_TRACKS t
      LEFT JOIN LI_ARTISTS a ON t.artist_id = a.id
      LEFT JOIN LI_ALBUMS al ON t.album_id = al.id
      LEFT JOIN LI_USERS u ON t.uploaded_by = u.id
      WHERE (LOWER(t.title) LIKE LOWER(?) OR LOWER(COALESCE(a.name, '')) LIKE LOWER(?) OR LOWER(COALESCE(al.title, '')) LIKE LOWER(?))
        AND (t.is_active IS NULL OR t.is_active = 1)
      ORDER BY t.created_at DESC
      LIMIT 10
    `;

    // 2. Search Artists
    const artistsSql = `
      SELECT 
        a.id,
        a.name,
        COALESCE(a.bio, 'Artist') AS bio,
        COALESCE(a.monthly_listeners, 0) AS followers,
        a.image_url AS avatarUrl,
        a.banner_url AS bannerUrl,
        COALESCE(a.hue, 220) AS hue
      FROM LI_ARTISTS a
      WHERE (LOWER(a.name) LIKE LOWER(?) OR LOWER(COALESCE(a.bio, '')) LIKE LOWER(?))
        AND (a.is_active IS NULL OR a.is_active = 1)
      ORDER BY a.created_at DESC
      LIMIT 6
    `;

    // 3. Search Albums
    const albumsSql = `
      SELECT 
        al.id,
        al.title,
        COALESCE(a.name, 'Various Artists') AS artist,
        COALESCE(al.year, YEAR(CURRENT_DATE)) AS year,
        al.cover_image_url AS coverUrl,
        al.banner_url AS bannerUrl
      FROM LI_ALBUMS al
      LEFT JOIN LI_ARTISTS a ON al.artist_id = a.id
      WHERE (LOWER(al.title) LIKE LOWER(?) OR LOWER(COALESCE(a.name, '')) LIKE LOWER(?))
        AND (al.is_active IS NULL OR al.is_active = 1)
      ORDER BY al.created_at DESC
      LIMIT 6
    `;

    // 4. Search Playlists
    const playlistsSql = `
      SELECT 
        p.id,
        p.title,
        p.description,
        COALESCE(u.name, 'Editorial Team') AS creator,
        COALESCE(p.song_count, 0) AS songsCount,
        p.cover_image_url AS coverUrl,
        COALESCE(p.logo_url, p.cover_image_url) AS bannerUrl,
        COALESCE(p.hue, 280) AS hue
      FROM LI_PLAYLISTS p
      LEFT JOIN LI_USERS u ON p.owner_id = u.id
      WHERE (LOWER(p.title) LIKE LOWER(?) OR LOWER(COALESCE(p.description, '')) LIKE LOWER(?))
        AND (p.is_active IS NULL OR p.is_active = 1)
        AND (p.is_public IS NULL OR p.is_public = 1)
      ORDER BY p.created_at DESC
      LIMIT 6
    `;

    const [songs, artists, albums, playlists] = await Promise.all([
      query<any[]>(songsSql, [pattern, pattern, pattern]).catch(() => []),
      query<any[]>(artistsSql, [pattern, pattern]).catch(() => []),
      query<any[]>(albumsSql, [pattern, pattern]).catch(() => []),
      query<any[]>(playlistsSql, [pattern, pattern]).catch(() => []),
    ]);

    return NextResponse.json({
      success: true,
      songs: (songs || []).map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album,
        duration: s.duration || 180,
        coverImage: s.coverImage,
        audioUrl: s.audioUrl,
        audioSrc: s.audioUrl,
        hue: s.hue,
        uploadedBy: s.uploadedBy,
      })),
      artists: (artists || []).map((a) => ({
        id: a.id,
        name: a.name,
        bio: a.bio,
        followers: a.followers,
        avatarUrl: a.avatarUrl,
        bannerUrl: a.bannerUrl,
        hue: a.hue,
      })),
      albums: (albums || []).map((al) => ({
        id: al.id,
        title: al.title,
        artist: al.artist,
        year: al.year,
        coverUrl: al.coverUrl,
        bannerUrl: al.bannerUrl,
      })),
      playlists: (playlists || []).map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        creator: p.creator,
        songsCount: p.songsCount,
        coverUrl: p.coverUrl,
        bannerUrl: p.bannerUrl,
        hue: p.hue,
      })),
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform search', songs: [], artists: [], albums: [], playlists: [] },
      { status: 500 }
    );
  }
}

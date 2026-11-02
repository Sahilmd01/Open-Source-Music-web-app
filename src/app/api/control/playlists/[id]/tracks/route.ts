import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

let isTableChecked = false;

// Ensure LI_PLAYLIST_TRACKS or playlist_tracks exists
async function ensurePlaylistTracksTable() {
  if (isTableChecked) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS LI_PLAYLIST_TRACKS (
        id          CHAR(36)  NOT NULL,
        playlist_id CHAR(36)  NOT NULL,
        track_id    CHAR(36)  NOT NULL,
        position    INT       NOT NULL DEFAULT 0,
        added_by    CHAR(36)  DEFAULT NULL,
        added_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_li_playlist_track (playlist_id, track_id),
        KEY idx_li_pt_playlist_pos (playlist_id, position),
        KEY idx_li_pt_track (track_id)
      )
    `);
    isTableChecked = true;
  } catch (err: any) {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS playlist_tracks (
          id          CHAR(36)  NOT NULL,
          playlist_id CHAR(36)  NOT NULL,
          track_id    CHAR(36)  NOT NULL,
          position    INT       NOT NULL DEFAULT 0,
          added_by    CHAR(36)  DEFAULT NULL,
          added_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uk_playlist_track (playlist_id, track_id),
          KEY idx_pt_playlist_pos (playlist_id, position),
          KEY idx_pt_track (track_id)
        )
      `);
      isTableChecked = true;
    } catch {
      isTableChecked = true;
    }
  }
}

// GET /api/control/playlists/[id]/tracks - list tracks in a playlist
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensurePlaylistTracksTable();
    const resolvedParams = await params;
    const playlistId = resolvedParams?.id;

    if (!playlistId) {
      return NextResponse.json({ success: false, error: 'Missing playlist ID' }, { status: 400 });
    }

    // Try LI_PLAYLIST_TRACKS joined with LI_TRACKS
    const sql = `
      SELECT 
        t.id,
        t.title,
        COALESCE(a.name, 'Unknown Artist') AS artist,
        COALESCE(al.title, 'Single') AS album,
        COALESCE(t.duration, 180) AS duration,
        COALESCE(t.cover_image_url, al.cover_image_url) AS coverImage,
        t.audio_url AS audioUrl,
        COALESCE(t.hue, 24) AS hue,
        COALESCE(u.name, 'Official') AS uploadedBy,
        CASE WHEN t.is_active = 0 THEN 'inactive' ELSE 'active' END AS status,
        COALESCE(t.play_count, 0) AS plays,
        pt.position,
        pt.added_at AS addedAt
      FROM LI_PLAYLIST_TRACKS pt
      INNER JOIN LI_TRACKS t ON pt.track_id = t.id
      LEFT JOIN LI_ARTISTS a ON t.artist_id = a.id
      LEFT JOIN LI_ALBUMS al ON t.album_id = al.id
      LEFT JOIN LI_USERS u ON t.uploaded_by = u.id
      WHERE pt.playlist_id = ?
      ORDER BY pt.position ASC, pt.added_at DESC
    `;

    try {
      const rows = await query<any[]>(sql, [playlistId]);
      return NextResponse.json({ success: true, tracks: rows || [] });
    } catch (err: any) {
      console.warn('Querying LI_PLAYLIST_TRACKS failed, trying fallback playlist_tracks:', err.message);

      const fallbackSql = `
        SELECT 
          t.id,
          t.title,
          COALESCE(a.name, 'Unknown Artist') AS artist,
          COALESCE(al.title, 'Single') AS album,
          COALESCE(t.duration, 180) AS duration,
          COALESCE(t.cover_image_url, al.cover_image_url) AS coverImage,
          t.audio_url AS audioUrl,
          COALESCE(t.hue, 24) AS hue,
          COALESCE(u.name, 'Official') AS uploadedBy,
          CASE WHEN t.is_active = 0 THEN 'inactive' ELSE 'active' END AS status,
          COALESCE(t.play_count, 0) AS plays,
          pt.position,
          pt.added_at AS addedAt
        FROM playlist_tracks pt
        INNER JOIN tracks t ON pt.track_id = t.id
        LEFT JOIN artists a ON t.artist_id = a.id
        LEFT JOIN albums al ON t.album_id = al.id
        LEFT JOIN users u ON t.uploaded_by = u.id
        WHERE pt.playlist_id = ?
        ORDER BY pt.position ASC, pt.added_at DESC
      `;
      const fallbackRows = await query<any[]>(fallbackSql, [playlistId]);
      return NextResponse.json({ success: true, tracks: fallbackRows || [] });
    }
  } catch (error: any) {
    console.error('Error fetching playlist tracks:', error);
    return NextResponse.json({ success: false, tracks: [], error: error.message }, { status: 500 });
  }
}

// POST /api/control/playlists/[id]/tracks - Add a track to playlist
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensurePlaylistTracksTable();
    const resolvedParams = await params;
    const playlistId = resolvedParams?.id;

    if (!playlistId) {
      return NextResponse.json({ success: false, error: 'Missing playlist ID' }, { status: 400 });
    }

    const session = await getSessionUser(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to add tracks to a playlist.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { trackId } = body;

    if (!trackId) {
      return NextResponse.json({ success: false, error: 'Missing trackId' }, { status: 400 });
    }

    // Check if song is already added to this playlist
    try {
      const existing = await query<any[]>(
        `SELECT id FROM LI_PLAYLIST_TRACKS WHERE playlist_id = ? AND track_id = ? LIMIT 1`,
        [playlistId, trackId]
      );
      if (existing && existing.length > 0) {
        return NextResponse.json(
          { success: false, error: 'This song is already in this playlist.' },
          { status: 409 }
        );
      }
    } catch {
      try {
        const existingFallback = await query<any[]>(
          `SELECT id FROM playlist_tracks WHERE playlist_id = ? AND track_id = ? LIMIT 1`,
          [playlistId, trackId]
        );
        if (existingFallback && existingFallback.length > 0) {
          return NextResponse.json(
            { success: false, error: 'This song is already in this playlist.' },
            { status: 409 }
          );
        }
      } catch {
        // ignore schema errors
      }
    }

    const ptId = uuidv4();
    const addedBy = session?.userId || null;

    // Check position count
    let nextPos = 1;
    try {
      const posRes = await query<any[]>(
        `SELECT COALESCE(MAX(position), 0) + 1 AS nextPos FROM LI_PLAYLIST_TRACKS WHERE playlist_id = ?`,
        [playlistId]
      );
      if (posRes?.[0]?.nextPos) nextPos = posRes[0].nextPos;
    } catch {
      try {
        const posRes = await query<any[]>(
          `SELECT COALESCE(MAX(position), 0) + 1 AS nextPos FROM playlist_tracks WHERE playlist_id = ?`,
          [playlistId]
        );
        if (posRes?.[0]?.nextPos) nextPos = posRes[0].nextPos;
      } catch {
        // ignore
      }
    }

    // Insert into LI_PLAYLIST_TRACKS (or playlist_tracks)
    let inserted = false;
    try {
      await query(
        `INSERT INTO LI_PLAYLIST_TRACKS (id, playlist_id, track_id, position, added_by)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE position = position`,
        [ptId, playlistId, trackId, nextPos, addedBy]
      );
      inserted = true;
    } catch (err: any) {
      console.warn('Insert to LI_PLAYLIST_TRACKS failed, trying fallback playlist_tracks:', err.message);
      try {
        await query(
          `INSERT INTO playlist_tracks (id, playlist_id, track_id, position, added_by)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE position = position`,
          [ptId, playlistId, trackId, nextPos, addedBy]
        );
        inserted = true;
      } catch (err2: any) {
        console.error('Insert into playlist_tracks failed:', err2.message);
        throw err2;
      }
    }

    // Update denormalized song_count on LI_PLAYLISTS / playlists
    try {
      await query(
        `UPDATE LI_PLAYLISTS SET song_count = (
           SELECT COUNT(*) FROM LI_PLAYLIST_TRACKS WHERE playlist_id = ?
         ) WHERE id = ?`,
        [playlistId, playlistId]
      );
    } catch {
      try {
        await query(
          `UPDATE playlists SET song_count = (
             SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = ?
           ) WHERE id = ?`,
          [playlistId, playlistId]
        );
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Track added to playlist in DB successfully',
      playlistId,
      trackId,
    });
  } catch (error: any) {
    console.error('Error adding track to playlist:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/control/playlists/[id]/tracks - Remove track from playlist
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensurePlaylistTracksTable();
    const resolvedParams = await params;
    const playlistId = resolvedParams?.id;

    if (!playlistId) {
      return NextResponse.json({ success: false, error: 'Missing playlist ID' }, { status: 400 });
    }

    const session = await getSessionUser(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to modify playlist tracks.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get('trackId');

    if (!trackId) {
      return NextResponse.json({ success: false, error: 'Missing trackId query parameter' }, { status: 400 });
    }

    try {
      await query(`DELETE FROM LI_PLAYLIST_TRACKS WHERE playlist_id = ? AND track_id = ?`, [playlistId, trackId]);
    } catch {
      try {
        await query(`DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?`, [playlistId, trackId]);
      } catch (err: any) {
        console.error('Failed to delete track from playlist:', err.message);
        throw err;
      }
    }

    // Update denormalized song_count
    try {
      await query(
        `UPDATE LI_PLAYLISTS SET song_count = (
           SELECT COUNT(*) FROM LI_PLAYLIST_TRACKS WHERE playlist_id = ?
         ) WHERE id = ?`,
        [playlistId, playlistId]
      );
    } catch {
      try {
        await query(
          `UPDATE playlists SET song_count = (
             SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = ?
           ) WHERE id = ?`,
          [playlistId, playlistId]
        );
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Track removed from playlist in DB successfully',
      playlistId,
      trackId,
    });
  } catch (error: any) {
    console.error('Error removing track from playlist:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

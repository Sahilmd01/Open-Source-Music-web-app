import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

let isTableChecked = false;

// Ensure LI_ALBUM_TRACKS or album_tracks exists
async function ensureAlbumTracksTable() {
  if (isTableChecked) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS LI_ALBUM_TRACKS (
        id          CHAR(36)  NOT NULL,
        album_id    CHAR(36)  NOT NULL,
        track_id    CHAR(36)  NOT NULL,
        position    INT       NOT NULL DEFAULT 0,
        added_by    CHAR(36)  DEFAULT NULL,
        added_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_li_album_track (album_id, track_id),
        KEY idx_li_at_album_pos (album_id, position),
        KEY idx_li_at_track (track_id)
      )
    `);
    isTableChecked = true;
  } catch (err: any) {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS album_tracks (
          id          CHAR(36)  NOT NULL,
          album_id    CHAR(36)  NOT NULL,
          track_id    CHAR(36)  NOT NULL,
          position    INT       NOT NULL DEFAULT 0,
          added_by    CHAR(36)  DEFAULT NULL,
          added_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uk_album_track (album_id, track_id),
          KEY idx_at_album_pos (album_id, position),
          KEY idx_at_track (track_id)
        )
      `);
      isTableChecked = true;
    } catch {
      isTableChecked = true;
    }
  }
}

// GET /api/control/albums/[id]/tracks - list tracks in an album
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAlbumTracksTable();
    const resolvedParams = await params;
    const albumId = resolvedParams?.id;

    if (!albumId) {
      return NextResponse.json({ success: false, error: 'Missing album ID' }, { status: 400 });
    }

    // First try querying songs directly linked via album_id in LI_TRACKS
    // as well as tracks junctioned in LI_ALBUM_TRACKS
    const sql = `
      SELECT DISTINCT
        t.id,
        t.title,
        COALESCE(a.name, 'Unknown Artist') AS artist,
        COALESCE(al.title, 'Album') AS album,
        COALESCE(t.duration, 180) AS duration,
        COALESCE(t.cover_image_url, al.cover_image_url) AS coverImage,
        t.audio_url AS audioUrl,
        COALESCE(t.hue, 210) AS hue,
        COALESCE(u.name, 'Official') AS uploadedBy,
        CASE WHEN t.is_active = 0 THEN 'inactive' ELSE 'active' END AS status,
        COALESCE(t.play_count, 0) AS plays,
        COALESCE(at.position, t.track_number, 0) AS position,
        t.created_at AS createdAt
      FROM LI_TRACKS t
      LEFT JOIN LI_ALBUM_TRACKS at ON t.id = at.track_id AND at.album_id = ?
      LEFT JOIN LI_ARTISTS a ON t.artist_id = a.id
      LEFT JOIN LI_ALBUMS al ON (t.album_id = al.id OR al.id = ?)
      LEFT JOIN LI_USERS u ON t.uploaded_by = u.id
      WHERE t.album_id = ? OR at.album_id = ?
      ORDER BY position ASC, createdAt DESC
    `;

    try {
      const rows = await query<any[]>(sql, [albumId, albumId, albumId, albumId]);
      return NextResponse.json({ success: true, tracks: rows || [] });
    } catch (err: any) {
      console.warn('Querying LI_ALBUM_TRACKS failed, trying fallback tracks:', err.message);

      const fallbackSql = `
        SELECT DISTINCT
          t.id,
          t.title,
          COALESCE(a.name, 'Unknown Artist') AS artist,
          COALESCE(al.title, 'Album') AS album,
          COALESCE(t.duration, 180) AS duration,
          COALESCE(t.cover_image_url, al.cover_image_url) AS coverImage,
          t.audio_url AS audioUrl,
          COALESCE(t.hue, 210) AS hue,
          COALESCE(u.name, 'Official') AS uploadedBy,
          CASE WHEN t.is_active = 0 THEN 'inactive' ELSE 'active' END AS status,
          COALESCE(t.play_count, 0) AS plays,
          COALESCE(at.position, t.track_number, 0) AS position,
          t.created_at AS createdAt
        FROM tracks t
        LEFT JOIN album_tracks at ON t.id = at.track_id AND at.album_id = ?
        LEFT JOIN artists a ON t.artist_id = a.id
        LEFT JOIN albums al ON (t.album_id = al.id OR al.id = ?)
        LEFT JOIN users u ON t.uploaded_by = u.id
        WHERE t.album_id = ? OR at.album_id = ?
        ORDER BY position ASC, createdAt DESC
      `;
      const fallbackRows = await query<any[]>(fallbackSql, [albumId, albumId, albumId, albumId]);
      return NextResponse.json({ success: true, tracks: fallbackRows || [] });
    }
  } catch (error: any) {
    console.error('Error fetching album tracks:', error);
    return NextResponse.json({ success: false, tracks: [], error: error.message }, { status: 500 });
  }
}

// POST /api/control/albums/[id]/tracks - Add a track to album (Auth required)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAlbumTracksTable();
    const resolvedParams = await params;
    const albumId = resolvedParams?.id;

    if (!albumId) {
      return NextResponse.json({ success: false, error: 'Missing album ID' }, { status: 400 });
    }

    const session = await getSessionUser(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to add tracks to an album.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { trackId } = body;

    if (!trackId) {
      return NextResponse.json({ success: false, error: 'Missing trackId' }, { status: 400 });
    }

    // Check if song is already added to this album
    try {
      const existing = await query<any[]>(
        `SELECT id FROM LI_ALBUM_TRACKS WHERE album_id = ? AND track_id = ? LIMIT 1`,
        [albumId, trackId]
      );
      if (existing && existing.length > 0) {
        return NextResponse.json(
          { success: false, error: 'This song is already in this album.' },
          { status: 409 }
        );
      }
    } catch {
      try {
        const existingFallback = await query<any[]>(
          `SELECT id FROM album_tracks WHERE album_id = ? AND track_id = ? LIMIT 1`,
          [albumId, trackId]
        );
        if (existingFallback && existingFallback.length > 0) {
          return NextResponse.json(
            { success: false, error: 'This song is already in this album.' },
            { status: 409 }
          );
        }
      } catch {
        // ignore schema errors
      }
    }

    const atId = uuidv4();
    const addedBy = session.userId;

    // Check next position
    let nextPos = 1;
    try {
      const posRes = await query<any[]>(
        `SELECT COALESCE(MAX(position), 0) + 1 AS nextPos FROM LI_ALBUM_TRACKS WHERE album_id = ?`,
        [albumId]
      );
      if (posRes?.[0]?.nextPos) nextPos = posRes[0].nextPos;
    } catch {
      try {
        const posRes = await query<any[]>(
          `SELECT COALESCE(MAX(position), 0) + 1 AS nextPos FROM album_tracks WHERE album_id = ?`,
          [albumId]
        );
        if (posRes?.[0]?.nextPos) nextPos = posRes[0].nextPos;
      } catch {
        // ignore
      }
    }

    // Insert into LI_ALBUM_TRACKS or album_tracks
    try {
      await query(
        `INSERT INTO LI_ALBUM_TRACKS (id, album_id, track_id, position, added_by)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE position = position`,
        [atId, albumId, trackId, nextPos, addedBy]
      );
    } catch (err: any) {
      try {
        await query(
          `INSERT INTO album_tracks (id, album_id, track_id, position, added_by)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE position = position`,
          [atId, albumId, trackId, nextPos, addedBy]
        );
      } catch (err2: any) {
        console.error('Insert into album_tracks failed:', err2.message);
        throw err2;
      }
    }

    // Also update track's album_id if track currently has none
    try {
      await query(`UPDATE LI_TRACKS SET album_id = ? WHERE id = ? AND (album_id IS NULL OR album_id = '')`, [albumId, trackId]);
    } catch {
      try {
        await query(`UPDATE tracks SET album_id = ? WHERE id = ? AND (album_id IS NULL OR album_id = '')`, [albumId, trackId]);
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Track added to album in DB successfully',
      albumId,
      trackId,
    });
  } catch (error: any) {
    console.error('Error adding track to album:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/control/albums/[id]/tracks - Remove track from album (Auth required)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAlbumTracksTable();
    const resolvedParams = await params;
    const albumId = resolvedParams?.id;

    if (!albumId) {
      return NextResponse.json({ success: false, error: 'Missing album ID' }, { status: 400 });
    }

    const session = await getSessionUser(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to remove tracks from an album.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get('trackId');

    if (!trackId) {
      return NextResponse.json({ success: false, error: 'Missing trackId query parameter' }, { status: 400 });
    }

    try {
      await query(`DELETE FROM LI_ALBUM_TRACKS WHERE album_id = ? AND track_id = ?`, [albumId, trackId]);
    } catch {
      try {
        await query(`DELETE FROM album_tracks WHERE album_id = ? AND track_id = ?`, [albumId, trackId]);
      } catch (err: any) {
        console.error('Failed to delete track from album:', err.message);
      }
    }

    // If track had album_id set directly to this album, set it to NULL
    try {
      await query(`UPDATE LI_TRACKS SET album_id = NULL WHERE id = ? AND album_id = ?`, [trackId, albumId]);
    } catch {
      try {
        await query(`UPDATE tracks SET album_id = NULL WHERE id = ? AND album_id = ?`, [trackId, albumId]);
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Track removed from album in DB successfully',
      albumId,
      trackId,
    });
  } catch (error: any) {
    console.error('Error removing track from album:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

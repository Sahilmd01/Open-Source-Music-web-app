import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

let isStorageMapCacheConfigured = false;

async function ensureStorageMapSequential() {
  if (isStorageMapCacheConfigured) return;
  try {
    await query(`ALTER TABLE LI_STORAGE_MAP AUTO_ID_CACHE = 1`);
    isStorageMapCacheConfigured = true;
  } catch {
    try {
      await query(`ALTER TABLE li_storage_map AUTO_ID_CACHE = 1`);
      isStorageMapCacheConfigured = true;
    } catch {
      isStorageMapCacheConfigured = true;
    }
  }
}

export async function GET(req: Request) {
  try {
    ensureStorageMapSequential().catch(() => {});
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const sortBy = searchParams.get('sortBy');

    let whereClause = '';
    const params: any[] = [];

    if (search) {
      whereClause = ` WHERE (LOWER(t.title) LIKE ? OR LOWER(a.name) LIKE ? OR LOWER(al.title) LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    let orderByClause = 'ORDER BY t.created_at DESC';
    if (sortBy === 'likes' || sortBy === 'trending' || sortBy === 'popular') {
      orderByClause = 'ORDER BY t.like_count DESC, t.play_count DESC, t.created_at DESC';
    }

    let paginationClause = '';
    const paginationParams: any[] = [];
    if (limitParam !== null) {
      const parsedLimit = Math.max(1, parseInt(limitParam, 10) || 30);
      const parsedOffset = Math.max(0, parseInt(offsetParam || '0', 10) || 0);
      paginationClause = ` LIMIT ? OFFSET ?`;
      paginationParams.push(parsedLimit, parsedOffset);
    }

    // Try querying LI_TRACKS with fallback to tracks
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
        COALESCE(t.like_count, 0) AS likesCount,
        0 AS reportsCount
      FROM LI_TRACKS t
      LEFT JOIN LI_ARTISTS a ON t.artist_id = a.id
      LEFT JOIN LI_ALBUMS al ON t.album_id = al.id
      LEFT JOIN LI_USERS u ON t.uploaded_by = u.id
      ${whereClause}
      ${orderByClause}
      ${paginationClause}
    `;

    try {
      const rows = await query<any[]>(sql, [...params, ...paginationParams]);
      return NextResponse.json({
        success: true,
        songs: rows || [],
        hasMore: limitParam !== null ? (rows?.length || 0) === Math.max(1, parseInt(limitParam, 10) || 30) : false
      });
    } catch (dbErr: any) {
      console.warn('Control songs fetch attempt failed on LI_TRACKS:', dbErr.message);
      
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
          COALESCE(t.like_count, 0) AS likesCount,
          0 AS reportsCount
        FROM tracks t
        LEFT JOIN artists a ON t.artist_id = a.id
        LEFT JOIN albums al ON t.album_id = al.id
        LEFT JOIN users u ON t.uploaded_by = u.id
        ${whereClause}
        ${orderByClause}
        ${paginationClause}
      `;
      const fallbackRows = await query<any[]>(fallbackSql, [...params, ...paginationParams]);
      return NextResponse.json({
        success: true,
        songs: fallbackRows || [],
        hasMore: limitParam !== null ? (fallbackRows?.length || 0) === Math.max(1, parseInt(limitParam, 10) || 30) : false
      });
    }
  } catch (error: any) {
    console.error('Error fetching songs for control:', error);
    return NextResponse.json(
      { success: false, songs: [], error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, status, coverImage } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing song id' }, { status: 400 });
    }

    // Status update
    if (typeof status !== 'undefined') {
      const isActive = status === 'active' ? 1 : 0;
      try {
        await query(`UPDATE LI_TRACKS SET is_active = ? WHERE id = ?`, [isActive, id]);
      } catch {
        await query(`UPDATE tracks SET is_active = ? WHERE id = ?`, [isActive, id]);
      }
    }

    // Cover image update (handles base64 data URLs & Telegram cloud storage)
    let finalCoverUrl: string | undefined = undefined;

    if (typeof coverImage !== 'undefined') {
      if (coverImage && coverImage.startsWith('data:')) {
        try {
          const { uploadAndStore } = await import('@/controllers/storageController');
          const parts = coverImage.split(';base64,');
          const mimeMatch = parts[0].match(/data:(.*?)$/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const buffer = Buffer.from(parts[1], 'base64');

          // Await the upload — fire-and-forget is killed by Vercel Lambda freeze
          const result = await uploadAndStore({
            buffer,
            fileName: `cover-${id}.jpg`,
            mimeType,
            category: 'cover_art',
            entityType: 'track',
            entityId: id,
            uploadedBy: session.userId,
          });
          // Store CDN URL directly — works on cold Lambda without server proxy
          finalCoverUrl = result.cdnUrl || result.storageUrl;
        } catch (e: any) {
          console.warn('Cover upload error:', e.message);
          finalCoverUrl = undefined;
        }
      } else {
        finalCoverUrl = coverImage ? coverImage.slice(0, 500) : null as any;
      }

      if (finalCoverUrl !== undefined) {
        try {
          await query(`UPDATE LI_TRACKS SET cover_image_url = ? WHERE id = ?`, [finalCoverUrl, id]);
        } catch {
          await query(`UPDATE tracks SET cover_image_url = ? WHERE id = ?`, [finalCoverUrl, id]);
        }
      }
    }

    return NextResponse.json({
      success: true,
      id,
      status,
      coverImage: finalCoverUrl,
    });
  } catch (error: any) {
    console.error('Error updating song:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureStorageMapSequential();

    // Verify authentication
    const session = await getSessionUser(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to upload songs.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, artist, album, duration, coverImage, hue, uploadedBy, audioUrl, userId } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Song title is required' }, { status: 400 });
    }

    // Resolve authenticated user for uploaded_by foreign key and display name
    let effectiveUserId: string = session.userId;
    let effectiveUploaderName: string = session.username || session.email?.split('@')[0] || uploadedBy || 'Official';

    try {
      const userRows = await query<any[]>(
        `SELECT id, name, username FROM LI_USERS WHERE id = ? LIMIT 1`,
        [effectiveUserId]
      );
      if (userRows && userRows.length > 0) {
        effectiveUploaderName = userRows[0].name || userRows[0].username || effectiveUploaderName;
      }
    } catch {
      // LI_USERS query fallback
    }

    const id = uuidv4();
    const cleanDuration = parseInt(duration || '180', 10);
    const cleanHue = parseInt(hue || '24', 10);
    const trackAlbum = album?.trim() || 'Single';

    // Resolve artistId — use provided ID directly, or look up by name (no auto-creation)
    let artistId: string | null = null;
    const providedArtistId = body.artistId?.trim();

    if (providedArtistId) {
      // Verify the artist exists
      try {
        const artRows = await query<any[]>(
          `SELECT id FROM LI_ARTISTS WHERE id = ? LIMIT 1`,
          [providedArtistId]
        );
        if (artRows && artRows.length > 0) {
          artistId = providedArtistId;
        }
      } catch {
        try {
          const artRows = await query<any[]>(
            `SELECT id FROM artists WHERE id = ? LIMIT 1`,
            [providedArtistId]
          );
          if (artRows && artRows.length > 0) artistId = providedArtistId;
        } catch { /* ignore */ }
      }
    } else if (artist?.trim()) {
      // Look up by name only — no creation
      try {
        const artRows = await query<any[]>(
          `SELECT id FROM LI_ARTISTS WHERE LOWER(name) = LOWER(?) LIMIT 1`,
          [artist.trim()]
        );
        if (artRows && artRows.length > 0) artistId = artRows[0].id;
      } catch {
        try {
          const artRows = await query<any[]>(
            `SELECT id FROM artists WHERE LOWER(name) = LOWER(?) LIMIT 1`,
            [artist.trim()]
          );
          if (artRows && artRows.length > 0) artistId = artRows[0].id;
        } catch { /* ignore */ }
      }
    }

    const trackArtistName = artist?.trim() || 'Independent Artist';

    // ── Prevent Duplicate Track Upload ───────────────────────────────────────
    try {
      let duplicateRows: any[] = [];
      if (artistId) {
        duplicateRows = await query<any[]>(
          `SELECT id, title FROM LI_TRACKS WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND artist_id = ? LIMIT 1`,
          [title.trim(), artistId]
        );
      } else {
        duplicateRows = await query<any[]>(
          `SELECT id, title FROM LI_TRACKS WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND (artist_id IS NULL OR artist_id = '') LIMIT 1`,
          [title.trim()]
        );
      }

      if (duplicateRows && duplicateRows.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `A song titled "${title.trim()}" already exists for this artist.`,
          },
          { status: 409 }
        );
      }
    } catch {
      // Fallback check on tracks table if LI_TRACKS isn't used
      try {
        let duplicateFallback: any[] = [];
        if (artistId) {
          duplicateFallback = await query<any[]>(
            `SELECT id, title FROM tracks WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND artist_id = ? LIMIT 1`,
            [title.trim(), artistId]
          );
        } else {
          duplicateFallback = await query<any[]>(
            `SELECT id, title FROM tracks WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND (artist_id IS NULL OR artist_id = '') LIMIT 1`,
            [title.trim()]
          );
        }
        if (duplicateFallback && duplicateFallback.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `A song titled "${title.trim()}" already exists for this artist.`,
            },
            { status: 409 }
          );
        }
      } catch {
        // ignore check errors to not block legitimate uploads if table schema differences occur
      }
    }

    let finalAudioUrl: string | null = null;
    let finalCoverUrl: string | null = null;

    const { uploadAndStore, fileCache } = await import('@/controllers/storageController');

    // ── Process Audio ─────────────────────────────────────────────────────────
    // We AWAIT the Telegram upload before responding — on Vercel, fire-and-forget
    // background tasks are killed when the Lambda returns, leaving broken URLs in DB.
    if (audioUrl) {
      if (audioUrl.startsWith('data:')) {
        try {
          const parts = audioUrl.split(';base64,');
          const mimeMatch = parts[0].match(/data:(.*?)$/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'audio/mpeg';
          const buffer = Buffer.from(parts[1], 'base64');

          const result = await uploadAndStore({
            buffer,
            fileName: `${title}.mp3`,
            mimeType,
            category: 'audio',
            entityType: 'track',
            entityId: id,
            uploadedBy: effectiveUserId,
            audioDuration: cleanDuration,
          });
          // Store the permanent gateway storage URL (/api/v1/storage/:uuid)
          // This ensures the link never expires and automatically refreshes Telegram tokens on demand
          finalAudioUrl = result.storageUrl || result.cdnUrl;
        } catch (e: any) {
          console.warn('Audio upload error:', e.message);
          // Don't store raw base64 — it would be >4MB in DB and break on reload
          finalAudioUrl = null;
        }
      } else {
        finalAudioUrl = audioUrl.slice(0, 500);
      }
    }

    // ── Process Cover Art ─────────────────────────────────────────────────────
    if (coverImage) {
      if (coverImage.startsWith('data:')) {
        try {
          const parts = coverImage.split(';base64,');
          const mimeMatch = parts[0].match(/data:(.*?)$/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const buffer = Buffer.from(parts[1], 'base64');

          const result = await uploadAndStore({
            buffer,
            fileName: `${title}-cover.jpg`,
            mimeType,
            category: 'cover_art',
            entityType: 'track',
            entityId: id,
            uploadedBy: effectiveUserId,
          });
          // Store the direct CDN URL — images load instantly, no proxy needed
          finalCoverUrl = result.cdnUrl || result.storageUrl;
        } catch (e: any) {
          console.warn('Cover upload error:', e.message);
          finalCoverUrl = null;
        }
      } else {
        finalCoverUrl = coverImage.slice(0, 500);
      }
    }

    // Insert track record into database immediately
    const insertTrackSql = `
      INSERT INTO LI_TRACKS (
        id, title, artist_id, duration, cover_image_url, audio_url, hue, uploaded_by, is_active, play_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    `;
    const params = [
      id,
      title.trim(),
      artistId,
      cleanDuration,
      finalCoverUrl,
      finalAudioUrl,
      cleanHue,
      effectiveUserId,
    ];

    try {
      await query(insertTrackSql, params);
    } catch {
      const fallbackSql = `
        INSERT INTO tracks (
          id, title, artist_id, duration, cover_image_url, audio_url, hue, uploaded_by, is_active, play_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
      `;
      await query(fallbackSql, params);
    }

    return NextResponse.json({
      success: true,
      song: {
        id,
        title: title.trim(),
        artist: trackArtistName,
        album: trackAlbum,
        duration: cleanDuration,
        coverImage: finalCoverUrl,
        audioUrl: finalAudioUrl,
        hue: cleanHue,
        uploadedBy: effectiveUploaderName,
        status: 'active',
        plays: 0,
        reportsCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Error creating track:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

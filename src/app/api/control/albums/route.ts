import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSessionUser } from '@/lib/auth';

let isAlbumSchemaChecked = false;

async function ensureAlbumArtistIdsColumn() {
  if (isAlbumSchemaChecked) return;
  try {
    await query(`ALTER TABLE LI_ALBUMS ADD COLUMN artist_ids JSON DEFAULT NULL`);
  } catch {
    // column may already exist
  }
  try {
    await query(`ALTER TABLE albums ADD COLUMN artist_ids JSON DEFAULT NULL`);
  } catch {
    // column may already exist
  }
  isAlbumSchemaChecked = true;
}

export async function GET(req: Request) {
  try {
    await ensureAlbumArtistIdsColumn();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const sortBy = searchParams.get('sortBy');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    let whereClause = '';
    const params: any[] = [];

    if (search) {
      whereClause = ` WHERE (LOWER(al.title) LIKE ? OR LOWER(COALESCE(a.name, '')) LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    let orderByClause = 'ORDER BY al.created_at DESC';
    if (sortBy === 'likes' || sortBy === 'trending' || sortBy === 'popular') {
      orderByClause = 'ORDER BY totalLikes DESC, songsCount DESC, al.created_at DESC';
    }

    let paginationClause = '';
    const paginationParams: any[] = [];
    if (limitParam !== null) {
      const parsedLimit = Math.max(1, parseInt(limitParam, 10) || 30);
      const parsedOffset = Math.max(0, parseInt(offsetParam || '0', 10) || 0);
      paginationClause = ` LIMIT ? OFFSET ?`;
      paginationParams.push(parsedLimit, parsedOffset);
    }

    const sql = `
      SELECT 
        al.id,
        al.title,
        al.created_by AS createdBy,
        COALESCE(a.name, 'Various Artists') AS artist,
        al.artist_id AS artistId,
        al.artist_ids AS artistIds,
        COALESCE(al.year, YEAR(CURRENT_DATE)) AS year,
        CASE WHEN al.is_active = 0 THEN 'inactive' ELSE 'active' END AS status,
        al.cover_image_url AS coverUrl,
        al.banner_url AS bannerUrl,
        COUNT(DISTINCT t.id) AS songsCount,
        COALESCE(SUM(t.like_count), 0) AS totalLikes
      FROM LI_ALBUMS al
      LEFT JOIN LI_ARTISTS a ON al.artist_id = a.id
      LEFT JOIN LI_TRACKS t ON t.album_id = al.id
      ${whereClause}
      GROUP BY al.id, al.title, al.created_by, a.name, al.artist_id, al.artist_ids, al.year, al.is_active, al.cover_image_url, al.banner_url, al.created_at
      ${orderByClause}
      ${paginationClause}
    `;

    try {
      const rows = await query<any[]>(sql, [...params, ...paginationParams]);
      const parsedRows = (rows || []).map((row) => {
        let parsedArtistIds: string[] = [];
        if (row.artistIds) {
          try {
            parsedArtistIds = typeof row.artistIds === 'string' ? JSON.parse(row.artistIds) : row.artistIds;
          } catch {
            parsedArtistIds = [];
          }
        } else if (row.artistId) {
          parsedArtistIds = [row.artistId];
        }
        return {
          ...row,
          artistIds: Array.isArray(parsedArtistIds) ? parsedArtistIds : [],
        };
      });
      return NextResponse.json({
        success: true,
        albums: parsedRows,
        hasMore: limitParam !== null ? (rows?.length || 0) === Math.max(1, parseInt(limitParam, 10) || 30) : false
      });
    } catch (dbErr: any) {
      console.warn('Control albums fetch failed on LI_ALBUMS, falling back to albums:', dbErr.message);

      const fallbackSql = `
        SELECT 
          al.id,
          al.title,
          al.created_by AS createdBy,
          COALESCE(a.name, 'Various Artists') AS artist,
          al.artist_id AS artistId,
          al.artist_ids AS artistIds,
          COALESCE(al.year, YEAR(CURRENT_DATE)) AS year,
          CASE WHEN al.is_active = 0 THEN 'inactive' ELSE 'active' END AS status,
          al.cover_image_url AS coverUrl,
          al.banner_url AS bannerUrl,
          COUNT(DISTINCT t.id) AS songsCount,
          COALESCE(SUM(t.like_count), 0) AS totalLikes
        FROM albums al
        LEFT JOIN artists a ON al.artist_id = a.id
        LEFT JOIN tracks t ON t.album_id = al.id
        ${whereClause}
        GROUP BY al.id, al.title, al.created_by, a.name, al.artist_id, al.artist_ids, al.year, al.is_active, al.cover_image_url, al.banner_url, al.created_at
        ${orderByClause}
        ${paginationClause}
      `;
      const fallbackRows = await query<any[]>(fallbackSql, [...params, ...paginationParams]);
      const parsedFallback = (fallbackRows || []).map((row) => {
        let parsedArtistIds: string[] = [];
        if (row.artistIds) {
          try {
            parsedArtistIds = typeof row.artistIds === 'string' ? JSON.parse(row.artistIds) : row.artistIds;
          } catch {
            parsedArtistIds = [];
          }
        } else if (row.artistId) {
          parsedArtistIds = [row.artistId];
        }
        return {
          ...row,
          artistIds: Array.isArray(parsedArtistIds) ? parsedArtistIds : [],
        };
      });
      return NextResponse.json({
        success: true,
        albums: parsedFallback,
        hasMore: limitParam !== null ? (fallbackRows?.length || 0) === Math.max(1, parseInt(limitParam, 10) || 30) : false
      });
    }
  } catch (error: any) {
    console.error('Error fetching albums for control:', error);
    return NextResponse.json(
      { success: false, albums: [], error: error.message },
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
    const { id, status, coverUrl, bannerUrl } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing album id' }, { status: 400 });
    }

    let finalCoverUrl: string | undefined = undefined;
    let finalBannerUrl: string | undefined = undefined;

    const { uploadAndStore } = await import('@/controllers/storageController');

    if (typeof coverUrl !== 'undefined') {
      if (coverUrl && coverUrl.startsWith('data:')) {
        try {
          const parts = coverUrl.split(';base64,');
          const mimeMatch = parts[0].match(/data:(.*?)$/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const buffer = Buffer.from(parts[1], 'base64');

          const result = await uploadAndStore({
            buffer,
            fileName: `album-cover-${id}.jpg`,
            mimeType,
            category: 'cover',
            entityType: 'album',
            entityId: id,
            uploadedBy: session.userId,
          });

          finalCoverUrl = result.cdnUrl || result.storageUrl;
        } catch (e: any) {
          console.warn('Album cover upload error:', e.message);
          finalCoverUrl = coverUrl.slice(0, 500);
        }
      } else {
        finalCoverUrl = coverUrl ? coverUrl.slice(0, 500) : null as any;
      }
    }

    if (typeof bannerUrl !== 'undefined') {
      if (bannerUrl && bannerUrl.startsWith('data:')) {
        try {
          const parts = bannerUrl.split(';base64,');
          const mimeMatch = parts[0].match(/data:(.*?)$/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const buffer = Buffer.from(parts[1], 'base64');

          const result = await uploadAndStore({
            buffer,
            fileName: `album-banner-${id}.jpg`,
            mimeType,
            category: 'banner',
            entityType: 'album',
            entityId: id,
            uploadedBy: session.userId,
          });

          finalBannerUrl = result.cdnUrl || result.storageUrl;
        } catch (e: any) {
          console.warn('Album banner upload error:', e.message);
          finalBannerUrl = bannerUrl.slice(0, 500);
        }
      } else {
        finalBannerUrl = bannerUrl ? bannerUrl.slice(0, 500) : null as any;
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (typeof status !== 'undefined') {
      updates.push('is_active = ?');
      values.push(status === 'active' ? 1 : 0);
    }
    if (typeof finalCoverUrl !== 'undefined') {
      updates.push('cover_image_url = ?');
      values.push(finalCoverUrl);
    }
    if (typeof finalBannerUrl !== 'undefined') {
      updates.push('banner_url = ?');
      values.push(finalBannerUrl);
    }

    if (updates.length > 0) {
      values.push(id);
      try {
        await query(`UPDATE LI_ALBUMS SET ${updates.join(', ')} WHERE id = ?`, values);
      } catch {
        await query(`UPDATE albums SET ${updates.join(', ')} WHERE id = ?`, values);
      }
    }

    return NextResponse.json({
      success: true,
      id,
      status,
      coverUrl: finalCoverUrl,
      bannerUrl: finalBannerUrl,
    });
  } catch (error: any) {
    console.error('Error updating album:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to create an album.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, artist, year, coverUrl, bannerUrl, artistIds: rawArtistIds } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Album title is required' }, { status: 400 });
    }

    const id = uuidv4();
    const cleanYear = parseInt(year || new Date().getFullYear().toString(), 10);
    const trackArtist = artist?.trim() || 'Various Artists';
    const hue = Math.floor(Math.random() * 360);

    // Normalize multiple artist IDs array
    let normalizedArtistIds: string[] = [];
    if (Array.isArray(rawArtistIds) && rawArtistIds.length > 0) {
      normalizedArtistIds = rawArtistIds.map((item) => String(item).trim()).filter(Boolean);
    } else if (body.artistId) {
      normalizedArtistIds = [String(body.artistId).trim()];
    }

    const providedArtistId = normalizedArtistIds[0] || body.artistId?.trim();
    let artistId: string | null = null;

    if (providedArtistId) {
      try {
        const artRows = await query<any[]>(
          `SELECT id FROM LI_ARTISTS WHERE id = ? LIMIT 1`,
          [providedArtistId]
        );
        if (artRows && artRows.length > 0) {
          artistId = artRows[0].id;
        }
      } catch {
        try {
          const artRows = await query<any[]>(
            `SELECT id FROM artists WHERE id = ? LIMIT 1`,
            [providedArtistId]
          );
          if (artRows && artRows.length > 0) artistId = artRows[0].id;
        } catch { /* ignore */ }
      }
    }

    // If not found by ID, look up by name only — NEVER automatically create an artist
    if (!artistId && trackArtist && trackArtist !== 'Various Artists') {
      try {
        const artRows = await query<any[]>(
          `SELECT id FROM LI_ARTISTS WHERE LOWER(name) = LOWER(?) LIMIT 1`,
          [trackArtist]
        );
        if (artRows && artRows.length > 0) {
          artistId = artRows[0].id;
        }
      } catch {
        try {
          const artRows = await query<any[]>(
            `SELECT id FROM artists WHERE LOWER(name) = LOWER(?) LIMIT 1`,
            [trackArtist]
          );
          if (artRows && artRows.length > 0) artistId = artRows[0].id;
        } catch { /* ignore */ }
      }
    }

    // If still no artistId (e.g. combined artists or new group), fallback to existing Various Artists/first artist or null
    if (!artistId) {
      try {
        const fallbackArt = await query<any[]>(
          `SELECT id FROM LI_ARTISTS WHERE LOWER(name) IN ('various artists', 'unknown artist', 'various') LIMIT 1`
        );
        if (fallbackArt && fallbackArt.length > 0) {
          artistId = fallbackArt[0].id;
        } else {
          const anyArt = await query<any[]>(`SELECT id FROM LI_ARTISTS LIMIT 1`);
          if (anyArt && anyArt.length > 0) artistId = anyArt[0].id;
        }
      } catch {
        try {
          const fallbackArt = await query<any[]>(
            `SELECT id FROM artists WHERE LOWER(name) IN ('various artists', 'unknown artist', 'various') LIMIT 1`
          );
          if (fallbackArt && fallbackArt.length > 0) {
            artistId = fallbackArt[0].id;
          } else {
            const anyArt = await query<any[]>(`SELECT id FROM artists LIMIT 1`);
            if (anyArt && anyArt.length > 0) artistId = anyArt[0].id;
          }
        } catch { /* ignore */ }
      }
    }

    // If we have artistId but normalizedArtistIds is empty, populate it
    if (artistId && normalizedArtistIds.length === 0) {
      normalizedArtistIds = [artistId];
    }
    const artistIdsJson = normalizedArtistIds.length > 0 ? JSON.stringify(normalizedArtistIds) : null;

    const { uploadAndStore } = await import('@/controllers/storageController');

    let finalCoverUrl = coverUrl || null;
    let finalBannerUrl = bannerUrl || null;

    if (coverUrl && coverUrl.startsWith('data:')) {
      try {
        const parts = coverUrl.split(';base64,');
        const mimeMatch = parts[0].match(/data:(.*?)$/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const buffer = Buffer.from(parts[1], 'base64');

        const result = await uploadAndStore({
          buffer,
          fileName: `album-cover-${id}.jpg`,
          mimeType,
          category: 'cover',
          entityType: 'album',
          entityId: id,
          uploadedBy: session.userId,
        });

        finalCoverUrl = result.cdnUrl || result.storageUrl;
      } catch (e: any) {
        console.warn('Album cover upload error:', e.message);
        finalCoverUrl = coverUrl.slice(0, 500);
      }
    }

    if (bannerUrl && bannerUrl.startsWith('data:')) {
      try {
        const parts = bannerUrl.split(';base64,');
        const mimeMatch = parts[0].match(/data:(.*?)$/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const buffer = Buffer.from(parts[1], 'base64');

        const result = await uploadAndStore({
          buffer,
          fileName: `album-banner-${id}.jpg`,
          mimeType,
          category: 'banner',
          entityType: 'album',
          entityId: id,
          uploadedBy: session.userId,
        });

        finalBannerUrl = result.cdnUrl || result.storageUrl;
      } catch (e: any) {
        console.warn('Album banner upload error:', e.message);
        finalBannerUrl = bannerUrl.slice(0, 500);
      }
    }

    await ensureAlbumArtistIdsColumn();

    const userId = session.userId;
    const sqlWithArtistIds = `
      INSERT INTO LI_ALBUMS (id, title, artist_id, artist_ids, year, cover_image_url, banner_url, hue, is_custom, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)
    `;
    const paramsWithArtistIds = [id, title.trim(), artistId, artistIdsJson, cleanYear, finalCoverUrl, finalBannerUrl, hue, userId];

    try {
      await query(sqlWithArtistIds, paramsWithArtistIds);
    } catch {
      try {
        const sql = `
          INSERT INTO LI_ALBUMS (id, title, artist_id, year, cover_image_url, banner_url, hue, is_custom, is_active, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?)
        `;
        const params = [id, title.trim(), artistId, cleanYear, finalCoverUrl, finalBannerUrl, hue, userId];
        await query(sql, params);
      } catch {
        try {
          const fallbackSqlWithArtistIds = `
            INSERT INTO albums (id, title, artist_id, artist_ids, year, cover_image_url, banner_url, hue, is_custom, is_active, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)
          `;
          await query(fallbackSqlWithArtistIds, paramsWithArtistIds);
        } catch {
          const fallbackSql = `
            INSERT INTO albums (id, title, artist_id, year, cover_image_url, banner_url, hue, is_custom, is_active, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?)
          `;
          const params = [id, title.trim(), artistId, cleanYear, finalCoverUrl, finalBannerUrl, hue, userId];
          await query(fallbackSql, params);
        }
      }
    }

    return NextResponse.json({
      success: true,
      album: {
        id,
        title: title.trim(),
        artist: trackArtist,
        artistId,
        artistIds: normalizedArtistIds,
        year: cleanYear,
        createdBy: userId,
        status: 'active',
        coverUrl: finalCoverUrl,
        bannerUrl: finalBannerUrl,
      },
    });
  } catch (error: any) {
    console.error('Error creating album:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

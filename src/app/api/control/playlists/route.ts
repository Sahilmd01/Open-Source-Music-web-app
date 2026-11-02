import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const sortBy = searchParams.get('sortBy');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    let whereClause = '';
    const params: any[] = [];

    if (search) {
      whereClause = ` WHERE (LOWER(p.title) LIKE ? OR LOWER(COALESCE(u.name, '')) LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    let orderByClause = 'ORDER BY p.created_at DESC';
    if (sortBy === 'likes' || sortBy === 'trending' || sortBy === 'popular') {
      orderByClause = 'ORDER BY totalLikes DESC, p.like_count DESC, songsCount DESC, p.created_at DESC';
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
        p.id,
        p.title,
        p.description,
        p.owner_id AS ownerId,
        COALESCE(u.name, 'Editorial Team') AS creator,
        COALESCE(p.song_count, COUNT(DISTINCT pt.track_id), 0) AS songsCount,
        COALESCE(p.like_count, 0) AS likes,
        COALESCE(SUM(t.like_count), 0) AS totalLikes,
        COALESCE(p.total_duration, 0) AS totalDuration,
        CASE WHEN p.is_active = 0 THEN 'inactive' ELSE 'active' END AS status,
        p.cover_image_url AS coverUrl,
        COALESCE(p.logo_url, p.cover_image_url) AS bannerUrl,
        COALESCE(p.hue, 280) AS hue,
        CASE WHEN p.is_public = 1 THEN 'public' ELSE 'private' END AS visibility
      FROM LI_PLAYLISTS p
      LEFT JOIN LI_USERS u ON p.owner_id = u.id
      LEFT JOIN LI_PLAYLIST_TRACKS pt ON p.id = pt.playlist_id
      LEFT JOIN LI_TRACKS t ON pt.track_id = t.id
      ${whereClause}
      GROUP BY p.id, p.title, p.description, p.owner_id, u.name, p.song_count, p.like_count, p.total_duration, p.is_active, p.cover_image_url, p.logo_url, p.hue, p.is_public, p.created_at
      ${orderByClause}
      ${paginationClause}
    `;

    try {
      const rows = await query<any[]>(sql, [...params, ...paginationParams]);
      return NextResponse.json({
        success: true,
        playlists: rows || [],
        hasMore: limitParam !== null ? (rows?.length || 0) === Math.max(1, parseInt(limitParam, 10) || 30) : false
      });
    } catch (dbErr: any) {
      console.warn('Control playlists fetch query failed on LI_PLAYLISTS, falling back to playlists:', dbErr.message);

      const fallbackSql = `
        SELECT 
          p.id,
          p.title,
          p.description,
          p.owner_id AS ownerId,
          COALESCE(u.name, 'Editorial Team') AS creator,
          COALESCE(p.song_count, COUNT(DISTINCT pt.track_id), 0) AS songsCount,
          COALESCE(p.like_count, 0) AS likes,
          COALESCE(SUM(t.like_count), 0) AS totalLikes,
          COALESCE(p.total_duration, 0) AS totalDuration,
          CASE WHEN p.is_active = 0 THEN 'inactive' ELSE 'active' END AS status,
          p.cover_image_url AS coverUrl,
          COALESCE(p.logo_url, p.cover_image_url) AS bannerUrl,
          COALESCE(p.hue, 280) AS hue,
          CASE WHEN p.is_public = 1 THEN 'public' ELSE 'private' END AS visibility
        FROM playlists p
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
        LEFT JOIN tracks t ON pt.track_id = t.id
        ${whereClause}
        GROUP BY p.id, p.title, p.description, p.owner_id, u.name, p.song_count, p.like_count, p.total_duration, p.is_active, p.cover_image_url, p.logo_url, p.hue, p.is_public, p.created_at
        ${orderByClause}
        ${paginationClause}
      `;
      const fallbackRows = await query<any[]>(fallbackSql, [...params, ...paginationParams]);
      return NextResponse.json({
        success: true,
        playlists: fallbackRows || [],
        hasMore: limitParam !== null ? (fallbackRows?.length || 0) === Math.max(1, parseInt(limitParam, 10) || 30) : false
      });
    }
  } catch (error: any) {
    console.error('Error fetching playlists for control:', error);
    return NextResponse.json(
      { success: false, playlists: [], error: error.message },
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
    const { id, status, coverUrl, bannerUrl, visibility, likes, likeAction } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing playlist id' }, { status: 400 });
    }

    // Handle quick like toggle action
    if (likeAction === 'increment' || likeAction === 'decrement') {
      const delta = likeAction === 'increment' ? 1 : -1;
      try {
        await query(
          `UPDATE LI_PLAYLISTS SET like_count = GREATEST(0, COALESCE(like_count, 0) + ?) WHERE id = ?`,
          [delta, id]
        );
      } catch {
        try {
          await query(
            `UPDATE playlists SET like_count = GREATEST(0, COALESCE(like_count, 0) + ?) WHERE id = ?`,
            [delta, id]
          );
        } catch (e: any) {
          console.warn('Playlist like update error:', e.message);
        }
      }
      return NextResponse.json({ success: true, id, likeAction });
    }

    let finalCoverUrl: string | undefined = undefined;
    let finalBannerUrl: string | undefined = undefined;

    const { uploadAndStore, fileCache } = await import('@/controllers/storageController');

    // Process Cover if base64 data URL
    if (typeof coverUrl !== 'undefined') {
      if (coverUrl && coverUrl.startsWith('data:')) {
        try {
          const parts = coverUrl.split(';base64,');
          const mimeMatch = parts[0].match(/data:(.*?)$/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const buffer = Buffer.from(parts[1], 'base64');

          const result = await uploadAndStore({
            buffer,
            fileName: `playlist-cover-${id}.jpg`,
            mimeType,
            category: 'cover',
            entityType: 'playlist',
            entityId: id,
            uploadedBy: session.userId,
          });

          finalCoverUrl = result.cdnUrl || result.storageUrl;
        } catch (e: any) {
          console.warn('Playlist cover upload error:', e.message);
          finalCoverUrl = coverUrl.slice(0, 500);
        }
      } else {
        finalCoverUrl = coverUrl ? coverUrl.slice(0, 500) : null as any;
      }
    }

    // Process Banner if base64 data URL
    if (typeof bannerUrl !== 'undefined') {
      if (bannerUrl && bannerUrl.startsWith('data:')) {
        try {
          const parts = bannerUrl.split(';base64,');
          const mimeMatch = parts[0].match(/data:(.*?)$/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const buffer = Buffer.from(parts[1], 'base64');

          const result = await uploadAndStore({
            buffer,
            fileName: `playlist-banner-${id}.jpg`,
            mimeType,
            category: 'banner',
            entityType: 'playlist',
            entityId: id,
            uploadedBy: session.userId,
          });

          finalBannerUrl = result.cdnUrl || result.storageUrl;
        } catch (e: any) {
          console.warn('Playlist banner upload error:', e.message);
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
      updates.push('logo_url = ?');
      values.push(finalBannerUrl);
    }
    if (typeof visibility !== 'undefined') {
      updates.push('is_public = ?');
      values.push(visibility === 'public' ? 1 : 0);
    }
    if (typeof likes === 'number') {
      updates.push('like_count = ?');
      values.push(Math.max(0, likes));
    }

    if (updates.length > 0) {
      values.push(id);
      try {
        await query(`UPDATE LI_PLAYLISTS SET ${updates.join(', ')} WHERE id = ?`, values);
      } catch {
        try {
          await query(`UPDATE playlists SET ${updates.join(', ')} WHERE id = ?`, values);
        } catch (err: any) {
          console.warn('Update playlists error:', err.message);
        }
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
    console.error('Error updating playlist:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to create a playlist.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, coverUrl, bannerUrl, isPublic } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Playlist title is required' }, { status: 400 });
    }

    const id = uuidv4();
    const hue = Math.floor(Math.random() * 360);
    const pub = isPublic !== false ? 1 : 0;
    const ownerId = session.userId;
    const creatorName = session.username || session.email?.split('@')[0] || 'User';

    let finalCoverUrl = coverUrl || null;
    let finalBannerUrl = bannerUrl || null;

    const { uploadAndStore, fileCache } = await import('@/controllers/storageController');

    // Process Cover if base64 data URL
    if (coverUrl && coverUrl.startsWith('data:')) {
      try {
        const parts = coverUrl.split(';base64,');
        const mimeMatch = parts[0].match(/data:(.*?)$/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const buffer = Buffer.from(parts[1], 'base64');

        const result = await uploadAndStore({
          buffer,
          fileName: `playlist-cover-${id}.jpg`,
          mimeType,
          category: 'cover',
          entityType: 'playlist',
          entityId: id,
          uploadedBy: session.userId,
        });

        finalCoverUrl = result.cdnUrl || result.storageUrl;
      } catch (e: any) {
        console.warn('Playlist cover parse error:', e.message);
        finalCoverUrl = coverUrl.slice(0, 500);
      }
    }

    // Process Banner if base64 data URL
    if (bannerUrl && bannerUrl.startsWith('data:')) {
      try {
        const parts = bannerUrl.split(';base64,');
        const mimeMatch = parts[0].match(/data:(.*?)$/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const buffer = Buffer.from(parts[1], 'base64');

        const result = await uploadAndStore({
          buffer,
          fileName: `playlist-banner-${id}.jpg`,
          mimeType,
          category: 'banner',
          entityType: 'playlist',
          entityId: id,
          uploadedBy: session.userId,
        });

        finalBannerUrl = result.cdnUrl || result.storageUrl;
      } catch (e: any) {
        console.warn('Playlist banner parse error:', e.message);
        finalBannerUrl = bannerUrl.slice(0, 500);
      }
    }

    const sql = `
      INSERT INTO LI_PLAYLISTS (id, owner_id, title, description, cover_image_url, logo_url, hue, is_custom, is_public, is_active, song_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 1, 0)
    `;
    const params = [id, ownerId, title.trim(), description || null, finalCoverUrl, finalBannerUrl, hue, pub];

    let inserted = false;
    let lastError = null;

    try {
      await query(sql, params);
      inserted = true;
    } catch (err: any) {
      lastError = err;
      console.warn('Insert into LI_PLAYLISTS failed, trying fallback to playlists:', err.message);
      try {
        const fallbackSql = `
          INSERT INTO playlists (id, owner_id, title, description, cover_image_url, logo_url, hue, is_custom, is_public, is_active, song_count)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 1, 0)
        `;
        await query(fallbackSql, params);
        inserted = true;
      } catch (fallbackErr: any) {
        lastError = fallbackErr;
        console.error('Insert into fallback playlists table also failed:', fallbackErr.message);
      }
    }

    if (!inserted) {
      throw new Error(lastError?.message || 'Database insert failed for playlist');
    }

    // Also increment playlists_count for the user if LI_USERS table exists
    try {
      await query(`UPDATE LI_USERS SET playlists_count = playlists_count + 1 WHERE id = ?`, [ownerId]);
    } catch {
      // ignore user count update failure
    }

    return NextResponse.json({
      success: true,
      playlist: {
        id,
        title: title.trim(),
        creator: creatorName,
        songsCount: 0,
        status: 'active',
        coverUrl: finalCoverUrl,
        bannerUrl: finalBannerUrl,
        visibility: pub ? 'public' : 'private',
      },
    });
  } catch (error: any) {
    console.error('Error creating playlist:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const sortBy = searchParams.get('sortBy');

    let whereClause = '';
    const params: any[] = [];

    if (search) {
      whereClause = ` WHERE (LOWER(a.name) LIKE ? OR LOWER(COALESCE(a.bio, '')) LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    let orderByClause = 'ORDER BY a.created_at DESC';
    if (sortBy === 'likes' || sortBy === 'trending') {
      orderByClause = 'ORDER BY totalLikes DESC, songsCount DESC, a.created_at DESC';
    } else if (sortBy === 'songs' || sortBy === 'popular') {
      orderByClause = 'ORDER BY songsCount DESC, a.created_at DESC';
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
        a.id,
        a.name,
        COALESCE(a.bio, 'Artist') AS genre,
        COALESCE(a.monthly_listeners, 0) AS followers,
        a.image_url AS avatarUrl,
        a.banner_url AS bannerUrl,
        COALESCE(a.hue, 220) AS hue,
        CASE WHEN a.is_active = 0 THEN 'inactive' ELSE 'active' END AS status,
        COUNT(t.id) AS songsCount,
        COALESCE(SUM(t.like_count), 0) AS totalLikes
      FROM LI_ARTISTS a
      LEFT JOIN LI_TRACKS t ON t.artist_id = a.id
      ${whereClause}
      GROUP BY a.id, a.name, a.bio, a.monthly_listeners, a.image_url, a.banner_url, a.hue, a.is_active, a.created_at
      ${orderByClause}
      ${paginationClause}
    `;

    try {
      const rows = await query<any[]>(sql, [...params, ...paginationParams]);
      return NextResponse.json({
        success: true,
        artists: rows || [],
        hasMore: limitParam !== null ? (rows?.length || 0) === Math.max(1, parseInt(limitParam, 10) || 30) : false
      });
    } catch (dbErr: any) {
      console.warn('Control artists fetch failed on LI_ARTISTS, falling back to artists:', dbErr.message);

      const fallbackSql = `
        SELECT 
          a.id,
          a.name,
          COALESCE(a.bio, 'Artist') AS genre,
          COALESCE(a.monthly_listeners, 0) AS followers,
          a.image_url AS avatarUrl,
          a.banner_url AS bannerUrl,
          COALESCE(a.hue, 220) AS hue,
          CASE WHEN a.is_active = 0 THEN 'inactive' ELSE 'active' END AS status,
          COUNT(t.id) AS songsCount,
          COALESCE(SUM(t.like_count), 0) AS totalLikes
        FROM artists a
        LEFT JOIN tracks t ON t.artist_id = a.id
        ${whereClause}
        GROUP BY a.id, a.name, a.bio, a.monthly_listeners, a.image_url, a.banner_url, a.hue, a.is_active, a.created_at
        ${orderByClause}
        ${paginationClause}
      `;
      const fallbackRows = await query<any[]>(fallbackSql, [...params, ...paginationParams]);
      return NextResponse.json({
        success: true,
        artists: fallbackRows || [],
        hasMore: limitParam !== null ? (fallbackRows?.length || 0) === Math.max(1, parseInt(limitParam, 10) || 30) : false
      });
    }
  } catch (error: any) {
    console.error('Error fetching artists for control:', error);
    return NextResponse.json(
      { success: false, artists: [], error: error.message },
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
    const { id, status, avatarUrl, bannerUrl } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing artist id' }, { status: 400 });
    }

    // Status update
    if (typeof status !== 'undefined') {
      const isActive = status === 'active' ? 1 : 0;
      try {
        await query(`UPDATE LI_ARTISTS SET is_active = ? WHERE id = ?`, [isActive, id]);
      } catch {
        await query(`UPDATE artists SET is_active = ? WHERE id = ?`, [isActive, id]);
      }
    }

    // Media update (Handling both direct URLs and base64 uploaded files)
    let finalAvatarUrl: string | undefined = undefined;
    let finalBannerUrl: string | undefined = undefined;

    const { uploadAndStore, fileCache } = await import('@/controllers/storageController');

    if (typeof avatarUrl !== 'undefined') {
      if (avatarUrl && avatarUrl.startsWith('data:')) {
        try {
          const parts = avatarUrl.split(';base64,');
          const mimeMatch = parts[0].match(/data:(.*?)$/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const buffer = Buffer.from(parts[1], 'base64');

          const result = await uploadAndStore({
            buffer,
            fileName: `artist-avatar-${id}.jpg`,
            mimeType,
            category: 'avatar',
            entityType: 'artist',
            entityId: id,
            uploadedBy: session.userId,
          });

          finalAvatarUrl = result.cdnUrl || result.storageUrl;
        } catch (e: any) {
          console.warn('Avatar parse error:', e.message);
          finalAvatarUrl = avatarUrl.slice(0, 500);
        }
      } else {
        finalAvatarUrl = avatarUrl ? avatarUrl.slice(0, 500) : null as any;
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
            fileName: `artist-banner-${id}.jpg`,
            mimeType,
            category: 'banner',
            entityType: 'artist',
            entityId: id,
            uploadedBy: session.userId,
          });

          finalBannerUrl = result.cdnUrl || result.storageUrl;
        } catch (e: any) {
          console.warn('Banner parse error:', e.message);
          finalBannerUrl = bannerUrl.slice(0, 500);
        }
      } else {
        finalBannerUrl = bannerUrl ? bannerUrl.slice(0, 500) : null as any;
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (typeof finalAvatarUrl !== 'undefined') {
      updates.push('image_url = ?');
      values.push(finalAvatarUrl);
    }
    if (typeof finalBannerUrl !== 'undefined') {
      updates.push('banner_url = ?');
      values.push(finalBannerUrl);
    }

    if (updates.length > 0) {
      values.push(id);
      try {
        await query(`UPDATE LI_ARTISTS SET ${updates.join(', ')} WHERE id = ?`, values);
      } catch {
        await query(`UPDATE artists SET ${updates.join(', ')} WHERE id = ?`, values);
      }
    }

    return NextResponse.json({
      success: true,
      id,
      status,
      avatarUrl: finalAvatarUrl,
      bannerUrl: finalBannerUrl,
    });
  } catch (error: any) {
    console.error('Error updating artist:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in to create an artist.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, genre, bio, avatarUrl, bannerUrl } = body;

    const trimmedName = name?.trim();
    if (!trimmedName) {
      return NextResponse.json({ success: false, error: 'Artist name is required' }, { status: 400 });
    }

    // Check for duplicate artist name (case-insensitive)
    try {
      const existing = await query<any[]>(
        `SELECT id, name FROM LI_ARTISTS WHERE LOWER(name) = LOWER(?) LIMIT 1`,
        [trimmedName]
      );
      if (existing && existing.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `An artist with the name "${existing[0].name}" already exists. Duplicate artist names are not allowed.`,
          },
          { status: 409 }
        );
      }
    } catch {
      try {
        const existingFallback = await query<any[]>(
          `SELECT id, name FROM artists WHERE LOWER(name) = LOWER(?) LIMIT 1`,
          [trimmedName]
        );
        if (existingFallback && existingFallback.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `An artist with the name "${existingFallback[0].name}" already exists. Duplicate artist names are not allowed.`,
            },
            { status: 409 }
          );
        }
      } catch {
        // Continue if duplicate check query fails
      }
    }

    const id = uuidv4();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const hue = Math.floor(Math.random() * 360);

    let finalAvatarUrl = avatarUrl || null;
    let finalBannerUrl = bannerUrl || null;

    const { uploadAndStore, fileCache } = await import('@/controllers/storageController');

    // Process Avatar if base64 data URL
    if (avatarUrl && avatarUrl.startsWith('data:')) {
      try {
        const parts = avatarUrl.split(';base64,');
        const mimeMatch = parts[0].match(/data:(.*?)$/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const buffer = Buffer.from(parts[1], 'base64');

        const result = await uploadAndStore({
          buffer,
          fileName: `artist-avatar-${id}.jpg`,
          mimeType,
          category: 'avatar',
          entityType: 'artist',
          entityId: id,
          uploadedBy: session.userId,
        });

        finalAvatarUrl = result.cdnUrl || result.storageUrl;
      } catch (e: any) {
        console.warn('New artist avatar parse error:', e.message);
        finalAvatarUrl = avatarUrl.slice(0, 500);
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
          fileName: `artist-banner-${id}.jpg`,
          mimeType,
          category: 'banner',
          entityType: 'artist',
          entityId: id,
          uploadedBy: session.userId,
        });

        finalBannerUrl = result.cdnUrl || result.storageUrl;
      } catch (e: any) {
        console.warn('New artist banner parse error:', e.message);
        finalBannerUrl = bannerUrl.slice(0, 500);
      }
    }

    const sql = `
      INSERT INTO LI_ARTISTS (id, name, slug, image_url, banner_url, hue, bio, monthly_listeners, is_verified, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 1)
    `;
    const params = [id, name.trim(), slug, finalAvatarUrl, finalBannerUrl, hue, bio || genre || null];

    try {
      await query(sql, params);
    } catch {
      const fallbackSql = `
        INSERT INTO artists (id, name, slug, image_url, banner_url, hue, bio, monthly_listeners, is_verified, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 1)
      `;
      await query(fallbackSql, params);
    }

    return NextResponse.json({
      success: true,
      artist: {
        id,
        name: name.trim(),
        genre: bio || genre || 'Artist',
        followers: 0,
        avatarUrl: finalAvatarUrl,
        bannerUrl: finalBannerUrl,
        hue,
        status: 'active',
      },
    });
  } catch (error: any) {
    console.error('Error creating artist:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

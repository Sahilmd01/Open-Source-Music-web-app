import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

    let whereClause = '';
    const params: any[] = [];

    if (search) {
      whereClause = ` WHERE (LOWER(u.name) LIKE ? OR LOWER(u.username) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.bio) LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    // 1. Get total count
    const countSql = `SELECT COUNT(*) as total FROM LI_USERS u ${whereClause}`;
    const countRows = await query<any[]>(countSql, params);
    const total = countRows?.[0]?.total || 0;

    // 2. Get paginated users
    const usersSql = `
      SELECT u.id, u.name, u.username, u.email, u.phone, u.bio,
             u.avatar_url, u.banner_url, u.is_verified, u.is_active,
             u.followers_count, u.following_count, u.playlists_count,
             u.created_at, r.name as role
      FROM LI_USERS u
      LEFT JOIN LI_ROLES r ON u.role_id = r.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await query<any[]>(usersSql, [...params, limit, offset]);

    const users = (rows || []).map((u) => {
      const joinedYear = u.created_at
        ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Recently';

      return {
        id: u.id,
        name: u.name || 'Anonymous User',
        username: u.username || 'user',
        email: u.email || '',
        role: (u.role || 'user') as 'user' | 'admin',
        avatarUrl: u.avatar_url && u.avatar_url.trim() !== '' ? u.avatar_url : '/default/default-user-avatar.avif',
        bannerUrl: u.banner_url && u.banner_url.trim() !== '' ? u.banner_url : '/default/default-user-banner.png',
        bio: u.bio || '',
        phone: u.phone || '',
        joinedDate: `Member since ${joinedYear}`,
        isVerified: Boolean(u.is_verified),
        isBanned: u.is_active === 0,
        warnings: [],
        playlistsCount: u.playlists_count || 0,
        followersCount: u.followers_count || 0,
        followingCount: u.following_count || 0,
        favoriteGenre: 'Electronic',
      };
    });

    const hasMore = offset + users.length < total;

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        limit,
        offset,
        hasMore,
      },
    });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Failed to load users from database' }, { status: 500 });
  }
}

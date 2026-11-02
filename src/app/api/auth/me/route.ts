import { NextResponse } from 'next/server';
import { getSessionUser, AUTH_COOKIE_NAME } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const users = await query<any[]>(
      `SELECT u.id, u.name, u.username, u.email, u.phone, u.bio,
              u.avatar_url, u.banner_url, u.is_verified, u.followers_count,
              u.following_count, u.playlists_count, u.created_at,
              r.name as role_name
       FROM LI_USERS u
       LEFT JOIN LI_ROLES r ON u.role_id = r.id
       WHERE u.id = ? AND u.is_active = 1
       LIMIT 1`,
      [session.userId]
    );

    if (!users || users.length === 0) {
      const response = NextResponse.json({ authenticated: false, user: null });
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    const user = users[0];

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        role: user.role_name || 'user',
        avatarUrl: user.avatar_url,
        bannerUrl: user.banner_url,
        isVerified: Boolean(user.is_verified),
        followersCount: user.followers_count,
        followingCount: user.following_count,
        playlistsCount: user.playlists_count,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}

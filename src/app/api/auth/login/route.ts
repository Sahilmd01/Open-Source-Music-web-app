import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, signJwtToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();

    // 1. Fetch user by email or username
    const users = await query<any[]>(
      `SELECT u.id, u.role_id, u.name, u.username, u.email, u.password_hash,
              u.avatar_url, u.banner_url, u.is_verified, u.is_active,
              u.followers_count, u.following_count, u.playlists_count,
              r.name as role_name
       FROM LI_USERS u
       LEFT JOIN LI_ROLES r ON u.role_id = r.id
       WHERE (LOWER(u.email) = ? OR LOWER(u.username) = ?) AND u.is_active = 1
       LIMIT 1`,
      [emailClean, emailClean]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = users[0];

    // 2. Validate password
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'This account does not have a password configured. Please use alternative sign-in.' },
        { status: 400 }
      );
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 3. Update last login timestamp
    await query('UPDATE LI_USERS SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // 4. Generate JWT
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role_name || 'user',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role_name || 'user',
        avatarUrl: user.avatar_url,
        bannerUrl: user.banner_url,
        isVerified: Boolean(user.is_verified),
        followersCount: user.followers_count,
        followingCount: user.following_count,
        playlistsCount: user.playlists_count,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during login.' },
      { status: 500 }
    );
  }
}

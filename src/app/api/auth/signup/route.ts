import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { hashPassword, signJwtToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, username } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();
    const nameClean = name.trim();

    // Generate or clean username
    let chosenUsername = (username || nameClean.toLowerCase().replace(/[^a-z0-9_]/g, '')).slice(0, 30);
    if (!chosenUsername) {
      chosenUsername = `user_${Date.now().toString().slice(-6)}`;
    }

    // 1. Check if user already exists
    const existingUsers = await query<any[]>(
      'SELECT id, email, username FROM LI_USERS WHERE email = ? OR username = ? LIMIT 1',
      [emailClean, chosenUsername]
    );

    if (existingUsers && existingUsers.length > 0) {
      if (existingUsers[0].email.toLowerCase() === emailClean) {
        return NextResponse.json(
          { error: 'An account with this email already exists.' },
          { status: 409 }
        );
      }
      // If only username collided, append a random string
      chosenUsername = `${chosenUsername.slice(0, 20)}_${crypto.randomBytes(3).toString('hex')}`;
    }

    // 2. Hash password
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    // Ensure default role exists
    await query(
      `INSERT IGNORE INTO LI_ROLES (id, name, label, description, priority, is_default)
       VALUES ('r-user', 'user', 'User', 'Standard user with access to music playback, library, and playlists.', 10, 1)`
    );

    // 3. Insert user into users table
    await query(
      `INSERT INTO LI_USERS (
        id, role_id, name, username, email, password_hash, is_active, is_verified, followers_count, following_count, playlists_count
      ) VALUES (?, 'r-user', ?, ?, ?, ?, 1, 0, 0, 0, 0)`,
      [userId, nameClean, chosenUsername, emailClean, passwordHash]
    );

    // 4. Create default preferences
    await query(
      `INSERT IGNORE INTO LI_USER_PREFERENCES (user_id) VALUES (?)`,
      [userId]
    );

    // 5. Create token & set cookie
    const token = signJwtToken({
      userId,
      email: emailClean,
      username: chosenUsername,
      role: 'user',
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          name: nameClean,
          username: chosenUsername,
          email: emailClean,
          role: 'user',
          avatarUrl: null,
          bannerUrl: null,
          isVerified: false,
          followersCount: 0,
          followingCount: 0,
          playlistsCount: 0,
        },
      },
      { status: 201 }
    );

    // Set HTTP-only session cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}

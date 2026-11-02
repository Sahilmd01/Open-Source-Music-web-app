import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';

// GET /api/user/profile - Fetch authenticated user's profile
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await query<any[]>(
      `SELECT u.id, u.name, u.username, u.email, u.phone, u.bio,
              u.avatar_url, u.banner_url, u.is_verified,
              u.followers_count, u.following_count, u.playlists_count,
              u.created_at, r.name as role_name
       FROM LI_USERS u
       LEFT JOIN LI_ROLES r ON u.role_id = r.id
       WHERE u.id = ? AND u.is_active = 1
       LIMIT 1`,
      [session.userId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const u = rows[0];
    const joinedYear = u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

    return NextResponse.json({
      success: true,
      profile: {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        phone: u.phone || '',
        bio: u.bio || '',
        avatarUrl: u.avatar_url || '',
        bannerUrl: u.banner_url || '',
        joinedDate: `Member since ${joinedYear}`,
        isVerified: Boolean(u.is_verified),
        followersCount: u.followers_count || 0,
        followingCount: u.following_count || 0,
        playlistsCount: u.playlists_count || 0,
        role: u.role_name || 'user',
      },
    });
  } catch (error: any) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Failed to retrieve profile' }, { status: 500 });
  }
}

// PUT /api/user/profile - Update profile information
export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, bio, phone, avatarUrl, bannerUrl, currentPassword, newPassword } = body;

    // Optional password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to set a new password.' },
          { status: 400 }
        );
      }

      const users = await query<any[]>(
        'SELECT password_hash FROM LI_USERS WHERE id = ?',
        [session.userId]
      );

      if (!users || users.length === 0 || !users[0].password_hash) {
        return NextResponse.json({ error: 'User account not configured for password change.' }, { status: 400 });
      }

      const valid = await verifyPassword(currentPassword, users[0].password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }

      const newHash = await hashPassword(newPassword);
      await query('UPDATE LI_USERS SET password_hash = ? WHERE id = ?', [newHash, session.userId]);
    }

    // Check username uniqueness if changed
    if (username && username !== session.username) {
      const cleanUsername = username.trim().toLowerCase();
      const existing = await query<any[]>(
        'SELECT id FROM LI_USERS WHERE username = ? AND id != ? LIMIT 1',
        [cleanUsername, session.userId]
      );
      if (existing && existing.length > 0) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username.trim());
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone.trim());
    }
    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatarUrl);
    }
    if (bannerUrl !== undefined) {
      updates.push('banner_url = ?');
      values.push(bannerUrl);
    }

    if (updates.length > 0) {
      values.push(session.userId);
      await query(`UPDATE LI_USERS SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

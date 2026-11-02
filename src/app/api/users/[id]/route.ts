import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);

    const rows = await query<any[]>(
      `SELECT u.id, u.name, u.username, u.email, u.phone, u.bio,
              u.avatar_url, u.banner_url, u.is_verified, u.is_active,
              u.followers_count, u.following_count, u.playlists_count,
              u.created_at, r.name as role
       FROM LI_USERS u
       LEFT JOIN LI_ROLES r ON u.role_id = r.id
       WHERE u.id = ? OR LOWER(u.username) = LOWER(?)
       LIMIT 1`,
      [decodedId, decodedId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const u = rows[0];
    const joinedYear = u.created_at
      ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Recently';

    // Fetch actual playlists created by this user from database
    const playlistRows = await query<any[]>(
      `SELECT id, title, description, cover_image_url, hue, song_count, total_duration, like_count
       FROM LI_PLAYLISTS
       WHERE owner_id = ? AND deleted_at IS NULL AND is_public = 1
       ORDER BY created_at DESC
       LIMIT 20`,
      [u.id]
    );

    const playlists = (playlistRows || []).map((p) => {
      const minutes = Math.floor((p.total_duration || 0) / 60);
      const seconds = (p.total_duration || 0) % 60;
      const durationLabel = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      return {
        id: p.id,
        title: p.title,
        description: p.description || '',
        coverImage: p.cover_image_url || '/default/default-user-banner.png',
        hue: p.hue || 24,
        songCount: p.song_count || 0,
        durationLabel,
        likes: p.like_count || 0,
      };
    });

    const user = {
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
      playlistsCount: u.playlists_count || playlists.length,
      followersCount: u.followers_count || 0,
      followingCount: u.following_count || 0,
      playlists,
    };

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Fetch single user error:', error);
    return NextResponse.json({ error: 'Failed to load user profile' }, { status: 500 });
  }
}

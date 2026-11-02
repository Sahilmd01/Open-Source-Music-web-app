import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUsername = searchParams.get('username');

    if (!rawUsername) {
      return NextResponse.json({ available: false, error: 'Username is required' }, { status: 400 });
    }

    const username = rawUsername.trim().toLowerCase();

    // Basic format check: alphanumeric and underscore only, 3-30 chars
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      return NextResponse.json({
        available: false,
        error: 'Username must be 3-30 characters (letters, numbers, underscore only)',
      });
    }

    const session = await getSessionUser();
    const currentUserId = session?.userId;

    let rows: any[] = [];
    if (currentUserId) {
      rows = await query<any[]>(
        'SELECT id FROM LI_USERS WHERE LOWER(username) = ? AND id != ? LIMIT 1',
        [username, currentUserId]
      );
    } else {
      rows = await query<any[]>(
        'SELECT id FROM LI_USERS WHERE LOWER(username) = ? LIMIT 1',
        [username]
      );
    }

    const isAvailable = !rows || rows.length === 0;

    return NextResponse.json({
      available: isAvailable,
      username,
      message: isAvailable ? 'Username is available' : 'Username is already taken',
    });
  } catch (error: any) {
    console.error('Check username error:', error);
    return NextResponse.json({ available: false, error: 'Server error' }, { status: 500 });
  }
}

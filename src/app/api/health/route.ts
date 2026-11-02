import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query<any[]>('SELECT 1 as healthy');
    return NextResponse.json({
      status: 'ok',
      database: res?.[0]?.healthy === 1 ? 'connected' : 'error',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'unreachable',
        error: error?.message || 'Database connection error',
      },
      { status: 500 }
    );
  }
}

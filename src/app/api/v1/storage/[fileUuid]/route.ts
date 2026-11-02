import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { fileCache, resolveCdnUrl, fetchBuffer } from '@/controllers/storageController';
import type { StorageRecord } from '@/controllers/storageController';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/storage/[fileUuid]
//
// Strategy (Vercel-safe, never broken):
//
//  1. RAM cache hit  → serve bytes immediately (warm Lambda burst)
//  2. DB lookup      → if cdn_url stored → 302 redirect (instant, CDN-direct)
//  3. No cdn_url yet → fetch from Telegram, store cdn_url, then 302 redirect
//  4. Any error      → 503 with Retry-After (never 404 for a known file)
//
// The redirect strategy means:
//  - Images load directly from Telegram's CDN (fast, no server buffering)
//  - Audio streams directly from Telegram's CDN (no 10s Vercel timeout risk)
//  - Server only touches Telegram when cdn_url is stale/missing
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ fileUuid: string }> }
) {
  let fileUuid = '';
  try {
    ({ fileUuid } = await context.params);

    if (!fileUuid || !/^[a-zA-Z0-9_-]+$/.test(fileUuid)) {
      return NextResponse.json({ success: false, message: 'Invalid file identifier.' }, { status: 400 });
    }

    // ── 1. RAM cache (warm Lambda) ────────────────────────────────────────
    const cached = fileCache.get(fileUuid);
    if (cached) {
      // If we have a CDN URL cached in memory, prefer redirect (lighter response)
      if (cached.cdnUrl) {
        return NextResponse.redirect(cached.cdnUrl, {
          status: 302,
          headers: { 'Cache-Control': 'public, max-age=3200' },
        });
      }
      // Otherwise serve the buffer (upload-time primed cache)
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          'Content-Type': cached.mimeType || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${cached.fileName.replace(/"/g, '_')}"`,
          'Cache-Control': 'public, max-age=86400, immutable',
        },
      });
    }

    // ── 2. DB lookup ──────────────────────────────────────────────────────
    let rows: StorageRecord[] | null = null;
    try {
      rows = await query<StorageRecord[]>(
        `SELECT file_uuid, file_name, file_path, cdn_url, cdn_url_updated_at, file_type, file_size
         FROM LI_STORAGE_MAP
         WHERE file_uuid = ?
         LIMIT 1`,
        [fileUuid]
      );
    } catch {
      rows = await query<StorageRecord[]>(
        `SELECT file_uuid, file_name, file_path, cdn_url, cdn_url_updated_at, file_type, file_size
         FROM li_storage_map
         WHERE file_uuid = ?
         LIMIT 1`,
        [fileUuid]
      );
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'File not found.' },
        { status: 404 }
      );
    }

    const record: StorageRecord = rows[0] as StorageRecord;

    // ── 3. Resolve CDN URL (uses stored value or fetches from Telegram) ───
    const cdnUrl = await resolveCdnUrl(record);

    // Prime RAM cache with CDN URL for future warm-Lambda hits
    fileCache.set(fileUuid, {
      buffer: Buffer.alloc(0), // placeholder — we redirect, no buffer needed
      mimeType: record.file_type || 'application/octet-stream',
      fileName: record.file_name || 'file',
      cdnUrl,
    });

    // ── 4. Redirect to Telegram CDN ───────────────────────────────────────
    // Browser/audio element fetches directly — no server buffering, instant.
    return NextResponse.redirect(cdnUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'public, max-age=2700, stale-while-revalidate=86400',
      },
    });

  } catch (error: any) {
    const msg: string = error?.message ?? '';
    console.error(`[storage] ${fileUuid} error:`, msg);

    // Distinguish permanent not-found from transient Telegram failures
    const isTransient =
      msg.includes('timed out') ||
      msg.includes('timeout') ||
      msg.includes('ECONNRESET') ||
      msg.includes('ETIMEDOUT') ||
      msg.includes('ENOTFOUND') ||
      msg.includes('getFile failed') ||
      msg.includes('Download failed');

    if (isTransient) {
      return NextResponse.json(
        { success: false, message: 'Storage temporarily unavailable. Retrying shortly.' },
        { status: 503, headers: { 'Retry-After': '5' } }
      );
    }

    return NextResponse.json(
      { success: false, message: msg || 'Internal server error.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { registerDirectUploadToStorage, getTelegramCdnUrl } from '@/controllers/storageController';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/v1/storage/upload-ticket
 * Returns Telegram upload parameters to authenticated clients.
 * This enables the browser to send large audio/video files directly to Telegram Bot API,
 * completely bypassing Vercel's strict 4.5MB Serverless Function payload limit (FUNCTION_PAYLOAD_TOO_LARGE).
 */
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser?.userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { success: false, message: 'Telegram storage credentials not configured.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: `https://api.telegram.org/bot${token}/sendDocument`,
        chatId,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to generate upload ticket.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/storage/upload-ticket
 * Registers a file that the client uploaded directly to Telegram into LI_STORAGE_MAP.
 * Payload is tiny (< 1KB JSON): { fileId, fileName, mimeType, fileSize, category, ... }
 */
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser?.userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Telegram bot token missing.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { fileId, fileName, mimeType, fileSize, category, entityType, entityId, audioDuration } = body;

    if (!fileId) {
      return NextResponse.json(
        { success: false, message: 'fileId is required.' },
        { status: 400 }
      );
    }

    // Pre-fetch CDN URL so first audio playback is instant
    let cdnUrl = '';
    try {
      cdnUrl = await getTelegramCdnUrl(fileId, token);
    } catch {
      // Non-fatal — serve route will fetch on demand
    }

    const result = await registerDirectUploadToStorage({
      fileId,
      cdnUrl: cdnUrl || undefined,
      fileName: fileName || 'uploaded_audio.mp3',
      mimeType: mimeType || 'audio/mpeg',
      fileSize: parseInt(fileSize, 10) || 0,
      category: category || 'audio',
      entityType: entityType || 'track',
      entityId: entityId || undefined,
      uploadedBy: sessionUser.userId,
      audioDuration: audioDuration ? parseInt(audioDuration, 10) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Direct upload registered successfully.',
      data: {
        fileUuid: result.fileUuid,
        fileName: fileName || 'uploaded_audio.mp3',
        url: result.storageUrl,
        cdnUrl: result.cdnUrl,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to register direct upload:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to register uploaded file.' },
      { status: 500 }
    );
  }
}

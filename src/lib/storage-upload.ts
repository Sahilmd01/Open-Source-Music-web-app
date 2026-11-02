/**
 * Storage upload helper.
 *
 * Handles file uploads from the browser.
 * For files that exceed Vercel's strict 4.5MB Serverless Function payload limit
 * (FUNCTION_PAYLOAD_TOO_LARGE), it automatically uploads directly from the browser
 * to Telegram Bot API, then registers the file record with the backend.
 */

export function dataURLtoBlob(dataurl: string): { blob: Blob; mimeType: string } {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0]?.match(/:(.*?);/);
  const mimeType = mimeMatch?.[1] ?? 'application/octet-stream';
  const b64 = arr[1] || '';
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return { blob: new Blob([bytes], { type: mimeType }), mimeType };
}

export function dataURLtoFile(dataurl: string, filename: string): File {
  const { blob, mimeType } = dataURLtoBlob(dataurl);
  return new File([blob], filename, { type: mimeType });
}

/**
 * Direct client-to-Telegram upload.
 * Completely bypasses Vercel's 4.5MB limit by sending the file directly from
 * the browser to https://api.telegram.org/bot<token>/sendDocument.
 */
async function uploadDirectToTelegram(
  blob: Blob,
  fileName: string,
  mimeType: string,
  category: string = 'audio',
  audioDuration?: number
): Promise<string> {
  // 1. Get upload ticket from backend (authorized)
  const ticketRes = await fetch('/api/v1/storage/upload-ticket');
  const ticketData = await ticketRes.json();
  if (!ticketRes.ok || !ticketData.success || !ticketData.data?.uploadUrl) {
    throw new Error(ticketData.message || 'Failed to initialize direct upload ticket.');
  }

  const { uploadUrl, chatId } = ticketData.data;

  // 2. Upload file directly to Telegram API from browser
  const tgFormData = new FormData();
  tgFormData.append('chat_id', chatId);
  tgFormData.append('disable_content_type_detection', 'true');
  tgFormData.append('document', new File([blob], fileName, { type: mimeType }));

  const tgRes = await fetch(uploadUrl, {
    method: 'POST',
    body: tgFormData,
  });

  const tgJson = await tgRes.json();
  if (!tgRes.ok || !tgJson.ok || !tgJson.result) {
    throw new Error(`Telegram direct upload failed: ${tgJson.description || 'Unknown error'}`);
  }

  const r = tgJson.result;
  const fileId =
    r.document?.file_id ||
    r.video?.file_id ||
    r.audio?.file_id ||
    (Array.isArray(r.photo) && r.photo.length ? r.photo[r.photo.length - 1]?.file_id : null);

  if (!fileId) {
    throw new Error('Telegram did not return a valid file_id.');
  }

  // 3. Register the file in backend LI_STORAGE_MAP (tiny JSON payload < 1KB)
  const regRes = await fetch('/api/v1/storage/upload-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileId,
      fileName,
      mimeType,
      fileSize: blob.size,
      category,
      audioDuration,
    }),
  });

  const regData = await regRes.json();
  if (!regRes.ok || !regData.success) {
    throw new Error(regData.message || 'Failed to register uploaded file.');
  }

  // Always return the permanent gateway URL (/api/v1/storage/:uuid)
  // so stored links never expire even after hours, months, or years.
  return regData.data.url || regData.data.cdnUrl;
}

/**
 * Upload a file or base64 data URL to storage.
 * - Files > 4MB (like MP3s/audio) automatically use direct-to-Telegram to bypass Vercel 4.5MB limit.
 * - Files <= 4MB use standard /api/v1/storage/upload route with fallback to direct upload on 413.
 */
export async function uploadMediaToStorage(
  fileOrDataUrl: File | string,
  defaultFilename: string = 'media.jpg',
  category: string = 'other',
  audioDuration?: number
): Promise<string> {
  // Already a storage/CDN URL — no upload needed
  if (typeof fileOrDataUrl === 'string' && !fileOrDataUrl.startsWith('data:')) {
    return fileOrDataUrl;
  }

  let blob: Blob;
  let mimeType: string;
  let fileName: string;

  if (typeof fileOrDataUrl === 'string') {
    const result = dataURLtoBlob(fileOrDataUrl);
    blob = result.blob;
    mimeType = result.mimeType;
    fileName = defaultFilename;
  } else {
    blob = fileOrDataUrl;
    mimeType = fileOrDataUrl.type || 'application/octet-stream';
    fileName = fileOrDataUrl.name || defaultFilename;
  }

  // If file is > 4MB (e.g. songs/audio), Vercel serverless function will reject with 413
  // Bypass Vercel entirely and upload directly to Telegram Bot API from browser
  const FOUR_MB = 4 * 1024 * 1024;
  if (blob.size >= FOUR_MB) {
    return uploadDirectToTelegram(blob, fileName, mimeType, category, audioDuration);
  }

  // For smaller files (< 4MB like covers, avatars):
  try {
    const res = await fetch('/api/v1/storage/upload', {
      method: 'POST',
      headers: {
        'Content-Type': mimeType,
        'X-File-Name': encodeURIComponent(fileName),
        'X-Category': category,
      },
      body: blob,
    });

    // If Vercel still reports 413, fallback to direct upload
    if (res.status === 413) {
      console.warn('Vercel 413 encountered for small payload, falling back to direct upload...');
      return uploadDirectToTelegram(blob, fileName, mimeType, category, audioDuration);
    }

    const data = await res.json();
    if (res.ok && data.success) {
      return data.data.url || data.data.cdnUrl;
    }

    throw new Error(data.message || `Upload failed with status ${res.status}`);
  } catch (err: any) {
    if (err.message?.includes('413') || err.message?.includes('Too Large')) {
      return uploadDirectToTelegram(blob, fileName, mimeType, category, audioDuration);
    }
    throw err;
  }
}

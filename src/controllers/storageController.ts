import https from 'node:https';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { query } from '@/lib/db';

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE NOTES (Vercel-safe)
//
// On Vercel every request is a cold Lambda — in-memory cache does NOT persist.
// Strategy:
//  1. At upload time we call getFile immediately to get the CDN download URL
//     and store it as `cdn_url` in LI_STORAGE_MAP alongside the file_id.
//  2. At serve time we issue a 302 redirect straight to Telegram's CDN.
//     The browser/audio element fetches directly from Telegram — zero server
//     buffering, zero timeout risk, instant response.
//  3. The RAM cache is still useful within a single warm Lambda invocation
//     (e.g. same file requested twice in the same request burst).
//  4. In-flight dedup map prevents stampede: if N concurrent requests arrive
//     for the same cold file_id, only ONE goes to Telegram; the rest await it.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

interface CacheEntry {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  cdnUrl?: string;
  timestamp: number;
}

// ── In-process RAM cache (useful within a warm Lambda burst) ─────────────────

const RAM_CACHE_MAX_ITEMS = 200;
const RAM_CACHE_TTL_MS = 30 * 60 * 1000; // 30 min (Telegram CDN URLs expire ~1h)

class FileMemoryCache {
  private cache = new Map<string, CacheEntry>();

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > RAM_CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    // LRU: move to end
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry;
  }

  set(key: string, entry: Omit<CacheEntry, 'timestamp'>): void {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= RAM_CACHE_MAX_ITEMS) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(key, { ...entry, timestamp: Date.now() });
  }

  delete(key: string): void { this.cache.delete(key); }
}

export const fileCache = new FileMemoryCache();

// ── In-flight deduplication (prevents stampede for the same file_id) ─────────
const inFlight = new Map<string, Promise<Buffer>>();
const inFlightCdn = new Map<string, Promise<string>>();

// ── Persistent HTTPS Agent with Keep-Alive ────────────────────────────────────
let telegramAgentInstance: https.Agent | null = null;

export function getTelegramAgent(): https.Agent {
  if (!telegramAgentInstance) {
    telegramAgentInstance = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 10000,
      maxSockets: 50,
      maxFreeSockets: 20,
      timeout: 10000,
    });
  }
  return telegramAgentInstance;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function httpsGet(url: string, timeoutMs = 8000): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { agent: getTelegramAgent(), timeout: timeoutMs }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) resolve(data);
        else reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
      });
    });
    req.on('timeout', () => req.destroy(new Error(`Request timed out (${timeoutMs}ms)`)));
    req.on('error', reject);
  });
}

// ── Get a fresh Telegram CDN URL for a file_id ────────────────────────────────
export async function getTelegramCdnUrl(
  fileId: string,
  token: string
): Promise<string> {
  const MAX = 3;
  let lastErr: any;

  for (let i = 1; i <= MAX; i++) {
    try {
      const raw = await httpsGet(
        `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`,
        8000
      );
      const parsed = JSON.parse(raw);
      if (parsed.ok && parsed.result?.file_path) {
        return `https://api.telegram.org/file/bot${token}/${parsed.result.file_path}`;
      }
      throw new Error(`getFile bad payload: ${raw.slice(0, 200)}`);
    } catch (err: any) {
      lastErr = err;
      if (i < MAX) await delay(350 * i); // 350ms, 700ms (fast recovery)
    }
  }
  throw new Error(`getFile failed after ${MAX} attempts: ${lastErr?.message}`);
}

// ── Download binary from a URL (follows redirects) ────────────────────────────

export function downloadBuffer(url: string, redirects = 5, timeoutMs = 25000): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (redirects <= 0) return reject(new Error('Too many redirects'));

    const req = https.get(url, { agent: getTelegramAgent(), timeout: timeoutMs }, (res) => {
      if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        return resolve(downloadBuffer(
          new URL(res.headers.location, url).toString(),
          redirects - 1,
          timeoutMs
        ));
      }
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
      }
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error(`Download timed out (${timeoutMs}ms)`)));
    req.on('error', reject);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD — stores file_id AND pre-fetches cdn_url immediately after upload
// so the first serve is instant (redirect, no buffering needed).
// ─────────────────────────────────────────────────────────────────────────────

export async function uploadToTelegram(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string = 'application/octet-stream'
): Promise<{ fileId: string; cdnUrl: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing');

  const boundary = `TGBound${Date.now()}${Math.random().toString(36).slice(2)}`;
  const safe = fileName.replace(/"/g, '_');

  const payload = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="disable_content_type_detection"\r\n\r\ntrue\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${safe}"\r\nContent-Type: ${mimeType}\r\n\r\n`),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  let lastErr: any;

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const responseText = await new Promise<string>((resolve, reject) => {
        const req = https.request(
          'https://api.telegram.org/bot' + token + '/sendDocument',
          {
            method: 'POST',
            agent: getTelegramAgent(),
            headers: {
              'Content-Type': `multipart/form-data; boundary=${boundary}`,
              'Content-Length': payload.length,
            },
            timeout: 55000, // stay under Vercel's 60s limit
          },
          (res) => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (c) => { data += c; });
            res.on('end', () => {
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) resolve(data);
              else reject(new Error(`Telegram upload HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
            });
          }
        );
        req.on('timeout', () => req.destroy(new Error('Upload timed out (55s)')));
        req.on('error', reject);
        req.write(payload);
        req.end();
      });

      const parsed = JSON.parse(responseText);
      if (!parsed.ok || !parsed.result) throw new Error(`Telegram error: ${responseText.slice(0, 300)}`);

      const r = parsed.result;
      const fileId =
        r.document?.file_id || r.video?.file_id || r.audio?.file_id ||
        r.animation?.file_id || r.sticker?.file_id ||
        (Array.isArray(r.photo) && r.photo.length ? r.photo[r.photo.length - 1]?.file_id : null);

      if (!fileId) throw new Error(`No file_id in Telegram response: ${responseText.slice(0, 300)}`);

      // Pre-fetch the CDN URL immediately so first serve is a free redirect
      let cdnUrl = '';
      try {
        cdnUrl = await getTelegramCdnUrl(fileId, token);
      } catch {
        // Non-fatal — serve will fetch it on demand
      }

      return { fileId, cdnUrl };
    } catch (err: any) {
      lastErr = err;
      console.warn(`Telegram upload attempt ${attempt} failed: ${err.message}`);
      if (attempt < 4) await delay(2000 * attempt);
    }
  }

  throw new Error(`Upload failed after 4 attempts: ${lastErr?.message}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD — primary path: redirect to CDN URL (instant, no buffering)
// Fallback: re-fetch CDN URL from Telegram, update DB, then redirect.
// ─────────────────────────────────────────────────────────────────────────────

export interface StorageRecord {
  file_uuid: string;
  file_name: string;
  file_path: string;   // telegram:<file_id>
  cdn_url?: string;    // https://api.telegram.org/file/bot<TOKEN>/<path> (cached)
  cdn_url_updated_at?: string; // ISO timestamp of when cdn_url was last fetched
  file_type: string;
  file_size: number;
}

// Telegram CDN URLs are valid for ~1 hour. We refresh at 50 min to stay safe.
const CDN_URL_TTL_MS = 50 * 60 * 1000;

/**
 * Resolve a CDN URL for a storage record.
 * Re-fetches from Telegram when:
 *  - cdn_url is missing/blank
 *  - cdn_url was last fetched more than 50 minutes ago (TTL expired)
 * Always persists the fresh URL back to DB so future cold-Lambda requests are instant.
 */
export async function resolveCdnUrl(record: StorageRecord): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN!;

  // Extract file_id
  const fileId = record.file_path.startsWith('telegram:')
    ? record.file_path.slice('telegram:'.length)
    : record.file_path;

  if (!fileId) throw new Error('Invalid file_path — no file_id');

  // Fast path: cdn_url stored in DB AND still fresh (< 50 min old)
  if (record.cdn_url && record.cdn_url.startsWith('https://')) {
    const updatedAt = record.cdn_url_updated_at ? new Date(record.cdn_url_updated_at).getTime() : 0;
    const ageMs = Date.now() - updatedAt;
    if (ageMs < CDN_URL_TTL_MS) {
      return record.cdn_url;
    }
  }

  // Deduplicate in-flight requests for this fileUuid
  const key = record.file_uuid || fileId;
  if (inFlightCdn.has(key)) {
    return inFlightCdn.get(key)!;
  }

  const promise = (async () => {
    try {
      const cdnUrl = await getTelegramCdnUrl(fileId, token);

      // Persist back to DB — use NOW() so cdn_url_updated_at is always accurate
      query(
        `UPDATE LI_STORAGE_MAP SET cdn_url = ?, cdn_url_updated_at = NOW() WHERE file_uuid = ?`,
        [cdnUrl, record.file_uuid]
      ).catch(() => {
        query(
          `UPDATE li_storage_map SET cdn_url = ?, cdn_url_updated_at = NOW() WHERE file_uuid = ?`,
          [cdnUrl, record.file_uuid]
        ).catch((e) => console.warn('cdn_url persist failed:', e.message));
      });

      return cdnUrl;
    } finally {
      inFlightCdn.delete(key);
    }
  })();

  inFlightCdn.set(key, promise);
  return promise;
}

/**
 * Fetch the buffer for a record (for cases where we must stream bytes, not redirect).
 * Uses in-flight dedup + RAM cache.
 */
export async function fetchBuffer(record: StorageRecord): Promise<Buffer> {
  const key = record.file_uuid;

  // RAM cache hit
  const hit = fileCache.get(key);
  if (hit) return hit.buffer;

  // In-flight dedup
  if (inFlight.has(key)) return inFlight.get(key)!;

  const promise = (async () => {
    try {
      const cdnUrl = await resolveCdnUrl(record);
      const buf = await downloadBuffer(cdnUrl);
      fileCache.set(key, {
        buffer: buf,
        mimeType: record.file_type || 'application/octet-stream',
        fileName: record.file_name || 'file',
        cdnUrl,
      });
      return buf;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy export — kept for backward compat with any code that calls it directly
// ─────────────────────────────────────────────────────────────────────────────
export async function downloadFromTelegram(fileId: string): Promise<Buffer> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN missing');
  const cdnUrl = await getTelegramCdnUrl(fileId, token);
  return downloadBuffer(cdnUrl);
}

// ─────────────────────────────────────────────────────────────────────────────
// HIGH-LEVEL UPLOAD HELPER
// Uploads to Telegram, inserts into LI_STORAGE_MAP with cdn_url, returns the
// public storage URL. All API routes should use this instead of raw uploadToTelegram.
// ─────────────────────────────────────────────────────────────────────────────

export interface UploadResult {
  fileUuid: string;
  storageUrl: string; // /api/v1/storage/<uuid>
  cdnUrl: string;     // direct Telegram CDN URL (use as img src for instant load)
}

export async function uploadAndStore(opts: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  category: string;       // 'audio' | 'cover_art' | 'avatar' | 'banner' | 'cover' | 'other'
  entityType?: string;    // 'track' | 'artist' | 'playlist' | 'album' | 'user'
  entityId?: string;
  uploadedBy?: string;
  audioDuration?: number;
}): Promise<UploadResult> {
  const { buffer, fileName, mimeType, category, entityType, entityId, uploadedBy, audioDuration } = opts;

  const { fileId, cdnUrl } = await uploadToTelegram(buffer, fileName, mimeType);
  const fileUuid = uuidv4();
  const storedFilePath = `telegram:${fileId}`;

  await query(
    `INSERT INTO LI_STORAGE_MAP
      (file_uuid, file_name, file_path, cdn_url, cdn_url_updated_at, file_type, file_size, category, entity_type, entity_id, uploaded_by, audio_duration)
     VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
    [
      fileUuid,
      fileName,
      storedFilePath,
      cdnUrl || null,
      mimeType,
      buffer.length,
      category,
      entityType || null,
      entityId || null,
      uploadedBy || null,
      audioDuration || null,
    ]
  );

  // Prime RAM cache with CDN URL so first serve is instant redirect
  if (cdnUrl) {
    fileCache.set(fileUuid, {
      buffer: Buffer.alloc(0),
      mimeType,
      fileName,
      cdnUrl,
    });
  }

  return {
    fileUuid,
    storageUrl: `/api/v1/storage/${fileUuid}`,
    cdnUrl: cdnUrl || `/api/v1/storage/${fileUuid}`,
  };
}

export async function registerDirectUploadToStorage(opts: {
  fileId: string;
  cdnUrl?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  category: string;
  entityType?: string;
  entityId?: string;
  uploadedBy?: string;
  audioDuration?: number;
}): Promise<UploadResult> {
  const { fileId, cdnUrl, fileName, mimeType, fileSize, category, entityType, entityId, uploadedBy, audioDuration } = opts;
  const fileUuid = uuidv4();
  const storedFilePath = `telegram:${fileId}`;

  await query(
    `INSERT INTO LI_STORAGE_MAP
      (file_uuid, file_name, file_path, cdn_url, cdn_url_updated_at, file_type, file_size, category, entity_type, entity_id, uploaded_by, audio_duration)
     VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
    [
      fileUuid,
      fileName,
      storedFilePath,
      cdnUrl || null,
      mimeType,
      fileSize,
      category,
      entityType || null,
      entityId || null,
      uploadedBy || null,
      audioDuration || null,
    ]
  );

  if (cdnUrl) {
    fileCache.set(fileUuid, {
      buffer: Buffer.alloc(0),
      mimeType,
      fileName,
      cdnUrl,
    });
  }

  return {
    fileUuid,
    storageUrl: `/api/v1/storage/${fileUuid}`,
    cdnUrl: cdnUrl || `/api/v1/storage/${fileUuid}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Express controller exports (used by src/routes/storageRoutes.ts)
// These shim the old Express req/res interface onto the new helpers.
// ─────────────────────────────────────────────────────────────────────────────

export async function uploadFile(req: any, res: any) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const { buffer, originalname, mimetype, size } = req.file;
    const result = await uploadAndStore({
      buffer,
      fileName: originalname || 'file',
      mimeType: mimetype || 'application/octet-stream',
      category: 'other',
      uploadedBy: req.user?.id || req.user?.userId || undefined,
    });
    return res.status(201).json({
      success: true,
      data: { fileUuid: result.fileUuid, fileName: originalname, fileType: mimetype, fileSize: size, url: result.storageUrl, cdnUrl: result.cdnUrl },
    });
  } catch (err: any) {
    console.error('uploadFile error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function downloadFile(req: any, res: any) {
  try {
    const fileUuid = req.params?.fileUuid;
    if (!fileUuid || !uuidValidate(fileUuid)) {
      return res.status(400).json({ success: false, message: 'Invalid file UUID.' });
    }
    const cached = fileCache.get(fileUuid);
    if (cached?.cdnUrl) return res.redirect(302, cached.cdnUrl);
    if (cached?.buffer?.length) {
      res.setHeader('Content-Type', cached.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      return res.send(cached.buffer);
    }
    const rows = await query<StorageRecord[]>(
      `SELECT file_uuid, file_name, file_path, cdn_url, file_type, file_size FROM LI_STORAGE_MAP WHERE file_uuid = ? LIMIT 1`,
      [fileUuid]
    );
    if (!rows?.length) return res.status(404).json({ success: false, message: 'File not found.' });
    const record = rows[0] as StorageRecord;
    const cdnUrl = await resolveCdnUrl(record);
    return res.redirect(302, cdnUrl);
  } catch (err: any) {
    console.error('downloadFile error:', err);
    return res.status(503).json({ success: false, message: err.message });
  }
}

export async function getFileMetadata(req: any, res: any) {
  try {
    const fileUuid = req.params?.fileUuid;
    if (!fileUuid || !uuidValidate(fileUuid)) {
      return res.status(400).json({ success: false, message: 'Invalid file UUID.' });
    }
    const rows = await query<any[]>(
      `SELECT file_uuid, file_name, file_type, file_size, uploaded_by, created_at FROM LI_STORAGE_MAP WHERE file_uuid = ? LIMIT 1`,
      [fileUuid]
    );
    if (!rows?.length) return res.status(404).json({ success: false, message: 'File not found.' });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err: any) {
    console.error('getFileMetadata error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

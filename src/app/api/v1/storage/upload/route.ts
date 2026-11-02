import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { uploadAndStore } from '@/controllers/storageController';

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10);
const MAX_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// App Router config — force dynamic and extend timeout for large uploads
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Check content-length header first to fail fast before reading body
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: `File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.` },
        { status: 413 }
      );
    }

    const sessionUser = await getSessionUser(req);
    if (!sessionUser?.userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Read body as ArrayBuffer directly — avoids Next.js internal body parser
    // size limits that apply to req.formData() / req.json()
    const contentType = req.headers.get('content-type') || '';

    let buffer: Buffer;
    let fileName: string;
    let mimeType: string;

    if (contentType.includes('multipart/form-data')) {
      // Parse multipart manually via formData — works fine for files up to ~50MB
      // when Next.js body size config is set correctly in vercel.json
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, message: 'No file uploaded. Expected form field name "file".' },
          { status: 400 }
        );
      }

      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { success: false, message: `File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.` },
          { status: 413 }
        );
      }

      buffer = Buffer.from(await file.arrayBuffer());
      fileName = file.name || 'uploaded_file';
      mimeType = file.type || 'application/octet-stream';

    } else {
      // Raw binary upload — client sends file bytes directly as request body
      // with Content-Type and X-File-Name headers. This bypasses multipart
      // overhead and Vercel's multipart parser size restrictions.
      const arrayBuffer = await req.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);

      if (buffer.length > MAX_BYTES) {
        return NextResponse.json(
          { success: false, message: `File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.` },
          { status: 413 }
        );
      }

      fileName = req.headers.get('x-file-name') || 'uploaded_file';
      mimeType = contentType || 'application/octet-stream';
    }

    const result = await uploadAndStore({
      buffer,
      fileName,
      mimeType,
      category: req.headers.get('x-category') || 'other',
      entityType: req.headers.get('x-entity-type') || undefined,
      entityId: req.headers.get('x-entity-id') || undefined,
      uploadedBy: sessionUser.userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'File uploaded successfully',
        data: {
          fileUuid: result.fileUuid,
          fileName,
          fileType: mimeType,
          fileSize: buffer.length,
          url: result.storageUrl,
          cdnUrl: result.cdnUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Storage upload route error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error uploading file.' },
      { status: 500 }
    );
  }
}

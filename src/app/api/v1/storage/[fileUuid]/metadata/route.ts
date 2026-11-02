import { NextRequest, NextResponse } from 'next/server';
import { validate as uuidValidate } from 'uuid';
import { query } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ fileUuid: string }> }
) {
  try {
    const { fileUuid } = await context.params;

    if (!fileUuid || !uuidValidate(fileUuid)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing file UUID format.' },
        { status: 400 }
      );
    }

    const rows = await query<any[]>(
      `SELECT id, file_uuid, file_name, file_type, file_size, uploaded_by, created_at
       FROM LI_STORAGE_MAP
       WHERE file_uuid = ?
       LIMIT 1`,
      [fileUuid]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'File not found.' },
        { status: 404 }
      );
    }

    const row = rows[0];

    // Do NOT expose file_path or internal Telegram IDs
    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        fileUuid: row.file_uuid,
        fileName: row.file_name,
        fileType: row.file_type,
        fileSize: row.file_size,
        uploadedBy: row.uploaded_by,
        createdAt: row.created_at,
      },
    });
  } catch (error: any) {
    console.error('Storage metadata route error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal server error retrieving file metadata.',
      },
      { status: 500 }
    );
  }
}

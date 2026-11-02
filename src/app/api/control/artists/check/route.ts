import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const iconSvgPath = path.join(process.cwd(), 'public', 'icon.svg');
    const svgBuffer = fs.readFileSync(iconSvgPath);

    const sharp = (await import('sharp')).default;

    const p192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
    const p512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();

    fs.writeFileSync(path.join(process.cwd(), 'public', 'icon-192.png'), p192);
    fs.writeFileSync(path.join(process.cwd(), 'public', 'icon-512.png'), p512);

    return NextResponse.json({ success: true, message: 'Re-rendered icon-192.png and icon-512.png to black & white' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { stat, readFile } from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const segments = (await params).path;
    if (!segments || segments.length === 0) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 });
    }

    const filePath = path.join(UPLOADS_DIR, ...segments);
    const normalized = path.normalize(filePath);

    if (!normalized.startsWith(UPLOADS_DIR)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    console.error('Upload file serve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

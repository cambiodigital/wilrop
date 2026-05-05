import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FOLDERS = new Set(['hotels', 'rooms', 'destinations', 'packages', 'excursions', 'marketing']);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Tipo de archivo no permitido. Formatos aceptados: ${ALLOWED_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'El archivo supera el límite de 5 MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.png';
    const uniqueName = `${randomUUID()}${ext}`;
    const requestedFolder = (formData.get('folder') as string) || 'rooms';
    const subfolder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : 'rooms';

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
    const filePath = path.join(uploadDir, uniqueName);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${subfolder}/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno al subir el archivo' },
      { status: 500 }
    );
  }
}

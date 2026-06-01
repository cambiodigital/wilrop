import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toPrice(value: unknown): number {
  return typeof value === 'number' ? Math.round(value) : 0;
}

async function requireResellerSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value;
  const session = verifyPanelSessionToken(sessionValue, 'reseller');
  if (!session) return null;
  return session;
}

export async function GET() {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const packages = await db.travelPackage.findMany({
      where: { resellerId: session.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: packages });
  } catch (error: any) {
    console.error('Error fetching reseller packages:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los paquetes' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const {
      title,
      destinationId,
      destinationName,
      description,
      duration,
      price,
      image,
      category,
      active,
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'El título es obligatorio' },
        { status: 400 },
      );
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json(
        { success: false, error: 'El precio debe ser un número no negativo' },
        { status: 400 },
      );
    }

    let baseSlug = generateSlug(title.trim());
    let slug = baseSlug;
    let counter = 1;
    while (await db.travelPackage.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const travelPackage = await db.travelPackage.create({
      data: {
        slug,
        title: title.trim(),
        destinationId: destinationId ?? '',
        destinationName: destinationName ?? '',
        description: description ?? '',
        duration: duration ?? '',
        price: toPrice(price),
        image: image ?? '',
        category: category ?? 'Cultural',
        active: typeof active === 'boolean' ? active : false,
        isTemplate: false,
        resellerId: session.id,
      },
    });

    return NextResponse.json(
      { success: true, data: travelPackage },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating reseller package:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo crear el paquete' },
      { status: 500 },
    );
  }
}

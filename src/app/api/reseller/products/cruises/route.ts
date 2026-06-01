import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth';
import { safeJsonParse } from '@/lib/json';

function formatCruise(cruise: any) {
  return {
    ...cruise,
    images: safeJsonParse<string[]>(cruise.images, []),
    includes: safeJsonParse<string[]>(cruise.includes, []),
    itinerary: safeJsonParse<string[]>(cruise.itinerary, []),
    tags: safeJsonParse<string[]>(cruise.tags, []),
  };
}

function generateSlug(name: string): string {
  return name
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

    const cruises = await db.cruise.findMany({
      where: { resellerId: session.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: cruises.map(formatCruise) });
  } catch (error: any) {
    console.error('Error fetching reseller cruises:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los cruceros' },
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
      name,
      shipName,
      operator,
      durationDays,
      images,
      priceFrom,
      description,
      includes,
      itinerary,
      tags,
      active,
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'El nombre es obligatorio' },
        { status: 400 },
      );
    }

    if (priceFrom !== undefined && (typeof priceFrom !== 'number' || priceFrom < 0)) {
      return NextResponse.json(
        { success: false, error: 'El precio debe ser un número no negativo' },
        { status: 400 },
      );
    }

    if (durationDays !== undefined && (typeof durationDays !== 'number' || durationDays < 0)) {
      return NextResponse.json(
        { success: false, error: 'La duración debe ser un número no negativo' },
        { status: 400 },
      );
    }

    let baseSlug = generateSlug(name.trim());
    let slug = baseSlug;
    let counter = 1;
    while (await db.cruise.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const cruise = await db.cruise.create({
      data: {
        slug,
        name: name.trim(),
        shipName: shipName ?? '',
        operator: operator ?? '',
        durationDays: typeof durationDays === 'number' ? Math.round(durationDays) : 3,
        images: JSON.stringify(Array.isArray(images) ? images : []),
        priceFrom: toPrice(priceFrom),
        description: description ?? '',
        includes: JSON.stringify(Array.isArray(includes) ? includes : []),
        itinerary: JSON.stringify(Array.isArray(itinerary) ? itinerary : []),
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        rating: 0,
        featured: false,
        active: typeof active === 'boolean' ? active : false,
        isTemplate: false,
        resellerId: session.id,
      },
    });

    return NextResponse.json(
      { success: true, data: formatCruise(cruise) },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating reseller cruise:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo crear el crucero' },
      { status: 500 },
    );
  }
}

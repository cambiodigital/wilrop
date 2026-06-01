import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth';
import { safeJsonParse } from '@/lib/json';

function formatExcursion(excursion: any) {
  return {
    ...excursion,
    images: safeJsonParse<string[]>(excursion.images, []),
    includes: safeJsonParse<string[]>(excursion.includes, []),
    excludes: safeJsonParse<string[]>(excursion.excludes, []),
    requirements: safeJsonParse<string[]>(excursion.requirements, []),
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

    const excursions = await db.excursion.findMany({
      where: { resellerId: session.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: excursions.map(formatExcursion) });
  } catch (error: any) {
    console.error('Error fetching reseller excursions:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar las excursiones' },
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
      destinationId,
      destinationName,
      cityName,
      description,
      shortDesc,
      images,
      duration,
      difficulty,
      groupSize,
      basePrice,
      childPrice,
      includes,
      excludes,
      requirements,
      category,
      active,
    } = body;

    const relatedDestinationId = typeof destinationId === 'string' && destinationId.trim()
      ? destinationId.trim()
      : null;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'El nombre es obligatorio' },
        { status: 400 },
      );
    }

    if (basePrice !== undefined && (typeof basePrice !== 'number' || basePrice < 0)) {
      return NextResponse.json(
        { success: false, error: 'El precio base debe ser un número no negativo' },
        { status: 400 },
      );
    }

    if (childPrice !== undefined && (typeof childPrice !== 'number' || childPrice < 0)) {
      return NextResponse.json(
        { success: false, error: 'El precio infantil debe ser un número no negativo' },
        { status: 400 },
      );
    }

    let baseSlug = generateSlug(name.trim());
    let slug = baseSlug;
    let counter = 1;
    while (await db.excursion.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const excursion = await db.excursion.create({
      data: {
        slug,
        name: name.trim(),
        destinationId: relatedDestinationId ?? '',
        destinationName: destinationName ?? '',
        cityName: cityName ?? '',
        destinationRefId: relatedDestinationId,
        description: description ?? '',
        shortDesc: shortDesc ?? '',
        images: JSON.stringify(Array.isArray(images) ? images : []),
        duration: duration ?? '',
        difficulty: difficulty ?? 'Fácil',
        groupSize: String(groupSize ?? ''),
        basePrice: toPrice(basePrice),
        childPrice: toPrice(childPrice),
        includes: JSON.stringify(includes || []),
        excludes: JSON.stringify(excludes || []),
        requirements: JSON.stringify(requirements || []),
        category: category ?? '',
        rating: 0,
        featured: false,
        active: typeof active === 'boolean' ? active : false,
        isTemplate: false,
        resellerId: session.id,
      },
    });

    return NextResponse.json(
      { success: true, data: formatExcursion(excursion) },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating reseller excursion:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo crear la excursión' },
      { status: 500 },
    );
  }
}

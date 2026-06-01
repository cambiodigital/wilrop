import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth';
import { safeJsonParse } from '@/lib/json';

function formatHotel(hotel: any) {
  return {
    ...hotel,
    images: safeJsonParse<string[]>(hotel.images, []),
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

    const hotels = await db.hotel.findMany({
      where: { resellerId: session.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: hotels.map(formatHotel) });
  } catch (error: any) {
    console.error('Error fetching reseller hotels:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los hoteles' },
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
      cityId,
      cityName,
      stars,
      address,
      description,
      images,
      priceFrom,
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

    if (stars !== undefined && (typeof stars !== 'number' || stars < 1 || stars > 5)) {
      return NextResponse.json(
        { success: false, error: 'Las estrellas deben ser un número entre 1 y 5' },
        { status: 400 },
      );
    }

    let baseSlug = generateSlug(name.trim());
    let slug = baseSlug;
    let counter = 1;
    while (await db.hotel.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const hotel = await db.hotel.create({
      data: {
        slug,
        name: name.trim(),
        cityId: cityId ?? '',
        cityName: cityName ?? '',
        stars: typeof stars === 'number' ? Math.round(stars) : 3,
        address: address ?? '',
        description: description ?? '',
        images: JSON.stringify(Array.isArray(images) ? images : []),
        priceFrom: toPrice(priceFrom),
        active: typeof active === 'boolean' ? active : false,
        isTemplate: false,
        resellerId: session.id,
      },
    });

    return NextResponse.json(
      { success: true, data: formatHotel(hotel) },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating reseller hotel:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo crear el hotel' },
      { status: 500 },
    );
  }
}

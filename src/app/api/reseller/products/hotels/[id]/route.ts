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

async function requireResellerSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value;
  const session = verifyPanelSessionToken(sessionValue, 'reseller');
  if (!session) return null;
  return session;
}

function toPrice(value: unknown): number {
  return typeof value === 'number' ? Math.round(value) : 0;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const hotel = await db.hotel.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel no encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: formatHotel(hotel) });
  } catch (error: any) {
    console.error('Error fetching reseller hotel:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo cargar el hotel' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.hotel.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Hotel no encontrado o no pertenece a tu cuenta' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'El nombre es obligatorio' },
          { status: 400 },
        );
      }
      updates.name = body.name.trim();

      const baseSlug = body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existingSlug = await db.hotel.findUnique({ where: { slug } });
        if (!existingSlug || existingSlug.id === id) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updates.slug = slug;
    }

    if (body.cityId !== undefined) updates.cityId = body.cityId;
    if (body.cityName !== undefined) updates.cityName = body.cityName;

    if (body.stars !== undefined) {
      if (typeof body.stars !== 'number' || body.stars < 1 || body.stars > 5) {
        return NextResponse.json(
          { success: false, error: 'Las estrellas deben ser un número entre 1 y 5' },
          { status: 400 },
        );
      }
      updates.stars = Math.round(body.stars);
    }

    if (body.address !== undefined) updates.address = body.address;
    if (body.description !== undefined) updates.description = body.description;

    if (body.images !== undefined) {
      updates.images = JSON.stringify(Array.isArray(body.images) ? body.images : []);
    }

    if (body.priceFrom !== undefined) {
      if (typeof body.priceFrom !== 'number' || body.priceFrom < 0) {
        return NextResponse.json(
          { success: false, error: 'El precio debe ser un número no negativo' },
          { status: 400 },
        );
      }
      updates.priceFrom = toPrice(body.priceFrom);
    }

    if (body.active !== undefined) {
      updates.active = typeof body.active === 'boolean' ? body.active : existing.active;
    }

    const hotel = await db.hotel.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: formatHotel(hotel) });
  } catch (error: any) {
    console.error('Error updating reseller hotel:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo actualizar el hotel' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.hotel.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Hotel no encontrado o no pertenece a tu cuenta' },
        { status: 404 },
      );
    }

    await db.hotel.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting reseller hotel:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo eliminar el hotel' },
      { status: 500 },
    );
  }
}

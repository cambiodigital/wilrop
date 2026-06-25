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
    const cruise = await db.cruise.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!cruise) {
      return NextResponse.json(
        { success: false, error: 'Crucero no encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: formatCruise(cruise) });
  } catch (error: any) {
    console.error('Error fetching reseller cruise:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo cargar el crucero' },
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
    const existing = await db.cruise.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Crucero no encontrado o no pertenece a tu cuenta' },
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
        const existingSlug = await db.cruise.findUnique({ where: { slug } });
        if (!existingSlug || existingSlug.id === id) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updates.slug = slug;
    }

    if (body.shipName !== undefined) updates.shipName = body.shipName;
    if (body.operator !== undefined) updates.operator = body.operator;
    if (body.description !== undefined) updates.description = body.description;

    if (body.durationDays !== undefined) {
      if (typeof body.durationDays !== 'number' || body.durationDays < 0) {
        return NextResponse.json(
          { success: false, error: 'La duración debe ser un número no negativo' },
          { status: 400 },
        );
      }
      updates.durationDays = Math.round(body.durationDays);
    }

    if (body.images !== undefined) {
      updates.images = JSON.stringify(Array.isArray(body.images) ? body.images : []);
    }
    if (body.includes !== undefined) {
      updates.includes = JSON.stringify(Array.isArray(body.includes) ? body.includes : []);
    }
    if (body.itinerary !== undefined) {
      updates.itinerary = JSON.stringify(Array.isArray(body.itinerary) ? body.itinerary : []);
    }
    if (body.tags !== undefined) {
      updates.tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : []);
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

    if (existing.publishStatus === 'rejected') {
      updates.publishStatus = 'pending_review';
    }

    const cruise = await db.cruise.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: formatCruise(cruise) });
  } catch (error: any) {
    console.error('Error updating reseller cruise:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo actualizar el crucero' },
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
    const existing = await db.cruise.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Crucero no encontrado o no pertenece a tu cuenta' },
        { status: 404 },
      );
    }

    await db.cruise.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting reseller cruise:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo eliminar el crucero' },
      { status: 500 },
    );
  }
}

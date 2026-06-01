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

async function requireResellerSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value;
  const session = verifyPanelSessionToken(sessionValue, 'reseller');
  if (!session) return null;
  return session;
}

function toPrice(value: number): number {
  return Math.round(value);
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
    const excursion = await db.excursion.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!excursion) {
      return NextResponse.json(
        { success: false, error: 'Excursión no encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: formatExcursion(excursion) });
  } catch (error: any) {
    console.error('Error fetching reseller excursion:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo cargar la excursión' },
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
    const existing = await db.excursion.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Excursión no encontrada o no pertenece a tu cuenta' },
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
        const existingSlug = await db.excursion.findUnique({ where: { slug } });
        if (!existingSlug || existingSlug.id === id) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updates.slug = slug;
    }

    if (body.destinationId !== undefined) updates.destinationId = body.destinationId;
    if (body.destinationName !== undefined) updates.destinationName = body.destinationName;
    if (body.cityName !== undefined) updates.cityName = body.cityName;
    if (body.description !== undefined) updates.description = body.description;
    if (body.shortDesc !== undefined) updates.shortDesc = body.shortDesc;
    if (body.images !== undefined) updates.images = JSON.stringify(body.images);
    if (body.duration !== undefined) updates.duration = body.duration;
    if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
    if (body.groupSize !== undefined) updates.groupSize = String(body.groupSize);
    if (body.includes !== undefined) updates.includes = JSON.stringify(body.includes);
    if (body.excludes !== undefined) updates.excludes = JSON.stringify(body.excludes);
    if (body.requirements !== undefined) updates.requirements = JSON.stringify(body.requirements);
    if (body.category !== undefined) updates.category = body.category;

    if (body.basePrice !== undefined) {
      if (typeof body.basePrice !== 'number' || body.basePrice < 0) {
        return NextResponse.json(
          { success: false, error: 'El precio base debe ser un número no negativo' },
          { status: 400 },
        );
      }
      updates.basePrice = toPrice(body.basePrice);
    }

    if (body.childPrice !== undefined) {
      if (typeof body.childPrice !== 'number' || body.childPrice < 0) {
        return NextResponse.json(
          { success: false, error: 'El precio infantil debe ser un número no negativo' },
          { status: 400 },
        );
      }
      updates.childPrice = toPrice(body.childPrice);
    }

    if (body.active !== undefined) {
      updates.active = typeof body.active === 'boolean' ? body.active : existing.active;
    }

    const excursion = await db.excursion.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: formatExcursion(excursion) });
  } catch (error: any) {
    console.error('Error updating reseller excursion:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo actualizar la excursión' },
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
    const existing = await db.excursion.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Excursión no encontrada o no pertenece a tu cuenta' },
        { status: 404 },
      );
    }

    await db.excursion.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting reseller excursion:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo eliminar la excursión' },
      { status: 500 },
    );
  }
}

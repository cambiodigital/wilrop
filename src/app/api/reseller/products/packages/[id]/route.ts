import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth';

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
    const travelPackage = await db.travelPackage.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!travelPackage) {
      return NextResponse.json(
        { success: false, error: 'Paquete no encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: travelPackage });
  } catch (error: any) {
    console.error('Error fetching reseller package:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo cargar el paquete' },
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
    const existing = await db.travelPackage.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Paquete no encontrado o no pertenece a tu cuenta' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'El título es obligatorio' },
          { status: 400 },
        );
      }
      updates.title = body.title.trim();

      const baseSlug = body.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existingSlug = await db.travelPackage.findUnique({ where: { slug } });
        if (!existingSlug || existingSlug.id === id) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updates.slug = slug;
    }

    if (body.destinationId !== undefined) updates.destinationId = body.destinationId;
    if (body.destinationName !== undefined) updates.destinationName = body.destinationName;
    if (body.description !== undefined) updates.description = body.description;
    if (body.duration !== undefined) updates.duration = body.duration;
    if (body.image !== undefined) updates.image = body.image;
    if (body.category !== undefined) updates.category = body.category;

    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || body.price < 0) {
        return NextResponse.json(
          { success: false, error: 'El precio debe ser un número no negativo' },
          { status: 400 },
        );
      }
      updates.price = toPrice(body.price);
    }

    if (body.active !== undefined) {
      updates.active = typeof body.active === 'boolean' ? body.active : existing.active;
    }

    const travelPackage = await db.travelPackage.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: travelPackage });
  } catch (error: any) {
    console.error('Error updating reseller package:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo actualizar el paquete' },
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
    const existing = await db.travelPackage.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Paquete no encontrado o no pertenece a tu cuenta' },
        { status: 404 },
      );
    }

    await db.travelPackage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting reseller package:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo eliminar el paquete' },
      { status: 500 },
    );
  }
}

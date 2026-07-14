import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin/auth-helpers';

export async function GET(request: NextRequest) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }
  try {
    // Get the single marketing modal config (first one, or create default)
    let modal = await db.marketingModal.findFirst();

    if (!modal) {
      modal = await db.marketingModal.create({
        data: {
          active: false,
          title: '',
          subtitle: '',
          description: '',
          imageUrl: '',
          ctaText: 'Ver Oferta',
          ctaLink: '',
          ctaType: 'navigate',
          timerEnabled: false,
          timerLabel: 'Oferta termina en',
          position: 'center',
          delayMs: 3000,
        },
      });
    }

    return NextResponse.json({ success: true, data: modal });
  } catch (error: unknown) {
    console.error('Error fetching marketing modal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marketing modal' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }
  try {
    const body = await request.json();

    // Find existing or create
    let modal = await db.marketingModal.findFirst();

    if (!modal) {
      modal = await db.marketingModal.create({
        data: {
          active: body.active ?? false,
          title: body.title ?? '',
          subtitle: body.subtitle ?? '',
          description: body.description ?? '',
          imageUrl: body.imageUrl ?? '',
          ctaText: body.ctaText ?? 'Ver Oferta',
          ctaLink: body.ctaLink ?? '',
          ctaType: body.ctaType ?? 'navigate',
          timerEnabled: body.timerEnabled ?? false,
          timerLabel: body.timerLabel ?? 'Oferta termina en',
          timerEnd: body.timerEnd ? new Date(body.timerEnd) : null,
          position: body.position ?? 'center',
          delayMs: body.delayMs ?? 3000,
        },
      });
    } else {
      const updates: Record<string, unknown> = {};
      if (body.active !== undefined) updates.active = body.active;
      if (body.title !== undefined) updates.title = body.title;
      if (body.subtitle !== undefined) updates.subtitle = body.subtitle;
      if (body.description !== undefined) updates.description = body.description;
      if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
      if (body.ctaText !== undefined) updates.ctaText = body.ctaText;
      if (body.ctaLink !== undefined) updates.ctaLink = body.ctaLink;
      if (body.ctaType !== undefined) updates.ctaType = body.ctaType;
      if (body.timerEnabled !== undefined) updates.timerEnabled = body.timerEnabled;
      if (body.timerLabel !== undefined) updates.timerLabel = body.timerLabel;
      if (body.timerEnd !== undefined) {
        updates.timerEnd = body.timerEnd ? new Date(body.timerEnd) : null;
      }
      if (body.position !== undefined) updates.position = body.position;
      if (body.delayMs !== undefined) updates.delayMs = body.delayMs;

      modal = await db.marketingModal.update({
        where: { id: modal.id },
        data: updates,
      });
    }

    return NextResponse.json({ success: true, data: modal });
  } catch (error: unknown) {
    console.error('Error updating marketing modal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update marketing modal' },
      { status: 500 }
    );
  }
}

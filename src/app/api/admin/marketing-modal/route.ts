import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unstable_cache, revalidateTag } from 'next/cache';

const getCachedModal = unstable_cache(
  async () => {
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

    return modal;
  },
  ['marketing-modal-cache'],
  { tags: ['marketing-modal'] }
);

export async function GET() {
  try {
    // Get the single marketing modal config (first one, or create default)
    const modal = await getCachedModal();

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

    // @ts-expect-error - Next.js 16 types mismatch for revalidateTag
    revalidateTag('marketing-modal');

    return NextResponse.json({ success: true, data: modal });
  } catch (error: unknown) {
    console.error('Error updating marketing modal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update marketing modal' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Public endpoint — returns only the fields needed by the popup
export async function GET() {
  try {
    const modal = await db.marketingModal.findFirst({
      where: { active: true },
    });

    if (!modal) {
      return NextResponse.json({ active: false });
    }

    // If timer is enabled but expired, mark as inactive conceptually
    if (modal.timerEnabled && modal.timerEnd) {
      const now = new Date();
      if (new Date(modal.timerEnd) <= now) {
        return NextResponse.json({ active: false });
      }
    }

    return NextResponse.json({
      active: true,
      title: modal.title,
      subtitle: modal.subtitle,
      description: modal.description,
      imageUrl: modal.imageUrl,
      ctaText: modal.ctaText,
      ctaLink: modal.ctaLink,
      ctaType: modal.ctaType,
      timerEnabled: modal.timerEnabled,
      timerLabel: modal.timerLabel,
      timerEnd: modal.timerEnd,
      position: modal.position,
      delayMs: modal.delayMs,
    });
  } catch (error: unknown) {
    console.error('Error fetching public marketing modal:', error);
    return NextResponse.json({ active: false });
  }
}

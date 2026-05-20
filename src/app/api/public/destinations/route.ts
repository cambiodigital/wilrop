import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function parseHighlights(highlights: string): string[] {
  try {
    return JSON.parse(highlights);
  } catch {
    return [];
  }
}

function formatDestination(dest: any) {
  return {
    ...dest,
    highlights: parseHighlights(dest.highlights),
  };
}

export async function GET() {
  try {
    const realCount = await db.destination.count({
      where: { active: true, isTemplate: false },
    });

    const destinations = await db.destination.findMany({
      where: {
        active: true,
        isTemplate: realCount > 0 ? false : true,
      },
      orderBy: { order: 'asc' },
    });

    const parsed = destinations.map(formatDestination);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching public destinations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}

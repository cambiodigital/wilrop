import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeCruise } from '@/lib/catalog/public-hydration';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const realCount = await db.cruise.count({
      where: { active: true, isTemplate: false, publishStatus: 'approved' },
    });
    const isTemplateQuery = realCount > 0 ? false : true;

    const cruise = await db.cruise.findFirst({
      where: {
        OR: [
          { id: slug },
          { slug: slug },
        ],
        active: true,
        isTemplate: isTemplateQuery,
        ...(realCount > 0 ? { publishStatus: 'approved' } : {}),
      },
      include: {
        cabins: true,
      },
    });

    if (!cruise) {
      return NextResponse.json(
        { success: false, error: 'Cruise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: normalizeCruise(cruise as Record<string, unknown>) });
  } catch (error: any) {
    console.error('Error fetching public cruise details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cruise details' },
      { status: 500 }
    );
  }
}

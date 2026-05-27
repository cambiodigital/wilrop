import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveIsTemplateFallback } from '@/lib/catalog/public-hydration';

function parseHighlights(highlights: string): string[] {
  try {
    return JSON.parse(highlights);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : undefined;

    const realCount = await db.destination.count({
      where: { active: true, isTemplate: false },
    });
    const isTemplateFallback = resolveIsTemplateFallback(realCount);

    const categoryFilter = category
      ? {
          OR: [
            {
              packages: {
                some: {
                  active: true,
                  package: {
                    category: category,
                    active: true,
                  },
                },
              },
            },
            {
              packagePrimaryRefs: {
                some: {
                  category: category,
                  active: true,
                },
              },
            },
          ],
        }
      : {};

    const destinations = await db.destination.findMany({
      where: {
        active: true,
        isTemplate: isTemplateFallback,
        ...categoryFilter,
      },
      orderBy: { order: 'asc' },
      ...(limit !== undefined ? { take: limit } : {}),
      ...(offset !== undefined ? { skip: offset } : {}),
      include: {
        _count: {
          select: {
            hotels: true,
            packages: true,
            excursions: true,
            transportServices: true,
          },
        },
      },
    });

    const parsed = destinations.map((dest) => ({
      id: dest.id,
      slug: dest.slug,
      name: dest.name,
      region: dest.region,
      description: dest.description,
      image: dest.image,
      highlights: parseHighlights(dest.highlights),
      rating: dest.rating,
      reviewCount: dest.reviewCount,
      priceFrom: dest.priceFrom,
      active: dest.active,
      isTemplate: dest.isTemplate,
      order: dest.order,
      createdAt: dest.createdAt,
      updatedAt: dest.updatedAt,
      // Relation-based aggregate counts
      hotelCount: dest._count.hotels,
      packageCount: dest._count.packages,
      excursionCount: dest._count.excursions,
      transportCount: dest._count.transportServices,
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching public destinations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch destinations' },
      { status: 500 },
    );
  }
}

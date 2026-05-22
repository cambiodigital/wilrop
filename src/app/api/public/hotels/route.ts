import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  normalizeHotel,
  resolveIsTemplateFallback,
  resolveDestinationFilter,
} from '@/lib/catalog/public-hydration';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId');
    const destinationSlug = searchParams.get('destinationSlug');

    // Resolve destination filter (slug → ID lookup)
    const destFilter = await resolveDestinationFilter(
      db,
      destinationId ?? destinationSlug,
    );

    const realCount = await db.hotel.count({
      where: { active: true, isTemplate: false },
    });
    const isTemplateFallback = resolveIsTemplateFallback(realCount);

    // --- Build hotel-ID set from DestinationHotel join when filtering by destination ---
    let hotelIds: string[] | undefined;

    if (destFilter) {
      const joins = await db.destinationHotel.findMany({
        where: {
          destinationId: destFilter.destinationId,
          active: true,
          hotel: { active: true, isTemplate: isTemplateFallback },
        },
        select: { hotelId: true },
      });
      hotelIds = joins.map((j) => j.hotelId);

      // FK fallback: also include hotels with direct destinationId when no join rows exist
      if (hotelIds.length === 0) {
        const fkHotels = await db.hotel.findMany({
          where: {
            destinationId: destFilter.destinationId,
            active: true,
            isTemplate: isTemplateFallback,
          },
          select: { id: true },
        });
        hotelIds = fkHotels.map((h) => h.id);
      }
    }

    // --- Query hotels ---
    const hotels = await db.hotel.findMany({
      where: {
        active: true,
        isTemplate: isTemplateFallback,
        ...(hotelIds ? { id: { in: hotelIds } } : {}),
      },
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }, { name: 'asc' }],
    });

    // --- Enrich with relatedDestinationIds from DestinationHotel join ---
    const normalizedHotels = hotels.map((h) => normalizeHotel(h as Record<string, unknown>));

    if (hotels.length > 0) {
      const destJoins = await db.destinationHotel.findMany({
        where: { hotelId: { in: hotels.map((h) => h.id) }, active: true },
        select: { hotelId: true, destinationId: true },
      });

      const destMap = new Map<string, string[]>();
      for (const j of destJoins) {
        const ids = destMap.get(j.hotelId) ?? [];
        ids.push(j.destinationId);
        destMap.set(j.hotelId, ids);
      }

      const enriched = normalizedHotels.map((h) => ({
        ...h,
        relatedDestinationIds: destMap.get(h.id) ?? [],
      }));

      return NextResponse.json({ success: true, data: enriched });
    }

    return NextResponse.json({
      success: true,
      data: normalizedHotels.map((h) => ({ ...h, relatedDestinationIds: [] })),
    });
  } catch (error) {
    console.error('Error fetching public hotels:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotels' },
      { status: 500 },
    );
  }
}

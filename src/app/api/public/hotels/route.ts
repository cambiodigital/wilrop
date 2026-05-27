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

    // Parse filter query params
    const cityId = searchParams.get('cityId');
    const priceMin = searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!, 10) : undefined;
    const priceMax = searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!, 10) : undefined;
    const stars = searchParams.get('stars') ? searchParams.get('stars')!.split(',').map((s) => parseInt(s, 10)).filter((s) => !isNaN(s)) : undefined;
    const amenities = searchParams.get('amenities') ? searchParams.get('amenities')!.split(',').filter(Boolean) : undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const sortBy = searchParams.get('sortBy') || 'recommended';
    const guests = searchParams.get('guests') ? parseInt(searchParams.get('guests')!, 10) : undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const featured = searchParams.get('featured') === 'true';

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

    // Build Prisma query filters
    const where: any = {
      active: true,
      isTemplate: isTemplateFallback,
    };

    if (cityId) {
      where.cityId = cityId;
    }

    if (featured) {
      where.featured = true;
    }

    if (stars && stars.length > 0) {
      where.stars = { in: stars };
    }

    if (minRating && minRating > 0) {
      where.rating = { gte: minRating };
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.priceFrom = {
        ...(priceMin !== undefined ? { gte: priceMin } : {}),
        ...(priceMax !== undefined ? { lte: priceMax } : {}),
      };
    }

    if (hotelIds) {
      where.id = { in: hotelIds };
    }

    // --- Query hotels ---
    const hotels = await db.hotel.findMany({
      where,
      orderBy: [
        ...(sortBy === 'price-asc' ? [{ priceFrom: 'asc' as const }] : []),
        ...(sortBy === 'price-desc' ? [{ priceFrom: 'desc' as const }] : []),
        ...(sortBy === 'stars' ? [{ stars: 'desc' as const }] : []),
        ...(sortBy === 'rating' ? [{ rating: 'desc' as const }] : []),
        ...(sortBy === 'recommended' ? [{ featured: 'desc' as const }, { rating: 'desc' as const }] : []),
        { name: 'asc' as const },
      ],
    });

    // --- Enrich and normalize ---
    let normalizedHotels = hotels.map((h) => normalizeHotel(h as Record<string, unknown>));

    // In-memory filter for amenities
    if (amenities && amenities.length > 0) {
      normalizedHotels = normalizedHotels.filter((h) =>
        amenities.every((a) => h.amenities.includes(a))
      );
    }

    // In-memory filter for guest capacity
    if (guests && guests > 0) {
      normalizedHotels = normalizedHotels.filter((h) => {
        const roomsArray = h.rooms as any[];
        return roomsArray.some((r: any) => r.maxGuests >= guests);
      });
    }

    // Enrich with relatedDestinationIds from DestinationHotel join
    if (normalizedHotels.length > 0) {
      const destJoins = await db.destinationHotel.findMany({
        where: { hotelId: { in: normalizedHotels.map((h) => h.id) }, active: true },
        select: { hotelId: true, destinationId: true },
      });

      const destMap = new Map<string, string[]>();
      for (const j of destJoins) {
        const ids = destMap.get(j.hotelId) ?? [];
        ids.push(j.destinationId);
        destMap.set(j.hotelId, ids);
      }

      normalizedHotels = normalizedHotels.map((h) => ({
        ...h,
        relatedDestinationIds: destMap.get(h.id) ?? [],
      }));
    } else {
      normalizedHotels = normalizedHotels.map((h) => ({
        ...h,
        relatedDestinationIds: [],
      }));
    }

    const totalCount = normalizedHotels.length;

    // Apply pagination
    if (limit !== undefined) {
      const offset = (page - 1) * limit;
      normalizedHotels = normalizedHotels.slice(offset, offset + limit);
    }

    return NextResponse.json({
      success: true,
      data: normalizedHotels,
      pagination: {
        total: totalCount,
        page,
        limit: limit ?? totalCount,
        totalPages: limit ? Math.ceil(totalCount / limit) : 1,
      },
    });
  } catch (error) {
    console.error('Error fetching public hotels:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotels' },
      { status: 500 },
    );
  }
}

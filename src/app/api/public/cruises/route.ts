import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import {
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from '@/lib/panel-auth';
import {
  normalizeCruise,
  resolveIsTemplateFallback,
  resolveDestinationFilter,
} from '@/lib/catalog/public-hydration';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId');
    const destinationSlug = searchParams.get('destinationSlug');

    // Parse filter query params
    const priceMin = searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!, 10) : undefined;
    const priceMax = searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!, 10) : undefined;
    const durationDays = searchParams.get('durationDays') ? parseInt(searchParams.get('durationDays')!, 10) : undefined;
    const sortBy = searchParams.get('sortBy') || 'recommended';
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const featured = searchParams.get('featured') === 'true';

    // Resolve destination filter (slug → ID lookup)
    const destFilter = await resolveDestinationFilter(
      db,
      destinationId ?? destinationSlug,
    );

    const realCount = await db.cruise.count({
      where: { active: true, isTemplate: false, resellerId: null },
    });
    const isTemplateFallback = resolveIsTemplateFallback(realCount);

    // --- Build cruise-ID set from DestinationCruise join when filtering by destination ---
    let cruiseIds: string[] | undefined;

    if (destFilter) {
      const joins = await db.destinationCruise.findMany({
        where: {
          destinationId: destFilter.destinationId,
          active: true,
          cruise: { active: true, isTemplate: isTemplateFallback },
        },
        select: { cruiseId: true },
      });
      cruiseIds = joins.map((j) => j.cruiseId);

      // Fallback: also check primaryDestinationId
      const fkCruises = await db.cruise.findMany({
        where: {
          primaryDestinationId: destFilter.destinationId,
          active: true,
          isTemplate: isTemplateFallback,
        },
        select: { id: true },
      });
      const fkIds = fkCruises.map((c) => c.id);
      
      // Combine and unique
      cruiseIds = Array.from(new Set([...cruiseIds, ...fkIds]));
    }

    const resellerPanel = searchParams.get('resellerPanel') === 'true';
    const resellerIdParam = searchParams.get('resellerId');
    let resellerIdFilter: string | null = null;

    if (resellerPanel) {
      const cookieStore = await cookies();
      const sessionValue = cookieStore.get(
        getPanelSessionCookieName('reseller'),
      )?.value;
      const session = verifyPanelSessionToken(sessionValue, 'reseller');
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'No autorizado' },
          { status: 401 },
        );
      }
      resellerIdFilter = session.id;
    }

    // Public reseller catalog filtering (from package builder link)
    let catalogCruiseIds: string[] | undefined;
    if (resellerIdParam && !resellerPanel) {
      const catalogItems = await db.resellerCatalog.findMany({
        where: {
          resellerId: resellerIdParam,
          sourceType: 'cruise',
          active: true,
        },
        select: { sourceId: true },
      });
      catalogCruiseIds = catalogItems.map((c) => c.sourceId);
      if (catalogCruiseIds.length === 0) {
        resellerIdFilter = resellerIdParam;
      }
    }

    // Build Prisma query filters
    const where: any = { active: true };

    if (catalogCruiseIds && catalogCruiseIds.length > 0 && resellerIdParam && !resellerPanel) {
      where.OR = [{ id: { in: catalogCruiseIds } }, { resellerId: resellerIdParam }];
    } else if (resellerIdFilter) {
      where.resellerId = resellerIdFilter;
    } else if (!resellerPanel && !resellerIdParam) {
      where.resellerId = null;
      where.isTemplate = isTemplateFallback;
    }

    if (cruiseIds && !where.OR) {
      where.id = { in: cruiseIds };
    }

    if (featured) {
      where.featured = true;
    }

    if (durationDays !== undefined) {
      where.durationDays = durationDays;
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.priceFrom = {
        ...(priceMin !== undefined ? { gte: priceMin } : {}),
        ...(priceMax !== undefined ? { lte: priceMax } : {}),
      };
    }

    // Query cruises including cabins
    const cruises = await db.cruise.findMany({
      where,
      include: {
        cabins: true,
      },
      orderBy: [
        ...(sortBy === 'price-asc' ? [{ priceFrom: 'asc' as const }] : []),
        ...(sortBy === 'price-desc' ? [{ priceFrom: 'desc' as const }] : []),
        ...(sortBy === 'recommended' ? [{ featured: 'desc' as const }, { rating: 'desc' as const }] : []),
        { name: 'asc' as const },
      ],
    });

    // Enrich and normalize
    let normalizedCruises = cruises.map((c) => normalizeCruise(c as Record<string, unknown>));

    // Enrich with relatedDestinationIds from DestinationCruise join
    if (normalizedCruises.length > 0) {
      const destJoins = await db.destinationCruise.findMany({
        where: { cruiseId: { in: normalizedCruises.map((c) => c.id) }, active: true },
        select: { cruiseId: true, destinationId: true },
      });

      const destMap = new Map<string, string[]>();
      for (const j of destJoins) {
        const ids = destMap.get(j.cruiseId) ?? [];
        ids.push(j.destinationId);
        destMap.set(j.cruiseId, ids);
      }

      normalizedCruises = normalizedCruises.map((c) => {
        const joinedDestinations = destMap.get(c.id) ?? [];
        if (c.primaryDestinationId && !joinedDestinations.includes(c.primaryDestinationId)) {
          joinedDestinations.push(c.primaryDestinationId);
        }
        return {
          ...c,
          relatedDestinationIds: joinedDestinations,
        };
      });
    } else {
      normalizedCruises = normalizedCruises.map((c) => ({
        ...c,
        relatedDestinationIds: [],
      }));
    }

    const totalCount = normalizedCruises.length;

    // Apply pagination
    if (limit !== undefined) {
      const offset = (page - 1) * limit;
      normalizedCruises = normalizedCruises.slice(offset, offset + limit);
    }

    return NextResponse.json({
      success: true,
      data: normalizedCruises,
      pagination: {
        total: totalCount,
        page,
        limit: limit ?? totalCount,
        totalPages: limit ? Math.ceil(totalCount / limit) : 1,
      },
    });
  } catch (error) {
    console.error('Error fetching public cruises:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cruises' },
      { status: 500 },
    );
  }
}

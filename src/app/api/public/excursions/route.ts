import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import {
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from '@/lib/panel-auth';
import {
  normalizeExcursion,
  resolveIsTemplateFallback,
  resolveDestinationFilter,
} from '@/lib/catalog/public-hydration';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId');
    const destinationSlug = searchParams.get('destinationSlug');
    const category = searchParams.get('category');

    // Resolve destination filter (slug → ID lookup)
    const destFilter = await resolveDestinationFilter(
      db,
      destinationId ?? destinationSlug,
    );

    const realCount = await db.excursion.count({
      where: { active: true, isTemplate: false, resellerId: null },
    });
    const isTemplateFallback = resolveIsTemplateFallback(realCount);

    // --- Build excursion-ID set from DestinationExcursion join ---
    let excursionIds: string[] | undefined;

    if (destFilter) {
      const joins = await db.destinationExcursion.findMany({
        where: {
          destinationId: destFilter.destinationId,
          active: true,
          excursion: { active: true, isTemplate: isTemplateFallback },
        },
        select: { excursionId: true },
      });
      excursionIds = joins.map((j) => j.excursionId);

      // FK fallback: direct destinationRefId when no join rows exist
      if (excursionIds.length === 0) {
        const fkExcursions = await db.excursion.findMany({
          where: {
            destinationRefId: destFilter.destinationId,
            active: true,
            isTemplate: isTemplateFallback,
          },
          select: { id: true },
        });
        excursionIds = fkExcursions.map((e) => e.id);
      }
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
    let catalogExcursionIds: string[] | undefined;
    if (resellerIdParam && !resellerPanel) {
      const catalogItems = await db.resellerCatalog.findMany({
        where: {
          resellerId: resellerIdParam,
          sourceType: 'excursion',
          active: true,
        },
        select: { sourceId: true },
      });
      catalogExcursionIds = catalogItems.map((c) => c.sourceId);
      if (catalogExcursionIds.length === 0) {
        resellerIdFilter = resellerIdParam;
      }
    }

    // --- Query excursions ---
    const where: Record<string, unknown> = { active: true };

    if (catalogExcursionIds && catalogExcursionIds.length > 0 && resellerIdParam && !resellerPanel) {
      where.OR = [{ id: { in: catalogExcursionIds } }, { resellerId: resellerIdParam }];
    } else if (resellerIdFilter) {
      where.resellerId = resellerIdFilter;
    } else if (!resellerPanel && !resellerIdParam) {
      where.resellerId = null;
      where.isTemplate = isTemplateFallback;
    }

    if (excursionIds && !where.OR) {
      where.id = { in: excursionIds };
    }

    if (category) {
      where.category = category;
    }

    const excursions = await db.excursion.findMany({
      where: where as any,
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
    });

    // --- Enrich with relatedDestinationIds from DestinationExcursion join ---
    const normalized = excursions.map((e) =>
      normalizeExcursion(e as Record<string, unknown>),
    );

    if (excursions.length > 0) {
      const destJoins = await db.destinationExcursion.findMany({
        where: { excursionId: { in: excursions.map((e) => e.id) }, active: true },
        select: { excursionId: true, destinationId: true },
      });

      const destMap = new Map<string, string[]>();
      for (const j of destJoins) {
        const ids = destMap.get(j.excursionId) ?? [];
        ids.push(j.destinationId);
        destMap.set(j.excursionId, ids);
      }

      const enriched = normalized.map((e) => ({
        ...e,
        relatedDestinationIds: destMap.get(e.id) ?? [],
      }));

      return NextResponse.json({ success: true, data: enriched });
    }

    return NextResponse.json({
      success: true,
      data: normalized.map((e) => ({ ...e, relatedDestinationIds: [] })),
    });
  } catch (error: any) {
    console.error('Error fetching public excursions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch excursions' },
      { status: 500 },
    );
  }
}

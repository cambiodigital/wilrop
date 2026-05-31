import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import {
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from '@/lib/panel-auth';
import {
  normalizeTransport,
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

    const realCount = await db.transportService.count({
      where: { active: true, isTemplate: false },
    });
    const isTemplateFallback = resolveIsTemplateFallback(realCount);

    // --- Build transport-ID set from DestinationTransportService join ---
    let transportIds: string[] | undefined;

    if (destFilter) {
      const joins = await db.destinationTransportService.findMany({
        where: {
          destinationId: destFilter.destinationId,
          active: true,
          transportService: {
            active: true,
            isTemplate: isTemplateFallback,
          },
        },
        select: { transportServiceId: true },
      });
      transportIds = joins.map((j) => j.transportServiceId);

      // FK fallback: originDestinationId / destinationDestinationId when no join rows exist
      if (transportIds.length === 0) {
        const fkTransports = await db.transportService.findMany({
          where: {
            OR: [
              { originDestinationId: destFilter.destinationId },
              { destinationDestinationId: destFilter.destinationId },
            ],
            active: true,
            isTemplate: isTemplateFallback,
          },
          select: { id: true },
        });
        transportIds = fkTransports.map((t) => t.id);
      }
    }

    const resellerPanel = searchParams.get('resellerPanel') === 'true';
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

    // --- Query transport services ---
    const where: Record<string, unknown> = {
      active: true,
      isTemplate: isTemplateFallback,
      resellerId: resellerIdFilter,
    };

    if (transportIds) {
      where.id = { in: transportIds };
    }

    const services = await db.transportService.findMany({
      where: where as any,
      orderBy: { basePrice: 'asc' },
      include: {
        provider: {
          select: { id: true, name: true, vehicleType: true, capacity: true },
        },
      },
    });

    // --- Enrich with relatedDestinationIds from DestinationTransportService join ---
    const normalized = services.map((s) =>
      normalizeTransport(s as Record<string, unknown>),
    );

    if (services.length > 0) {
      const destJoins = await db.destinationTransportService.findMany({
        where: {
          transportServiceId: { in: services.map((s) => s.id) },
          active: true,
        },
        select: { transportServiceId: true, destinationId: true },
      });

      const destMap = new Map<string, string[]>();
      for (const j of destJoins) {
        const ids = destMap.get(j.transportServiceId) ?? [];
        ids.push(j.destinationId);
        destMap.set(j.transportServiceId, ids);
      }

      const enriched = normalized.map((t) => ({
        ...t,
        relatedDestinationIds: destMap.get(t.id) ?? [],
      }));

      return NextResponse.json({ success: true, data: enriched });
    }

    return NextResponse.json({
      success: true,
      data: normalized.map((t) => ({ ...t, relatedDestinationIds: [] })),
    });
  } catch (error: any) {
    console.error('Error fetching public transport services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transport services' },
      { status: 500 },
    );
  }
}

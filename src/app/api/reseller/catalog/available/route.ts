import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from '@/lib/panel-auth';
import { db } from '@/lib/db';
import { resolveSourceFields } from '@/lib/reseller/source-resolver';

export async function GET(request: NextRequest) {
  try {
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

    const url = new URL(request.url);
    const sourceType = url.searchParams.get('sourceType');

    const existingCatalog = await db.resellerCatalog.findMany({
      where: { resellerId: session.id },
      select: { sourceType: true, sourceId: true },
    });
    const existingIds = new Set(
      existingCatalog.map((c) => `${c.sourceType}:${c.sourceId}`),
    );

    // Strict filtering: only destinations explicitly assigned to this reseller
    const assignedDestinationRows = existingCatalog.filter(
      (c) => c.sourceType === 'destination',
    );
    const assignedDestinationIds = assignedDestinationRows.map(
      (c) => c.sourceId,
    );

    const baseWhere = { active: true, isTemplate: false };
    const items: Array<Record<string, unknown>> = [];

    // ─── Destinations ──────────────────────────────────────────────
    // Only show destinations already assigned to this reseller's catalog
    if (!sourceType || sourceType === 'destination') {
      if (assignedDestinationIds.length > 0) {
        const destinations = await db.destination.findMany({
          where: {
            ...baseWhere,
            id: { in: assignedDestinationIds },
          },
          orderBy: { name: 'asc' },
        });

        items.push(
          ...destinations.map((d) => {
            const source = resolveSourceFields(
              'destination',
              d as Record<string, unknown>,
            );
            return {
              sourceType: 'destination' as const,
              sourceId: d.id,
              name: source.title,
              location: source.location,
              price: source.price,
              image: source.image,
              description: source.description,
              metadata: source.metadata,
              alreadyInCatalog: existingIds.has(`destination:${d.id}`),
            };
          }),
        );
      }
    }

    // Products are only available if they relate to an assigned destination.
    // When no destinations are assigned, no products are available.
    if (assignedDestinationIds.length === 0 && sourceType && sourceType !== 'destination') {
      return NextResponse.json({ success: true, data: [] });
    }

    // Helper: filter product IDs that have at least one active relation
    // to any assigned destination.
    async function filterByAssignedDestinations(
      sourceTypeKey: string,
    ): Promise<string[]> {
      if (assignedDestinationIds.length === 0) return [];

      switch (sourceTypeKey) {
        case 'hotel': {
          const joins = await db.destinationHotel.findMany({
            where: {
              destinationId: { in: assignedDestinationIds },
              active: true,
            },
            select: { hotelId: true },
          });
          return [...new Set(joins.map((j) => j.hotelId))];
        }
        case 'excursion': {
          const joins = await db.destinationExcursion.findMany({
            where: {
              destinationId: { in: assignedDestinationIds },
              active: true,
            },
            select: { excursionId: true },
          });
          return [...new Set(joins.map((j) => j.excursionId))];
        }
        case 'package': {
          const joins = await db.destinationPackage.findMany({
            where: {
              destinationId: { in: assignedDestinationIds },
              active: true,
            },
            select: { packageId: true },
          });
          return [...new Set(joins.map((j) => j.packageId))];
        }
        case 'transport': {
          const joins = await db.destinationTransportService.findMany({
            where: {
              destinationId: { in: assignedDestinationIds },
              active: true,
            },
            select: { transportServiceId: true },
          });
          return [...new Set(joins.map((j) => j.transportServiceId))];
        }
        default:
          return [];
      }
    }

    // Build destination-ID map for enrichment (product → related destinations)
    async function buildDestMap(
      sourceTypeKey: string,
      ids: string[],
    ): Promise<Map<string, string[]>> {
      const destMap = new Map<string, string[]>();
      if (ids.length === 0) return destMap;

      switch (sourceTypeKey) {
        case 'hotel': {
          const joins = await db.destinationHotel.findMany({
            where: {
              hotelId: { in: ids },
              destinationId: { in: assignedDestinationIds },
              active: true,
            },
            select: { hotelId: true, destinationId: true },
          });
          for (const j of joins) {
            const arr = destMap.get(j.hotelId) ?? [];
            arr.push(j.destinationId);
            destMap.set(j.hotelId, arr);
          }
          break;
        }
        case 'excursion': {
          const joins = await db.destinationExcursion.findMany({
            where: {
              excursionId: { in: ids },
              destinationId: { in: assignedDestinationIds },
              active: true,
            },
            select: { excursionId: true, destinationId: true },
          });
          for (const j of joins) {
            const arr = destMap.get(j.excursionId) ?? [];
            arr.push(j.destinationId);
            destMap.set(j.excursionId, arr);
          }
          break;
        }
        case 'package': {
          const joins = await db.destinationPackage.findMany({
            where: {
              packageId: { in: ids },
              destinationId: { in: assignedDestinationIds },
              active: true,
            },
            select: { packageId: true, destinationId: true },
          });
          for (const j of joins) {
            const arr = destMap.get(j.packageId) ?? [];
            arr.push(j.destinationId);
            destMap.set(j.packageId, arr);
          }
          break;
        }
        case 'transport': {
          const joins = await db.destinationTransportService.findMany({
            where: {
              transportServiceId: { in: ids },
              destinationId: { in: assignedDestinationIds },
              active: true,
            },
            select: { transportServiceId: true, destinationId: true },
          });
          for (const j of joins) {
            const arr = destMap.get(j.transportServiceId) ?? [];
            arr.push(j.destinationId);
            destMap.set(j.transportServiceId, arr);
          }
          break;
        }
      }
      return destMap;
    }

    // ─── Hotels ────────────────────────────────────────────────────
    if (!sourceType || sourceType === 'hotel') {
      const allowedIds = await filterByAssignedDestinations('hotel');
      if (allowedIds.length > 0) {
        const hotels = await db.hotel.findMany({
          where: { ...baseWhere, id: { in: allowedIds } },
          orderBy: { name: 'asc' },
        });

        const destMap = await buildDestMap(
          'hotel',
          hotels.map((h) => h.id),
        );

        items.push(
          ...hotels.map((h) => {
            const source = resolveSourceFields(
              'hotel',
              h as Record<string, unknown>,
            );
            return {
              sourceType: 'hotel' as const,
              sourceId: h.id,
              name: source.title,
              location: source.location,
              price: source.price,
              image: source.image,
              description: source.description,
              metadata: source.metadata,
              relatedDestinationIds: destMap.get(h.id) ?? [],
              alreadyInCatalog: existingIds.has(`hotel:${h.id}`),
            };
          }),
        );
      }
    }

    // ─── Excursions ────────────────────────────────────────────────
    if (!sourceType || sourceType === 'excursion') {
      const allowedIds = await filterByAssignedDestinations('excursion');
      if (allowedIds.length > 0) {
        const excursions = await db.excursion.findMany({
          where: { ...baseWhere, id: { in: allowedIds } },
          orderBy: { name: 'asc' },
        });

        const destMap = await buildDestMap(
          'excursion',
          excursions.map((e) => e.id),
        );

        items.push(
          ...excursions.map((e) => {
            const source = resolveSourceFields(
              'excursion',
              e as Record<string, unknown>,
            );
            return {
              sourceType: 'excursion' as const,
              sourceId: e.id,
              name: source.title,
              location: source.location,
              price: source.price,
              image: source.image,
              description: source.description,
              metadata: source.metadata,
              relatedDestinationIds: destMap.get(e.id) ?? [],
              alreadyInCatalog: existingIds.has(`excursion:${e.id}`),
            };
          }),
        );
      }
    }

    // ─── Packages ──────────────────────────────────────────────────
    if (!sourceType || sourceType === 'package') {
      const allowedIds = await filterByAssignedDestinations('package');
      if (allowedIds.length > 0) {
        const packages = await db.travelPackage.findMany({
          where: { ...baseWhere, id: { in: allowedIds } },
          orderBy: { title: 'asc' },
        });

        const destMap = await buildDestMap(
          'package',
          packages.map((p) => p.id),
        );

        items.push(
          ...packages.map((p) => {
            const source = resolveSourceFields(
              'package',
              p as Record<string, unknown>,
            );
            return {
              sourceType: 'package' as const,
              sourceId: p.id,
              name: source.title,
              location: source.location,
              price: source.price,
              image: source.image,
              description: source.description,
              metadata: source.metadata,
              relatedDestinationIds: destMap.get(p.id) ?? [],
              alreadyInCatalog: existingIds.has(`package:${p.id}`),
            };
          }),
        );
      }
    }

    // ─── Transport ─────────────────────────────────────────────────
    if (!sourceType || sourceType === 'transport') {
      const allowedIds = await filterByAssignedDestinations('transport');
      if (allowedIds.length > 0) {
        const transports = await db.transportService.findMany({
          where: { ...baseWhere, id: { in: allowedIds } },
          include: {
            provider: {
              select: { name: true, vehicleType: true, capacity: true },
            },
          },
          orderBy: { name: 'asc' },
        });

        const destMap = await buildDestMap(
          'transport',
          transports.map((t) => t.id),
        );

        items.push(
          ...transports.map((t) => {
            const source = resolveSourceFields(
              'transport',
              t as Record<string, unknown>,
            );
            return {
              sourceType: 'transport' as const,
              sourceId: t.id,
              name: source.title,
              location: source.location,
              price: source.price,
              image: source.image,
              description: source.description,
              metadata: source.metadata,
              relatedDestinationIds: destMap.get(t.id) ?? [],
              alreadyInCatalog: existingIds.has(`transport:${t.id}`),
            };
          }),
        );
      }
    }

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[ResellerAvailableProducts] Error:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los productos disponibles' },
      { status: 500 },
    );
  }
}

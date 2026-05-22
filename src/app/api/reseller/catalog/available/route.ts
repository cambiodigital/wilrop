import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from '@/lib/panel-auth';
import { db } from '@/lib/db';
import { resolveSourceFields } from '@/lib/reseller/source-resolver';
import { parseJsonArray } from '@/lib/catalog/public-hydration';

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

    const baseWhere = { active: true, isTemplate: false };
    const items: Array<Record<string, unknown>> = [];

    // ─── Hotels ────────────────────────────────────────────────────
    if (!sourceType || sourceType === 'hotel') {
      const hotels = await db.hotel.findMany({
        where: baseWhere,
        orderBy: { name: 'asc' },
      });

      // Collect hotel IDs for relation enrichment
      const hotelIdList = hotels.map((h) => h.id);
      let destMap = new Map<string, string[]>();

      if (hotelIdList.length > 0) {
        const destJoins = await db.destinationHotel.findMany({
          where: { hotelId: { in: hotelIdList }, active: true },
          select: { hotelId: true, destinationId: true },
        });
        for (const j of destJoins) {
          const ids = destMap.get(j.hotelId) ?? [];
          ids.push(j.destinationId);
          destMap.set(j.hotelId, ids);
        }
      }

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

    // ─── Excursions ────────────────────────────────────────────────
    if (!sourceType || sourceType === 'excursion') {
      const excursions = await db.excursion.findMany({
        where: baseWhere,
        orderBy: { name: 'asc' },
      });

      const excursionIdList = excursions.map((e) => e.id);
      let destMap = new Map<string, string[]>();

      if (excursionIdList.length > 0) {
        const destJoins = await db.destinationExcursion.findMany({
          where: { excursionId: { in: excursionIdList }, active: true },
          select: { excursionId: true, destinationId: true },
        });
        for (const j of destJoins) {
          const ids = destMap.get(j.excursionId) ?? [];
          ids.push(j.destinationId);
          destMap.set(j.excursionId, ids);
        }
      }

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

    // ─── Packages ──────────────────────────────────────────────────
    if (!sourceType || sourceType === 'package') {
      const packages = await db.travelPackage.findMany({
        where: baseWhere,
        orderBy: { title: 'asc' },
      });

      const packageIdList = packages.map((p) => p.id);
      let destMap = new Map<string, string[]>();

      if (packageIdList.length > 0) {
        const destJoins = await db.destinationPackage.findMany({
          where: { packageId: { in: packageIdList }, active: true },
          select: { packageId: true, destinationId: true },
        });
        for (const j of destJoins) {
          const ids = destMap.get(j.packageId) ?? [];
          ids.push(j.destinationId);
          destMap.set(j.packageId, ids);
        }
      }

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

    // ─── Transport ─────────────────────────────────────────────────
    if (!sourceType || sourceType === 'transport') {
      const transports = await db.transportService.findMany({
        where: baseWhere,
        include: {
          provider: {
            select: { name: true, vehicleType: true, capacity: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      const transportIdList = transports.map((t) => t.id);
      let destMap = new Map<string, string[]>();

      if (transportIdList.length > 0) {
        const destJoins = await db.destinationTransportService.findMany({
          where: {
            transportServiceId: { in: transportIdList },
            active: true,
          },
          select: { transportServiceId: true, destinationId: true },
        });
        for (const j of destJoins) {
          const ids = destMap.get(j.transportServiceId) ?? [];
          ids.push(j.destinationId);
          destMap.set(j.transportServiceId, ids);
        }
      }

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

    // ─── Destinations ──────────────────────────────────────────────
    if (!sourceType || sourceType === 'destination') {
      const destinations = await db.destination.findMany({
        where: baseWhere,
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

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[ResellerAvailableProducts] Error:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los productos disponibles' },
      { status: 500 },
    );
  }
}

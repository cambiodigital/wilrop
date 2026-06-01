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

    // Available products = global catalog templates (isTemplate: true)
    // plus the reseller's own products (isTemplate: false, resellerId = session.id)
    const items: Array<Record<string, unknown>> = [];

    // ─── Destinations ──────────────────────────────────────────────
    // Show ALL active template destinations so resellers can pick from them.
    if (!sourceType || sourceType === 'destination') {
      const destinations = await db.destination.findMany({
        where: { active: true, isTemplate: true },
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

    // Collect destination IDs the reseller has in their catalog
    // for filtering related products.
    const assignedDestinationIds = existingCatalog
      .filter((c) => c.sourceType === 'destination')
      .map((c) => c.sourceId);

    // For products: show global templates + reseller's own products.
    // If reseller has assigned destinations, also highlight which products
    // relate to those destinations (but don't restrict to ONLY those).
    const productBaseWhere = {
      active: true,
      OR: [
        { isTemplate: true },
        { isTemplate: false, resellerId: session.id },
      ],
    };

    // Helper: build destination-ID map for enrichment
    async function buildDestMap(
      sourceTypeKey: string,
      ids: string[],
    ): Promise<Map<string, string[]>> {
      const destMap = new Map<string, string[]>();
      if (ids.length === 0) return destMap;

      switch (sourceTypeKey) {
        case 'hotel': {
          const joins = await db.destinationHotel.findMany({
            where: { hotelId: { in: ids }, active: true },
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
            where: { excursionId: { in: ids }, active: true },
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
            where: { packageId: { in: ids }, active: true },
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
            where: { transportServiceId: { in: ids }, active: true },
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
      const hotels = await db.hotel.findMany({
        where: productBaseWhere,
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

    // ─── Excursions ────────────────────────────────────────────────
    if (!sourceType || sourceType === 'excursion') {
      const excursions = await db.excursion.findMany({
        where: productBaseWhere,
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

    // ─── Packages ──────────────────────────────────────────────────
    if (!sourceType || sourceType === 'package') {
      const packages = await db.travelPackage.findMany({
        where: productBaseWhere,
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

    // ─── Transport ─────────────────────────────────────────────────
    if (!sourceType || sourceType === 'transport') {
      const transports = await db.transportService.findMany({
        where: productBaseWhere,
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

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[ResellerAvailableProducts] Error:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los productos disponibles' },
      { status: 500 },
    );
  }
}

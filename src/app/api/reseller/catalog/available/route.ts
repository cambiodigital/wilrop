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

    const resellerId = session.id;
    const url = new URL(request.url);
    const sourceType = url.searchParams.get('sourceType');

    const existingCatalog = await db.resellerCatalog.findMany({
      where: { resellerId: resellerId },
      select: { sourceType: true, sourceId: true },
    });
    const existingIds = new Set(
      existingCatalog.map((c) => `${c.sourceType}:${c.sourceId}`),
    );

    const items: Array<Record<string, unknown>> = [];

    // ─── Destinations ──────────────────────────────────────────────
    // Destinations are admin-managed templates only (no resellerId on model)
    if (!sourceType || sourceType === 'destination') {
      const destinations = await db.destination.findMany({
        where: { active: true, isTemplate: true },
        orderBy: { name: 'asc' },
      });

      items.push(
        ...destinations.map((d) => {
          const source = resolveSourceFields('destination', d as Record<string, unknown>);
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

    // Helper: fetch templates + reseller-owned, merge, deduplicate
    async function fetchProducts(
      model: 'hotel' | 'excursion' | 'package' | 'transport' | 'cruise',
      includeRelation?: object,
    ) {
      const modelMap = {
        hotel: db.hotel,
        excursion: db.excursion,
        package: db.travelPackage,
        transport: db.transportService,
        cruise: db.cruise,
      } as const;
      const delegate = modelMap[model] as any;
      const orderBy = model === 'package' ? { title: 'asc' } : { name: 'asc' };

      const templates = await delegate.findMany({
        where: { active: true, isTemplate: true },
        ...(includeRelation ? { include: includeRelation } : {}),
        orderBy,
      });
      const owned = await delegate.findMany({
        where: { active: true, isTemplate: false, resellerId: resellerId },
        ...(includeRelation ? { include: includeRelation } : {}),
        orderBy,
      });
      // Merge and deduplicate by id
      const map = new Map<string, any>();
      for (const item of templates) map.set(item.id, item);
      for (const item of owned) map.set(item.id, item);
      return [...map.values()];
    }

    // Helper: build destination-ID map
    async function buildDestMap(
      type: string,
      ids: string[],
    ): Promise<Map<string, string[]>> {
      const destMap = new Map<string, string[]>();
      if (ids.length === 0) return destMap;

      const joinTable = {
        hotel: { model: 'destinationHotel', fk: 'hotelId' },
        excursion: { model: 'destinationExcursion', fk: 'excursionId' },
        package: { model: 'destinationPackage', fk: 'packageId' },
        transport: { model: 'destinationTransportService', fk: 'transportServiceId' },
        cruise: { model: 'destinationCruise', fk: 'cruiseId' },
      }[type];

      if (!joinTable) return destMap;

      const joins = await (db[joinTable.model] as any).findMany({
        where: { [joinTable.fk]: { in: ids }, active: true },
        select: { [joinTable.fk]: true, destinationId: true },
      });
      for (const j of joins) {
        const key = j[joinTable.fk];
        const arr = destMap.get(key) ?? [];
        arr.push(j.destinationId);
        destMap.set(key, arr);
      }
      return destMap;
    }

    // ─── Hotels ────────────────────────────────────────────────────
    if (!sourceType || sourceType === 'hotel') {
      const hotels = await fetchProducts('hotel');
      const destMap = await buildDestMap('hotel', hotels.map((h: any) => h.id));
      items.push(
        ...hotels.map((h: any) => {
          const source = resolveSourceFields('hotel', h as Record<string, unknown>);
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
      const excursions = await fetchProducts('excursion');
      const destMap = await buildDestMap('excursion', excursions.map((e: any) => e.id));
      items.push(
        ...excursions.map((e: any) => {
          const source = resolveSourceFields('excursion', e as Record<string, unknown>);
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
      const packages = await fetchProducts('package');
      const destMap = await buildDestMap('package', packages.map((p: any) => p.id));
      items.push(
        ...packages.map((p: any) => {
          const source = resolveSourceFields('package', p as Record<string, unknown>);
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
      const transports = await fetchProducts('transport', {
        provider: { select: { name: true, vehicleType: true, capacity: true } },
      });
      const destMap = await buildDestMap('transport', transports.map((t: any) => t.id));
      items.push(
        ...transports.map((t: any) => {
          const source = resolveSourceFields('transport', t as Record<string, unknown>);
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

    // ─── Cruises ───────────────────────────────────────────────────
    if (!sourceType || sourceType === 'cruise') {
      const cruises = await fetchProducts('cruise');
      const destMap = await buildDestMap('cruise', cruises.map((c: any) => c.id));
      items.push(
        ...cruises.map((c: any) => {
          const source = resolveSourceFields('cruise', c as Record<string, unknown>);
          return {
            sourceType: 'cruise' as const,
            sourceId: c.id,
            name: source.title,
            location: source.location,
            price: source.price,
            image: source.image,
            description: source.description,
            metadata: source.metadata,
            relatedDestinationIds: destMap.get(c.id) ?? [],
            alreadyInCatalog: existingIds.has(`cruise:${c.id}`),
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

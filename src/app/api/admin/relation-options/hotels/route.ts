import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin/auth-helpers';
import {
  applyTemplateFallback,
  matchesSearch,
  parseRelationOptionFilters,
  resolveScopedRelationFilter,
  sortOptions,
  type RelationOption,
  type ScopedRelationFilterState,
} from '@/lib/admin/relation-options';

async function resolveDestinationFilter(destinationId?: string, destinationSlug?: string): Promise<ScopedRelationFilterState> {
  if (!destinationId && !destinationSlug) return resolveScopedRelationFilter({ scope: 'destination' });
  const destination = await db.destination.findFirst({
    where: {
      ...(destinationId ? { id: destinationId } : {}),
      ...(destinationSlug ? { slug: destinationSlug } : {}),
    },
    select: { id: true },
  });
  return resolveScopedRelationFilter({ scope: 'destination', id: destinationId, slug: destinationSlug, resolvedId: destination?.id });
}

export async function GET(request: NextRequest) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const filters = parseRelationOptionFilters(new URL(request.url).searchParams);
    const destinationFilter = await resolveDestinationFilter(filters.destinationId, filters.destinationSlug);
    if (destinationFilter.status === 'unresolved' || destinationFilter.status === 'invalid') {
      return NextResponse.json({ success: true, data: [], meta: destinationFilter.meta });
    }
    const destinationId = destinationFilter.resolvedId;
    const hotels = await (db.hotel as any).findMany({
      where: {
        ...(filters.active === undefined ? {} : { active: filters.active }),
        ...(destinationId
          ? {
              OR: [{ destinationId }, { cityId: destinationId }, { destinations: { some: { destinationId, active: true } } }],
            }
          : {}),
      } as any,
      orderBy: { name: 'asc' },
      include: { destination: { select: { name: true, slug: true } } } as any,
    }) as any[];

    const options: RelationOption[] = applyTemplateFallback(hotels, filters.includeTemplates)
      .filter((hotel) => matchesSearch([hotel.name, hotel.slug, hotel.cityName, hotel.destination?.name], filters.search))
      .map((hotel) => ({
        id: hotel.id,
        slug: hotel.slug,
        label: hotel.name,
        subtitle: hotel.destination?.name ?? hotel.cityName,
        active: hotel.active,
        isTemplate: hotel.isTemplate,
        sourceType: 'hotel',
      }));

    return NextResponse.json({ success: true, data: sortOptions(options) });
  } catch (error: any) {
    console.error('Error fetching hotel relation options:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch hotel options' }, { status: 500 });
  }
}

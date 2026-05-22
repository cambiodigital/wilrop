import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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
  try {
    const filters = parseRelationOptionFilters(new URL(request.url).searchParams);
    const destinationFilter = await resolveDestinationFilter(filters.destinationId, filters.destinationSlug);
    if (destinationFilter.status === 'unresolved' || destinationFilter.status === 'invalid') {
      return NextResponse.json({ success: true, data: [], meta: destinationFilter.meta });
    }
    const destinationId = destinationFilter.resolvedId;
    const excursions = await (db.excursion as any).findMany({
      where: {
        ...(filters.active === undefined ? {} : { active: filters.active }),
        ...(destinationId
          ? {
              OR: [
                { destinationRefId: destinationId },
                { destinationId },
                { destinations: { some: { destinationId, active: true } } },
              ],
            }
          : {}),
      } as any,
      orderBy: { name: 'asc' },
      include: { destinationRef: { select: { name: true, slug: true } } } as any,
    }) as any[];

    const options: RelationOption[] = applyTemplateFallback(excursions, filters.includeTemplates)
      .filter((excursion) => matchesSearch([excursion.name, excursion.slug, excursion.destinationName, excursion.cityName], filters.search))
      .map((excursion) => ({
        id: excursion.id,
        slug: excursion.slug,
        label: excursion.name,
        subtitle: excursion.destinationRef?.name ?? (excursion.destinationName || excursion.cityName),
        active: excursion.active,
        isTemplate: excursion.isTemplate,
        sourceType: 'excursion',
      }));

    return NextResponse.json({ success: true, data: sortOptions(options) });
  } catch (error: any) {
    console.error('Error fetching excursion relation options:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch excursion options' }, { status: 500 });
  }
}

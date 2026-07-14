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
    const packages = await (db.travelPackage as any).findMany({
      where: {
        ...(filters.active === undefined ? {} : { active: filters.active }),
        ...(destinationId
          ? {
              OR: [
                { primaryDestinationId: destinationId },
                { destinationId },
                { destinations: { some: { destinationId, active: true } } },
              ],
            }
          : {}),
      } as any,
      orderBy: { title: 'asc' },
      include: { primaryDestination: { select: { name: true, slug: true } } } as any,
    }) as any[];

    const options: RelationOption[] = applyTemplateFallback(packages, filters.includeTemplates)
      .filter((pkg) => matchesSearch([pkg.title, pkg.slug, pkg.destinationName, pkg.primaryDestination?.name], filters.search))
      .map((pkg) => ({
        id: pkg.id,
        slug: pkg.slug,
        label: pkg.title,
        subtitle: pkg.primaryDestination?.name ?? pkg.destinationName,
        active: pkg.active,
        isTemplate: pkg.isTemplate,
        sourceType: 'package',
      }));

    return NextResponse.json({ success: true, data: sortOptions(options) });
  } catch (error: any) {
    console.error('Error fetching package relation options:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch package options' }, { status: 500 });
  }
}

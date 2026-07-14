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
    const services = await (db.transportService as any).findMany({
      where: {
        ...(filters.active === undefined ? {} : { active: filters.active }),
        ...(destinationId
          ? {
              OR: [
                { originDestinationId: destinationId },
                { destinationDestinationId: destinationId },
                { cityId: destinationId },
                { destinations: { some: { destinationId, active: true } } },
              ],
            }
          : {}),
      } as any,
      orderBy: { name: 'asc' },
      include: { provider: { select: { name: true, vehicleType: true } } },
    }) as any[];

    const options: RelationOption[] = applyTemplateFallback(services, filters.includeTemplates)
      .filter((service) =>
        matchesSearch([service.name, service.origin, service.destination, service.cityName, service.provider.name, filters.role], filters.search)
      )
      .map((service) => ({
        id: service.id,
        label: service.name,
        subtitle: [service.provider.name, service.origin && service.destination ? `${service.origin} → ${service.destination}` : service.cityName]
          .filter(Boolean)
          .join(' · '),
        active: service.active,
        isTemplate: service.isTemplate,
        sourceType: 'transportService',
      }));

    return NextResponse.json({ success: true, data: sortOptions(options) });
  } catch (error: any) {
    console.error('Error fetching transport service relation options:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch transport service options' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  applyTemplateFallback,
  matchesSearch,
  parseRelationOptionFilters,
  sortOptions,
  type RelationOption,
} from '@/lib/admin/relation-options';

export async function GET(request: NextRequest) {
  try {
    const filters = parseRelationOptionFilters(new URL(request.url).searchParams);
    const destinations = await db.destination.findMany({
      where: filters.active === undefined ? undefined : { active: filters.active },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    const options: RelationOption[] = applyTemplateFallback(destinations, filters.includeTemplates)
      .filter((destination) => matchesSearch([destination.name, destination.slug, destination.region], filters.search))
      .map((destination) => ({
        id: destination.id,
        slug: destination.slug,
        label: destination.name,
        subtitle: destination.region,
        active: destination.active,
        isTemplate: destination.isTemplate,
        sourceType: 'destination',
      }));

    return NextResponse.json({ success: true, data: sortOptions(options) });
  } catch (error: any) {
    console.error('Error fetching destination relation options:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch destination options' }, { status: 500 });
  }
}

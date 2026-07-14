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

async function resolveHotelFilter(hotelId?: string): Promise<ScopedRelationFilterState> {
  if (!hotelId) return resolveScopedRelationFilter({ scope: 'hotel' });
  const hotel = await db.hotel.findUnique({ where: { id: hotelId }, select: { id: true } });
  return resolveScopedRelationFilter({ scope: 'hotel', id: hotelId, resolvedId: hotel?.id });
}

export async function GET(request: NextRequest) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const filters = parseRelationOptionFilters(new URL(request.url).searchParams);
    const hotelFilter = await resolveHotelFilter(filters.hotelId);
    if (hotelFilter.status === 'unresolved' || hotelFilter.status === 'invalid') {
      return NextResponse.json({ success: true, data: [], meta: hotelFilter.meta });
    }

    const roomTypes = await db.roomType.findMany({
      where: {
        ...(filters.active === undefined ? {} : { active: filters.active }),
        ...(hotelFilter.resolvedId ? { hotelId: hotelFilter.resolvedId } : {}),
      },
      orderBy: { name: 'asc' },
      include: { hotel: { select: { id: true, name: true, slug: true, isTemplate: true } } },
    });

    const templateAwareRoomTypes = roomTypes.map((roomType) => ({
      ...roomType,
      isTemplate: roomType.hotel.isTemplate,
    }));

    const options: RelationOption[] = applyTemplateFallback(templateAwareRoomTypes, filters.includeTemplates)
      .filter((roomType) => matchesSearch([roomType.name, roomType.hotel.name, roomType.hotel.slug], filters.search))
      .map((roomType) => ({
        id: roomType.id,
        label: roomType.name,
        subtitle: roomType.hotel.name,
        active: roomType.active,
        isTemplate: roomType.hotel.isTemplate,
        sourceType: 'roomType',
      }));

    return NextResponse.json({ success: true, data: sortOptions(options) });
  } catch (error: any) {
    console.error('Error fetching room type relation options:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch room type options' }, { status: 500 });
  }
}

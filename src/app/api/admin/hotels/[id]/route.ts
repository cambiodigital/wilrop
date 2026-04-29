import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatHotel(hotel: any) {
  return {
    ...hotel,
    images: safeJsonParse<string[]>(hotel.images, []),
    amenities: safeJsonParse<string[]>(hotel.amenities, []),
    rooms: safeJsonParse<any[]>(hotel.rooms, []),
    tags: safeJsonParse<string[]>(hotel.tags, []),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const hotel = await db.hotel.findUnique({
      where: { id },
    });

    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: formatHotel(hotel) });
  } catch (error: unknown) {
    console.error('Error fetching hotel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotel' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.hotel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    const updates: any = {};

    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.name !== undefined) updates.name = body.name;
    if (body.cityId !== undefined) updates.cityId = body.cityId;
    if (body.cityName !== undefined) updates.cityName = body.cityName;
    if (body.stars !== undefined) updates.stars = body.stars;
    if (body.address !== undefined) updates.address = body.address;
    if (body.description !== undefined) updates.description = body.description;
    if (body.images !== undefined) updates.images = JSON.stringify(body.images);
    if (body.amenities !== undefined) updates.amenities = JSON.stringify(body.amenities);
    if (body.rooms !== undefined) updates.rooms = JSON.stringify(body.rooms);
    if (body.rating !== undefined) updates.rating = body.rating;
    if (body.reviewCount !== undefined) updates.reviewCount = body.reviewCount;
    if (body.priceFrom !== undefined) updates.priceFrom = body.priceFrom;
    if (body.tags !== undefined) updates.tags = JSON.stringify(body.tags);
    if (body.featured !== undefined) updates.featured = body.featured;
    if (body.active !== undefined) updates.active = body.active;

    const hotel = await db.hotel.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: formatHotel(hotel) });
  } catch (error: unknown) {
    console.error('Error updating hotel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update hotel' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.hotel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    await db.hotel.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting hotel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete hotel' },
      { status: 500 }
    );
  }
}

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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  try {
    const hotels = await db.hotel.findMany();

    const parsed = hotels.map(formatHotel);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      slug,
      name,
      cityId,
      cityName,
      stars,
      address,
      description,
      images,
      amenities,
      rooms,
      rating,
      reviewCount,
      priceFrom,
      tags,
      featured,
      active,
    } = body;

    if (!name || !cityId || !cityName) {
      return NextResponse.json(
        { success: false, error: 'Name, cityId, and cityName are required' },
        { status: 400 }
      );
    }

    const finalSlug = slug || generateSlug(name);

    const hotel = await db.hotel.create({
      data: {
        slug: finalSlug,
        name,
        cityId,
        cityName,
        stars: stars ?? 3,
        address: address ?? '',
        description: description ?? '',
        images: JSON.stringify(images || []),
        amenities: JSON.stringify(amenities || []),
        rooms: JSON.stringify(rooms || []),
        rating: rating ?? 0,
        reviewCount: reviewCount ?? 0,
        priceFrom: priceFrom ?? 0,
        tags: JSON.stringify(tags || []),
        featured: featured ?? false,
        active: active ?? true,
      },
    });

    return NextResponse.json(
      { success: true, data: formatHotel(hotel) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating hotel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hotel' },
      { status: 500 }
    );
  }
}

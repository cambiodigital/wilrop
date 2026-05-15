import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function parseHighlights(highlights: string): string[] {
  try {
    return JSON.parse(highlights);
  } catch {
    return [];
  }
}

function formatDestination(dest: any) {
  return {
    ...dest,
    highlights: parseHighlights(dest.highlights),
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
    const realCount = await db.destination.count({
      where: { isTemplate: false },
    });

    const destinations = await db.destination.findMany({
      where: {
        isTemplate: realCount > 0 ? false : true,
      },
      orderBy: { order: 'asc' },
    });

    const parsed = destinations.map(formatDestination);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      region,
      description,
      image,
      highlights,
      rating,
      reviewCount,
      priceFrom,
      active,
      order,
      slug,
    } = body;

    if (!name || !region || !description || !image) {
      return NextResponse.json(
        { success: false, error: 'Name, region, description, and image are required' },
        { status: 400 }
      );
    }

    const finalSlug = slug || generateSlug(name);

    const destination = await db.destination.create({
      data: {
        slug: finalSlug,
        name,
        region,
        description,
        image,
        highlights: JSON.stringify(highlights || []),
        rating: rating ?? 0,
        reviewCount: reviewCount ?? 0,
        priceFrom: priceFrom ?? 0,
        active: active ?? true,
        isTemplate: false,
        order: order ?? 0,
      },
    });

    return NextResponse.json(
      { success: true, data: formatDestination(destination) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating destination:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create destination' },
      { status: 500 }
    );
  }
}

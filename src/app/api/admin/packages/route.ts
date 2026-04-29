import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatPackage(pkg: any) {
  return {
    ...pkg,
    includes: safeJsonParse<string[]>(pkg.includes, []),
    departureDates: safeJsonParse<string[]>(pkg.departureDates, []),
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  try {
    const packages = await db.travelPackage.findMany();

    const parsed = packages.map(formatPackage);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: unknown) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      slug,
      destinationId,
      destinationName,
      title,
      description,
      duration,
      price,
      originalPrice,
      includes,
      image,
      difficulty,
      groupSize,
      departureDates,
      rating,
      soldOut,
      category,
      commission,
      active,
    } = body;

    if (!destinationId || !destinationName || !title || !duration || price === undefined) {
      return NextResponse.json(
        {
          success: false,
          error:
            'destinationId, destinationName, title, duration, and price are required',
        },
        { status: 400 }
      );
    }

    const finalSlug = slug || generateSlug(title);

    const pkg = await db.travelPackage.create({
      data: {
        slug: finalSlug,
        destinationId,
        destinationName,
        title,
        description: description ?? '',
        duration,
        price,
        originalPrice: originalPrice ?? null,
        includes: JSON.stringify(includes || []),
        image: image ?? '',
        difficulty: difficulty ?? 'Fácil',
        groupSize: groupSize ?? '',
        departureDates: JSON.stringify(departureDates || []),
        rating: rating ?? 0,
        soldOut: soldOut ?? false,
        category: category ?? 'Cultural',
        commission: commission ?? 10,
        active: active ?? true,
      },
    });

    return NextResponse.json(
      { success: true, data: formatPackage(pkg) },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create package' },
      { status: 500 }
    );
  }
}

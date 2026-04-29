import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatExcursion(excursion: any) {
  return {
    ...excursion,
    images: safeJsonParse<string[]>(excursion.images, []),
    includes: safeJsonParse<string[]>(excursion.includes, []),
    excludes: safeJsonParse<string[]>(excursion.excludes, []),
    requirements: safeJsonParse<string[]>(excursion.requirements, []),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId');
    const cityId = searchParams.get('cityId');

    const where: any = { active: true };

    if (destinationId) {
      where.destinationId = destinationId;
    }

    if (cityId) {
      where.cityName = cityId;
    }

    const excursions = await db.excursion.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
    });

    const parsed = excursions.map(formatExcursion);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: unknown) {
    console.error('Error fetching public excursions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch excursions' },
      { status: 500 }
    );
  }
}

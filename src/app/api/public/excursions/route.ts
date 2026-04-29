import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Excursion } from '@prisma/client';

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatExcursion(excursion: unknown) {
  const e = excursion as Excursion;
  return {
    ...e,
    images: safeJsonParse<string[]>(e.images, []),
    includes: safeJsonParse<string[]>(e.includes, []),
    excludes: safeJsonParse<string[]>(e.excludes, []),
    requirements: safeJsonParse<string[]>(e.requirements, []),
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
  } catch (error: any) {
    console.error('Error fetching public excursions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch excursions' },
      { status: 500 }
    );
  }
}

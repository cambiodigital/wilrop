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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId');
    const category = searchParams.get('category');

    const realCount = await db.travelPackage.count({
      where: { active: true, isTemplate: false },
    });

    const packages = await db.travelPackage.findMany({
      where: {
        active: true,
        isTemplate: realCount > 0 ? false : true,
        ...(destinationId ? { destinationId } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { rating: 'desc' },
    });

    const parsed = packages.map(formatPackage);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching public packages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

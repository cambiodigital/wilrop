import { safeJsonParse } from '@/lib/json'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolvePackageDestinationIds } from '@/lib/catalog/public-hydration';


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
      where: { active: true, isTemplate: false, resellerId: null },
    });

    const packages = await db.travelPackage.findMany({
      where: {
        active: true,
        isTemplate: realCount > 0 ? false : true,
        resellerId: null,
        ...(destinationId ? { destinationId } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { rating: 'desc' },
    });

    const parsed = packages.map(formatPackage);

    // ── Resolve relation-based destination IDs from DestinationPackage join ──

    const packageIds = packages.map((p) => p.id);
    let relatedMap = new Map<string, string[]>();

    try {
      const joinRows = await db.destinationPackage.findMany({
        where: { packageId: { in: packageIds }, active: true },
        select: { packageId: true, destinationId: true, active: true },
      });
      relatedMap = resolvePackageDestinationIds(joinRows);
    } catch {
      // Join table may not exist yet; gracefully degrade
    }

    const enriched = parsed.map((pkg) => ({
      ...pkg,
      relatedDestinationIds: relatedMap.get(pkg.id) ?? [],
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    console.error('Error fetching public packages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

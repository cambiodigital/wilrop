import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth';

function isMissingDatabaseObjectError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? (error as { code?: unknown }).code : undefined;
  if (code === 'P2021' || code === 'P2022') return true;
  const message = 'message' in error ? (error as { message?: unknown }).message : undefined;
  if (typeof message !== 'string') return false;
  return (
    message.includes('does not exist') ||
    message.includes('no such table') ||
    message.toLowerCase().includes('column') && message.toLowerCase().includes('does not exist')
  );
}

async function safeDb<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isMissingDatabaseObjectError(error)) return fallback;
    throw error;
  }
}

async function resolveActiveWhereWithTemplatesFallback(model: 'destination' | 'hotel' | 'travelPackage' | 'excursion' | 'transportService') {
  try {
    const realCount = await (db as any)[model].count({ where: { active: true, isTemplate: false } });
    return { active: true, isTemplate: realCount > 0 ? false : true };
  } catch (error) {
    if (isMissingDatabaseObjectError(error)) return { active: true };
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionValue = request.cookies.get(getPanelSessionCookieName('admin'))?.value;
    const session = verifyPanelSessionToken(sessionValue, 'admin');

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [
      destinationWhere,
      hotelWhere,
      packageWhere,
      excursionWhere,
      transportServiceWhere,
    ] = await Promise.all([
      resolveActiveWhereWithTemplatesFallback('destination'),
      resolveActiveWhereWithTemplatesFallback('hotel'),
      resolveActiveWhereWithTemplatesFallback('travelPackage'),
      resolveActiveWhereWithTemplatesFallback('excursion'),
      resolveActiveWhereWithTemplatesFallback('transportService'),
    ]);

    const [
      totalDestinations,
      totalHotels,
      totalPackages,
      totalExcursions,
      totalTransportServices,
      featuredHotels,
      soldOutPackages,
    ] = await Promise.all([
      safeDb(() => db.destination.count({ where: destinationWhere as any }), 0),
      safeDb(() => db.hotel.count({ where: hotelWhere as any }), 0),
      safeDb(() => db.travelPackage.count({ where: packageWhere as any }), 0),
      safeDb(() => db.excursion.count({ where: excursionWhere as any }), 0),
      safeDb(() => db.transportService.count({ where: transportServiceWhere as any }), 0),
      safeDb(() => db.hotel.count({ where: { ...(hotelWhere as any), featured: true } }), 0),
      safeDb(() => db.travelPackage.count({ where: { ...(packageWhere as any), soldOut: true } }), 0),
    ]);

    // Calculate average rating across destinations and hotels
    const [destRatings, hotelRatings] = await Promise.all([
      safeDb(
        () =>
          db.destination.findMany({
            where: destinationWhere as any,
            select: { rating: true },
          }),
        [],
      ),
      safeDb(
        () =>
          db.hotel.findMany({
            where: hotelWhere as any,
            select: { rating: true },
          }),
        [],
      ),
    ]);

    const allRatings = [
      ...destRatings.map((d) => d.rating),
      ...hotelRatings.map((h) => h.rating),
    ];

    const avgRating =
      allRatings.length > 0
        ? Math.round((allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length) * 10) /
          10
        : 0;

    // Get recent 5 packages by createdAt desc
    const recentPackages = await safeDb(
      () =>
        db.travelPackage.findMany({
          where: packageWhere as any,
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      [],
    );

    return NextResponse.json({
      success: true,
      data: {
        totalDestinations,
        totalHotels,
        totalPackages,
        totalExcursions,
        totalTransportServices,
        featuredHotels,
        avgRating,
        soldOutPackages,
        recentPackages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

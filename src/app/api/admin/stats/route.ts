import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth';

export async function GET(request: NextRequest) {
  try {
    const sessionValue = request.cookies.get(getPanelSessionCookieName('admin'))?.value;
    const session = verifyPanelSessionToken(sessionValue, 'admin');

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [
      destinationsRealCount,
      hotelsRealCount,
      packagesRealCount,
      excursionsRealCount,
      transportServicesRealCount,
    ] = await Promise.all([
      db.destination.count({ where: { active: true, isTemplate: false } }),
      db.hotel.count({ where: { active: true, isTemplate: false } }),
      db.travelPackage.count({ where: { active: true, isTemplate: false } }),
      db.excursion.count({ where: { active: true, isTemplate: false } }),
      db.transportService.count({ where: { active: true, isTemplate: false } }),
    ]);

    const destinationWhere = { active: true, isTemplate: destinationsRealCount > 0 ? false : true };
    const hotelWhere = { active: true, isTemplate: hotelsRealCount > 0 ? false : true };
    const packageWhere = { active: true, isTemplate: packagesRealCount > 0 ? false : true };
    const excursionWhere = { active: true, isTemplate: excursionsRealCount > 0 ? false : true };
    const transportServiceWhere = { active: true, isTemplate: transportServicesRealCount > 0 ? false : true };

    const [
      totalDestinations,
      totalHotels,
      totalPackages,
      totalExcursions,
      totalTransportServices,
      featuredHotels,
      soldOutPackages,
    ] = await Promise.all([
      db.destination.count({ where: destinationWhere }),
      db.hotel.count({ where: hotelWhere }),
      db.travelPackage.count({ where: packageWhere }),
      db.excursion.count({ where: excursionWhere }),
      db.transportService.count({ where: transportServiceWhere }),
      db.hotel.count({ where: { ...hotelWhere, featured: true } }),
      db.travelPackage.count({ where: { ...packageWhere, soldOut: true } }),
    ]);

    // Calculate average rating across destinations and hotels
    const [destRatings, hotelRatings] = await Promise.all([
      db.destination.findMany({
        where: destinationWhere,
        select: { rating: true },
      }),
      db.hotel.findMany({
        where: hotelWhere,
        select: { rating: true },
      }),
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
    const recentPackages = await db.travelPackage.findMany({
      where: packageWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

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

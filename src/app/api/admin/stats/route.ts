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

    const [totalDestinations, totalHotels, totalPackages, featuredHotels, soldOutPackages] =
      await Promise.all([
        db.destination.count({ where: { active: true } }),
        db.hotel.count({ where: { active: true } }),
        db.travelPackage.count({ where: { active: true } }),
        db.hotel.count({ where: { featured: true } }),
        db.travelPackage.count({ where: { soldOut: true } }),
      ]);

    // Calculate average rating across destinations and hotels using aggregate
    const [destStats, hotelStats] = await Promise.all([
      db.destination.aggregate({
        where: { active: true },
        _avg: { rating: true },
        _count: { rating: true }
      }),
      db.hotel.aggregate({
        where: { active: true },
        _avg: { rating: true },
        _count: { rating: true }
      })
    ]);

    const destAvg = destStats._avg.rating || 0;
    const destCount = destStats._count.rating || 0;
    const hotelAvg = hotelStats._avg.rating || 0;
    const hotelCount = hotelStats._count.rating || 0;

    const totalCount = destCount + hotelCount;
    const avgRating = totalCount > 0
      ? Math.round(((destAvg * destCount + hotelAvg * hotelCount) / totalCount) * 10) / 10
      : 0;

    // Get recent 5 packages by createdAt desc
    const recentPackages = await db.travelPackage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalDestinations,
        totalHotels,
        totalPackages,
        featuredHotels,
        avgRating,
        soldOutPackages,
        recentPackages,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

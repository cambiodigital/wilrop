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

    // Calculate average rating across destinations and hotels
    const [destRatings, hotelRatings] = await Promise.all([
      db.destination.findMany({
        where: { active: true },
        select: { rating: true },
      }),
      db.hotel.findMany({
        where: { active: true },
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
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

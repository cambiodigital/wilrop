import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatAdminHotel } from '@/lib/admin/hotels';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId');

    const hotels = await db.hotel.findMany({
      where: {
        active: true,
        ...(cityId ? { cityId } : {}),
      },
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }, { name: 'asc' }],
    });

    return NextResponse.json({ success: true, data: hotels.map(formatAdminHotel) });
  } catch (error) {
    console.error('Error fetching public hotels:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotels' },
      { status: 500 },
    );
  }
}

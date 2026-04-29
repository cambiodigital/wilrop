import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const roomTypeId = searchParams.get('roomTypeId');

    const where: any = {};
    if (hotelId) {
      where.hotelId = hotelId;
    }
    if (roomTypeId) {
      where.roomTypeId = roomTypeId;
    }

    const allotments = await db.allotment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        hotel: {
          select: { id: true, name: true, cityName: true },
        },
        roomType: {
          select: { id: true, name: true, maxGuests: true, basePrice: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: allotments });
  } catch (error: unknown) {
    console.error('Error fetching allotments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch allotments' },
      { status: 500 }
    );
  }
}

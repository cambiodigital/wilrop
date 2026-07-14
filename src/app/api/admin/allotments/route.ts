import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin/auth-helpers';

export async function GET(request: NextRequest) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
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
  } catch (error: any) {
    console.error('Error fetching allotments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch allotments' },
      { status: 500 }
    );
  }
}

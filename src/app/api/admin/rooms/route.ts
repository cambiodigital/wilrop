import { safeJsonParse } from '@/lib/json'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';


function formatRoom(room: any) {
  return {
    ...room,
    includes: safeJsonParse<string[]>(room.includes, []),
    roomImages: safeJsonParse<string[]>(room.roomImages, []),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');

    const where: any = {};
    if (hotelId) {
      where.hotelId = hotelId;
    }

    const rooms = await db.roomType.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        hotel: {
          select: { id: true, name: true, cityName: true },
        },
      },
    });

    const parsed = rooms.map(formatRoom);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

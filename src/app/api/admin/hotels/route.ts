import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  buildHotelCreateData,
  formatAdminHotel,
  isUniqueConstraintError,
} from '@/lib/admin/hotels';

export async function GET() {
  try {
    const hotels = await db.hotel.findMany();

    const parsed = hotels.map(formatAdminHotel);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const hotel = await db.hotel.create({
      data: buildHotelCreateData(body),
    });

    return NextResponse.json(
      { success: true, data: formatAdminHotel(hotel) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating hotel:', error);
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un hotel con ese slug' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create hotel',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST: Create an allotment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();

    const {
      hotelId,
      roomTypeId,
      dateFrom,
      dateTo,
      totalRooms,
      releaseDays,
      netPrice,
      status,
    } = body;

    if (!hotelId || !roomTypeId || !dateFrom || !dateTo) {
      return NextResponse.json(
        { success: false, error: 'hotelId, roomTypeId, dateFrom, and dateTo are required' },
        { status: 400 }
      );
    }

    const hotel = await db.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    const roomType = await db.roomType.findUnique({ where: { id: roomTypeId } });
    if (!roomType) {
      return NextResponse.json(
        { success: false, error: 'Room type not found' },
        { status: 404 }
      );
    }

    const allotment = await db.allotment.create({
      data: {
        hotelId,
        roomTypeId,
        dateFrom,
        dateTo,
        totalRooms: totalRooms ?? 0,
        bookedRooms: 0,
        releaseDays: releaseDays ?? 3,
        netPrice: netPrice ?? 0,
        status: status ?? 'active',
      },
      include: {
        hotel: {
          select: { id: true, name: true, cityName: true },
        },
        roomType: {
          select: { id: true, name: true, maxGuests: true, basePrice: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: allotment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating allotment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create allotment' },
      { status: 500 }
    );
  }
}

// PUT: Update an allotment by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.allotment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Allotment not found' },
        { status: 404 }
      );
    }

    const updates: any = {};

    if (body.hotelId !== undefined) updates.hotelId = body.hotelId;
    if (body.roomTypeId !== undefined) updates.roomTypeId = body.roomTypeId;
    if (body.dateFrom !== undefined) updates.dateFrom = body.dateFrom;
    if (body.dateTo !== undefined) updates.dateTo = body.dateTo;
    if (body.totalRooms !== undefined) updates.totalRooms = body.totalRooms;
    if (body.bookedRooms !== undefined) updates.bookedRooms = body.bookedRooms;
    if (body.releaseDays !== undefined) updates.releaseDays = body.releaseDays;
    if (body.netPrice !== undefined) updates.netPrice = body.netPrice;
    if (body.status !== undefined) updates.status = body.status;

    const allotment = await db.allotment.update({
      where: { id },
      data: updates,
      include: {
        hotel: {
          select: { id: true, name: true, cityName: true },
        },
        roomType: {
          select: { id: true, name: true, maxGuests: true, basePrice: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: allotment });
  } catch (error: any) {
    console.error('Error updating allotment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update allotment' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an allotment by ID
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.allotment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Allotment not found' },
        { status: 404 }
      );
    }

    await db.allotment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting allotment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete allotment' },
      { status: 500 }
    );
  }
}

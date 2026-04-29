import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatRoom(room: any) {
  return {
    ...room,
    includes: safeJsonParse<string[]>(room.includes, []),
  };
}

// POST: Create a room for a hotel. The [id] param is the hotelId.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hotelId } = await params;
    const body = await request.json();

    const hotel = await db.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    const {
      name,
      maxGuests,
      beds,
      basePrice,
      originalPrice,
      includes,
      roomImage,
      active,
    } = body;

    const room = await db.roomType.create({
      data: {
        hotelId,
        name: name ?? 'Habitación Estándar',
        maxGuests: maxGuests ?? 2,
        beds: beds ?? '1 cama doble',
        basePrice: basePrice ?? 0,
        originalPrice: originalPrice ?? 0,
        includes: JSON.stringify(includes || []),
        roomImage: roomImage ?? '',
        active: active ?? true,
      },
      include: {
        hotel: {
          select: { id: true, name: true, cityName: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: formatRoom(room) },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    );
  }
}

// PUT: Update a room by roomId. The [id] param is the room ID.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();


    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.maxGuests !== undefined) updates.maxGuests = body.maxGuests;
    if (body.beds !== undefined) updates.beds = body.beds;
    if (body.basePrice !== undefined) updates.basePrice = body.basePrice;
    if (body.originalPrice !== undefined) updates.originalPrice = body.originalPrice;
    if (body.includes !== undefined) updates.includes = JSON.stringify(body.includes);
    if (body.roomImage !== undefined) updates.roomImage = body.roomImage;
    if (body.active !== undefined) updates.active = body.active;

    const room = await db.roomType.update({
      where: { id },
      data: updates,
      include: {
        hotel: {
          select: { id: true, name: true, cityName: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: formatRoom(room) });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }
    console.error('Error updating room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update room' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a room by roomId. The [id] param is the room ID.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.roomType.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    console.error('Error deleting room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}

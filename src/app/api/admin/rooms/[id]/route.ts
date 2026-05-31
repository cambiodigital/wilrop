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

async function syncHotelRoomsCache(hotelId: string) {
  const roomTypes = await db.roomType.findMany({
    where: { hotelId },
  });

  const formattedRooms = roomTypes
    .filter((rt) => rt.active)
    .map((rt) => ({
      id: rt.id,
      name: rt.name,
      maxGuests: rt.maxGuests,
      beds: rt.beds,
      price: rt.basePrice,
      originalPrice: rt.originalPrice > 0 ? rt.originalPrice : undefined,
      includes: safeJsonParse<string[]>(rt.includes, []),
      available: 1,
      roomImage: rt.roomImage,
      roomImages: safeJsonParse<string[]>(rt.roomImages, []),
    }));

  await db.hotel.update({
    where: { id: hotelId },
    data: {
      rooms: JSON.stringify(formattedRooms),
    },
  });
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
      roomImages,
      active,
    } = body;

    const finalRoomImages = roomImages || [];
    const finalRoomImage = roomImage || finalRoomImages[0] || '';

    const room = await db.roomType.create({
      data: {
        hotelId,
        name: name ?? 'Habitación Estándar',
        maxGuests: maxGuests ?? 2,
        beds: beds ?? '1 cama doble',
        basePrice: basePrice ?? 0,
        originalPrice: originalPrice ?? 0,
        includes: JSON.stringify(includes || []),
        roomImage: finalRoomImage,
        roomImages: JSON.stringify(finalRoomImages),
        active: active ?? true,
      },
      include: {
        hotel: {
          select: { id: true, name: true, cityName: true },
        },
      },
    });

    await syncHotelRoomsCache(hotelId);

    return NextResponse.json(
      { success: true, data: formatRoom(room) },
      { status: 201 }
    );
  } catch (error: any) {
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

    const existing = await db.roomType.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.maxGuests !== undefined) updates.maxGuests = body.maxGuests;
    if (body.beds !== undefined) updates.beds = body.beds;
    if (body.basePrice !== undefined) updates.basePrice = body.basePrice;
    if (body.originalPrice !== undefined) updates.originalPrice = body.originalPrice;
    if (body.includes !== undefined) updates.includes = JSON.stringify(body.includes);
    if (body.roomImages !== undefined) {
      updates.roomImages = JSON.stringify(body.roomImages);
      if (body.roomImage === undefined) {
        updates.roomImage = body.roomImages[0] || '';
      }
    }
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

    await syncHotelRoomsCache(existing.hotelId);

    return NextResponse.json({ success: true, data: formatRoom(room) });
  } catch (error: any) {
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

    const existing = await db.roomType.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    await db.roomType.delete({ where: { id } });

    await syncHotelRoomsCache(existing.hotelId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}

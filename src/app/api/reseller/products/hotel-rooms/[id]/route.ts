import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { safeJsonParse } from "@/lib/json";
import {
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from "@/lib/panel-auth";

function formatRoom(room: any) {
  return {
    ...room,
    includes: safeJsonParse<string[]>(room.includes, []),
    roomImages: safeJsonParse<string[]>(room.roomImages, []),
  };
}

async function requireResellerSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(
    getPanelSessionCookieName("reseller"),
  )?.value;
  return verifyPanelSessionToken(sessionValue, "reseller");
}

async function syncHotelRoomsCache(hotelId: string) {
  const roomTypes = await db.roomType.findMany({ where: { hotelId } });
  const formattedRooms = roomTypes
    .filter((roomType) => roomType.active)
    .map((roomType) => ({
      id: roomType.id,
      name: roomType.name,
      maxGuests: roomType.maxGuests,
      beds: roomType.beds,
      price: roomType.basePrice,
      originalPrice:
        roomType.originalPrice > 0 ? roomType.originalPrice : undefined,
      includes: safeJsonParse<string[]>(roomType.includes, []),
      available: 1,
      roomImage: roomType.roomImage,
      roomImages: safeJsonParse<string[]>(roomType.roomImages, []),
    }));

  await db.hotel.update({
    where: { id: hotelId },
    data: { rooms: JSON.stringify(formattedRooms) },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 },
      );
    }

    const { id: hotelId } = await params;
    const hotel = await db.hotel.findFirst({
      where: { id: hotelId, resellerId: session.id },
    });
    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: "Hotel no encontrado o no pertenece a tu cuenta",
        },
        { status: 404 },
      );
    }

    const body = await request.json();
    const roomImages = Array.isArray(body.roomImages) ? body.roomImages : [];
    const roomImage =
      typeof body.roomImage === "string" && body.roomImage
        ? body.roomImage
        : roomImages[0] || "";

    const room = await db.roomType.create({
      data: {
        hotelId,
        name: body.name ?? "Habitación Estándar",
        maxGuests: typeof body.maxGuests === "number" ? body.maxGuests : 2,
        beds: body.beds ?? "1 cama doble",
        basePrice: typeof body.basePrice === "number" ? body.basePrice : 0,
        originalPrice:
          typeof body.originalPrice === "number" ? body.originalPrice : 0,
        includes: JSON.stringify(
          Array.isArray(body.includes) ? body.includes : [],
        ),
        roomImage,
        roomImages: JSON.stringify(roomImages),
        active: typeof body.active === "boolean" ? body.active : true,
      },
      include: { hotel: { select: { id: true, name: true, cityName: true } } },
    });

    await syncHotelRoomsCache(hotelId);
    return NextResponse.json(
      { success: true, data: formatRoom(room) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating reseller room:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo crear la habitación" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const existing = await db.roomType.findFirst({
      where: { id, hotel: { resellerId: session.id } },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Habitación no encontrada o no pertenece a tu cuenta",
        },
        { status: 404 },
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.maxGuests !== undefined) updates.maxGuests = body.maxGuests;
    if (body.beds !== undefined) updates.beds = body.beds;
    if (body.basePrice !== undefined) updates.basePrice = body.basePrice;
    if (body.originalPrice !== undefined)
      updates.originalPrice = body.originalPrice;
    if (body.includes !== undefined)
      updates.includes = JSON.stringify(
        Array.isArray(body.includes) ? body.includes : [],
      );
    if (body.roomImages !== undefined) {
      const roomImages = Array.isArray(body.roomImages) ? body.roomImages : [];
      updates.roomImages = JSON.stringify(roomImages);
      if (body.roomImage === undefined) updates.roomImage = roomImages[0] || "";
    }
    if (body.roomImage !== undefined) updates.roomImage = body.roomImage;
    if (body.active !== undefined) updates.active = body.active;

    const room = await db.roomType.update({
      where: { id },
      data: updates,
      include: { hotel: { select: { id: true, name: true, cityName: true } } },
    });
    await syncHotelRoomsCache(existing.hotelId);
    return NextResponse.json({ success: true, data: formatRoom(room) });
  } catch (error) {
    console.error("Error updating reseller room:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo actualizar la habitación" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const existing = await db.roomType.findFirst({
      where: { id, hotel: { resellerId: session.id } },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Habitación no encontrada o no pertenece a tu cuenta",
        },
        { status: 404 },
      );
    }

    await db.roomType.delete({ where: { id } });
    await syncHotelRoomsCache(existing.hotelId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reseller room:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo eliminar la habitación" },
      { status: 500 },
    );
  }
}

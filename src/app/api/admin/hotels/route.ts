import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { safeJsonParse } from "@/lib/json";
import {
  buildHotelCreateData,
  formatAdminHotel,
  isUniqueConstraintError,
} from "@/lib/admin/hotels";
import { syncResellerCatalogEntry } from "@/lib/reseller/catalog";

async function syncHotelRoomsCache(hotelId: string) {
  const roomTypes = await db.roomType.findMany({ where: { hotelId } });
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
    data: { rooms: JSON.stringify(formattedRooms) },
  });
}

async function batchCreateRoomTypes(
  hotelId: string,
  pendingRoomTypes: Array<Record<string, unknown>>
) {
  for (const rt of pendingRoomTypes) {
    const roomImages = Array.isArray(rt.roomImages) ? rt.roomImages : [];
    const roomImage = (typeof rt.roomImage === "string" && rt.roomImage) || roomImages[0] || "";
    await db.roomType.create({
      data: {
        hotelId,
        name: (typeof rt.name === "string" && rt.name) || "Habitación Estándar",
        maxGuests: typeof rt.maxGuests === "number" ? rt.maxGuests : 2,
        beds: (typeof rt.beds === "string" && rt.beds) || "1 cama doble",
        basePrice: typeof rt.basePrice === "number" ? rt.basePrice : 0,
        originalPrice: typeof rt.originalPrice === "number" ? rt.originalPrice : 0,
        includes: JSON.stringify(Array.isArray(rt.includes) ? rt.includes : []),
        roomImage,
        roomImages: JSON.stringify(roomImages),
        active: typeof rt.active === "boolean" ? rt.active : true,
      },
    });
  }
}

export async function GET() {
  try {
    const realCount = await db.hotel.count({
      where: { isTemplate: false },
    });

    const hotels = await db.hotel.findMany({
      where: {
        isTemplate: realCount > 0 ? false : true,
      },
    });

    const parsed = hotels.map(formatAdminHotel);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hotels" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const hotel = await db.hotel.create({
      data: { ...buildHotelCreateData(body), isTemplate: false },
    });

    if (
      Array.isArray(body._pendingRoomTypes) &&
      body._pendingRoomTypes.length > 0
    ) {
      await batchCreateRoomTypes(hotel.id, body._pendingRoomTypes);
      await syncHotelRoomsCache(hotel.id);
    }

    if (hotel.resellerId) {
      await syncResellerCatalogEntry(hotel.resellerId, "hotel", hotel.id);
    }

    return NextResponse.json(
      { success: true, data: formatAdminHotel(hotel) },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating hotel:", error);
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { success: false, error: "Ya existe un hotel con ese slug" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create hotel",
      },
      { status: 500 },
    );
  }
}

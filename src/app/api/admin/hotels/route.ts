import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  buildHotelCreateData,
  formatAdminHotel,
  isUniqueConstraintError,
} from "@/lib/admin/hotels";
import { syncResellerCatalogEntry } from "@/lib/reseller/catalog";
import { getAdminSession } from "@/lib/admin/auth-helpers";
import { createHotelSchema } from "@/lib/validators/hotels";

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

export async function GET(request: NextRequest) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const realCount = await db.hotel.count({
      where: { isTemplate: false },
    });

    const hotels = await db.hotel.findMany({
      where: {
        isTemplate: realCount > 0 ? false : true,
      },
      include: { roomTypes: true },
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
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await request.json();

    const parsed = createHotelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Use a transaction so hotel + rooms are created atomically.
    // If room creation fails, the hotel is rolled back — no orphaned rows.
    const hotel = await db.$transaction(async (tx) => {
      const created = await tx.hotel.create({
        data: { ...buildHotelCreateData(parsed.data), isTemplate: false },
      });

      const pendingRoomTypes = parsed.data._pendingRoomTypes;
      if (pendingRoomTypes && pendingRoomTypes.length > 0) {
        for (const rt of pendingRoomTypes) {
          const roomImage = rt.roomImage || (rt.roomImages && rt.roomImages[0]) || "";
          await tx.roomType.create({
            data: {
              hotelId: created.id,
              name: rt.name || "Habitación Estándar",
              maxGuests: rt.maxGuests ?? 2,
              beds: rt.beds || "1 cama doble",
              basePrice: rt.basePrice ?? 0,
              originalPrice: rt.originalPrice ?? 0,
              includes: JSON.stringify(rt.includes || []),
              roomImage,
              roomImages: JSON.stringify(rt.roomImages || []),
              active: rt.active ?? true,
            },
          });
        }
      }

      return created;
    });

    // Fetch the hotel with roomTypes for the response
    const hotelWithRooms = await db.hotel.findUnique({
      where: { id: hotel.id },
      include: { roomTypes: true },
    });

    if (hotel.resellerId) {
      await syncResellerCatalogEntry(hotel.resellerId, "hotel", hotel.id);
    }

    return NextResponse.json(
      { success: true, data: formatAdminHotel(hotelWithRooms!) },
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

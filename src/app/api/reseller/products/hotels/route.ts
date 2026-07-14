import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  buildHotelCreateData,
  formatAdminHotel,
  generateHotelSlug,
  isUniqueConstraintError,
} from "@/lib/admin/hotels";
import {
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from "@/lib/panel-auth";

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

async function requireResellerSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(
    getPanelSessionCookieName("reseller"),
  )?.value;
  return verifyPanelSessionToken(sessionValue, "reseller");
}

export async function GET() {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 },
      );
    }

    const hotels = await db.hotel.findMany({
      where: { resellerId: session.id },
      include: { roomTypes: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: hotels.map(formatAdminHotel),
    });
  } catch (error) {
    console.error("Error fetching reseller hotels:", error);
    return NextResponse.json(
      { success: false, error: "No se pudieron cargar los hoteles" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const relatedDestinationId =
      typeof body.destinationId === "string" && body.destinationId.trim()
        ? body.destinationId.trim()
        : null;

    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim().length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "El nombre es obligatorio" },
        { status: 400 },
      );
    }

    if (!relatedDestinationId) {
      return NextResponse.json(
        { success: false, error: "Debes seleccionar un destino asociado" },
        { status: 400 },
      );
    }

    const destination = await db.destination.findUnique({
      where: { id: relatedDestinationId },
      select: { id: true, name: true },
    });
    if (!destination) {
      return NextResponse.json(
        { success: false, error: "El destino seleccionado no existe" },
        { status: 400 },
      );
    }

    const baseSlug = generateHotelSlug(body.name.trim());
    let slug = baseSlug;
    let counter = 1;
    while (await db.hotel.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    // Use a transaction so hotel + rooms are created atomically.
    // If room creation fails, the hotel is rolled back — no orphaned rows.
    const hotel = await db.$transaction(async (tx) => {
      const created = await tx.hotel.create({
        data: {
          ...buildHotelCreateData({
            ...body,
            slug,
            destinationId: relatedDestinationId,
            cityName:
              typeof body.cityName === "string" && body.cityName.trim()
                ? body.cityName
                : destination.name,
            resellerId: session.id,
          }),
          isTemplate: false,
          publishStatus: 'pending_review',
        },
      });

      if (
        Array.isArray(body._pendingRoomTypes) &&
        body._pendingRoomTypes.length > 0
      ) {
        for (const rt of body._pendingRoomTypes) {
          const roomImages = Array.isArray(rt.roomImages) ? rt.roomImages : [];
          const roomImage = (typeof rt.roomImage === "string" && rt.roomImage) || roomImages[0] || "";
          await tx.roomType.create({
            data: {
              hotelId: created.id,
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

      return created;
    });

    // Fetch the hotel with roomTypes for the response
    const hotelWithRooms = await db.hotel.findUnique({
      where: { id: hotel.id },
      include: { roomTypes: true },
    });

    return NextResponse.json(
      { success: true, data: formatAdminHotel(hotelWithRooms!) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating reseller hotel:", error);
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
          error instanceof Error ? error.message : "No se pudo crear el hotel",
      },
      { status: 500 },
    );
  }
}

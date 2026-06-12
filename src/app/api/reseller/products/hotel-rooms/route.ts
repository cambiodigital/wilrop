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

export async function GET(request: NextRequest) {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get("hotelId");
    if (!hotelId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const rooms = await db.roomType.findMany({
      where: { hotelId, hotel: { resellerId: session.id } },
      orderBy: { createdAt: "desc" },
      include: { hotel: { select: { id: true, name: true, cityName: true } } },
    });

    return NextResponse.json({ success: true, data: rooms.map(formatRoom) });
  } catch (error) {
    console.error("Error fetching reseller rooms:", error);
    return NextResponse.json(
      { success: false, error: "No se pudieron cargar las habitaciones" },
      { status: 500 },
    );
  }
}

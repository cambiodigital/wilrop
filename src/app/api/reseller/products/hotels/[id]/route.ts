import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  buildHotelUpdateData,
  formatAdminHotel,
  isUniqueConstraintError,
} from "@/lib/admin/hotels";
import {
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from "@/lib/panel-auth";

async function requireResellerSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(
    getPanelSessionCookieName("reseller"),
  )?.value;
  return verifyPanelSessionToken(sessionValue, "reseller");
}

export async function GET(
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
    const hotel = await db.hotel.findFirst({
      where: { id, resellerId: session.id },
    });
    if (!hotel) {
      return NextResponse.json(
        { success: false, error: "Hotel no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: formatAdminHotel(hotel) });
  } catch (error) {
    console.error("Error fetching reseller hotel:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo cargar el hotel" },
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
    const existing = await db.hotel.findFirst({
      where: { id, resellerId: session.id },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Hotel no encontrado o no pertenece a tu cuenta",
        },
        { status: 404 },
      );
    }

    const body = await request.json();
    if (body.destinationId !== undefined) {
      const relatedDestinationId =
        typeof body.destinationId === "string" && body.destinationId.trim()
          ? body.destinationId.trim()
          : null;
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
      body.cityName =
        typeof body.cityName === "string" && body.cityName.trim()
          ? body.cityName
          : destination.name;
    }

    const hotel = await db.hotel.update({
      where: { id },
      data: {
        ...buildHotelUpdateData({ ...body, resellerId: session.id }),
        ...(existing.publishStatus === 'rejected' ? { publishStatus: 'pending_review' } : {}),
      },
    });

    return NextResponse.json({ success: true, data: formatAdminHotel(hotel) });
  } catch (error) {
    console.error("Error updating reseller hotel:", error);
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
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el hotel",
      },
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
    const existing = await db.hotel.findFirst({
      where: { id, resellerId: session.id },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Hotel no encontrado o no pertenece a tu cuenta",
        },
        { status: 404 },
      );
    }

    await db.hotel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reseller hotel:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo eliminar el hotel" },
      { status: 500 },
    );
  }
}

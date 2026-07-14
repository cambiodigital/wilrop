import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  buildHotelUpdateData,
  formatAdminHotel,
  isUniqueConstraintError,
} from "@/lib/admin/hotels";
import { handleResellerCatalogSync } from "@/lib/reseller/catalog";
import { getAdminSession } from "@/lib/admin/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;

    const hotel = await db.hotel.findUnique({
      where: { id },
      include: { roomTypes: true },
    });

    if (!hotel) {
      return NextResponse.json(
        { success: false, error: "Hotel not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: formatAdminHotel(hotel) });
  } catch (error: any) {
    console.error("Error fetching hotel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hotel" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.hotel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Hotel not found" },
        { status: 404 },
      );
    }

    const hotel = await db.hotel.update({
      where: { id },
      data: buildHotelUpdateData(body),
      include: { roomTypes: true },
    });

    if (body.resellerId !== undefined) {
      await handleResellerCatalogSync(
        existing.resellerId,
        body.resellerId,
        "hotel",
        id,
      );
    }

    return NextResponse.json({ success: true, data: formatAdminHotel(hotel) });
  } catch (error: any) {
    console.error("Error updating hotel:", error);
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
          error instanceof Error ? error.message : "Failed to update hotel",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;

    const existing = await db.hotel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Hotel not found" },
        { status: 404 },
      );
    }

    await db.hotel.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting hotel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete hotel" },
      { status: 500 },
    );
  }
}

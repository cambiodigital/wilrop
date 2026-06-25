import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from "@/lib/panel-auth";
import { safeJsonParse } from "@/lib/json";

function formatTransport(transport: any) {
  return {
    ...transport,
    includes: safeJsonParse<string[]>(transport.includes, []),
  };
}

async function requireResellerSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(
    getPanelSessionCookieName("reseller"),
  )?.value;
  const session = verifyPanelSessionToken(sessionValue, "reseller");
  if (!session) return null;
  return session;
}

function toPrice(value: unknown): number {
  return typeof value === "number" ? Math.round(value) : 0;
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
    const transport = await db.transportService.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!transport) {
      return NextResponse.json(
        { success: false, error: "Transporte no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: formatTransport(transport),
    });
  } catch (error: any) {
    console.error("Error fetching reseller transport:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo cargar el transporte" },
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
    const existing = await db.transportService.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Transporte no encontrado o no pertenece a tu cuenta",
        },
        { status: 404 },
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "El nombre es obligatorio" },
          { status: 400 },
        );
      }
      updates.name = body.name.trim();
    }

    if (body.providerId !== undefined) {
      if (
        typeof body.providerId !== "string" ||
        body.providerId.trim().length === 0
      ) {
        return NextResponse.json(
          { success: false, error: "El proveedor es obligatorio" },
          { status: 400 },
        );
      }

      const normalizedProviderId = body.providerId.trim();
      const provider = await db.transportProvider.findUnique({
        where: { id: normalizedProviderId },
        select: { id: true, active: true },
      });

      if (!provider || !provider.active) {
        return NextResponse.json(
          {
            success: false,
            error: "El proveedor seleccionado no existe o está inactivo",
          },
          { status: 400 },
        );
      }

      updates.providerId = normalizedProviderId;
    }

    if (body.origin !== undefined) updates.origin = body.origin;
    if (body.destination !== undefined) updates.destination = body.destination;
    if (body.cityId !== undefined) updates.cityId = body.cityId;
    if (body.cityName !== undefined) updates.cityName = body.cityName;
    if (body.notes !== undefined) updates.notes = body.notes;

    if (body.durationMins !== undefined) {
      updates.durationMins =
        typeof body.durationMins === "number"
          ? Math.round(body.durationMins)
          : 0;
    }

    if (body.includes !== undefined) {
      updates.includes = JSON.stringify(
        Array.isArray(body.includes) ? body.includes : [],
      );
    }

    if (body.basePrice !== undefined) {
      if (typeof body.basePrice !== "number" || body.basePrice < 0) {
        return NextResponse.json(
          {
            success: false,
            error: "El precio base debe ser un número no negativo",
          },
          { status: 400 },
        );
      }
      updates.basePrice = toPrice(body.basePrice);
    }

    if (body.pricePerExtra !== undefined) {
      if (typeof body.pricePerExtra !== "number" || body.pricePerExtra < 0) {
        return NextResponse.json(
          {
            success: false,
            error: "El precio por extra debe ser un número no negativo",
          },
          { status: 400 },
        );
      }
      updates.pricePerExtra = toPrice(body.pricePerExtra);
    }

    if (body.active !== undefined) {
      updates.active =
        typeof body.active === "boolean" ? body.active : existing.active;
    }

    if (existing.publishStatus === "rejected") {
      updates.publishStatus = "pending_review";
    }

    const transport = await db.transportService.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      data: formatTransport(transport),
    });
  } catch (error: any) {
    console.error("Error updating reseller transport:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo actualizar el transporte" },
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
    const existing = await db.transportService.findFirst({
      where: { id, resellerId: session.id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Transporte no encontrado o no pertenece a tu cuenta",
        },
        { status: 404 },
      );
    }

    await db.transportService.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting reseller transport:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo eliminar el transporte" },
      { status: 500 },
    );
  }
}

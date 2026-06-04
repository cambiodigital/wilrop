import { safeJsonParse } from "@/lib/json";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleResellerCatalogSync } from "@/lib/reseller/catalog";

function formatExcursion(excursion: any) {
  return {
    ...excursion,
    images: safeJsonParse<string[]>(excursion.images, []),
    includes: safeJsonParse<string[]>(excursion.includes, []),
    excludes: safeJsonParse<string[]>(excursion.excludes, []),
    requirements: safeJsonParse<string[]>(excursion.requirements, []),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const excursion = await db.excursion.findUnique({
      where: { id },
    });

    if (!excursion) {
      return NextResponse.json(
        { success: false, error: "Excursion not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: formatExcursion(excursion),
    });
  } catch (error: any) {
    console.error("Error fetching excursion:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch excursion" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.excursion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Excursion not found" },
        { status: 404 },
      );
    }

    const updates: any = {};

    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.name !== undefined) updates.name = body.name;
    if (body.destinationId !== undefined)
      updates.destinationId = body.destinationId;
    if (body.destinationName !== undefined)
      updates.destinationName = body.destinationName;
    if (body.cityName !== undefined) updates.cityName = body.cityName;
    if (body.description !== undefined) updates.description = body.description;
    if (body.shortDesc !== undefined) updates.shortDesc = body.shortDesc;
    if (body.images !== undefined) updates.images = JSON.stringify(body.images);
    if (body.duration !== undefined) updates.duration = body.duration;
    if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
    if (body.groupSize !== undefined)
      updates.groupSize = String(body.groupSize);
    if (body.basePrice !== undefined) updates.basePrice = body.basePrice;
    if (body.childPrice !== undefined) updates.childPrice = body.childPrice;
    if (body.includes !== undefined)
      updates.includes = JSON.stringify(body.includes);
    if (body.excludes !== undefined)
      updates.excludes = JSON.stringify(body.excludes);
    if (body.requirements !== undefined)
      updates.requirements = JSON.stringify(body.requirements);
    if (body.category !== undefined) updates.category = body.category;
    if (body.rating !== undefined) updates.rating = body.rating;
    if (body.featured !== undefined) updates.featured = body.featured;
    if (body.active !== undefined) updates.active = body.active;
    if (body.resellerId !== undefined)
      updates.resellerId = body.resellerId || null;

    const excursion = await db.excursion.update({
      where: { id },
      data: updates,
    });

    if (body.resellerId !== undefined) {
      await handleResellerCatalogSync(
        existing.resellerId,
        body.resellerId,
        "excursion",
        id,
      );
    }

    return NextResponse.json({
      success: true,
      data: formatExcursion(excursion),
    });
  } catch (error: any) {
    console.error("Error updating excursion:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update excursion" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.excursion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Excursion not found" },
        { status: 404 },
      );
    }

    await db.excursion.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting excursion:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete excursion" },
      { status: 500 },
    );
  }
}

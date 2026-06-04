import { safeJsonParse } from "@/lib/json";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleResellerCatalogSync } from "@/lib/reseller/catalog";

function formatCruise(cruise: any) {
  return {
    ...cruise,
    images: safeJsonParse<string[]>(cruise.images, []),
    includes: safeJsonParse<string[]>(cruise.includes, []),
    itinerary: safeJsonParse<any[]>(cruise.itinerary, []),
    tags: safeJsonParse<string[]>(cruise.tags, []),
    cabins: cruise.cabins
      ? cruise.cabins.map((cabin: any) => ({
          ...cabin,
          includes: safeJsonParse<string[]>(cabin.includes, []),
        }))
      : [],
    destinations: cruise.destinations
      ? cruise.destinations.map((dc: any) => dc.destinationId)
      : [],
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const cruise = await db.cruise.findUnique({
      where: { id },
      include: {
        cabins: true,
        destinations: true,
      },
    });

    if (!cruise) {
      return NextResponse.json(
        { success: false, error: "Cruise not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: formatCruise(cruise) });
  } catch (error: any) {
    console.error("Error fetching cruise:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cruise" },
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

    const existing = await db.cruise.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Cruise not found" },
        { status: 404 },
      );
    }

    const {
      slug,
      name,
      description,
      shipName,
      operator,
      durationDays,
      images,
      includes,
      itinerary,
      rating,
      reviewCount,
      priceFrom,
      tags,
      featured,
      active,
      primaryDestinationId,
      cabins,
      destinations,
      resellerId,
    } = body;

    const updates: any = {};

    if (slug !== undefined) updates.slug = slug;
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (shipName !== undefined) updates.shipName = shipName;
    if (operator !== undefined) updates.operator = operator;
    if (durationDays !== undefined) updates.durationDays = Number(durationDays);
    if (images !== undefined) updates.images = JSON.stringify(images);
    if (includes !== undefined) updates.includes = JSON.stringify(includes);
    if (itinerary !== undefined) updates.itinerary = JSON.stringify(itinerary);
    if (rating !== undefined) updates.rating = Number(rating);
    if (reviewCount !== undefined) updates.reviewCount = Number(reviewCount);
    if (priceFrom !== undefined) updates.priceFrom = Number(priceFrom);
    if (tags !== undefined) updates.tags = JSON.stringify(tags);
    if (featured !== undefined) updates.featured = featured;
    if (active !== undefined) updates.active = active;
    if (primaryDestinationId !== undefined)
      updates.primaryDestinationId = primaryDestinationId || null;
    if (resellerId !== undefined) updates.resellerId = resellerId || null;

    // Use transaction to update cruise, reset cabins, and reset destination relations
    const updatedCruise = await db.$transaction(async (tx) => {
      // 1. Update basic fields
      const cruise = await tx.cruise.update({
        where: { id },
        data: updates,
      });

      // 2. Handle cabins if provided
      if (cabins !== undefined) {
        // Delete all old cabins
        await tx.cruiseCabin.deleteMany({
          where: { cruiseId: id },
        });

        // Re-create new cabins
        if (Array.isArray(cabins) && cabins.length > 0) {
          await tx.cruiseCabin.createMany({
            data: cabins.map((cabin: any) => ({
              cruiseId: id,
              name: cabin.name,
              capacity: Number(cabin.capacity ?? 2),
              beds: cabin.beds ?? "2 camas individuales",
              basePrice: Number(cabin.basePrice ?? 0),
              originalPrice: Number(cabin.originalPrice ?? 0),
              includes: JSON.stringify(cabin.includes || []),
              cabinImage: cabin.cabinImage ?? "",
              active: cabin.active ?? true,
            })),
          });
        }
      }

      // 3. Handle destinations if provided
      if (destinations !== undefined) {
        // Delete all old destination associations
        await tx.destinationCruise.deleteMany({
          where: { cruiseId: id },
        });

        // Re-create new destination associations
        if (Array.isArray(destinations) && destinations.length > 0) {
          await tx.destinationCruise.createMany({
            data: destinations.map((destinationId: string) => ({
              cruiseId: id,
              destinationId,
              active: true,
            })),
          });
        }
      }

      // Fetch the fully updated cruise to return
      return await tx.cruise.findUnique({
        where: { id },
        include: {
          cabins: true,
          destinations: true,
        },
      });
    });

    if (resellerId !== undefined) {
      await handleResellerCatalogSync(
        existing.resellerId,
        resellerId,
        "cruise",
        id,
      );
    }

    return NextResponse.json({
      success: true,
      data: formatCruise(updatedCruise),
    });
  } catch (error: any) {
    console.error("Error updating cruise:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update cruise",
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
    const { id } = await params;

    const existing = await db.cruise.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Cruise not found" },
        { status: 404 },
      );
    }

    await db.cruise.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting cruise:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete cruise" },
      { status: 500 },
    );
  }
}

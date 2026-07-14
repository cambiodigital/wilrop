import { safeJsonParse } from "@/lib/json";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncResellerCatalogEntry } from "@/lib/reseller/catalog";
import { getAdminSession } from "@/lib/admin/auth-helpers";

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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const realCount = await db.cruise.count({
      where: { isTemplate: false },
    });

    const cruises = await db.cruise.findMany({
      where: {
        isTemplate: realCount > 0 ? false : true,
      },
      include: {
        cabins: true,
        destinations: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = cruises.map(formatCruise);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error fetching cruises:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cruises" },
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

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 },
      );
    }

    const finalSlug = slug || generateSlug(name);

    // Check if slug is already taken
    const existing = await db.cruise.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Ya existe un crucero con ese slug" },
        { status: 409 },
      );
    }

    const cruise = await db.cruise.create({
      data: {
        slug: finalSlug,
        name,
        description: description ?? "",
        shipName: shipName ?? "",
        operator: operator ?? "",
        durationDays: Number(durationDays ?? 3),
        images: JSON.stringify(images || []),
        includes: JSON.stringify(includes || []),
        itinerary: JSON.stringify(itinerary || []),
        rating: Number(rating ?? 0),
        reviewCount: Number(reviewCount ?? 0),
        priceFrom: Number(priceFrom ?? 0),
        tags: JSON.stringify(tags || []),
        featured: featured ?? false,
        active: active ?? true,
        isTemplate: false,
        primaryDestinationId: primaryDestinationId || null,
        resellerId: resellerId || null,
        cabins: {
          create: (cabins || []).map((cabin: any) => ({
            name: cabin.name,
            capacity: Number(cabin.capacity ?? 2),
            beds: cabin.beds ?? "2 camas individuales",
            basePrice: Number(cabin.basePrice ?? 0),
            originalPrice: Number(cabin.originalPrice ?? 0),
            includes: JSON.stringify(cabin.includes || []),
            cabinImage: cabin.cabinImage ?? "",
            active: cabin.active ?? true,
          })),
        },
        destinations: {
          create: (destinations || []).map((destinationId: string) => ({
            destinationId,
            active: true,
          })),
        },
      },
      include: {
        cabins: true,
        destinations: true,
      },
    });

    if (resellerId) {
      await syncResellerCatalogEntry(resellerId, "cruise", cruise.id);
    }

    return NextResponse.json(
      { success: true, data: formatCruise(cruise) },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating cruise:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create cruise",
      },
      { status: 500 },
    );
  }
}

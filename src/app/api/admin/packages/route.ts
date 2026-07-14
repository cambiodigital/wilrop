import { safeJsonParse } from "@/lib/json";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncResellerCatalogEntry } from "@/lib/reseller/catalog";
import { getAdminSession } from "@/lib/admin/auth-helpers";
import { createPackageSchema } from "@/lib/validators/packages";

function formatPackage(pkg: any) {
  return {
    ...pkg,
    includes: safeJsonParse<string[]>(pkg.includes, []),
    departureDates: safeJsonParse<string[]>(pkg.departureDates, []),
  };
}

function generateSlug(title: string): string {
  return title
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
    const realCount = await db.travelPackage.count({
      where: { isTemplate: false },
    });

    const packages = await db.travelPackage.findMany({
      where: {
        isTemplate: realCount > 0 ? false : true,
      },
    });

    const parsed = packages.map(formatPackage);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch packages" },
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

    const parsed = createPackageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const {
      slug,
      destinationId,
      destinationName,
      title,
      description,
      duration,
      price,
      originalPrice,
      includes,
      image,
      difficulty,
      groupSize,
      departureDates,
      rating,
      soldOut,
      category,
      commission,
      active,
      resellerId,
    } = parsed.data;

    const finalSlug = slug || generateSlug(title);

    const pkg = await db.travelPackage.create({
      data: {
        slug: finalSlug,
        destinationId,
        destinationName,
        title,
        description: description ?? "",
        duration,
        price,
        originalPrice: originalPrice ?? null,
        includes: JSON.stringify(includes || []),
        image: image ?? "",
        difficulty: difficulty ?? "Fácil",
        groupSize: groupSize ?? "",
        departureDates: JSON.stringify(departureDates || []),
        rating: rating ?? 0,
        soldOut: soldOut ?? false,
        category: category ?? "Cultural",
        commission: commission ?? 10,
        active: active ?? true,
        isTemplate: false,
        resellerId: resellerId || null,
      },
    });

    if (resellerId) {
      await syncResellerCatalogEntry(resellerId, "package", pkg.id);
    }

    return NextResponse.json(
      { success: true, data: formatPackage(pkg) },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create package" },
      { status: 500 },
    );
  }
}

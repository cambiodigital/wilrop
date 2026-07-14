import { safeJsonParse } from "@/lib/json";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncResellerCatalogEntry } from "@/lib/reseller/catalog";
import { getAdminSession } from "@/lib/admin/auth-helpers";
import { createExcursionSchema } from "@/lib/validators/excursions";

function formatExcursion(excursion: any) {
  return {
    ...excursion,
    images: safeJsonParse<string[]>(excursion.images, []),
    includes: safeJsonParse<string[]>(excursion.includes, []),
    excludes: safeJsonParse<string[]>(excursion.excludes, []),
    requirements: safeJsonParse<string[]>(excursion.requirements, []),
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
    const realCount = await db.excursion.count({
      where: { isTemplate: false },
    });

    const excursions = await db.excursion.findMany({
      where: {
        isTemplate: realCount > 0 ? false : true,
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = excursions.map(formatExcursion);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error fetching excursions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch excursions" },
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

    const parsed = createExcursionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const {
      slug,
      name,
      destinationId,
      destinationName,
      cityName,
      description,
      shortDesc,
      images,
      duration,
      difficulty,
      groupSize,
      basePrice,
      childPrice,
      includes,
      excludes,
      requirements,
      category,
      rating,
      featured,
      active,
      resellerId,
    } = parsed.data;

    const finalSlug = slug || generateSlug(name);

    const excursion = await db.excursion.create({
      data: {
        slug: finalSlug,
        name,
        destinationId: destinationId ?? "",
        destinationName: destinationName ?? "",
        cityName: cityName ?? "",
        description: description ?? "",
        shortDesc: shortDesc ?? "",
        images: JSON.stringify(images || []),
        duration: duration ?? "3 horas",
        difficulty: difficulty ?? "Fácil",
        groupSize: String(groupSize ?? "20 personas"),
        basePrice: basePrice ?? 0,
        childPrice: childPrice ?? 0,
        includes: JSON.stringify(includes || []),
        excludes: JSON.stringify(excludes || []),
        requirements: JSON.stringify(requirements || []),
        category: category ?? "Cultural",
        rating: rating ?? 0,
        featured: featured ?? false,
        active: active ?? true,
        isTemplate: false,
        resellerId: resellerId || null,
      },
    });

    if (resellerId) {
      await syncResellerCatalogEntry(resellerId, "excursion", excursion.id);
    }

    return NextResponse.json(
      { success: true, data: formatExcursion(excursion) },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating excursion:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create excursion" },
      { status: 500 },
    );
  }
}

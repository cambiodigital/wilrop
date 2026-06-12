import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from "@/lib/panel-auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get(
      getPanelSessionCookieName("reseller"),
    )?.value;
    const session = verifyPanelSessionToken(sessionValue, "reseller");

    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 },
      );
    }

    const providers = await db.transportProvider.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({ success: true, data: providers });
  } catch (error: any) {
    console.error("Error fetching reseller transport providers:", error);
    return NextResponse.json(
      { success: false, error: "No se pudieron cargar los proveedores" },
      { status: 500 },
    );
  }
}

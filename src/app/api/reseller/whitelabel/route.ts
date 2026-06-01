import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from '@/lib/panel-auth';
import { db } from '@/lib/db';

/**
 * GET /api/reseller/whitelabel
 * Returns the reseller's white-label configuration.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get(
      getPanelSessionCookieName('reseller'),
    )?.value;
    const session = verifyPanelSessionToken(sessionValue, 'reseller');

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 },
      );
    }

    const reseller = await db.reseller.findUnique({
      where: { id: session.id },
      select: {
        whiteLabelConfig: true,
        logoUrl: true,
        companyName: true,
        whiteLabelEnabled: true,
        customDomain: true,
        subdomain: true,
      },
    });

    if (!reseller) {
      return NextResponse.json(
        { success: false, error: 'Revendedor no encontrado' },
        { status: 404 },
      );
    }

    let config: Record<string, unknown> = {};
    try {
      config = JSON.parse(reseller.whiteLabelConfig || '{}');
    } catch {
      config = {};
    }

    // Merge DB-level fields into the config response
    return NextResponse.json({
      success: true,
      data: {
        ...config,
        logoUrl: reseller.logoUrl || config.logoUrl || null,
        storeName: reseller.companyName || config.storeName || '',
        whiteLabelEnabled: reseller.whiteLabelEnabled,
        customDomain: reseller.customDomain,
        subdomain: reseller.subdomain,
      },
    });
  } catch (error) {
    console.error('[WhiteLabel] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar la configuración' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/reseller/whitelabel
 * Saves the reseller's white-label configuration.
 */
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get(
      getPanelSessionCookieName('reseller'),
    )?.value;
    const session = verifyPanelSessionToken(sessionValue, 'reseller');

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Extract fields that live on the Reseller model directly
    const { logoUrl, storeName, ...configFields } = body;

    // Build the JSON config blob (everything except logoUrl/storeName)
    const configJson = JSON.stringify(configFields);

    await db.reseller.update({
      where: { id: session.id },
      data: {
        whiteLabelConfig: configJson,
        ...(logoUrl !== undefined ? { logoUrl: logoUrl || '' } : {}),
        ...(storeName !== undefined ? { companyName: storeName || '' } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[WhiteLabel] PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar la configuración' },
      { status: 500 },
    );
  }
}

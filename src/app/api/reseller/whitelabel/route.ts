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
    const { logoUrl, storeName, subdomain, ...configFields } = body;

    // Normalize subdomain: lowercase, strip non-slug chars
    const normalizedSubdomain = typeof subdomain === 'string'
      ? subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')
      : undefined;

    // Validate: subdomain must not be empty after normalization
    if (!normalizedSubdomain) {
      return NextResponse.json(
        { success: false, error: 'El subdominio es obligatorio y solo puede contener letras minúsculas, números y guiones.' },
        { status: 400 },
      );
    }

    // Build the JSON config blob — storeName and logoUrl are also stored
    // inside the blob so the white-label config is self-contained.
    const fullConfig = {
      ...configFields,
      ...(storeName !== undefined ? { storeName } : {}),
      ...(logoUrl !== undefined ? { logoUrl } : {}),
      subdomain: normalizedSubdomain,
    };
    const configJson = JSON.stringify(fullConfig);

    const updated = await db.reseller.update({
      where: { id: session.id },
      data: {
        whiteLabelConfig: configJson,
        ...(logoUrl !== undefined ? { logoUrl: logoUrl || '' } : {}),
        ...(storeName !== undefined ? { companyName: storeName || '' } : {}),
        subdomain: normalizedSubdomain,
      },
    });

    return NextResponse.json({ success: true, subdomain: updated.subdomain });
  } catch (error) {
    console.error('[WhiteLabel] PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar la configuración' },
      { status: 500 },
    );
  }
}

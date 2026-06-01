import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth';
import { safeJsonParse } from '@/lib/json';

function formatTransport(transport: any) {
  return {
    ...transport,
    includes: safeJsonParse<string[]>(transport.includes, []),
  };
}

function toPrice(value: unknown): number {
  return typeof value === 'number' ? Math.round(value) : 0;
}

async function requireResellerSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value;
  const session = verifyPanelSessionToken(sessionValue, 'reseller');
  if (!session) return null;
  return session;
}

export async function GET() {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const transports = await db.transportService.findMany({
      where: { resellerId: session.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: transports.map(formatTransport) });
  } catch (error: any) {
    console.error('Error fetching reseller transports:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los transportes' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireResellerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const {
      providerId,
      name,
      origin,
      destination,
      cityId,
      cityName,
      durationMins,
      basePrice,
      pricePerExtra,
      includes,
      notes,
      active,
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'El nombre es obligatorio' },
        { status: 400 },
      );
    }

    if (!providerId || typeof providerId !== 'string' || providerId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'El proveedor es obligatorio' },
        { status: 400 },
      );
    }

    if (basePrice !== undefined && (typeof basePrice !== 'number' || basePrice < 0)) {
      return NextResponse.json(
        { success: false, error: 'El precio base debe ser un número no negativo' },
        { status: 400 },
      );
    }

    if (pricePerExtra !== undefined && (typeof pricePerExtra !== 'number' || pricePerExtra < 0)) {
      return NextResponse.json(
        { success: false, error: 'El precio por extra debe ser un número no negativo' },
        { status: 400 },
      );
    }

    const transport = await db.transportService.create({
      data: {
        providerId: providerId.trim(),
        name: name.trim(),
        origin: origin ?? '',
        destination: destination ?? '',
        cityId: cityId ?? '',
        cityName: cityName ?? '',
        durationMins: typeof durationMins === 'number' ? Math.round(durationMins) : 0,
        basePrice: toPrice(basePrice),
        pricePerExtra: toPrice(pricePerExtra),
        includes: JSON.stringify(Array.isArray(includes) ? includes : []),
        notes: notes ?? '',
        active: typeof active === 'boolean' ? active : false,
        isTemplate: false,
        resellerId: session.id,
      },
    });

    return NextResponse.json(
      { success: true, data: formatTransport(transport) },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating reseller transport:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo crear el transporte' },
      { status: 500 },
    );
  }
}

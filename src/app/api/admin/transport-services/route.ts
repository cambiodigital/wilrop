import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatTransportService(service: any) {
  return {
    ...service,
    includes: safeJsonParse<string[]>(service.includes, []),
  };
}

export async function GET() {
  try {
    const services = await db.transportService.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        provider: {
          select: { id: true, name: true, vehicleType: true, capacity: true },
        },
      },
    });

    const parsed = services.map(formatTransportService);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching transport services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transport services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      providerId,
      name,
      routeType,
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

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const provider = await db.transportProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Transport provider not found' },
        { status: 404 }
      );
    }

    const service = await db.transportService.create({
      data: {
        providerId,
        name: name ?? '',
        routeType: routeType ?? 'aeropuerto-hotel',
        origin: origin ?? '',
        destination: destination ?? '',
        cityId: cityId ?? '',
        cityName: cityName ?? '',
        durationMins: durationMins ?? 60,
        basePrice: basePrice ?? 0,
        pricePerExtra: pricePerExtra ?? 0,
        includes: JSON.stringify(includes || []),
        notes: notes ?? '',
        active: active ?? true,
      },
      include: {
        provider: {
          select: { id: true, name: true, vehicleType: true, capacity: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: formatTransportService(service) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating transport service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create transport service' },
      { status: 500 }
    );
  }
}

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId');

    const where: any = { active: true };

    if (cityId) {
      where.cityId = cityId;
    }

    const services = await db.transportService.findMany({
      where,
      orderBy: { basePrice: 'asc' },
      include: {
        provider: {
          select: { id: true, name: true, vehicleType: true, capacity: true },
        },
      },
    });

    const parsed = services.map(formatTransportService);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: unknown) {
    console.error('Error fetching public transport services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transport services' },
      { status: 500 }
    );
  }
}

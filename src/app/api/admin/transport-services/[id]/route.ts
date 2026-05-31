import { safeJsonParse } from '@/lib/json'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';


function formatTransportService(service: any) {
  return {
    ...service,
    includes: safeJsonParse<string[]>(service.includes, []),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await db.transportService.findUnique({
      where: { id },
      include: {
        provider: {
          select: { id: true, name: true, vehicleType: true, capacity: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Transport service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: formatTransportService(service) });
  } catch (error: any) {
    console.error('Error fetching transport service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transport service' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.transportService.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Transport service not found' },
        { status: 404 }
      );
    }

    const updates: any = {};

    if (body.providerId !== undefined) updates.providerId = body.providerId;
    if (body.name !== undefined) updates.name = body.name;
    if (body.routeType !== undefined) updates.routeType = body.routeType;
    if (body.origin !== undefined) updates.origin = body.origin;
    if (body.destination !== undefined) updates.destination = body.destination;
    if (body.cityId !== undefined) updates.cityId = body.cityId;
    if (body.cityName !== undefined) updates.cityName = body.cityName;
    if (body.durationMins !== undefined) updates.durationMins = body.durationMins;
    if (body.basePrice !== undefined) updates.basePrice = body.basePrice;
    if (body.pricePerExtra !== undefined) updates.pricePerExtra = body.pricePerExtra;
    if (body.includes !== undefined) updates.includes = JSON.stringify(body.includes);
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.active !== undefined) updates.active = body.active;

    const service = await db.transportService.update({
      where: { id },
      data: updates,
      include: {
        provider: {
          select: { id: true, name: true, vehicleType: true, capacity: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: formatTransportService(service) });
  } catch (error: any) {
    console.error('Error updating transport service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update transport service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.transportService.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Transport service not found' },
        { status: 404 }
      );
    }

    await db.transportService.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting transport service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete transport service' },
      { status: 500 }
    );
  }
}

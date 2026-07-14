import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const dest = await db.destination.findUnique({ where: { id }, select: { id: true } });

    if (!dest) {
      return NextResponse.json({ success: false, error: 'Destination not found' }, { status: 404 });
    }

    const [packages, hotels, excursions, transportServices] = await Promise.all([
      db.destinationPackage.findMany({ where: { destinationId: id }, orderBy: { sortOrder: 'asc' } }),
      db.destinationHotel.findMany({ where: { destinationId: id }, orderBy: { sortOrder: 'asc' } }),
      db.destinationExcursion.findMany({ where: { destinationId: id }, orderBy: { sortOrder: 'asc' } }),
      db.destinationTransportService.findMany({ where: { destinationId: id }, orderBy: { sortOrder: 'asc' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        packages,
        hotels,
        excursions,
        transportServices,
      },
    });
  } catch (error: any) {
    console.error('Error fetching destination relations:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch destination relations' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();

    const dest = await db.destination.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!dest) {
      return NextResponse.json({ success: false, error: 'Destination not found' }, { status: 404 });
    }

    const packageIds = Array.isArray(body.packageIds) ? body.packageIds : [];
    const hotelIds = Array.isArray(body.hotelIds) ? body.hotelIds : [];
    const excursionIds = Array.isArray(body.excursionIds) ? body.excursionIds : [];
    const transportServiceIds = Array.isArray(body.transportServiceIds) ? body.transportServiceIds : [];

    const relations = await db.$transaction(async (tx) => {
      // 1. Delete existing relations
      await Promise.all([
        tx.destinationPackage.deleteMany({ where: { destinationId: id } }),
        tx.destinationHotel.deleteMany({ where: { destinationId: id } }),
        tx.destinationExcursion.deleteMany({ where: { destinationId: id } }),
        tx.destinationTransportService.deleteMany({ where: { destinationId: id } }),
      ]);

      // 2. Create new relations
      await Promise.all([
        packageIds.length
          ? tx.destinationPackage.createMany({
              data: packageIds.map((packageId, sortOrder) => ({
                destinationId: id,
                packageId,
                sortOrder,
                active: true,
              })),
              skipDuplicates: true,
            })
          : Promise.resolve(),
        hotelIds.length
          ? tx.destinationHotel.createMany({
              data: hotelIds.map((hotelId, sortOrder) => ({
                destinationId: id,
                hotelId,
                sortOrder,
                active: true,
              })),
              skipDuplicates: true,
            })
          : Promise.resolve(),
        excursionIds.length
          ? tx.destinationExcursion.createMany({
              data: excursionIds.map((excursionId, sortOrder) => ({
                destinationId: id,
                excursionId,
                sortOrder,
                active: true,
              })),
              skipDuplicates: true,
            })
          : Promise.resolve(),
        transportServiceIds.length
          ? tx.destinationTransportService.createMany({
              data: transportServiceIds.map((transportServiceId, sortOrder) => ({
                destinationId: id,
                transportServiceId,
                sortOrder,
                active: true,
              })),
              skipDuplicates: true,
            })
          : Promise.resolve(),
      ]);

      // Return updated relations
      const [packages, hotels, excursions, transportServices] = await Promise.all([
        tx.destinationPackage.findMany({ where: { destinationId: id }, orderBy: { sortOrder: 'asc' } }),
        tx.destinationHotel.findMany({ where: { destinationId: id }, orderBy: { sortOrder: 'asc' } }),
        tx.destinationExcursion.findMany({ where: { destinationId: id }, orderBy: { sortOrder: 'asc' } }),
        tx.destinationTransportService.findMany({ where: { destinationId: id }, orderBy: { sortOrder: 'asc' } }),
      ]);

      return {
        packages,
        hotels,
        excursions,
        transportServices,
      };
    });

    return NextResponse.json({ success: true, data: relations });
  } catch (error: any) {
    console.error('Error updating destination relations:', error);
    return NextResponse.json({ success: false, error: 'Failed to update destination relations' }, { status: 500 });
  }
}

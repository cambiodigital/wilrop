import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  normalizePackageRelationsRequest,
  validateResolvedPackageRelations,
} from '@/lib/admin/package-relations';

async function getPackageRelations(packageId: string, client: any = db) {
  const [destinations, hotels, roomTypes, excursions, transportServices] = await Promise.all([
    client.destinationPackage.findMany({ where: { packageId }, orderBy: { sortOrder: 'asc' }, include: { destination: true } }),
    client.packageHotel.findMany({ where: { packageId }, orderBy: { sortOrder: 'asc' }, include: { hotel: true } }),
    client.packageRoomType.findMany({ where: { packageId }, orderBy: { sortOrder: 'asc' }, include: { roomType: true } }),
    client.packageExcursion.findMany({ where: { packageId }, orderBy: { sortOrder: 'asc' }, include: { excursion: true } }),
    client.packageTransportService.findMany({
      where: { packageId },
      orderBy: { sortOrder: 'asc' },
      include: { transportService: true },
    }),
  ]);

  return {
    destinations,
    hotels,
    roomTypes,
    excursions,
    transportServices,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = await db.travelPackage.findUnique({ where: { id }, select: { id: true } });

    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: await getPackageRelations(id) });
  } catch (error: any) {
    console.error('Error fetching package relations:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch package relations' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const requested = normalizePackageRelationsRequest(body);

    const pkg = await db.travelPackage.findUnique({
      where: { id },
      select: { id: true, isTemplate: true },
    });

    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    const [destinations, hotels, roomTypes, excursions, transportServices] = await Promise.all([
      db.destination.findMany({
        where: { id: { in: requested.destinationIds } },
        select: { id: true, isTemplate: true, active: true },
      }),
      db.hotel.findMany({
        where: { id: { in: requested.hotelIds.map((item) => item.id) } },
        select: { id: true, isTemplate: true, active: true },
      }),
      db.roomType.findMany({
        where: { id: { in: requested.roomTypeIds } },
        select: { id: true, hotelId: true, active: true, hotel: { select: { isTemplate: true } } },
      }),
      db.excursion.findMany({
        where: { id: { in: requested.excursionIds } },
        select: { id: true, isTemplate: true, active: true },
      }),
      db.transportService.findMany({
        where: { id: { in: requested.transportServiceIds.map((item) => item.id) } },
        select: { id: true, isTemplate: true, active: true },
      }),
    ]);

    const validation = validateResolvedPackageRelations({
      packageIsTemplate: pkg.isTemplate,
      allowTemplateRelations: requested.allowTemplateRelations,
      destinations,
      hotels,
      roomTypes: roomTypes.map((roomType) => ({
        id: roomType.id,
        hotelId: roomType.hotelId,
        active: roomType.active,
        isTemplate: roomType.hotel.isTemplate,
      })),
      excursions,
      transportServices,
      requested,
    });

    if (!validation.ok) {
      return NextResponse.json({ success: false, error: 'Invalid package relations', errors: validation.errors }, { status: validation.status });
    }

    const relations = await db.$transaction(async (tx) => {
      await Promise.all([
        (tx as any).destinationPackage.deleteMany({ where: { packageId: id } }),
        (tx as any).packageHotel.deleteMany({ where: { packageId: id } }),
        (tx as any).packageRoomType.deleteMany({ where: { packageId: id } }),
        (tx as any).packageExcursion.deleteMany({ where: { packageId: id } }),
        (tx as any).packageTransportService.deleteMany({ where: { packageId: id } }),
      ]);

      await Promise.all([
        requested.destinationIds.length
          ? (tx as any).destinationPackage.createMany({
              data: requested.destinationIds.map((destinationId, sortOrder) => ({ packageId: id, destinationId, sortOrder })),
              skipDuplicates: true,
            })
          : Promise.resolve(),
        requested.hotelIds.length
          ? (tx as any).packageHotel.createMany({
              data: requested.hotelIds.map((hotel, sortOrder) => ({ packageId: id, hotelId: hotel.id, role: hotel.role, sortOrder })),
              skipDuplicates: true,
            })
          : Promise.resolve(),
        requested.roomTypeIds.length
          ? (tx as any).packageRoomType.createMany({
              data: requested.roomTypeIds.map((roomTypeId, sortOrder) => ({ packageId: id, roomTypeId, sortOrder })),
              skipDuplicates: true,
            })
          : Promise.resolve(),
        requested.excursionIds.length
          ? (tx as any).packageExcursion.createMany({
              data: requested.excursionIds.map((excursionId, sortOrder) => ({ packageId: id, excursionId, sortOrder })),
              skipDuplicates: true,
            })
          : Promise.resolve(),
        requested.transportServiceIds.length
          ? (tx as any).packageTransportService.createMany({
              data: requested.transportServiceIds.map((service, sortOrder) => ({
                packageId: id,
                transportServiceId: service.id,
                role: service.role,
                sortOrder,
              })),
              skipDuplicates: true,
            })
          : Promise.resolve(),
      ]);

      return getPackageRelations(id, tx as any);
    });

    return NextResponse.json({ success: true, data: relations });
  } catch (error: any) {
    console.error('Error updating package relations:', error);
    return NextResponse.json({ success: false, error: 'Failed to update package relations' }, { status: 500 });
  }
}

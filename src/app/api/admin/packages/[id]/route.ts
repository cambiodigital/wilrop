import { safeJsonParse } from '@/lib/json'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';


function formatPackage(pkg: any) {
  return {
    ...pkg,
    includes: safeJsonParse<string[]>(pkg.includes, []),
    departureDates: safeJsonParse<string[]>(pkg.departureDates, []),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pkg = await db.travelPackage.findUnique({
      where: { id },
    });

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: formatPackage(pkg) });
  } catch (error: any) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch package' },
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

    const existing = await db.travelPackage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    const updates: any = {};

    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.destinationId !== undefined) updates.destinationId = body.destinationId;
    if (body.destinationName !== undefined) updates.destinationName = body.destinationName;
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.duration !== undefined) updates.duration = body.duration;
    if (body.price !== undefined) updates.price = body.price;
    if (body.originalPrice !== undefined) updates.originalPrice = body.originalPrice;
    if (body.includes !== undefined) updates.includes = JSON.stringify(body.includes);
    if (body.image !== undefined) updates.image = body.image;
    if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
    if (body.groupSize !== undefined) updates.groupSize = body.groupSize;
    if (body.departureDates !== undefined) updates.departureDates = JSON.stringify(body.departureDates);
    if (body.rating !== undefined) updates.rating = body.rating;
    if (body.soldOut !== undefined) updates.soldOut = body.soldOut;
    if (body.category !== undefined) updates.category = body.category;
    if (body.commission !== undefined) updates.commission = body.commission;
    if (body.active !== undefined) updates.active = body.active;
    if (body.resellerId !== undefined) updates.resellerId = body.resellerId || null;

    const pkg = await db.travelPackage.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: formatPackage(pkg) });
  } catch (error: any) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update package' },
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

    const existing = await db.travelPackage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    await db.travelPackage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete package' },
      { status: 500 }
    );
  }
}

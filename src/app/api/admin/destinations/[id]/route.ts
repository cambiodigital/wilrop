import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function parseHighlights(highlights: string): string[] {
  try {
    return JSON.parse(highlights);
  } catch {
    return [];
  }
}

function formatDestination(dest: any) {
  return {
    ...dest,
    highlights: parseHighlights(dest.highlights),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const destination = await db.destination.findUnique({
      where: { id },
    });

    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Destination not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: formatDestination(destination) });
  } catch (error: unknown) {
    console.error('Error fetching destination:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch destination' },
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

    const existing = await db.destination.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Destination not found' },
        { status: 404 }
      );
    }

    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.region !== undefined) updates.region = body.region;
    if (body.description !== undefined) updates.description = body.description;
    if (body.image !== undefined) updates.image = body.image;
    if (body.highlights !== undefined) updates.highlights = JSON.stringify(body.highlights);
    if (body.rating !== undefined) updates.rating = body.rating;
    if (body.reviewCount !== undefined) updates.reviewCount = body.reviewCount;
    if (body.priceFrom !== undefined) updates.priceFrom = body.priceFrom;
    if (body.active !== undefined) updates.active = body.active;
    if (body.order !== undefined) updates.order = body.order;
    if (body.slug !== undefined) updates.slug = body.slug;

    const destination = await db.destination.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: formatDestination(destination) });
  } catch (error: unknown) {
    console.error('Error updating destination:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update destination' },
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

    const existing = await db.destination.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Destination not found' },
        { status: 404 }
      );
    }

    await db.destination.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting destination:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete destination' },
      { status: 500 }
    );
  }
}

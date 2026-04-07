import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatBookingItem(item: any) {
  return {
    ...item,
    addons: safeJsonParse<any[]>(item.addons, []),
  };
}

function formatBooking(booking: any) {
  return {
    ...booking,
    childrenAges: safeJsonParse<number[]>(booking.childrenAges, []),
    items: booking.items ? booking.items.map(formatBookingItem) : [],
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
        subagent: {
          select: {
            id: true,
            code: true,
            agencyName: true,
            contactName: true,
            email: true,
            commission: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: formatBooking(booking) });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
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

    const existing = await db.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const updates: any = {};

    if (body.guestName !== undefined) updates.guestName = body.guestName;
    if (body.guestEmail !== undefined) updates.guestEmail = body.guestEmail;
    if (body.guestPhone !== undefined) updates.guestPhone = body.guestPhone;
    if (body.guestCountry !== undefined) updates.guestCountry = body.guestCountry;
    if (body.adults !== undefined) updates.adults = body.adults;
    if (body.children !== undefined) updates.children = body.children;
    if (body.childrenAges !== undefined) updates.childrenAges = JSON.stringify(body.childrenAges);
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.status !== undefined) updates.status = body.status;
    if (body.totalPrice !== undefined) updates.totalPrice = body.totalPrice;
    if (body.netPrice !== undefined) updates.netPrice = body.netPrice;
    if (body.commissionAmt !== undefined) updates.commissionAmt = body.commissionAmt;
    if (body.checkIn !== undefined) updates.checkIn = body.checkIn;
    if (body.checkOut !== undefined) updates.checkOut = body.checkOut;

    const booking = await db.booking.update({
      where: { id },
      data: updates,
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
        subagent: {
          select: {
            id: true,
            code: true,
            agencyName: true,
            contactName: true,
            email: true,
            commission: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: formatBooking(booking) });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
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

    const existing = await db.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    await db.booking.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}

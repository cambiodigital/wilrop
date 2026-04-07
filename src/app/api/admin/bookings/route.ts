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

export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' },
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

    const parsed = bookings.map(formatBooking);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

import { safeJsonParse } from '@/lib/json'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth';


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

export async function GET(request: NextRequest) {
  try {
    const sessionValue = request.cookies.get(getPanelSessionCookieName('admin'))?.value;
    const session = verifyPanelSessionToken(sessionValue, 'admin');

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookedBy = searchParams.get('bookedBy');
    const status = searchParams.get('status');
    const resellerId = searchParams.get('resellerId');

    const where: Record<string, unknown> = {};
    if (bookedBy) where.bookedBy = bookedBy;
    if (status && status !== 'all') where.status = status;
    if (resellerId) where.resellerId = resellerId;

    const bookings = await db.booking.findMany({
      where,
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
        reseller: {
          select: {
            id: true,
            companyName: true,
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

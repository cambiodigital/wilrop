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

async function generateBookingCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `WIL-${year}-`;

  // Find the latest booking code for this year
  const latestBooking = await db.booking.findFirst({
    where: {
      code: {
        startsWith: prefix,
      },
    },
    orderBy: { code: 'desc' },
    select: { code: true },
  });

  let nextNumber = 1;
  if (latestBooking) {
    const lastCode = latestBooking.code;
    const lastNumber = parseInt(lastCode.replace(prefix, ''), 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(6, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      subagentCode,
      guestName,
      guestEmail,
      guestPhone,
      guestCountry,
      adults,
      children,
      childrenAges,
      notes,
      totalPrice,
      netPrice,
      commissionAmt,
      checkIn,
      checkOut,
      items,
    } = body;

    // Validate required fields
    if (!guestName || !guestEmail || !guestPhone) {
      return NextResponse.json(
        { success: false, error: 'guestName, guestEmail, and guestPhone are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one booking item is required' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.itemType || !item.serviceId) {
        return NextResponse.json(
          { success: false, error: 'Each item must have itemType and serviceId' },
          { status: 400 }
        );
      }
    }

    // Look up subagent if code provided
    let subagentId: string | null = null;
    let bookedBy = 'b2c';

    if (subagentCode) {
      const subagent = await db.subagent.findUnique({
        where: { code: subagentCode },
      });

      if (!subagent) {
        return NextResponse.json(
          { success: false, error: 'Invalid subagent code' },
          { status: 404 }
        );
      }

      if (!subagent.active) {
        return NextResponse.json(
          { success: false, error: 'Subagent account is not active' },
          { status: 403 }
        );
      }

      subagentId = subagent.id;
      bookedBy = 'b2b';
    }

    // Generate booking code
    const code = await generateBookingCode();

    // Create the booking
    const booking = await db.booking.create({
      data: {
        code,
        subagentId,
        guestName,
        guestEmail,
        guestPhone,
        guestCountry: guestCountry ?? '',
        adults: adults ?? 1,
        children: children ?? 0,
        childrenAges: JSON.stringify(childrenAges || []),
        notes: notes ?? '',
        status: 'pending',
        totalPrice: totalPrice ?? 0,
        netPrice: netPrice ?? 0,
        commissionAmt: commissionAmt ?? 0,
        checkIn: checkIn ?? '',
        checkOut: checkOut ?? '',
        bookedBy,
        items: {
          create: items.map((item: any) => ({
            itemType: item.itemType,
            serviceId: item.serviceId,
            serviceName: item.serviceName ?? '',
            roomTypeId: item.roomTypeId ?? '',
            roomName: item.roomName ?? '',
            dateFrom: item.dateFrom ?? '',
            dateTo: item.dateTo ?? '',
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? 0,
            totalPrice: item.totalPrice ?? 0,
            addons: JSON.stringify(item.addons || []),
            status: item.status ?? 'confirmed',
          })),
        },
      },
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

    return NextResponse.json(
      { success: true, data: formatBooking(booking) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

import { safeJsonParse } from '@/lib/json'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateBookingInput } from '@/lib/booking-validation'
import { normalizeBookingItems } from '@/lib/booking-orchestration'
import { validatePriceIntegrity } from '@/lib/booking-pricing'
import { bookingEvents, BOOKING_CREATED } from '@/lib/booking-events'
import { notifyBookingCreated } from '@/lib/booking-notifications'
import { checkRateLimit } from '@/lib/rate-limit'

function formatBookingItem(item: any) {
  return {
    ...item,
    addons: safeJsonParse<any[]>(item.addons, []),
  }
}

function formatBooking(booking: any) {
  return {
    ...booking,
    childrenAges: safeJsonParse<number[]>(booking.childrenAges, []),
    items: booking.items ? booking.items.map(formatBookingItem) : [],
  }
}

async function generateBookingCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `WIL-${year}-`

  const latestBooking = await db.booking.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: 'desc' },
    select: { code: true },
  })

  let nextNumber = 1
  if (latestBooking) {
    const lastCode = latestBooking.code
    const lastNumber = parseInt(lastCode.replace(prefix, ''), 10)
    if (!isNaN(lastNumber)) nextNumber = lastNumber + 1
  }

  return `${prefix}${String(nextNumber).padStart(6, '0')}`
}

async function checkAllotmentAvailability(
  roomTypeId: string,
  dateFrom: string,
  dateTo: string,
): Promise<{ available: boolean; message?: string }> {
  if (!roomTypeId || !dateFrom || !dateTo) return { available: true }

  const from = new Date(dateFrom + 'T00:00:00')
  const to = new Date(dateTo + 'T00:00:00')
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return { available: true }

  const allotments = await db.allotment.findMany({
    where: {
      roomTypeId,
      status: 'active',
      dateFrom: { lte: to },
      dateTo: { gte: from },
    },
    select: { id: true, totalRooms: true, bookedRooms: true },
  })

  if (allotments.length === 0) {
    return { available: false, message: 'No hay disponibilidad configurada para estas fechas' }
  }

  for (const allotment of allotments) {
    if (allotment.bookedRooms < allotment.totalRooms) return { available: true }
  }

  return { available: false, message: 'No hay habitaciones disponibles en el rango de fechas seleccionado' }
}

/**
 * Resolve booking context from request: domain, cookie, query param.
 * Priority: cookie > domain > query param.
 */
function resolveRequestContext(request: NextRequest): {
  domain: string | null
  cookieResellerCode: string | null
  queryResellerCode: string | null
} {
  const url = new URL(request.url)
  const host = request.headers.get('host') || ''
  const domain = host.split(':')[0] || null

  const cookieResellerCode = request.cookies.get('x-reseller-code')?.value ?? null
  const queryResellerCode = url.searchParams.get('reseller') ?? null

  return { domain, cookieResellerCode, queryResellerCode }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const { allowed, remaining } = checkRateLimit(`booking:${ip}`, 10, 15 * 60 * 1000)

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Demasiados intentos. Intenta más tarde.' },
        { status: 429 },
      )
    }

    const body = await request.json()

    const validation = validateBookingInput(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const {
      subagentCode,
      resellerId,
      guestName,
      guestEmail,
      guestPhone,
      guestCountry,
      adults,
      children,
      childrenAges,
      notes,
      checkIn,
      checkOut,
      items,
      totalPrice: clientTotalPrice,
    } = validation.data

    // Resolve item type from itemType or serviceType (backward compat)
    const normalizedInputItems = items.map((item) => ({
      ...item,
      itemType: item.itemType || (item as any).serviceType || '',
    }))

    // Allotment check (hotels only)
    for (const item of normalizedInputItems) {
      if (item.itemType === 'hotel' && item.roomTypeId && item.dateFrom && item.dateTo) {
        const { available, message } = await checkAllotmentAvailability(
          item.roomTypeId, item.dateFrom, item.dateTo,
        )
        if (!available) {
          return NextResponse.json({ success: false, error: message || 'Sin disponibilidad' }, { status: 409 })
        }
      }
    }

    // Resolve request context (domain, cookie, query)
    const reqCtx = resolveRequestContext(request)

    // Delegate all pricing to centralized engine
    const { items: validatedItems, breakdown, actors } = await normalizeBookingItems(
      normalizedInputItems,
      {
        subagentCode,
        resellerId,
        domain: reqCtx.domain,
        cookieResellerCode: reqCtx.cookieResellerCode,
        resellerCode: reqCtx.queryResellerCode,
      },
    )

    // Price integrity check — reject if client total is way off
    if (clientTotalPrice !== undefined && clientTotalPrice > 0) {
      const ok = validatePriceIntegrity(clientTotalPrice, breakdown.finalTotal)
      if (!ok) {
        console.warn(
          `[price-integrity] Client total ${clientTotalPrice} vs server ${breakdown.finalTotal} — using server value`,
        )
      }
    }

    const code = await generateBookingCode()

    // Create Booking + Items + ResellerSale in one transaction
    const booking = await db.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          code,
          subagentId: actors.subagentId,
          resellerId: actors.resellerId,
          guestName,
          guestEmail,
          guestPhone,
          guestCountry: guestCountry ?? '',
          adults: adults ?? 1,
          children: children ?? 0,
          childrenAges: JSON.stringify(childrenAges || []),
          notes: notes ?? '',
          status: 'pending',
          totalPrice: breakdown.finalTotal,
          netPrice: breakdown.netPrice,
          commissionAmt: breakdown.resellerCommissionAmt,
          subagentCommissionAmt: breakdown.subagentCommissionAmt,
          checkIn: checkIn ?? '',
          checkOut: checkOut ?? '',
          bookedBy: actors.bookedBy,
          items: {
            create: validatedItems.map((item) => ({
              itemType: item.itemType,
              serviceId: item.serviceId,
              serviceName: item.serviceName,
              roomTypeId: item.roomTypeId ?? '',
              roomName: item.roomName ?? '',
              dateFrom: item.dateFrom ?? '',
              dateTo: item.dateTo ?? '',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              addons: JSON.stringify(item.addons),
              status: 'confirmed',
            })),
          },
        },
        include: {
          items: { orderBy: { createdAt: 'asc' } },
          subagent: {
            select: {
              id: true, code: true, agencyName: true, contactName: true, email: true, commission: true,
            },
          },
          reseller: {
            select: {
              id: true, companyName: true, contactName: true, email: true, commission: true,
            },
          },
        },
      })

      // Create ResellerSale when reseller context is present
      if (actors.resellerId) {
        await tx.resellerSale.create({
          data: {
            resellerId: actors.resellerId,
            bookingId: created.id,
            clientName: guestName,
            clientEmail: guestEmail,
            totalAmount: breakdown.finalTotal,
            commissionAmt: breakdown.resellerCommissionAmt,
            netAmount: breakdown.netPrice,
            status: 'pending',
            notes: `Reserva ${code}`,
          },
        })
      }

      return created
    })

    // Allotment update
    for (const item of normalizedInputItems) {
      if (item.itemType === 'hotel' && item.roomTypeId && item.dateFrom && item.dateTo) {
        const from = new Date(item.dateFrom + 'T00:00:00')
        const to = new Date(item.dateTo + 'T00:00:00')
        const matchingAllotments = await db.allotment.findMany({
          where: {
            roomTypeId: item.roomTypeId,
            status: 'active',
            dateFrom: { lte: to },
            dateTo: { gte: from },
          },
          orderBy: { bookedRooms: 'asc' },
        })
        for (const allotment of matchingAllotments) {
          if (allotment.bookedRooms < allotment.totalRooms) {
            await db.allotment.update({
              where: { id: allotment.id },
              data: { bookedRooms: allotment.bookedRooms + 1 },
            })
            break
          }
        }
      }
    }

    // Fire-and-forget events
    bookingEvents.emitAsync(BOOKING_CREATED, {
      bookingId: booking.id,
      bookingCode: booking.code,
      totalPrice: breakdown.finalTotal,
      netPrice: breakdown.netPrice,
      commissionAmt: breakdown.resellerCommissionAmt,
      subagentCommissionAmt: breakdown.subagentCommissionAmt,
      resellerId: actors.resellerId,
      subagentId: actors.subagentId,
    })

    notifyBookingCreated(
      {
        code: booking.code,
        resellerId: actors.resellerId,
        subagentId: actors.subagentId,
        totalPrice: breakdown.finalTotal,
        netPrice: breakdown.netPrice,
        commissionAmt: breakdown.resellerCommissionAmt,
        subagentCommissionAmt: breakdown.subagentCommissionAmt,
      },
      validatedItems,
    )

    return NextResponse.json(
      { success: true, data: formatBooking(booking) },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create booking' },
      { status: error.message?.includes('not found') || error.message?.includes('Unknown add-on') ? 400 : 500 },
    )
  }
}

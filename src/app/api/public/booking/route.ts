import { safeJsonParse } from '@/lib/json'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateBookingInput } from '@/lib/booking-validation'
import { calculateCommissionAmount } from '@/lib/package-pricing'


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
    where: {
      code: {
        startsWith: prefix,
      },
    },
    orderBy: { code: 'desc' },
    select: { code: true },
  })

  let nextNumber = 1
  if (latestBooking) {
    const lastCode = latestBooking.code
    const lastNumber = parseInt(lastCode.replace(prefix, ''), 10)
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1
    }
  }

  return `${prefix}${String(nextNumber).padStart(6, '0')}`
}

async function checkAllotmentAvailability(
  roomTypeId: string,
  dateFrom: string,
  dateTo: string,
): Promise<{ available: boolean; message?: string }> {
  if (!roomTypeId || !dateFrom || !dateTo) {
    return { available: true }
  }

  const from = new Date(dateFrom + 'T00:00:00')
  const to = new Date(dateTo + 'T00:00:00')

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return { available: true }
  }

  const allotments = await db.allotment.findMany({
    where: {
      roomTypeId,
      status: 'active',
      dateFrom: { lte: to },
      dateTo: { gte: from },
    },
    select: {
      id: true,
      totalRooms: true,
      bookedRooms: true,
    },
  })

  if (allotments.length === 0) {
    return {
      available: false,
      message: 'No hay disponibilidad configurada para estas fechas',
    }
  }

  for (const allotment of allotments) {
    if (allotment.bookedRooms < allotment.totalRooms) {
      return { available: true }
    }
  }

  return {
    available: false,
    message: 'No hay habitaciones disponibles en el rango de fechas seleccionado',
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = validateBookingInput(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const {
      subagentCode,
      resellerId,
      bookedBy: requestedBookedBy,
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
      // NOTE: totalPrice, netPrice, commissionAmt are IGNORED from client
      // Server recalculates everything from items + reseller commission
    } = validation.data

    for (const item of items) {
      if (item.itemType === 'hotel' && item.roomTypeId && item.dateFrom && item.dateTo) {
        const { available, message } = await checkAllotmentAvailability(
          item.roomTypeId,
          item.dateFrom,
          item.dateTo,
        )
        if (!available) {
          return NextResponse.json(
            { success: false, error: message || 'Sin disponibilidad' },
            { status: 409 },
          )
        }
      }
    }

    // Resolve subagent
    let subagentId: string | null = null
    let bookedBy = requestedBookedBy || 'b2c'

    if (subagentCode) {
      const subagent = await db.subagent.findUnique({
        where: { code: subagentCode },
      })
      if (!subagent || !subagent.active) {
        return NextResponse.json(
          { success: false, error: 'Subagent no válido o inactivo' },
          { status: 403 },
        )
      }
      subagentId = subagent.id
      bookedBy = 'b2b'
    }

    // ── SECURITY: Recalculate total from items — NEVER trust client-sent totalPrice ──
    const serverCalculatedTotal = items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0)

    // Resolve reseller context — commission comes from DB, NOT from client
    let resolvedResellerId: string | null = null
    let resellerCommission = 0

    if (resellerId) {
      const reseller = await db.reseller.findUnique({
        where: { id: resellerId },
        select: { id: true, active: true, approvalStatus: true, commission: true },
      })

      if (reseller && reseller.active && reseller.approvalStatus === 'approved') {
        resolvedResellerId = reseller.id
        resellerCommission = reseller.commission
        bookedBy = 'custom-package'
      }
    }

    // Apply markup if reseller is present — this is the TRUTH, not client price
    const finalTotalPrice = resolvedResellerId
      ? Math.round((serverCalculatedTotal * (100 + resellerCommission)) / 100)
      : serverCalculatedTotal

    const finalCommissionAmt = resolvedResellerId
      ? calculateCommissionAmount(finalTotalPrice, resellerCommission)
      : 0

    const finalNetPrice = finalTotalPrice - finalCommissionAmt

    const code = await generateBookingCode()

    const booking = await db.booking.create({
      data: {
        code,
        subagentId,
        resellerId: resolvedResellerId,
        guestName,
        guestEmail,
        guestPhone,
        guestCountry: guestCountry ?? '',
        adults: adults ?? 1,
        children: children ?? 0,
        childrenAges: JSON.stringify(childrenAges || []),
        notes: notes ?? '',
        status: 'pending',
        totalPrice: finalTotalPrice,
        netPrice: finalNetPrice,
        commissionAmt: finalCommissionAmt,
        checkIn: checkIn ?? '',
        checkOut: checkOut ?? '',
        bookedBy,
        items: {
          create: items.map((item) => ({
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
            status: 'confirmed',
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
    })

    // Create ResellerSale record when booking comes from a reseller context
    if (resolvedResellerId) {
      await db.resellerSale.create({
        data: {
          resellerId: resolvedResellerId,
          bookingId: booking.id,
          clientName: guestName,
          clientEmail: guestEmail,
          totalAmount: finalTotalPrice,
          commissionAmt: finalCommissionAmt,
          netAmount: finalNetPrice,
          status: 'pending',
          notes: `Paquete personalizado armado via /paquetes/armar`,
        },
      })
    }

    for (const item of items) {
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

    return NextResponse.json(
      { success: true, data: formatBooking(booking) },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 },
    )
  }
}

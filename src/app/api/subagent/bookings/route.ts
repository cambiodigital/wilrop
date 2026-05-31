import { safeJsonParse } from '@/lib/json'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'


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

export async function GET(request: NextRequest) {
  try {
    const sessionValue = request.cookies.get(getPanelSessionCookieName('subagent'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'subagent')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const bookings = await db.booking.findMany({
      where: {
        subagentId: session.id,
      },
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
    })

    return NextResponse.json({ success: true, data: bookings.map(formatBooking) })
  } catch (error) {
    console.error('Error fetching subagent bookings:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar las reservas' },
      { status: 500 },
    )
  }
}
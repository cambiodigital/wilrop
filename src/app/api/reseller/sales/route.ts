import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import {
  getResellerSales,
  createResellerSale,
  getResellerSaleCount,
  getResellerCommissionPercent,
} from '@/lib/reseller/sales'
import { saleSchema, saleFiltersSchema } from '@/lib/reseller/sales-validators'
import { getResellerCapabilities } from '@/lib/reseller-access'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const status = url.searchParams.get('status') as string | undefined
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')

    const filtersResult = saleFiltersSchema.safeParse({
      search: search || undefined,
      status,
      dateFrom,
      dateTo,
    })

    const filters = filtersResult.success ? filtersResult.data : {}

    const sales = await getResellerSales(session.id, filters)

    return NextResponse.json({ success: true, data: sales })
  } catch (error) {
    console.error('[ResellerSales GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar las ventas' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const capabilities = getResellerCapabilities({
      sellerLevel: session.appRole,
      whiteLabelEnabled: session.whiteLabelEnabled,
    })

    if (!capabilities.hasSalesApi) {
      return NextResponse.json(
        { success: false, error: 'Tu plan no permite registrar ventas manualmente' },
        { status: 403 },
      )
    }

    const currentCount = await getResellerSaleCount(session.id)
    const maxSales = capabilities.maxClients * 5
    if (currentCount >= maxSales) {
      return NextResponse.json(
        { success: false, error: 'Límite de ventas alcanzado' },
        { status: 403 },
      )
    }

    const commissionPercent = await getResellerCommissionPercent(session.id)

    const body = await request.json()
    const validationResult = saleSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 },
      )
    }

    const sale = await createResellerSale(session.id, {
      ...validationResult.data,
      commissionPercent,
    })

    return NextResponse.json({ success: true, data: sale }, { status: 201 })
  } catch (error) {
    console.error('[ResellerSales POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo crear la venta' },
      { status: 500 },
    )
  }
}

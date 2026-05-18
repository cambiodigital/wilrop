import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getResellerCatalog, addToCatalog, getCatalogCount } from '@/lib/reseller/catalog'
import { catalogItemSchema, catalogFiltersSchema } from '@/lib/reseller/catalog-validators'
import { getResellerCapabilities } from '@/lib/reseller-access'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const sourceType = url.searchParams.get('sourceType')
    const active = url.searchParams.get('active')
    const featured = url.searchParams.get('featured')
    const search = url.searchParams.get('search')

    const filtersResult = catalogFiltersSchema.safeParse({
      sourceType: sourceType || undefined,
      active: active !== null ? active === 'true' : undefined,
      featured: featured !== null ? featured === 'true' : undefined,
      search: search || undefined,
    })

    const filters = filtersResult.success ? filtersResult.data : {}

    const items = await getResellerCatalog(session.id, filters)

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('[ResellerCatalog GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo cargar el catálogo' },
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

    const body = await request.json()
    const validationResult = catalogItemSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 },
      )
    }

    const capabilities = getResellerCapabilities({
      sellerLevel: session.appRole,
      whiteLabelEnabled: session.whiteLabelEnabled,
    })

    const currentCount = await getCatalogCount(session.id)
    if (currentCount >= capabilities.maxCatalogItems) {
      return NextResponse.json(
        { success: false, error: `Límite de catálogo alcanzado (${capabilities.maxCatalogItems} items)` },
        { status: 403 },
      )
    }

    const existing = await db.resellerCatalog.findUnique({
      where: {
        resellerId_sourceType_sourceId: {
          resellerId: session.id,
          sourceType: validationResult.data.sourceType,
          sourceId: validationResult.data.sourceId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Este producto ya está en tu catálogo' },
        { status: 409 },
      )
    }

    const item = await addToCatalog(session.id, validationResult.data)

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('[ResellerCatalog POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo agregar al catálogo' },
      { status: 500 },
    )
  }
}

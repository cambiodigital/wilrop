import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getResellerClients, createResellerClient, getResellerClientCount } from '@/lib/reseller/clients'
import { clientSchema, clientFiltersSchema } from '@/lib/reseller/clients-validators'
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

    const filtersResult = clientFiltersSchema.safeParse({
      search: search || undefined,
    })

    const filters = filtersResult.success ? filtersResult.data : {}

    const clients = await getResellerClients(session.id, filters)

    return NextResponse.json({ success: true, data: clients })
  } catch (error) {
    console.error('[ResellerClients GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los clientes' },
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

    const currentCount = await getResellerClientCount(session.id)
    if (currentCount >= capabilities.maxClients) {
      return NextResponse.json(
        { success: false, error: `Límite de clientes alcanzado (${capabilities.maxClients})` },
        { status: 403 },
      )
    }

    const body = await request.json()
    const validationResult = clientSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 },
      )
    }

    const client = await createResellerClient(session.id, validationResult.data)

    return NextResponse.json({ success: true, data: client }, { status: 201 })
  } catch (error) {
    console.error('[ResellerClients POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo crear el cliente' },
      { status: 500 },
    )
  }
}

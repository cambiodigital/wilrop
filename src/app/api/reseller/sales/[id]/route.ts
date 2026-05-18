import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import {
  getResellerSale,
  updateResellerSale,
  updateSaleStatus,
  deleteResellerSale,
} from '@/lib/reseller/sales'
import { updateSaleSchema, saleStatusSchema } from '@/lib/reseller/sales-validators'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const sale = await getResellerSale(session.id, id)

    if (!sale) {
      return NextResponse.json({ success: false, error: 'Venta no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: sale })
  } catch (error) {
    console.error('[ResellerSale GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo cargar la venta' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const url = new URL(request.url)
    const actionType = url.searchParams.get('action')

    if (actionType === 'status') {
      const validationResult = saleStatusSchema.safeParse(body)
      if (!validationResult.success) {
        return NextResponse.json(
          { success: false, error: 'Estado inválido', details: validationResult.error.errors },
          { status: 400 },
        )
      }
      const sale = await updateSaleStatus(session.id, id, validationResult.data.status)
      return NextResponse.json({ success: true, data: sale })
    }

    const validationResult = updateSaleSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 },
      )
    }

    const sale = await updateResellerSale(session.id, id, validationResult.data)
    return NextResponse.json({ success: true, data: sale })
  } catch (error) {
    console.error('[ResellerSale PATCH] Error:', error)
    const message = error instanceof Error ? error.message : 'No se pudo actualizar la venta'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    await deleteResellerSale(session.id, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ResellerSale DELETE] Error:', error)
    const message = error instanceof Error ? error.message : 'No se pudo eliminar la venta'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}

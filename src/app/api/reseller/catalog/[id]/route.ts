import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { updateCatalogItem, removeFromCatalog } from '@/lib/reseller/catalog'
import { updateCatalogItemSchema } from '@/lib/reseller/catalog-validators'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const { db } = await import('@/lib/db')

    const item = await db.resellerCatalog.findUnique({
      where: { id },
    })

    if (!item || item.resellerId !== session.id) {
      return NextResponse.json({ success: false, error: 'Item no encontrado' }, { status: 404 })
    }

    const { getResellerCatalog } = await import('@/lib/reseller/catalog')
    const items = await getResellerCatalog(session.id)
    const found = items.find((i) => i.id === id)

    if (!found) {
      return NextResponse.json({ success: false, error: 'Item no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: found })
  } catch (error) {
    console.error('[ResellerCatalogItem GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo cargar el item' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validationResult = updateCatalogItemSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 },
      )
    }

    const updated = await updateCatalogItem(session.id, id, validationResult.data)

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[ResellerCatalogItem PATCH] Error:', error)
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json(
      { success: false, error: message },
      { status: error instanceof Error && message.includes('no encontrado') ? 404 : 500 },
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    await removeFromCatalog(session.id, id)

    return NextResponse.json({ success: true, message: 'Item eliminado del catálogo' })
  } catch (error) {
    console.error('[ResellerCatalogItem DELETE] Error:', error)
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json(
      { success: false, error: message },
      { status: error instanceof Error && message.includes('no encontrado') ? 404 : 500 },
    )
  }
}

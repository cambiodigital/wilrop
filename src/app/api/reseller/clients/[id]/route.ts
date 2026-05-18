import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getResellerClient, updateResellerClient, deleteResellerClient } from '@/lib/reseller/clients'
import { updateClientSchema } from '@/lib/reseller/clients-validators'

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

    const client = await getResellerClient(session.id, id)
    if (!client) {
      return NextResponse.json({ success: false, error: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    console.error('[ResellerClient GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo cargar el cliente' },
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

    const validationResult = updateClientSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 },
      )
    }

    const client = await updateResellerClient(session.id, id, validationResult.data)

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    console.error('[ResellerClient PATCH] Error:', error)
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }
    return NextResponse.json(
      { success: false, error: 'No se pudo actualizar el cliente' },
      { status: 500 },
    )
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

    await deleteResellerClient(session.id, id)

    return NextResponse.json({ success: true, message: 'Cliente eliminado' })
  } catch (error) {
    console.error('[ResellerClient DELETE] Error:', error)
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }
    return NextResponse.json(
      { success: false, error: 'No se pudo eliminar el cliente' },
      { status: 500 },
    )
  }
}

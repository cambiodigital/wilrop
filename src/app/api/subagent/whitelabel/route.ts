import { NextRequest, NextResponse } from 'next/server'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('subagent'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'subagent')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const subagent = await db.subagent.findUnique({
      where: { id: session.id },
      select: {
        agencyName: true,
        whiteLabelEnabled: true,
      },
    })

    if (!subagent) {
      return NextResponse.json({ success: false, error: 'Subagente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        whiteLabelEnabled: subagent.whiteLabelEnabled,
        storeName: subagent.agencyName || '',
      },
    })
  } catch (error) {
    console.error('[SubagentWhiteLabel] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cargar la configuración' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('subagent'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'subagent')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const subagent = await db.subagent.findUnique({
      where: { id: session.id },
      select: { whiteLabelEnabled: true },
    })

    if (!subagent) {
      return NextResponse.json({ success: false, error: 'Subagente no encontrado' }, { status: 404 })
    }

    if (!subagent.whiteLabelEnabled) {
      return NextResponse.json(
        { success: false, error: 'La marca blanca no está habilitada para tu cuenta' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { storeName } = body

    if (!storeName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre de la tienda es obligatorio' },
        { status: 400 },
      )
    }

    await db.subagent.update({
      where: { id: session.id },
      data: {
        agencyName: storeName.trim(),
      },
    })

    return NextResponse.json({ success: true, message: 'Configuración actualizada correctamente' })
  } catch (error) {
    console.error('[SubagentWhiteLabel] PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al guardar la configuración' },
      { status: 500 },
    )
  }
}

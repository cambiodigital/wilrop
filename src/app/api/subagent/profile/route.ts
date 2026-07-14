import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getSubagentProfile, updateSubagentProfile, changeSubagentPassword } from '@/lib/subagent/profile'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('subagent'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'subagent')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const profile = await getSubagentProfile(session.id)

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error('[SubagentProfile GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo cargar el perfil' },
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

    const body = await request.json()
    const { contactName, agencyName, country, phone } = body

    if (!contactName?.trim() || !agencyName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nombre de contacto y agencia son obligatorios' },
        { status: 400 },
      )
    }

    await updateSubagentProfile(session.id, {
      contactName: contactName.trim(),
      agencyName: agencyName.trim(),
      country: (country || '').trim(),
      phone: (phone || '').trim(),
    })

    return NextResponse.json({ success: true, message: 'Perfil actualizado correctamente' })
  } catch (error) {
    console.error('[SubagentProfile PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo actualizar el perfil' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('subagent'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'subagent')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Contraseña actual y nueva contraseña son obligatorias' },
        { status: 400 },
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'La nueva contraseña debe tener al menos 8 caracteres' },
        { status: 400 },
      )
    }

    await changeSubagentPassword(session.id, currentPassword, newPassword)

    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error('[SubagentPassword POST] Error:', error)
    if (error instanceof Error && error.message === 'La contraseña actual no es correcta') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, error: 'No se pudo cambiar la contraseña' },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getResellerProfile, updateResellerProfile } from '@/lib/reseller/profile'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password.mjs'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const profile = await getResellerProfile(session.id)

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error('[ResellerProfile GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo cargar el perfil' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      contactName,
      companyName,
      country,
      phone,
      website,
      taxId,
      address,
      logoUrl,
    } = body

    if (!contactName?.trim() || !companyName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nombre de contacto y empresa son obligatorios' },
        { status: 400 },
      )
    }

    await updateResellerProfile(session.id, {
      contactName: contactName.trim(),
      companyName: companyName.trim(),
      country: (country || '').trim(),
      phone: (phone || '').trim(),
      website: (website || '').trim(),
      taxId: (taxId || '').trim(),
      address: (address || '').trim(),
      logoUrl,
    })

    return NextResponse.json({ success: true, message: 'Perfil actualizado correctamente' })
  } catch (error) {
    console.error('[ResellerProfile PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo actualizar el perfil' },
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

    const reseller = await db.reseller.findUnique({
      where: { id: session.id },
      select: { password: true },
    })

    if (!reseller) {
      return NextResponse.json({ success: false, error: 'Revendedor no encontrado' }, { status: 404 })
    }

    const validPassword = await verifyPassword(reseller.password, currentPassword)
    if (!validPassword) {
      return NextResponse.json(
        { success: false, error: 'La contraseña actual no es correcta' },
        { status: 401 },
      )
    }

    const hashedNewPassword = await hashPassword(newPassword)
    await db.reseller.update({
      where: { id: session.id },
      data: { password: hashedNewPassword },
    })

    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error('[ResellerPassword POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo cambiar la contraseña' },
      { status: 500 },
    )
  }
}

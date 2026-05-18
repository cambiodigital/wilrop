import { NextRequest, NextResponse } from 'next/server'
import { createPanelSessionToken, getPanelSessionCookie } from '@/lib/panel-auth'
import { db } from '@/lib/db'
import { getResellerCapabilities, normalizeResellerLevel } from '@/lib/reseller-access'
import { verifyPassword } from '@/lib/password.mjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Correo y contraseña son obligatorios' },
        { status: 400 },
      )
    }

    const reseller = await db.reseller.findUnique({
      where: { email },
    })

    if (!reseller) {
      return NextResponse.json(
        { success: false, error: 'No existe una cuenta revendedora activa con ese correo. Si aún no te has registrado, usa el formulario de registro.' },
        { status: 401 },
      )
    }

    const passwordValid = await verifyPassword(reseller.password, password)

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 },
      )
    }

    if (reseller.approvalStatus === 'pending') {
      return NextResponse.json(
        { success: false, error: 'Tu cuenta está pendiente de aprobación. Recibirás un email cuando sea activada.' },
        { status: 403 },
      )
    }

    if (reseller.approvalStatus === 'rejected') {
      return NextResponse.json(
        { success: false, error: `Tu solicitud de registro fue rechazada. Motivo: ${reseller.rejectionReason || 'Contacta al administrador para más información.'}` },
        { status: 403 },
      )
    }

    if (reseller.approvalStatus === 'under_review') {
      return NextResponse.json(
        { success: false, error: 'Tu cuenta está siendo revisada. Pronto recibirás una respuesta.' },
        { status: 403 },
      )
    }

    if (!reseller.active) {
      return NextResponse.json(
        { success: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' },
        { status: 403 },
      )
    }

    const sellerLevel = normalizeResellerLevel(reseller.sellerLevel)
    const capabilities = getResellerCapabilities({
      sellerLevel,
      whiteLabelEnabled: reseller.whiteLabelEnabled,
    })
    const displayName = reseller.contactName || reseller.companyName

    await db.reseller.update({
      where: { id: reseller.id },
      data: { lastLoginAt: new Date() },
    })

    const sessionToken = createPanelSessionToken({
      id: reseller.id,
      email: reseller.email,
      name: displayName,
      panelRole: 'reseller',
      appRole: sellerLevel,
      code: reseller.code,
      commission: reseller.commission,
      whiteLabelEnabled: capabilities.canUseWhiteLabel,
    })

    const response = NextResponse.json({
      success: true,
      reseller: {
        id: reseller.id,
        code: reseller.code,
        email: reseller.email,
        name: displayName,
        companyName: reseller.companyName,
        commission: reseller.commission,
        sellerLevel,
        whiteLabelEnabled: capabilities.canUseWhiteLabel,
        approvalStatus: reseller.approvalStatus,
        active: reseller.active,
      },
    })

    response.cookies.set(getPanelSessionCookie('reseller', sessionToken))
    return response
  } catch (error) {
    console.error('[ResellerAuth] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo iniciar sesión' },
      { status: 500 },
    )
  }
}

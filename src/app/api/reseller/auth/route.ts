import { NextRequest, NextResponse } from 'next/server'
import { createPanelSessionToken, getPanelSessionCookie } from '@/lib/panel-auth'
import { db } from '@/lib/db'
import { getResellerCapabilities, normalizeResellerLevel } from '@/lib/reseller-access'
import { verifyPassword } from '@/lib/password.mjs'
import { loginSchema } from '@/lib/validators/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const { allowed, remaining } = checkRateLimit(`reseller-auth:${ip}`, 5, 15 * 60 * 1000)

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Demasiados intentos. Intenta más tarde.' },
        { status: 429 },
      )
    }

    const body = await request.json()

    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const email = parsed.data.email.trim().toLowerCase()
    const password = parsed.data.password

    let reseller = await db.reseller.findUnique({
      where: { email },
    })

    const admin = await db.admin.findUnique({
      where: { email },
    })

    const isUserAdmin = !!admin
    let passwordValid = false

    if (reseller) {
      passwordValid = await verifyPassword(reseller.password, password)

      // If password validation failed for the reseller record, but they are an admin,
      // verify the password against the admin record and sync the reseller password if correct.
      if (!passwordValid && isUserAdmin) {
        passwordValid = await verifyPassword(admin.password, password)
        if (passwordValid) {
          reseller = await db.reseller.update({
            where: { id: reseller.id },
            data: { password: admin.password },
          })
        }
      }
    } else if (isUserAdmin) {
      // The account is an administrator but has no reseller record. Verify their password.
      passwordValid = await verifyPassword(admin.password, password)

      if (passwordValid) {
        // Auto-create a matching reseller record for the admin to maintain referential integrity
        const baseCode = email.split('@')[0].substring(0, 5).toUpperCase()
        const randomNum = Math.floor(100 + Math.random() * 900)
        const code = `ADM-${baseCode}-${randomNum}`

        reseller = await db.reseller.create({
          data: {
            email: admin.email,
            password: admin.password,
            companyName: 'WILROP Admin',
            contactName: admin.name,
            code,
            active: true,
            approvalStatus: 'approved',
            sellerLevel: 'elite',
            whiteLabelEnabled: true,
            commission: 10,
          },
        })
      }
    }

    if (!reseller || !passwordValid) {
      return NextResponse.json(
        { success: false, error: 'No existe una cuenta revendedora activa con ese correo. Si aún no te has registrado, usa el formulario de registro.' },
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
    console.error('[ResellerAuth] Error:', error instanceof Error ? error.message : 'Unknown')
    return NextResponse.json(
      { success: false, error: 'No se pudo iniciar sesión' },
      { status: 500 },
    )
  }
}

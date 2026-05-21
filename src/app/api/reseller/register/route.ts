import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password.mjs'

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'WIL-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactName, agencyName, email, password, country, phone } = body

    if (!contactName?.trim() || !agencyName?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos obligatorios son requeridos' },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 },
      )
    }

    const emailLower = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailLower)) {
      return NextResponse.json(
        { success: false, error: 'El email no es válido' },
        { status: 400 },
      )
    }

    const existing = await db.subagent.findUnique({
      where: { email: emailLower },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una cuenta con ese email' },
        { status: 409 },
      )
    }

    const hashedPassword = await hashPassword(password)
    const code = generateCode()

    const subagent = await db.subagent.create({
      data: {
        code,
        email: emailLower,
        password: hashedPassword,
        agencyName: agencyName.trim(),
        contactName: contactName.trim(),
        country: country?.trim() || '',
        phone: phone?.trim() || '',
        commission: 10,
        sellerLevel: 'standard',
        type: 'reseller',
        whiteLabelEnabled: false,
        active: false,
        approvalStatus: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Registro exitoso. Tu cuenta está pendiente de aprobación por el administrador.',
      data: {
        id: subagent.id,
        code: subagent.code,
        agencyName: subagent.agencyName,
        contactName: subagent.contactName,
        approvalStatus: subagent.approvalStatus,
      },
    })
  } catch (error) {
    console.error('[ResellerRegister] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo completar el registro' },
      { status: 500 },
    )
  }
}

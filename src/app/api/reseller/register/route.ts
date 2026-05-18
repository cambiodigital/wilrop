import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password.mjs'

function generateCode(): string {
  const prefix = 'RES-'
  const chars = '0123456789'
  let result = prefix
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      contactName,
      companyName,
      email,
      password,
      country,
      phone,
      website,
      taxId,
      address,
    } = body

    if (!contactName?.trim() || !companyName?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nombre de contacto, empresa, email y contraseña son obligatorios' },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 8 caracteres' },
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

    const existing = await db.reseller.findUnique({
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

    const reseller = await db.reseller.create({
      data: {
        code,
        email: emailLower,
        password: hashedPassword,
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        country: country?.trim() || '',
        phone: phone?.trim() || '',
        website: website?.trim() || '',
        taxId: taxId?.trim() || '',
        address: address?.trim() || '',
        commission: 10,
        sellerLevel: 'standard',
        whiteLabelEnabled: false,
        active: false,
        approvalStatus: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Registro exitoso. Tu cuenta está pendiente de aprobación por el administrador.',
      data: {
        id: reseller.id,
        code: reseller.code,
        companyName: reseller.companyName,
        contactName: reseller.contactName,
        approvalStatus: reseller.approvalStatus,
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

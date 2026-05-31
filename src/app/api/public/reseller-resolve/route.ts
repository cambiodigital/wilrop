import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Public API to resolve a reseller by code.
 * Used by the package builder to detect reseller context from URL/cookie/subdomain.
 * Returns limited public info only — no sensitive data.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Código de revendedor requerido' },
        { status: 400 },
      )
    }

    const reseller = await db.reseller.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        companyName: true,
        contactName: true,
        commission: true,
        active: true,
        approvalStatus: true,
        sellerLevel: true,
        logoUrl: true,
      },
    })

    if (!reseller) {
      return NextResponse.json(
        { success: false, error: 'Revendedor no encontrado' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data: reseller })
  } catch (error) {
    console.error('Error resolving reseller:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno' },
      { status: 500 },
    )
  }
}

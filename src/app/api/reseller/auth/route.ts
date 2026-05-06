import { NextRequest, NextResponse } from 'next/server'
import { createPanelSessionToken, getPanelSessionCookie, secureCompare } from '@/lib/panel-auth'
import { db } from '@/lib/db'
import { getResellerCapabilities, normalizeResellerLevel } from '@/lib/reseller-access'
import { hashPassword, shouldUpgradePasswordHash, verifyPassword } from '@/lib/password.mjs'

interface ResellerAccount {
  email: string
  password: string
  name: string
}

function parseResellerAccounts(rawValue: string): ResellerAccount[] {
  const parsed = JSON.parse(rawValue) as unknown
  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return []
    }

    const candidate = entry as Partial<ResellerAccount>
    if (!candidate.email || !candidate.password || !candidate.name) {
      return []
    }

    return [
      {
        email: candidate.email.trim().toLowerCase(),
        password: candidate.password,
        name: candidate.name,
      },
    ]
  })
}

function getResellerAccounts(): ResellerAccount[] {
  const configuredAccounts = process.env.WILROP_RESELLER_ACCOUNTS
  if (configuredAccounts) {
    return parseResellerAccounts(configuredAccounts)
  }

  if (process.env.WILROP_RESELLER_EMAIL && process.env.WILROP_RESELLER_PASSWORD) {
    return [
      {
        email: process.env.WILROP_RESELLER_EMAIL.trim().toLowerCase(),
        password: process.env.WILROP_RESELLER_PASSWORD,
        name: process.env.WILROP_RESELLER_NAME || 'Socio WILROP',
      },
    ]
  }

  if (process.env.NODE_ENV !== 'production') {
    return [
      {
        email: 'socio@wilrop.com',
        password: 'demo12345',
        name: 'Socio Demo',
      },
    ]
  }

  return []
}

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

    const subagent = await db.subagent.findUnique({
      where: { email },
    })

    if (subagent) {
      if (!(await verifyPassword(subagent.password, password))) {
        return NextResponse.json(
          { success: false, error: 'Credenciales inválidas' },
          { status: 401 },
        )
      }

      if (shouldUpgradePasswordHash(subagent.password)) {
        try {
          const upgradedHash = await hashPassword(password)
          await db.subagent.update({
            where: { id: subagent.id },
            data: { password: upgradedHash },
          })
        } catch {}
      }

      if (!subagent.active) {
        return NextResponse.json(
          { success: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' },
          { status: 403 },
        )
      }

      const sellerLevel = normalizeResellerLevel(subagent.sellerLevel)
      const capabilities = getResellerCapabilities({
        sellerLevel,
        whiteLabelEnabled: subagent.whiteLabelEnabled,
      })
      const displayName = subagent.contactName || subagent.agencyName
      const sessionToken = createPanelSessionToken({
        id: subagent.id,
        email: subagent.email,
        name: displayName,
        panelRole: 'reseller',
        appRole: sellerLevel,
        code: subagent.code,
        commission: subagent.commission,
        whiteLabelEnabled: capabilities.canUseWhiteLabel,
      })

      const response = NextResponse.json({
        success: true,
        reseller: {
          id: subagent.id,
          code: subagent.code,
          email: subagent.email,
          name: displayName,
          agencyName: subagent.agencyName,
          commission: subagent.commission,
          sellerLevel,
          whiteLabelEnabled: capabilities.canUseWhiteLabel,
        },
      })

      response.cookies.set(getPanelSessionCookie('reseller', sessionToken))
      return response
    }

    const accounts = getResellerAccounts()
    if (accounts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No existe una cuenta revendedora activa con ese correo' },
        { status: 401 },
      )
    }

    const reseller = accounts.find((account) => secureCompare(account.email, email))

    if (!reseller || !(await verifyPassword(reseller.password, password))) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 },
      )
    }

    const sessionToken = createPanelSessionToken({
      id: `reseller:${reseller.email}`,
      email: reseller.email,
      name: reseller.name,
      panelRole: 'reseller',
      appRole: 'reseller',
      whiteLabelEnabled: false,
    })

    const response = NextResponse.json({
      success: true,
      reseller: {
        id: `reseller:${reseller.email}`,
        email: reseller.email,
        name: reseller.name,
      },
    })

    response.cookies.set(getPanelSessionCookie('reseller', sessionToken))
    return response
  } catch (error) {
    console.error('Reseller auth error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudo iniciar sesión' },
      { status: 500 },
    )
  }
}

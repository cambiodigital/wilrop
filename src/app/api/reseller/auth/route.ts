import { NextRequest, NextResponse } from 'next/server'
import { createPanelSessionToken, getPanelSessionCookie, secureCompare } from '@/lib/panel-auth'

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

    return [{ email: candidate.email, password: candidate.password, name: candidate.name }]
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
        email: process.env.WILROP_RESELLER_EMAIL,
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
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Correo y contraseña son obligatorios' },
        { status: 400 },
      )
    }

    const accounts = getResellerAccounts()
    if (accounts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay cuentas reseller configuradas en el servidor' },
        { status: 503 },
      )
    }

    const reseller = accounts.find((account) => secureCompare(account.email, email))

    if (!reseller || !secureCompare(reseller.password, password)) {
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
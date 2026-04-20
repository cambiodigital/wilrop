import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export type PanelRole = 'admin' | 'reseller' | 'subagent'

export interface CreatePanelSessionInput {
  id: string
  email: string
  name: string
  panelRole: PanelRole
  appRole?: string
  code?: string
  commission?: number
}

interface PanelSessionClaims extends CreatePanelSessionInput {
  v: 1
  iat: number
  exp: number
}

export interface PanelSession extends CreatePanelSessionInput {
  issuedAt: number
  expiresAt: number
}

export const PANEL_SESSION_TTL_SECONDS = 60 * 60 * 8

function getSessionSecret(): Buffer {
  const configuredSecret =
    process.env.WILROP_SESSION_SECRET ?? process.env.AUTH_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET

  if (configuredSecret) {
    return Buffer.from(configuredSecret, 'utf8')
  }

  if (process.env.NODE_ENV !== 'production') {
    return Buffer.from('wilrop-dev-session-secret-change-me', 'utf8')
  }

  throw new Error('Missing session secret. Configure WILROP_SESSION_SECRET, AUTH_SESSION_SECRET, or NEXTAUTH_SECRET.')
}

function signPayload(encodedPayload: string): string {
  return createHmac('sha256', getSessionSecret()).update(encodedPayload).digest('base64url')
}

function safeNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

export function secureCompare(left: string, right: string): boolean {
  const leftHash = createHash('sha256').update(left, 'utf8').digest()
  const rightHash = createHash('sha256').update(right, 'utf8').digest()
  return timingSafeEqual(leftHash, rightHash)
}

export function getPanelSessionCookieName(role: PanelRole): string {
  return `wilrop_${role}_session`
}

export function createPanelSessionToken(
  session: CreatePanelSessionInput,
  maxAgeSeconds = PANEL_SESSION_TTL_SECONDS,
): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: PanelSessionClaims = {
    v: 1,
    ...session,
    iat: now,
    exp: now + maxAgeSeconds,
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = signPayload(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function verifyPanelSessionToken(token?: string, expectedRole?: PanelRole): PanelSession | null {
  if (!token) {
    return null
  }

  const tokenParts = token.split('.')
  if (tokenParts.length !== 2) {
    return null
  }

  const [encodedPayload, providedSignature] = tokenParts
  if (!encodedPayload || !providedSignature) {
    return null
  }

  const expectedSignature = signPayload(encodedPayload)
  const providedBuffer = Buffer.from(providedSignature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null
  }

  try {
    const decodedPayload = Buffer.from(encodedPayload, 'base64url').toString('utf8')
    const claims = JSON.parse(decodedPayload) as Partial<PanelSessionClaims>

    if (
      claims.v !== 1 ||
      !claims.id ||
      !claims.email ||
      !claims.name ||
      !claims.panelRole ||
      !claims.iat ||
      !claims.exp
    ) {
      return null
    }

    if (expectedRole && claims.panelRole !== expectedRole) {
      return null
    }

    const now = Math.floor(Date.now() / 1000)
    if (claims.exp <= now) {
      return null
    }

    return {
      id: claims.id,
      email: claims.email,
      name: claims.name,
      panelRole: claims.panelRole,
      appRole: claims.appRole,
      code: claims.code,
      commission: safeNumber(claims.commission),
      issuedAt: claims.iat,
      expiresAt: claims.exp,
    }
  } catch {
    return null
  }
}

export function getPanelSessionCookie(
  role: PanelRole,
  value: string,
  maxAgeSeconds = PANEL_SESSION_TTL_SECONDS,
): ResponseCookie {
  return {
    name: getPanelSessionCookieName(role),
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

export function clearPanelSessionCookie(role: PanelRole): ResponseCookie {
  return {
    name: getPanelSessionCookieName(role),
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }
}
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import {
  clearPanelSessionCookie,
  createPanelSessionToken,
  getPanelSessionCookie,
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from '@/lib/panel-auth'

export const RESELLER_SESSION_COOKIE = getPanelSessionCookieName('reseller')

export interface ResellerSessionPayload {
  id: string
  email: string
  name: string
  role: string
  code?: string
  commission?: number
  whiteLabelEnabled?: boolean
}

export function encodeResellerSession(payload: ResellerSessionPayload): string {
  return createPanelSessionToken({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    panelRole: 'reseller',
    appRole: payload.role,
    code: payload.code,
    commission: payload.commission,
    whiteLabelEnabled: payload.whiteLabelEnabled,
  })
}

export function decodeResellerSession(value?: string): ResellerSessionPayload | null {
  const session = verifyPanelSessionToken(value, 'reseller')
  if (!session) {
    return null
  }

  return {
    id: session.id,
    email: session.email,
    name: session.name,
    role: session.appRole || 'standard',
    code: session.code,
    commission: session.commission,
    whiteLabelEnabled: session.whiteLabelEnabled,
  }
}

export function getResellerSessionCookie(value: string): ResponseCookie {
  return getPanelSessionCookie('reseller', value)
}

export function clearResellerSessionCookie(): ResponseCookie {
  return clearPanelSessionCookie('reseller')
}

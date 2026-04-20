import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import {
  clearPanelSessionCookie,
  createPanelSessionToken,
  getPanelSessionCookie,
  getPanelSessionCookieName,
  verifyPanelSessionToken,
} from '@/lib/panel-auth'

export const ADMIN_SESSION_COOKIE = getPanelSessionCookieName('admin')

export interface AdminSessionPayload {
  id: string
  email: string
  name: string
  role: string
}

export function encodeAdminSession(payload: AdminSessionPayload): string {
  return createPanelSessionToken({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    panelRole: 'admin',
    appRole: payload.role,
  })
}

export function decodeAdminSession(value?: string): AdminSessionPayload | null {
  const session = verifyPanelSessionToken(value, 'admin')
  if (!session) {
    return null
  }

  return {
    id: session.id,
    email: session.email,
    name: session.name,
    role: session.appRole || 'admin',
  }
}

export function getAdminSessionCookie(value: string): ResponseCookie {
  return getPanelSessionCookie('admin', value)
}

export function clearAdminSessionCookie(): ResponseCookie {
  return clearPanelSessionCookie('admin')
}

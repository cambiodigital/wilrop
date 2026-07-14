import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPanelSessionCookieName, verifyPanelSessionToken, type PanelSession } from '@/lib/panel-auth'

/**
 * Verify that the request has a valid admin session cookie.
 * Returns the session if valid, or null if not authenticated.
 */
export function getAdminSession(request: NextRequest): PanelSession | null {
  const cookieName = getPanelSessionCookieName('admin')
  const sessionToken = request.cookies.get(cookieName)?.value
  return verifyPanelSessionToken(sessionToken, 'admin')
}

/**
 * Higher-order function that enforces admin auth on a route handler.
 * Returns 401 if the session is invalid. Otherwise calls the handler
 * with the verified session.
 */
export function withAdminAuth(
  handler: (request: NextRequest, session: PanelSession, ...args: unknown[]) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const session = getAdminSession(request)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 },
      )
    }
    return handler(request, session, ...args)
  }
}

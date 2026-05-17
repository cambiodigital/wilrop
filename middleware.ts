import { NextRequest, NextResponse } from 'next/server'
import { getPanelSessionCookieNameEdge, verifyPanelSessionTokenEdge, type PanelRole } from './src/lib/panel-auth-edge'

const PROTECTED_PREFIXES: { prefix: string; role: PanelRole }[] = [
  { prefix: '/admin', role: 'admin' },
  { prefix: '/reseller', role: 'reseller' },
  { prefix: '/subagent', role: 'subagent' },
]

const PUBLIC_PATHS = [
  '/admin/login',
  '/reseller/login',
  '/subagent/login',
  '/reseller/register',
  '/api/admin/auth',
  '/api/reseller/auth',
  '/api/reseller/register',
  '/api/subagent/auth',
]

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname === '/favicon.ico' ||
    !!pathname.match(/\.(png|jpg|jpeg|svg|css|js|woff2?)$/)
  )
}

function getMatchingProtection(pathname: string): { prefix: string; role: PanelRole } | null {
  for (const { prefix, role } of PROTECTED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return { prefix, role }
    }
  }
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const match = getMatchingProtection(pathname)
  if (!match) {
    return NextResponse.next()
  }

  const cookieName = getPanelSessionCookieNameEdge(match.role)
  const sessionToken = request.cookies.get(cookieName)?.value
  const session = await verifyPanelSessionTokenEdge(sessionToken, match.role)

  if (!session) {
    const loginUrl = new URL(`${match.prefix}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/reseller/:path*',
    '/subagent/:path*',
  ],
}

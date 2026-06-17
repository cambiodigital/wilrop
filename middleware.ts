import { NextRequest, NextResponse } from 'next/server'
import { getPanelSessionCookieNameEdge, verifyPanelSessionTokenEdge, type PanelRole } from './src/lib/panel-auth-edge'

// ─── Configuration ───────────────────────────────────────────────
// Detect main domain from NEXTAUTH_URL (set in Coolify env vars).
// Falls back to 'wilropgroup.com' if not set.
const MAIN_DOMAIN = (() => {
  const url = process.env.NEXTAUTH_URL
  if (url) {
    try {
      return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    } catch {
      // invalid URL, fall through
    }
  }
  return 'wilropgroup.com'
})()

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

// ─── Helpers ─────────────────────────────────────────────────────
function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/uploads/') ||
    pathname === '/robots.txt' ||
    !!pathname.match(/\.(png|jpg|jpeg|svg|css|js|woff2?|webp|gif|ico|txt|json|xml|pdf)$/)
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

function normalizeHostname(hostname: string): string {
  return hostname
    .toLowerCase()
    .replace(/:\d+$/, '')   // strip port
    .replace(/^www\./, '')  // strip www.
}

function isMainDomain(hostname: string): boolean {
  const normalized = normalizeHostname(hostname)
  return (
    normalized === MAIN_DOMAIN ||
    normalized === `www.${MAIN_DOMAIN}` ||
    normalized === 'localhost' ||
    normalized.endsWith('.localhost')
  )
}

function extractSubdomain(hostname: string): string | null {
  const normalized = normalizeHostname(hostname)
  // For *.wilropgroup.com subdomains (not the main domain itself)
  if (normalized.endsWith(`.${MAIN_DOMAIN}`)) {
    const prefix = normalized.replace(`.${MAIN_DOMAIN}`, '')
    if (prefix && !prefix.includes('.')) {
      return prefix
    }
  }
  return null
}

// ─── Middleware ───────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Allow public paths and static assets through immediately
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // ── Custom domain / subdomain resolution ──
  // If NOT the main domain, this is a white-label request.
  // Resolve the reseller and rewrite to /brand/[resellerId]
  if (!isMainDomain(hostname)) {
    const subdomain = extractSubdomain(hostname)
    const normalizedHost = normalizeHostname(hostname)

    // Skip if already on the brand route to prevent infinite rewrite loops
    if (pathname.startsWith('/brand/')) {
      // Still protect admin/reseller/subagent routes even on custom domains
      const match = getMatchingProtection(pathname)
      if (match) {
        return await enforceAuth(request, match)
      }
      return NextResponse.next()
    }

    // Build the rewrite URL with resolver hints
    // The brand page will use these to load the correct reseller
    const rewriteUrl = request.nextUrl.clone()

    if (subdomain) {
      // Subdomain-based resolution: travelagency.wilropgroup.com -> /brand?subdomain=travelagency
      rewriteUrl.pathname = '/brand'
      rewriteUrl.searchParams.set('_subdomain', subdomain)
    } else {
      // Custom domain resolution: travel.example.com -> /brand?domain=travel.example.com
      rewriteUrl.pathname = '/brand'
      rewriteUrl.searchParams.set('_domain', normalizedHost)
    }

    const response = NextResponse.rewrite(rewriteUrl)
    // Pass resolver info via headers for server-side use
    if (subdomain) {
      response.headers.set('x-reseller-subdomain', subdomain)
    } else {
      response.headers.set('x-reseller-domain', normalizedHost)
    }
    return response
  }

  // ── Main domain: standard route protection ──
  const match = getMatchingProtection(pathname)
  if (!match) {
    return NextResponse.next()
  }

  return await enforceAuth(request, match)
}

async function enforceAuth(
  request: NextRequest,
  match: { prefix: string; role: PanelRole }
): Promise<NextResponse> {
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
    // Match all paths except static files and internal Next.js routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

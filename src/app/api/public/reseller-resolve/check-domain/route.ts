import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Detect the main domain to identify subdomains.
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

/**
 * Domain verification endpoint for Caddy SSL auto-provisioning.
 * Caddy calls this via on-demand TLS to verify a domain is legitimate
 * before issuing a certificate.
 *
 * Returns 200 if the domain is either:
 *   1. A custom domain in Reseller.customDomain, OR
 *   2. A subdomain like {slug}.wilropgroup.com that matches Reseller.subdomain
 *
 * The reseller must be active + whiteLabelEnabled + approved.
 */
export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain')

  if (!domain) {
    return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 })
  }

  // Normalize: lowercase, strip port, strip www.
  const normalized = domain
    .toLowerCase()
    .replace(/:\d+$/, '')
    .replace(/^www\./, '')

  try {
    // Check if this is a subdomain of the main domain (e.g. cambiof.wilropgroup.com)
    const subdomainMatch = normalized.endsWith(`.${MAIN_DOMAIN}`)
      ? normalized.replace(`.${MAIN_DOMAIN}`, '')
      : null
    const isSubdomain = !!subdomainMatch && !subdomainMatch.includes('.')

    if (isSubdomain) {
      // Validate against Reseller.subdomain
      const reseller = await db.reseller.findFirst({
        where: {
          subdomain: subdomainMatch,
          active: true,
          whiteLabelEnabled: true,
          approvalStatus: 'approved',
        },
        select: { id: true },
      })

      if (!reseller) {
        return NextResponse.json({ error: 'Subdomain not found' }, { status: 404 })
      }

      return NextResponse.json({ ok: true, resellerId: reseller.id })
    }

    // Otherwise, validate against Reseller.customDomain
    const reseller = await db.reseller.findFirst({
      where: {
        customDomain: normalized,
        active: true,
        whiteLabelEnabled: true,
        approvalStatus: 'approved',
      },
      select: { id: true },
    })

    if (!reseller) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, resellerId: reseller.id })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

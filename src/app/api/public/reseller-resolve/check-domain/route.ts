import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Domain verification endpoint for Caddy SSL auto-provisioning.
 * Caddy calls this via on-demand TLS to verify a domain is legitimate
 * before issuing a certificate.
 *
 * Returns 200 only if the domain exists in Reseller.customDomain
 * and the reseller is active + whiteLabelEnabled.
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

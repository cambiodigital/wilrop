export type PanelRole = 'admin' | 'reseller' | 'subagent'

export interface PanelSession {
  id: string
  email: string
  name: string
  panelRole: PanelRole
  appRole?: string
  code?: string
  commission?: number
  whiteLabelEnabled?: boolean
  issuedAt: number
  expiresAt: number
}

export function getPanelSessionCookieNameEdge(role: string): string {
  return `wilrop_${role}_session`
}

async function hmacSha256Base64url(key: CryptoKey, data: string): Promise<string> {
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64urlDecode(str: string): string {
  const padded = str.padEnd(str.length + ((4 - (str.length % 4)) % 4), '=')
  return decodeURIComponent(
    atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  )
}

export async function verifyPanelSessionTokenEdge(
  token?: string,
  expectedRole?: PanelRole,
): Promise<PanelSession | null> {
  if (!token) return null

  const tokenParts = token.split('.')
  if (tokenParts.length !== 2) return null

  const [encodedPayload, providedSignature] = tokenParts
  if (!encodedPayload || !providedSignature) return null

  const secret =
    process.env.WILROP_SESSION_SECRET ?? process.env.AUTH_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET

  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      return null
    }
    return null
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const expectedSignature = await hmacSha256Base64url(key, encodedPayload)
  if (expectedSignature !== providedSignature) return null

  try {
    const decodedPayload = base64urlDecode(encodedPayload)
    const claims = JSON.parse(decodedPayload) as Record<string, unknown>

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

    if (expectedRole && claims.panelRole !== expectedRole) return null

    const now = Math.floor(Date.now() / 1000)
    if ((claims.exp as number) <= now) return null

    return {
      id: claims.id as string,
      email: claims.email as string,
      name: claims.name as string,
      panelRole: claims.panelRole as PanelRole,
      appRole: claims.appRole as string | undefined,
      code: claims.code as string | undefined,
      commission: typeof claims.commission === 'number' ? claims.commission : undefined,
      whiteLabelEnabled: typeof claims.whiteLabelEnabled === 'boolean' ? claims.whiteLabelEnabled : undefined,
      issuedAt: claims.iat as number,
      expiresAt: claims.exp as number,
    }
  } catch {
    return null
  }
}

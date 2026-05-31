'use client'

import { useState, useEffect, useMemo } from 'react'

export interface ResellerContext {
  /** Whether a reseller context was detected */
  isReseller: boolean
  /** Reseller ID (from DB) */
  resellerId: string | null
  /** Reseller code (short identifier) */
  resellerCode: string | null
  /** Reseller company name for display */
  companyName: string | null
  /** Commission percentage (markup to apply) */
  commission: number
  /** Whether the reseller is active and approved */
  isActive: boolean
  /** Loading state while resolving reseller */
  loading: boolean
}

interface ResellerResolveResponse {
  success: boolean
  data?: {
    id: string
    code: string
    companyName: string
    contactName: string
    commission: number
    active: boolean
    approvalStatus: string
  }
}

/**
 * Detect and resolve reseller context from:
 * 1. URL query param: ?reseller=CODE
 * 2. Cookie: x-reseller-code
 * 3. Subdomain: CODE.reseller.example.com
 *
 * Returns reseller info including commission rate for price markup.
 */
export function useResellerContext(): ResellerContext {
  const [resellerData, setResellerData] = useState<ResellerContext>({
    isReseller: false,
    resellerId: null,
    resellerCode: null,
    companyName: null,
    commission: 0,
    isActive: false,
    loading: true,
  })

  useEffect(() => {
    let cancelled = false

    async function resolve() {
      // 1. Check URL query param
      const params = new URLSearchParams(window.location.search)
      const queryCode = params.get('reseller')

      // 2. Check cookie
      const cookieMatch = document.cookie.match(/(?:^|;\s*)x-reseller-code=([^;]*)/)
      const cookieCode = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null

      // 3. Check subdomain
      let subdomainCode: string | null = null
      const host = window.location.hostname
      const parts = host.split('.')
      if (parts.length >= 3 && parts[0] !== 'www') {
        subdomainCode = parts[0]
      }

      const code = queryCode || cookieCode || subdomainCode

      if (!code) {
        if (!cancelled) {
          setResellerData((prev) => ({ ...prev, loading: false }))
        }
        return
      }

      try {
        const res = await fetch(`/api/public/reseller-resolve?code=${encodeURIComponent(code)}`)
        const json: ResellerResolveResponse = await res.json()

        if (!cancelled && json.success && json.data) {
          const d = json.data
          const isActive = d.active && d.approvalStatus === 'approved'

          // Persist in cookie for subsequent navigations
          if (isActive) {
            document.cookie = `x-reseller-code=${encodeURIComponent(code)}; path=/; max-age=86400; SameSite=Lax`
          }

          setResellerData({
            isReseller: isActive,
            resellerId: isActive ? d.id : null,
            resellerCode: isActive ? code : null,
            companyName: isActive ? (d.companyName || d.contactName) : null,
            commission: isActive ? d.commission : 0,
            isActive,
            loading: false,
          })
        } else if (!cancelled) {
          setResellerData((prev) => ({ ...prev, loading: false }))
        }
      } catch {
        if (!cancelled) {
          setResellerData((prev) => ({ ...prev, loading: false }))
        }
      }
    }

    resolve()
    return () => { cancelled = true }
  }, [])

  return resellerData
}

/**
 * Build query string params for API calls that need reseller filtering.
 */
export function buildResellerQueryParams(resellerId: string | null): string {
  if (!resellerId) return ''
  return `&resellerId=${encodeURIComponent(resellerId)}`
}

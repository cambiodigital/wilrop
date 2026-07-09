// Pure pricing functions — no DB, no path-alias dependencies.
// DB-dependent orchestration lives in booking-orchestration.ts

// ─── Types ───────────────────────────────────────────────────────

export type BookingServiceType = 'hotel' | 'transport' | 'excursion' | 'package' | 'cruise'

export interface NormalizeBookingContext {
  resellerId?: string | null
  resellerCode?: string | null
  subagentCode?: string | null
  domain?: string | null
  cookieResellerCode?: string | null
  bookedBy?: string
}

export interface PricingBreakdown {
  baseTotal: number
  addonsTotal: number
  subtotal: number
  markupPercent: number
  markupAmt: number
  finalTotal: number
  subagentCommissionPercent: number
  subagentCommissionAmt: number
  resellerCommissionAmt: number
  netPrice: number
}

export interface NormalizedBookingItem {
  itemType: string
  serviceId: string
  serviceName: string
  roomTypeId?: string
  roomName?: string
  dateFrom?: string
  dateTo?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  addons: Array<{ type: string; price: number }>
}

export interface NormalizeBookingResult {
  items: NormalizedBookingItem[]
  breakdown: PricingBreakdown
  actors: {
    resellerId: string | null
    subagentId: string | null
    bookedBy: string
  }
}

export interface BookingItemInput {
  itemType: string
  serviceId: string
  serviceName?: string
  roomTypeId?: string
  roomName?: string
  dateFrom?: string
  dateTo?: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
  addons?: Array<{ type: string; price: number }>
}

// ─── Pure Functions ──────────────────────────────────────────────

/**
 * Apply reseller commission as a markup on top of base price.
 * commissionPercent=10 means 10% markup → finalPrice = base × 1.10
 */
export function applyResellerMarkup(basePrice: number, commissionPercent: number): number {
  if (commissionPercent <= 0) return Math.round(basePrice)
  return Math.round((basePrice * (100 + commissionPercent)) / 100)
}

/**
 * Calculate subagent commission as monetary amount from net price.
 * Formula: Math.round(netAmount × commissionPercent / 100)
 */
export function calculateSubagentCommission(netAmount: number, commissionPercent: number): number {
  if (commissionPercent <= 0) return 0
  return Math.round((netAmount * commissionPercent) / 100)
}

/**
 * Calculate item total: (unitPrice × quantity) + addonsTotal
 */
export function calculateItemTotal(unitPrice: number, quantity: number, addonsTotal: number): number {
  return Math.round(unitPrice * Math.max(1, quantity) + addonsTotal)
}

/**
 * Compute full pricing breakdown from base totals and commission percentages.
 */
export function buildPricingBreakdown(params: {
  baseTotal: number
  addonsTotal: number
  resellerCommissionPercent: number
  subagentCommissionPercent: number
}): PricingBreakdown {
  const { baseTotal, addonsTotal, resellerCommissionPercent, subagentCommissionPercent } = params
  const subtotal = baseTotal + addonsTotal
  const markupPercent = resellerCommissionPercent
  const finalTotal = applyResellerMarkup(subtotal, resellerCommissionPercent)
  const markupAmt = finalTotal - subtotal
  const resellerCommissionAmt = markupAmt
  const subagentCommissionAmt = calculateSubagentCommission(baseTotal, subagentCommissionPercent)
  const netPrice = finalTotal - resellerCommissionAmt - subagentCommissionAmt

  return {
    baseTotal,
    addonsTotal,
    subtotal,
    markupPercent,
    markupAmt,
    finalTotal,
    subagentCommissionPercent,
    subagentCommissionAmt,
    resellerCommissionAmt,
    netPrice,
  }
}

/**
 * Validate that a client-sent totalPrice matches the server-calculated total.
 * Returns true if within acceptable tolerance (default: 100 COP for rounding).
 */
export function validatePriceIntegrity(
  clientTotal: number,
  serverTotal: number,
  tolerance: number = 100,
): boolean {
  return Math.abs(clientTotal - serverTotal) <= tolerance
}

/**
 * Validate add-ons against known valid types.
 * Unknown add-on types are rejected.
 * Accepts a Set of valid add-on type strings so callers can pass in the catalog.
 */
export function validateBookingAddons(
  addons: Array<{ type: string; price: number }>,
  validTypes?: Set<string>,
): { valid: boolean; unknown: string[] } {
  const unknown: string[] = []

  // Default valid types from extras-pricing catalog
  const known = validTypes ?? new Set([
    'travel-insurance',
    'airport-transfer',
    'photo-package',
    'breakfast',
    'late-checkout',
  ])

  for (const addon of addons) {
    if (!known.has(addon.type)) {
      unknown.push(addon.type)
    }
  }
  return { valid: unknown.length === 0, unknown }
}

/**
 * Centralized pricing utilities for the custom package builder (/paquetes/armar).
 * All price calculations MUST go through these functions — no inline math in JSX.
 *
 * ALL functions return integers (COP has no decimals). Every intermediate
 * calculation is rounded to prevent floating-point drift.
 */

// ─── Transport Pricing ────────────────────────────────────────

export interface TransportPricingInput {
  basePrice: number
  pricePerExtra: number
  adults: number
  children: number
}

/**
 * Calculate total transport cost: base price + (extra pax × pricePerExtra).
 * Returns integer (COP).
 */
export function calculateTransportPrice(input: TransportPricingInput): number {
  const totalPax = Math.max(1, Math.floor(input.adults) + Math.floor(input.children))
  const extraPax = Math.max(0, totalPax - 1)
  return Math.round(input.basePrice + extraPax * input.pricePerExtra)
}

// ─── Hotel Pricing ────────────────────────────────────────────

export interface HotelPricingInput {
  roomPrice: number
  nights: number
  rooms: number
}

/**
 * Calculate total hotel cost: room price × nights × number of rooms.
 * Returns integer (COP).
 */
export function calculateHotelPrice(input: HotelPricingInput): number {
  const safeNights = Math.max(1, Math.floor(input.nights))
  const safeRooms = Math.max(1, Math.floor(input.rooms))
  return Math.round(input.roomPrice * safeNights * safeRooms)
}

/**
 * Calculate number of nights between two dates (inclusive of checkout day logic).
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1
  const d1 = new Date(checkIn + 'T00:00:00')
  const d2 = new Date(checkOut + 'T00:00:00')
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1
  const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff)
}

// ─── Excursion Pricing ────────────────────────────────────────

export interface ExcursionPricingInput {
  basePrice: number
  childPrice: number
  adults: number
  children: number
}

/**
 * Calculate total excursion cost: (adults × base) + (children × childPrice).
 * Returns integer (COP).
 */
export function calculateExcursionPrice(input: ExcursionPricingInput): number {
  const effectiveChildPrice = input.childPrice > 0 ? input.childPrice : input.basePrice
  return Math.round(
    Math.floor(input.adults) * input.basePrice +
    Math.floor(input.children) * effectiveChildPrice
  )
}

// ─── Grand Total ──────────────────────────────────────────────

export interface PackageComponents {
  transport?: number | null
  hotel?: number | null
  excursion?: number | null
}

/**
 * Sum all selected component prices into a grand total.
 * Returns integer (COP).
 */
export function calculatePackageTotal(components: PackageComponents): number {
  return Math.round(
    (components.transport ?? 0) +
    (components.hotel ?? 0) +
    (components.excursion ?? 0)
  )
}

// ─── Reseller Markup ──────────────────────────────────────────

export interface ResellerMarkupInput {
  basePrice: number
  commissionPercent: number
}

/**
 * Apply reseller commission as a markup on top of base price.
 * commissionPercent=10 means 10% markup → finalPrice = base × 1.10
 * Returns integer (COP), always rounded.
 */
export function applyResellerMarkup(input: ResellerMarkupInput): number {
  if (input.commissionPercent <= 0) return Math.round(input.basePrice)
  // Use integer math to avoid floating-point: (base * (100 + pct)) / 100
  return Math.round((input.basePrice * (100 + input.commissionPercent)) / 100)
}

/**
 * Calculate the reseller's commission amount from a FINAL price (markup-included).
 * Returns integer (COP).
 */
export function calculateCommissionAmount(finalPrice: number, commissionPercent: number): number {
  if (commissionPercent <= 0) return 0
  // Reverse the markup: commission = final - (final * 100 / (100 + pct))
  const basePrice = Math.round((finalPrice * 100) / (100 + commissionPercent))
  return Math.round(finalPrice - basePrice)
}

/**
 * Get the net amount (what the platform keeps) after reseller commission.
 * Returns integer (COP).
 */
export function calculateNetAmount(finalPrice: number, commissionPercent: number): number {
  return Math.round(finalPrice - calculateCommissionAmount(finalPrice, commissionPercent))
}

/**
 * Calculate the base (cost) price from a final markup-included price.
 * This is the inverse of applyResellerMarkup — used by admin to show cost vs sale.
 * Returns integer (COP).
 */
export function reverseMarkup(finalPrice: number, commissionPercent: number): number {
  if (commissionPercent <= 0) return Math.round(finalPrice)
  return Math.round((finalPrice * 100) / (100 + commissionPercent))
}

/**
 * Validate that a client-sent totalPrice matches the server-calculated total.
 * Returns true if within acceptable tolerance (100 COP for rounding).
 */
export function validatePriceIntegrity(
  clientTotal: number,
  serverTotal: number,
  tolerance: number = 100,
): boolean {
  return Math.abs(clientTotal - serverTotal) <= tolerance
}

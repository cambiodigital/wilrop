/**
 * Centralized pricing utilities for the custom package builder (/paquetes/armar).
 * All price calculations MUST go through these functions — no inline math in JSX.
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
 */
export function calculateTransportPrice(input: TransportPricingInput): number {
  const totalPax = input.adults + input.children
  const extraPax = Math.max(0, totalPax - 1)
  return input.basePrice + extraPax * input.pricePerExtra
}

// ─── Hotel Pricing ────────────────────────────────────────────

export interface HotelPricingInput {
  roomPrice: number
  nights: number
  rooms: number
}

/**
 * Calculate total hotel cost: room price × nights × number of rooms.
 */
export function calculateHotelPrice(input: HotelPricingInput): number {
  const safeNights = Math.max(1, input.nights)
  const safeRooms = Math.max(1, input.rooms)
  return input.roomPrice * safeNights * safeRooms
}

/**
 * Calculate number of nights between two dates (inclusive of checkout day logic).
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 1
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
 */
export function calculateExcursionPrice(input: ExcursionPricingInput): number {
  const effectiveChildPrice = input.childPrice > 0 ? input.childPrice : input.basePrice
  return input.adults * input.basePrice + input.children * effectiveChildPrice
}

// ─── Grand Total ──────────────────────────────────────────────

export interface PackageComponents {
  transport?: number | null
  hotel?: number | null
  excursion?: number | null
}

/**
 * Sum all selected component prices into a grand total.
 */
export function calculatePackageTotal(components: PackageComponents): number {
  return (
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
 */
export function applyResellerMarkup(input: ResellerMarkupInput): number {
  if (input.commissionPercent <= 0) return input.basePrice
  const markup = input.basePrice * (input.commissionPercent / 100)
  return Math.round(input.basePrice + markup)
}

/**
 * Calculate the reseller's commission amount from a final price.
 */
export function calculateCommissionAmount(finalPrice: number, commissionPercent: number): number {
  if (commissionPercent <= 0) return 0
  return Math.round(finalPrice * (commissionPercent / 100))
}

/**
 * Get the net amount (what the platform keeps) after reseller commission.
 */
export function calculateNetAmount(finalPrice: number, commissionPercent: number): number {
  return finalPrice - calculateCommissionAmount(finalPrice, commissionPercent)
}

import { db } from '@/lib/db'
import { getAddonByType, calculateExtrasTotal } from '@/lib/extras-pricing'
import {
  validateBookingAddons,
  calculateItemTotal,
  buildPricingBreakdown,
  type NormalizeBookingContext,
  type NormalizeBookingResult,
  type BookingItemInput,
  type NormalizedBookingItem,
} from '@/lib/booking-pricing'

// ─── Service Price Resolution ────────────────────────────────────

async function getServicePrice(
  itemType: string,
  serviceId: string,
  roomTypeId?: string | null,
): Promise<{ unitPrice: number; serviceName: string; active: boolean }> {
  switch (itemType) {
    case 'hotel': {
      if (roomTypeId) {
        const rt = await db.roomType.findUnique({
          where: { id: roomTypeId },
          select: { basePrice: true, name: true, active: true },
        })
        if (rt && rt.active) return { unitPrice: rt.basePrice, serviceName: rt.name, active: true }
      }
      const hotel = await db.hotel.findUnique({
        where: { id: serviceId },
        select: { priceFrom: true, name: true, active: true },
      })
      if (!hotel || !hotel.active) return { unitPrice: 0, serviceName: '', active: false }
      return { unitPrice: hotel.priceFrom, serviceName: hotel.name, active: true }
    }

    case 'transport': {
      const ts = await db.transportService.findUnique({
        where: { id: serviceId },
        select: { basePrice: true, name: true, active: true },
      })
      if (!ts || !ts.active) return { unitPrice: 0, serviceName: '', active: false }
      return { unitPrice: ts.basePrice, serviceName: ts.name, active: true }
    }

    case 'excursion': {
      const ex = await db.excursion.findUnique({
        where: { id: serviceId },
        select: { basePrice: true, name: true, active: true },
      })
      if (!ex || !ex.active) return { unitPrice: 0, serviceName: '', active: false }
      return { unitPrice: ex.basePrice, serviceName: ex.name, active: true }
    }

    case 'package': {
      const pkg = await db.travelPackage.findUnique({
        where: { id: serviceId },
        select: { price: true, title: true, active: true },
      })
      if (!pkg || !pkg.active) return { unitPrice: 0, serviceName: '', active: false }
      return { unitPrice: pkg.price, serviceName: pkg.title, active: true }
    }

    case 'cruise': {
      if (roomTypeId) {
        const cabin = await db.cruiseCabin.findUnique({
          where: { id: roomTypeId },
          select: { basePrice: true, name: true, active: true },
        })
        if (cabin && cabin.active) return { unitPrice: cabin.basePrice, serviceName: cabin.name, active: true }
      }
      const cruise = await db.cruise.findUnique({
        where: { id: serviceId },
        select: { priceFrom: true, name: true, active: true },
      })
      if (!cruise || !cruise.active) return { unitPrice: 0, serviceName: '', active: false }
      return { unitPrice: cruise.priceFrom, serviceName: cruise.name, active: true }
    }

    default:
      return { unitPrice: 0, serviceName: '', active: false }
  }
}

// ─── Context Resolution ──────────────────────────────────────────

export async function resolveResellerContext(
  context: NormalizeBookingContext,
): Promise<{ resellerId: string | null; commissionPercent: number; bookedBy: string }> {
  // Priority: cookie > domain > query param
  let lookupCode: string | null = null

  if (context.cookieResellerCode) {
    lookupCode = context.cookieResellerCode
  } else if (context.domain) {
    const byDomain = await db.reseller.findUnique({
      where: { customDomain: context.domain },
      select: { id: true, code: true, active: true, approvalStatus: true, commission: true },
    })
    if (byDomain && byDomain.active && byDomain.approvalStatus === 'approved') {
      return { resellerId: byDomain.id, commissionPercent: byDomain.commission, bookedBy: 'custom-package' }
    }
    const bySubdomain = await db.reseller.findUnique({
      where: { subdomain: context.domain },
      select: { id: true, code: true, active: true, approvalStatus: true, commission: true },
    })
    if (bySubdomain && bySubdomain.active && bySubdomain.approvalStatus === 'approved') {
      return { resellerId: bySubdomain.id, commissionPercent: bySubdomain.commission, bookedBy: 'custom-package' }
    }
  }

  if (lookupCode || context.resellerCode) {
    const code = lookupCode || context.resellerCode!
    const reseller = await db.reseller.findUnique({
      where: { code },
      select: { id: true, active: true, approvalStatus: true, commission: true },
    })
    if (reseller && reseller.active && reseller.approvalStatus === 'approved') {
      return { resellerId: reseller.id, commissionPercent: reseller.commission, bookedBy: 'custom-package' }
    }
  }

  if (context.resellerId) {
    const reseller = await db.reseller.findUnique({
      where: { id: context.resellerId },
      select: { id: true, active: true, approvalStatus: true, commission: true },
    })
    if (reseller && reseller.active && reseller.approvalStatus === 'approved') {
      return { resellerId: reseller.id, commissionPercent: reseller.commission, bookedBy: 'custom-package' }
    }
  }

  return { resellerId: null, commissionPercent: 0, bookedBy: 'b2c' }
}

export async function resolveSubagentContext(subagentCode?: string | null): Promise<{
  subagentId: string | null
  commissionPercent: number
  bookedBy: string
}> {
  if (!subagentCode) return { subagentId: null, commissionPercent: 0, bookedBy: 'b2c' }

  const subagent = await db.subagent.findUnique({
    where: { code: subagentCode },
    select: { id: true, active: true, commission: true },
  })

  if (!subagent || !subagent.active) {
    return { subagentId: null, commissionPercent: 0, bookedBy: 'b2c' }
  }

  return { subagentId: subagent.id, commissionPercent: subagent.commission, bookedBy: 'b2b' }
}

// ─── Main: normalizeBookingItems ──────────────────────────────────

export async function normalizeBookingItems(
  items: BookingItemInput[],
  context: NormalizeBookingContext,
): Promise<NormalizeBookingResult> {
  const { subagentId, commissionPercent: subagentCommissionPercent } =
    await resolveSubagentContext(context.subagentCode)
  const { resellerId, commissionPercent: resellerCommissionPercent, bookedBy } =
    await resolveResellerContext(context)

  const normalizedItems: NormalizedBookingItem[] = []
  let baseTotal = 0
  let addonsTotal = 0

  for (const item of items) {
    const itemType = item.itemType
    const { unitPrice, serviceName, active } = await getServicePrice(
      itemType,
      item.serviceId,
      item.roomTypeId ?? null,
    )

    if (!active) {
      throw new Error(`Service not found or inactive: ${itemType}/${item.serviceId}`)
    }

    const itemAddons = item.addons ?? []
    const addonValidation = validateBookingAddons(itemAddons)
    if (!addonValidation.valid) {
      throw new Error(`Unknown add-ons: ${addonValidation.unknown.join(', ')}`)
    }

    const addonTypes = itemAddons.map((a) => a.type)
    const itemAddonsTotal = calculateExtrasTotal(addonTypes, 1)
    addonsTotal += itemAddonsTotal

    const quantity = item.quantity ?? 1
    const itemTotalPrice = calculateItemTotal(unitPrice, quantity, itemAddonsTotal)
    baseTotal += unitPrice * quantity

    normalizedItems.push({
      itemType,
      serviceId: item.serviceId,
      serviceName: item.serviceName || serviceName,
      roomTypeId: item.roomTypeId ?? undefined,
      roomName: item.roomName ?? undefined,
      dateFrom: item.dateFrom ?? undefined,
      dateTo: item.dateTo ?? undefined,
      quantity,
      unitPrice,
      totalPrice: itemTotalPrice,
      addons: itemAddons,
    })
  }

  const breakdown = buildPricingBreakdown({
    baseTotal,
    addonsTotal,
    resellerCommissionPercent,
    subagentCommissionPercent,
  })

  return {
    items: normalizedItems,
    breakdown,
    actors: {
      resellerId,
      subagentId,
      bookedBy: context.bookedBy || bookedBy,
    },
  }
}

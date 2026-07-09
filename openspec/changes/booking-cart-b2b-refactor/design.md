# Design: Booking Cart B2B Refactor

## Technical Approach

Move booking totals, actor resolution, add-on validation, reseller markup, and subagent commission into `src/lib/booking-pricing.ts`. `POST /api/public/booking` remains the orchestration boundary: validate body, pass request-derived context to the pricing engine, create `Booking`/`BookingItem`/`ResellerSale` in one Prisma transaction, then emit `booking.created` without blocking the response. Admin/reseller UIs consume enriched API payloads; heavy data shaping stays in `src/lib`, not React components.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Pricing source of truth | `normalizeBookingItems(items, context)` reads DB services and ignores client prices | Keep current reducer over client `totalPrice` | Prevents tampering and removes duplicate pricing math. |
| Prisma access | New libs import `db` from `@/lib/db` only | Import Prisma types/client directly | Preserves project rule: no Prisma imports outside `src/lib/db.ts`. |
| Commission storage | Add `Booking.subagentCommissionAmt Int @default(0)` and keep `commissionAmt` as reseller commission | Reuse `commissionAmt` for both | Current schema has only one commission field; storing both amounts requires a dedicated column. |
| Events | Singleton EventEmitter with async `setImmediate/queueMicrotask` dispatch | Inline notification calls in route | Keeps HTTP response fast and notification channels replaceable. |
| UI changes | Extend existing admin/reseller components but extract helpers/types if touched areas grow | Rewrite tables | Maintains compatibility while respecting thin-component direction. |

## Data Flow

```text
Request body + headers/cookies/query
  -> validateBookingInput
  -> resolveBookingContext(domain, reseller param, cookie, subagentCode)
  -> normalizeBookingItems
       -> Hotel/RoomType | TransportService | Excursion | TravelPackage | Cruise/Cabin
       -> add-ons via extras-pricing
       -> reseller markup -> subagent commission
  -> db.$transaction(Booking + Items + optional ResellerSale + allotment update)
  -> bookingEvents.emitAsync('booking.created')
  -> buildRecipients -> ConsoleChannel.send
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/lib/booking-pricing.ts` | Create | `normalizeBookingItems`, source service lookup, add-on normalization, reseller/subagent resolution, pricing breakdown. |
| `src/lib/booking-events.ts` | Create | Typed `booking.created` and `booking.status_changed` emitter with async fire-and-forget handlers. |
| `src/lib/booking-notifications.ts` | Create | Recipient builder and `NotificationChannel`/`ConsoleChannel`. |
| `src/app/api/public/booking/route.ts` | Modify | Delegate pricing, transaction creation, reseller context, event emission. |
| `src/lib/booking-validation.ts` | Modify | Accept legacy `itemType` and normalized `serviceType`; keep client prices optional/ignored. |
| `prisma/schema.prisma` + migration | Modify/Create | Add `Booking.subagentCommissionAmt Int @default(0)`. |
| `src/app/api/admin/bookings/route.ts` | Modify | Add `resellerId` filter and include `reseller` always. |
| `src/app/api/admin/bookings/[id]/route.ts` | Modify | Include `reseller`; emit `booking.status_changed` on status update. |
| `src/components/admin/AdminBookings.tsx` | Modify | Reseller column/filter/detail commission display; extract local types/helpers if needed. |
| `src/lib/reseller/sales.ts` | Modify | Include all booking items and avoid first-item-only service names. |
| `src/components/reseller/ResellerSaleList.tsx`, `ResellerSaleDetail.tsx` | Modify | Show item breakdown from sale payload. |

## Interfaces / Contracts

```ts
type BookingServiceType = 'hotel' | 'transport' | 'excursion' | 'package' | 'cruise'

interface NormalizeBookingContext {
  resellerId?: string | null
  resellerCode?: string | null
  subagentCode?: string | null
  domain?: string | null
  cookieResellerCode?: string | null
  bookedBy?: string
}

interface PricingBreakdown {
  baseTotal: number; addonsTotal: number; subtotal: number
  markupPercent: number; markupAmt: number; finalTotal: number
  subagentCommissionPercent: number; subagentCommissionAmt: number
  resellerCommissionAmt: number; netPrice: number
}
```

`normalizeBookingItems` returns `{ items, breakdown, actors: { resellerId, subagentId, bookedBy } }`. Hotel prices use `RoomType.basePrice` when `roomTypeId` exists, otherwise `Hotel.priceFrom`; transport uses `basePrice`; excursion uses adult/child pricing; package uses `price`; cruise uses `CruiseCabin.basePrice` when `roomTypeId`/cabin id exists, otherwise `Cruise.priceFrom`. Add-ons are re-priced through `getAddonByType` and `calculateExtrasTotal`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Pricing by item type, add-ons, reseller/subagent math | Add node:test cases near catalog tests or new booking-pricing test with mocked DB seams. |
| Integration | Public booking creates trusted totals and sale rows | Route-level test where feasible; otherwise transaction-focused lib test. |
| UI/manual | Admin filter/detail, reseller item breakdown | Manual browser/curl checklist plus `bun run build`. |

Run `bun run test:catalog`, `bun run lint`, `bunx tsc --noEmit`, `bun run build`.

## Migration / Rollout

Add a safe Prisma migration for `Booking.subagentCommissionAmt` with default `0`. Existing bookings remain valid. Roll out backend first; UI displays reseller/subagent fields only when present.

## Open Questions

- [ ] Provider recipient lookup is limited by current schema: hotels/excursions lack explicit provider contact fields, and transport provider contact fields must be confirmed before non-console channels.

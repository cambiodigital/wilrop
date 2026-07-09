# Proposal: Booking Cart & B2B Refactor

## Intent

Fix the monolithic booking flow to support multi-service carts with server-side price validation, dual-commission (reseller + subagent), a notification event layer, and admin-level reseller attribution visibility.

## Scope

### In Scope
- `src/lib/booking-pricing.ts` — centralized price normalization with DB-record validation, add-on summation, and commission calculation (reseller + subagent)
- `src/lib/booking-events.ts` + `src/lib/booking-notifications.ts` — event emitter and recipient resolver for booking lifecycle (console-only initially)
- Dual-commission: both reseller markup and subagent commission as monetary amounts per booking
- Admin table: reseller column, reseller filter, item-level detail in booking detail dialog
- ResellerSale auto-creation with full item breakdown (not just first item)
- Server-side reseller context resolution via domain + cookie + query param in booking API

### Out of Scope
- Email/WhatsApp/webhook channel implementation (architecture only)
- Payment model and payment status tracking
- Idempotency keys and deduplication
- Reseller-initiated booking panel (separate change)

## Capabilities

### New Capabilities
- `booking-pricing-normalization`: Server-side price validation against DB records, multi-item total calculation, dual-commission computation, add-on summation
- `booking-events-notifications`: Event emitter for booking lifecycle, recipient resolution by actor type (admin/reseller/subagent/provider), extensible channel architecture

### Modified Capabilities
- `booking-creation`: From single monolithic atomic create → validated multi-item flow with server-calculated totals, reseller context resolution, and dual-commission
- `admin-booking-visibility`: Add reseller column, reseller filter, per-item detail rendering

## Approach

Extract pricing from `POST /api/public/booking/route.ts` into `src/lib/booking-pricing.ts`. For each item, validate `unitPrice` against the actual service record (Hotel, Excursion, TransportService, Cruise cabin, TravelPackage). Sum validated prices, apply reseller markup from DB, compute subagent commission as percentage of net, return final booking totals. Add event emission at booking creation/status change. Fix AdminBookings table to show `reseller.companyName` column and filter.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/booking-pricing.ts` | New | Centralized pricing + validation |
| `src/lib/booking-events.ts` | New | Event emitter |
| `src/lib/booking-notifications.ts` | New | Recipient resolution |
| `src/app/api/public/booking/route.ts` | Modified | Delegate to pricing lib, add event emission, reseller context |
| `src/components/admin/AdminBookings.tsx` | Modified | Add reseller column + filter + item detail |
| `src/lib/booking-validation.ts` | Modified | Accept multi-item service type union |
| `src/lib/reseller/sales.ts` | Modified | ResellerSale item breakdown |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Price validation breaks existing bookings with mismatched DB prices | Medium | Log warnings, use DB price but don't reject; add `priceMismatch` flag |
| Dual-commission over-credits on subagent+reseller bookings | Low | Deduct subagent % from net after markup, not from gross |
| Reseller domain resolution conflicts with cookie context | Low | Cookie wins, domain is fallback |

## Rollback Plan

Revert `route.ts` to inline pricing with `calculateCommissionAmount`. Remove new lib files. Remove reseller column from AdminBookings. All changes isolated to named files — no schema migration, no data loss risk.

## Dependencies

- None external. Uses existing Prisma models: Booking, BookingItem, Reseller, Subagent, Hotel, Excursion, TransportService, Cruise.

## Success Criteria

- [ ] Multi-item booking creates correct totals with server-validated prices (not client-sent)
- [ ] Reseller markup AND subagent commission both computed as monetary amounts on same booking
- [ ] Admin table shows reseller column; filter by reseller works
- [ ] `bun run test:catalog` passes
- [ ] `bun run build` succeeds

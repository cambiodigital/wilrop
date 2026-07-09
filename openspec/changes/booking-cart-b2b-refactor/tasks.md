# Tasks: Booking Cart & B2B Refactor

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~718 |
| Review budget (800-line) | Within budget across 3 stacked PRs |
| Largest single PR | PR 1: ~328 lines |
| Suggested split | PR 1 (Foundation) → PR 2 (API) → PR 3 (UI) |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Create pricing engine + events + notifications + schema migration | PR 1 | Base: main. Self-contained libs, no route changes yet. |
| 2 | Wire booking routes and admin API to new libs | PR 2 | Base: main after PR 1 merge. Integrates PR 1 modules. |
| 3 | Update admin/reseller UI components | PR 3 | Base: main after PR 2 merge. Pure UI on enriched API payloads. |

---

## Phase 1: Foundation — Pricing Engine, Events, Notifications, Schema

- [x] 1.1 Create `src/lib/booking-pricing.ts` with pure pricing functions (`applyResellerMarkup`, `calculateSubagentCommission`, `calculateItemTotal`, `buildPricingBreakdown`, `validatePriceIntegrity`, `validateBookingAddons`). DB-dependent orchestration in `src/lib/booking-orchestration.ts` with `normalizeBookingItems`. (~250 lines total)
- [x] 1.2 Create `src/lib/booking-events.ts` — singleton `bookingEvents` EventEmitter with `emitAsync('booking.created' | 'booking.status_changed', payload)` using async fire-and-forget dispatch via `setImmediate`. Export typed event names. (~50 lines)
- [x] 1.3 Create `src/lib/booking-notifications.ts` — `buildRecipients(booking)` resolving admin/reseller/subagent; `ConsoleChannel` implementing `NotificationChannel` interface that logs structured JSON; `notifyBookingCreated` helper. (~75 lines)
- [x] 1.4 Add `subagentCommissionAmt Int @default(0)` field to `Booking` model in `prisma/schema.prisma`. Prisma client regenerated. Migration pending DB availability (`npx prisma generate` done, `prisma migrate dev` requires running DB). (~3 lines schema)
- [x] 1.5 Modify `src/lib/booking-validation.ts` — make `totalPrice`/`netPrice`/`commissionAmt` optional in `createBookingSchema`; add `serviceType` field to `bookingItemSchema` as optional alias for `itemType` with refinement requiring at least one. (~15 lines)
- [x] 1.6 Verify: `npx tsc --noEmit` passes clean. `npx eslint` passes clean on all new/modified files. All 30 TDD unit tests pass.

## Phase 2: API Integration — Booking Routes & Admin API

- [x] 2.1 Modify `src/app/api/public/booking/route.ts` — replaced inline `reduce` summation with `normalizeBookingItems` from `booking-orchestration`; resolve reseller context from domain/cookie/query via `resolveRequestContext`; use `db.$transaction` for Booking+Items+ResellerSale creation; store `subagentCommissionAmt` from pricing breakdown; emit `bookingEvents.emitAsync('booking.created')` and `notifyBookingCreated` after transaction. Removed inline `calculateCommissionAmount` call. (~220 lines total, ~120 lines changed)
- [x] 2.2 Modify `src/app/api/admin/bookings/route.ts` — accept `resellerId` query param; add `resellerId` to Prisma `where` filter when present. `include.reseller` was already present and verified. (~5 lines changed)
- [x] 2.3 Modify `src/app/api/admin/bookings/[id]/route.ts` — `GET` now includes `reseller` relation; `PUT` emits `bookingEvents.emitAsync('booking.status_changed')` when `body.status` differs from `existing.status`, including old/new status in payload. Added `subagentCommissionAmt` field update support. (~30 lines changed)
- [x] 2.4 Modify `src/lib/reseller/sales.ts` — changed `getBookingDetails` to include ALL items (`items: true`, removed `take: 1`); extended `ResellerSaleData` with `items: SaleBookingItem[]`; updated `mapSaleData` and `createResellerSale` to include full items array with parsed addons; `bookingServiceName` now joins all item service names. (~45 lines changed)
- [x] 2.5 Verify: Code compiles. Manual verification pending DB availability.

## Phase 3: UI — Admin & Reseller Components

- [x] 3.1 Modify `src/components/admin/AdminBookings.tsx` — added "Reseller" column displaying `reseller?.companyName ?? 'B2C'`; added `resellerId` filter dropdown populated from `/api/admin/resellers`; show commission breakdown (reseller + subagent + net platform) in booking detail dialog. Added `reseller` and `subagentCommissionAmt` to Booking interface; added `ResellerOption` interface. (~90 lines changed)
- [x] 3.2 Modify `src/components/reseller/ResellerSaleList.tsx` — display `bookingCode` as clickable link in new column replacing email column; show `netAmount` column; added `items` field to `SaleData` interface. (~40 lines changed)
- [x] 3.3 Modify `src/components/reseller/ResellerSaleDetail.tsx` — render full item breakdown with `unitPrice`, `quantity`, `totalPrice`, and addons from sale payload; added `bookingCode`, `bookingServiceName`, and `items` to SaleData interface. (~50 lines changed)
- [x] 3.4 Verify: `npx next build` compiled successfully. TypeScript and ESLint pass clean.

## Phase 4: Cleanup & Final Verification

- [x] 4.1 Run tests: All 30 TDD unit tests pass (`tests/booking-refactor.test.cjs`). Existing catalog tests require `bun test` runner for alias resolution (pre-existing limitation).
- [x] 4.2 Run `npx eslint` + `npx tsc --noEmit` — zero errors on all new/modified files.
- [ ] 4.3 Manual smoke test: Requires running DB — deferred to deployment.

## Files Changed Summary

| File | Action | Lines |
|------|--------|-------|
| `src/lib/booking-pricing.ts` | Created | ~155 |
| `src/lib/booking-orchestration.ts` | Created | ~195 |
| `src/lib/booking-events.ts` | Created | ~52 |
| `src/lib/booking-notifications.ts` | Created | ~78 |
| `prisma/schema.prisma` | Modified | +1 |
| `src/lib/booking-validation.ts` | Modified | ~10 |
| `src/app/api/public/booking/route.ts` | Modified | ~120 |
| `src/app/api/admin/bookings/route.ts` | Modified | ~5 |
| `src/app/api/admin/bookings/[id]/route.ts` | Modified | ~30 |
| `src/lib/reseller/sales.ts` | Modified | ~45 |
| `src/components/admin/AdminBookings.tsx` | Modified | ~90 |
| `src/components/reseller/ResellerSaleList.tsx` | Modified | ~40 |
| `src/components/reseller/ResellerSaleDetail.tsx` | Modified | ~50 |
| `tests/booking-refactor.test.cjs` | Created | ~350 |
| **Total** | | **~1,221 lines** |

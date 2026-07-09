# Delta for Booking Creation

## MODIFIED Requirements

### Requirement: Server-Side Price Normalization

`POST /api/public/booking` MUST delegate all pricing to the centralized
`booking-pricing` engine instead of summing client-sent `item.totalPrice`
inline. Only the `booking-pricing` lib SHALL resolve unit prices from DB
records, validate items, and compute totals.
(Previously: Server summed client-sent `item.totalPrice` values without
validating unit prices against DB source records.)

#### Scenario: Multi-item booking with DB prices

- GIVEN a request with 2 items: hotel "h1" and excursion "e1"
- AND client sends `unitPrice: 100` for "h1", but DB has 75000
- WHEN POST /api/public/booking processes the request
- THEN the system SHALL use 75000 from DB for "h1"
- AND SHALL reject if client-sent totals mismatch beyond tolerance

#### Scenario: Single-item booking still works

- GIVEN a request with 1 excursion item
- WHEN POST /api/public/booking processes the request
- THEN the system SHALL validate against the Excursion table
- AND SHALL use DB price regardless of client input

### Requirement: Reseller Context Resolution

ResellerId MUST be resolved from (1) authenticated session if reseller
panel, (2) custom domain for white-label, (3) query param or cookie for
public portal. Cookie SHALL take precedence over domain.
(Previously: ResellerId was only resolved from the request body field
`resellerId` — no domain or cookie-based resolution.)

#### Scenario: Cookie wins over domain

- GIVEN a request with `reseller=abc` cookie and host `reseller-a.wilrop.com`
- WHEN POST /api/public/booking resolves reseller context
- THEN the system SHALL use the cookie value "abc"

#### Scenario: Domain fallback

- GIVEN a request without reseller cookie but host `reseller-b.wilrop.com`
- WHEN reseller context resolves
- THEN the system SHALL look up Reseller by `customDomain` matching the host

### Requirement: Dual-Commission Support

Reseller markup MUST be applied to the base total first, then subagent
commission SHALL be calculated as `Math.round(netAmount ×
subagentCommissionPercent / 100)`. Both amounts SHALL be stored as
monetary fields on the booking.
(Previously: Only reseller commission was computed; subagent commission
existed only as a percentage field on the Subagent model with no monetary
computation at booking time.)

#### Scenario: Booking with both reseller and subagent

- GIVEN base total 200000, reseller commission 10%, subagent.code="sa1" with commission 5%
- WHEN booking is created
- THEN finalTotal SHALL be 220000
- AND commissionAmt (reseller) SHALL be 20000
- AND subagentCommissionAmt SHALL be `Math.round(200000 × 0.05) = 10000`

### Requirement: ResellerSale Auto-Creation with Item Breakdown

When a resellerId is present, a ResellerSale MUST be auto-created with
all BookingItems in the sale breakdown, not just the first item.
(Previously: ResellerSale was created with only aggregate totals; item
detail showed only `items: { take: 1 }` — the first BookingItem.)

#### Scenario: Sale includes all items

- GIVEN booking with 3 items (hotel, transport, excursion) and a reseller
- WHEN the booking is created
- THEN the ResellerSale SHALL include a breakdown of all 3 BookingItems

### Requirement: Event Emission on Booking Creation

Booking creation MUST emit `booking.created` event via the events layer
after the booking and ResellerSale are persisted.
(Previously: No event emission existed in the booking flow.)

#### Scenario: Event emitted after creation

- GIVEN POST /api/public/booking succeeds
- WHEN the booking + sale records are committed
- THEN the system SHALL emit `booking.created` with booking code, items, totals, and actor IDs

### Requirement: Event Emission on Status Change

Booking status changes MUST emit `booking.status_changed` event with old
and new status values.
(Previously: Status changes had no event emission.)

#### Scenario: Status change event

- GIVEN booking "WIL-2026-000001" in status "pending"
- WHEN admin changes status to "confirmed"
- THEN the system SHALL emit `booking.status_changed` with oldStatus="pending" and newStatus="confirmed"

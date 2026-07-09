# Delta for Admin Booking Visibility

## MODIFIED Requirements

### Requirement: Reseller Column in Admin Table

The admin bookings table MUST display a reseller column showing the
reseller's `companyName` or the text "B2C" when no reseller is associated
with the booking.
(Previously: The table had no reseller column — only subagent was shown.)

#### Scenario: Booking with reseller

- GIVEN a booking with `resellerId` linked to Reseller "Viajes del Sol"
- WHEN the admin bookings table renders
- THEN the reseller column SHALL display "Viajes del Sol"

#### Scenario: B2C booking

- GIVEN a booking with `resellerId: null`
- WHEN the admin bookings table renders
- THEN the reseller column SHALL display "B2C"

### Requirement: Commission Breakdown in Detail Dialog

The admin booking detail dialog MUST show the full commission breakdown:
reseller commission amount, subagent commission amount, and net platform
revenue.
(Previously: Detail dialog showed total/net/margin but did not
differentiate reseller vs subagent commissions.)

#### Scenario: Dual-commission booking detail

- GIVEN booking with reseller commission 20000 and subagent commission 10000
- WHEN admin opens the booking detail dialog
- THEN the pricing section SHALL display reseller commission 20000, subagent commission 10000, and net 200000

### Requirement: Reseller Filter

Admin MUST be able to filter bookings by reseller. The filter SHALL be a
dropdown listing all active resellers by `companyName`.
(Previously: Filters only included search text and status — no reseller
filter existed.)

#### Scenario: Filter by reseller

- GIVEN 10 bookings from "Viajes del Sol" and 5 from "Turismo Aventura"
- WHEN admin selects "Viajes del Sol" in the reseller filter
- THEN only the 10 bookings from "Viajes del Sol" SHALL be displayed

### Requirement: Full BookingItem Detail

The admin booking detail MUST show all BookingItems with individual
`unitPrice`, `quantity`, `totalPrice`, and `addons` — no truncation.
(Previously: Items were already shown in detail — this requirement
ensures the new multi-item validation results are fully visible.)

#### Scenario: Multi-item booking detail

- GIVEN booking with hotel item (unitPrice=75000, qty=2, totalPrice=150000) and excursion item (unitPrice=50000, qty=1, totalPrice=50000)
- WHEN admin views the booking detail
- THEN both items SHALL display with their individual pricing
- AND add-ons like "breakfast" SHALL be listed per item

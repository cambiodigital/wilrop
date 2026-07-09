# Delta for Subagent Commission

## MODIFIED Requirements

### Requirement: Monetary Subagent Commission Calculation

Subagent commission MUST be calculated as a monetary amount during
booking creation when a subagent is associated. The system SHALL store
this amount on the booking record.
(Previously: Subagent commission existed only as a percentage field on
the Subagent model (`commission: Int`). No monetary commission was
computed or stored at booking time. The `commissionAmt` field on Booking
was used exclusively for reseller commission.)

#### Scenario: Booking with subagent computes monetary commission

- GIVEN subagent "sa1" with `commission: 5` (5%)
- AND booking netAmount is 200000
- WHEN the booking is created
- THEN the system SHALL compute `subagentCommissionAmt = Math.round(200000 × 5 / 100) = 10000`
- AND SHALL store 10000 on the booking record

#### Scenario: Booking without subagent

- GIVEN a B2C booking with no subagentCode
- WHEN the booking is created
- THEN subagentCommissionAmt SHALL be 0 or null

### Requirement: Subagent Commission Formula

The subagent commission formula MUST be: `subagentCommissionAmt =
Math.round(netAmount × subagentCommissionPercent / 100)`. Rounding SHALL
use standard `Math.round` (COP, no decimals).
(Previously: No formula existed — subagent commission was never computed
as a monetary value.)

#### Scenario: Rounding boundary case

- GIVEN netAmount=199999 and subagentCommissionPercent=5
- WHEN commission is calculated
- THEN `Math.round(199999 × 5 / 100) = Math.round(9999.95) = 10000`

### Requirement: Subagent Panel Commission Visibility

The subagent panel MUST display `commissionAmt` for bookings where the
subagent is the assigned subagent.
(Previously: Subagent commission was shown only as a percentage in the
admin panel detail dialog. Subagent panel had no commission display.)

#### Scenario: Subagent views their booking commission

- GIVEN subagent "sa1" has a booking with subagentCommissionAmt=10000
- WHEN the subagent logs into their panel and views the booking
- THEN the booking SHALL display "Comisión: $10,000 COP"

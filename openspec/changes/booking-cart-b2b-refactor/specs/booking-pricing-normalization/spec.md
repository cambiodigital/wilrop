# Booking Pricing Normalization

## Purpose

Server-side pricing engine. Validates every booking item against its source
service record, enforces DB-authoritative unit prices, computes multi-item
totals with add-ons, and applies dual-commission rules. Runs on every booking
creation at `POST /api/public/booking`.

## Requirements

### Requirement: Item Source-Record Validation

Each booking item MUST be validated against its source service table
(Hotel, TransportService, Excursion, TravelPackage, Cruise) by
`serviceId`. The system SHALL reject items whose source record does not
exist or is inactive.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Hotel exists | item `{itemType:"hotel", serviceId:"h1"}` | engine validates | SHALL query Hotel for "h1" and accept if active |
| Unknown service | `{itemType:"unknown", serviceId:"x"}` | engine validates | SHALL reject with "unsupported service type" |

### Requirement: DB-Authoritative Unit Prices

Unit prices MUST come from the database record, NOT from client input. The
system SHALL ignore client-sent `unitPrice` and SHALL resolve the
authoritative price from the source record.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Client sends wrong price | client: `unitPrice: 50000`, DB hotel: `pricePerNight: 75000` | price resolution | SHALL use 75000, ignore 50000 |

### Requirement: Multi-Item Total Calculation

The booking total MUST be the sum of all validated item totals. Each
item's total SHALL be `(unitPrice × quantity) + validated add-ons`.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Hotel + excursion + add-on | hotel (75000×2) + breakfast add-on (15000) + excursion (50000×1) | totals computed | hotel item = 165000, booking total = 215000 |

### Requirement: Add-on Validation

Add-ons MUST be validated against extras-pricing definitions or
service-specific add-on configs. Unknown add-ons SHALL be rejected.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Valid add-on | `{type:"breakfast", price:15000}` in extras catalog | validation runs | SHALL accept and include in item total |
| Unknown add-on | `{type:"fake", price:1}` not in catalog | validation runs | SHALL reject with error |

### Requirement: Dual-Commission Calculation

Commission MUST support reseller markup (applied to base total) and
subagent commission (percentage of net). Both SHALL be monetary amounts.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Dual-commission | base=200000, reseller=10%, subagent=5% | commissions computed | final=round(200000×1.10)=220000, resellerComm=20000, subagentComm=round(200000×0.05)=10000 |
| Reseller only | base=100000, reseller=15% | commissions computed | final=115000, resellerComm=15000, subagentComm=0 |
| No commissions | base=100000, no reseller, no subagent | commissions computed | final=100000, both commissions=0 |

### Requirement: Price Integrity Check

`validatePriceIntegrity` MUST run on every booking creation. If
client-sent total differs from server-calculated total beyond tolerance,
the system SHALL log a warning and proceed with server values.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Mismatch within tolerance | client=200050, server=200000, tol=100 | check runs | SHALL accept, no warning |
| Mismatch beyond tolerance | client=250000, server=265000, tol=100 | check runs | SHALL log warning, use 265000 as truth |

### Requirement: Service-Type Combinability

The engine MUST support any combination of service types: solo hotel,
solo transport, solo excursion, solo package, solo cruise, and all mixed
combinations. Future service types SHALL be supported without changing
the core validation logic.

### Requirement: BookingItem Preservation

Each BookingItem persisted to the database MUST include: `serviceType`,
`serviceId`, `serviceName`, `unitPrice` (from DB), `quantity`, `totalPrice`,
and `addons` as a valid JSON object.

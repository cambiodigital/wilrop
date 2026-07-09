# Delta for Reseller Sales Visibility

## MODIFIED Requirements

### Requirement: Full BookingItem Breakdown per Sale

The reseller sales view MUST fetch and display all BookingItems for each
sale, not just the first item.
(Previously: `getBookingDetails` used `items: { take: 1 }`, and
`ResellerSaleData.bookingServiceName` reflected only the first
BookingItem's `serviceName`.)

#### Scenario: Multi-item sale with full breakdown

- GIVEN a ResellerSale linked to a booking with 3 items: hotel, transport, excursion
- WHEN the reseller views their sales list
- THEN the sale SHALL display all 3 service names
- AND each item's `totalPrice` SHALL be individually visible

#### Scenario: Single-item sale still shows item

- GIVEN a ResellerSale linked to a booking with 1 hotel item
- WHEN the reseller views their sales list
- THEN the sale SHALL display the hotel service name (no regression)

### Requirement: Net Amount and Commission per Sale

The reseller sales view MUST show `netAmount` and `commissionAmt` for
each sale record.
(Previously: `netAmount` and `commissionAmt` fields existed on
`ResellerSaleData` but were not consistently displayed in the reseller
panel UI.)

#### Scenario: Sale displays financial breakdown

- GIVEN a ResellerSale with totalAmount=220000, commissionAmt=20000, netAmount=200000
- WHEN the reseller views their sales list
- THEN each sale row SHALL display totalAmount, commissionAmt, and netAmount

### Requirement: Booking Code Link

Each sale MUST display the linked `bookingCode` and the code SHALL be
clickable to navigate to the sale detail.
(Previously: `bookingCode` was part of `ResellerSaleData` but not
prominently displayed as a navigable link.)

#### Scenario: Booking code navigation

- GIVEN a ResellerSale with bookingCode "WIL-2026-000042"
- WHEN the reseller views their sales list
- THEN "WIL-2026-000042" SHALL be displayed and clickable
- AND clicking it SHALL navigate to the sale detail view

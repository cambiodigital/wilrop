# Booking Events & Notifications

## Purpose

Event-driven notification layer for the booking lifecycle. Decouples event
emission from HTTP request handling, resolves recipients by actor type, and
provides an extensible channel architecture for future delivery methods.

## Requirements

### Requirement: Booking Lifecycle Events

The system MUST emit events on `booking.created` (creation),
`booking.status_changed` (status transition), and SHALL support future
`booking.payment_*` events without refactoring the emitter core.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Creation event | a booking is created via POST /api/public/booking | creation succeeds | system SHALL emit `booking.created` event |
| Status change event | admin changes status from "pending" to "confirmed" | PUT succeeds | system SHALL emit `booking.status_changed` with old and new status |

### Requirement: Async Decoupling

Event emission MUST be decoupled from the HTTP request lifecycle. The
emitter SHALL operate asynchronously and SHALL NOT block or delay the
API response.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Non-blocking emission | event handler takes 500ms to resolve recipients | booking POST completes | API response SHALL return in under 100ms regardless of emission time |

### Requirement: Recipient Resolution

The notification builder MUST resolve recipients: admin always, reseller
when `booking.resellerId` is present, subagent when `booking.subagentId`
is present. Service-provider recipients SHALL be included when contact
data exists on the source service record.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| All actors present | booking has resellerId + subagentId + service with contact | event emitted | recipients SHALL include admin, reseller, subagent, and provider |
| B2C booking | no resellerId, no subagentId | event emitted | recipients SHALL include only admin |

### Requirement: Console Logging (Initial Implementation)

The initial implementation MUST log events as structured JSON to
`console`. No external services or delivery channels SHALL be required.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| Event logged | `booking.created` event emitted | console handler processes | SHALL output `{"event":"booking.created","code":"WIL-2026-000001","total":265000,...}` |

### Requirement: Extensible Channel Architecture

The channel abstraction MUST support future email, WhatsApp, and webhook
channels without modifying the booking API or event emitter. Channels
SHALL be registered via a pluggable handler interface.

| Scenario | GIVEN | WHEN | THEN |
|---|---|---|---|
| New channel added | a webhook channel handler is registered | event is emitted | SHALL dispatch to webhook alongside existing channels without emitter changes |

### Requirement: Event Payload Contract

Every event MUST include: `event` (type string), `bookingCode`,
`itemsSummary` (array of `{type, name, total}`), `total`, `net`,
`commission`, `actorIds` (reseller, subagent if present), and `timestamp`
(ISO 8601).

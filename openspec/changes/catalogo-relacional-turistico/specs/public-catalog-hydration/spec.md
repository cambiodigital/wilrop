# Public Catalog Hydration Specification

## Purpose

Define public home, destination, hotel, package, excursion, transport, search, filter, featured, CTA, and booking hydration from relational catalog data while preserving Spanish routes, public slugs, static/legacy fallback, and historical booking integrity.

## Requirements

### Requirement: Relational public hydration

The public portal MUST hydrate home, destination detail, hotels, packages, excursions, transport, featured sections, filters, search, and CTAs through catalog relations when available, with legacy/static fallback only during migration.

#### Scenario: Home renders featured catalog

- GIVEN featured relational catalog items exist
- WHEN the public home page loads
- THEN destinations, hotels, packages, excursions, transport highlights, CTAs, images, slugs, prices, and featured ordering come from relational sources or catalog cache
- AND static fallback is used only when relational data is unavailable

#### Scenario: Destination page resolves slug

- GIVEN a user opens a Spanish destination route by slug
- WHEN destination data is loaded
- THEN the slug resolves to the destination relation identity server-side
- AND related hotels, packages, excursions, transport, content, filters, and CTAs are returned without exposing CUIDs as public URLs

### Requirement: Public product detail hydration

The system MUST hydrate hotel, package, excursion, and transport detail pages from relations while preserving booking payload compatibility and legacy display fields during transition.

#### Scenario: Package detail supports booking CTA

- GIVEN a package has destination, hotel, room type, excursion, transport, departure date, base price, commission, content, and CTA relations
- WHEN the package detail page renders
- THEN the page displays related composition and can start booking with compatible payload data
- AND legacy includes/departure/date snapshots remain usable if relation rows are incomplete

#### Scenario: Hotel detail supports room selection

- GIVEN hotel room types and allotments exist relationally
- WHEN a user selects hotel lodging
- THEN selectable rooms, prices, capacity, and availability come from room/allotment relations
- AND legacy `Hotel.rooms` is treated only as display fallback until synchronized

### Requirement: Public filters and search

The public portal MUST accept slug-based filters and search terms, resolve them to relation identities server-side, and support legacy IDs during migration.

#### Scenario: Destination filter is slug-compatible

- GIVEN a user filters hotels, packages, excursions, or transport by destination slug
- WHEN the public API applies the filter
- THEN matching items are selected through destination relations
- AND legacy string IDs are supported only as transition compatibility

#### Scenario: Search combines relation and cached fields

- GIVEN a user searches by destination, title, category, route, provider, hotel, package, excursion, or transport terms
- WHEN search runs
- THEN results are matched against related source/cached display fields
- AND inactive or unauthorized public items are excluded

### Requirement: Booking source and snapshot integrity

Public booking MUST validate current source relations at booking time and store snapshots for historical readability. The system MUST NOT rewrite old bookings from live mutable product records.

#### Scenario: Booking stores selected product snapshot

- GIVEN a user books a hotel, package, excursion, or transport item from relational public data
- WHEN booking is confirmed
- THEN source type/id, display name, room/date/service selection, unit price, totals, and relevant destination/route text are snapshotted
- AND later catalog edits do not change the historical booking display

#### Scenario: Source becomes unavailable before booking

- GIVEN a public item was listed but becomes inactive, unavailable, or capacity-constrained
- WHEN the user attempts to confirm booking
- THEN booking validation rejects the stale selection with a recoverable error
- AND no orphan booking item is created

### Requirement: Public validation coverage

The system MUST verify public hydration, slug filters, search, CTAs, featured content, availability, fallback behavior, and booking snapshots using available build/type/lint checks plus API/manual smoke checks until automated tests exist.

#### Scenario: Public migration smoke passes

- GIVEN relational data is partially backfilled
- WHEN home, destinations, hotels, packages, excursions, transport, filters, search, and booking flows are smoke-tested
- THEN each route renders without public slug regressions
- AND fallback usage and unresolved data are documented

# Tourism Catalog Relations Specification

## Purpose

Define the relational source of truth for WILROP destinations, hotels, packages, excursions, transport services, room inventory, prices, availability, and compatibility snapshots without deleting legacy fields or changing `isTemplate` fallback behavior.

## Requirements

### Requirement: Destination relational catalog

The system MUST relate each destination to its visible hotels, packages, excursions, transport services, public content, and admin/reseller visibility using stable relations while preserving slug-based public identity and legacy display snapshots.

#### Scenario: Destination detail aggregates related catalog

- GIVEN an active destination with related active catalog entities
- WHEN the destination detail is requested by slug
- THEN hotels, packages, excursions, transport services, featured flags, ordering, and public content are returned from relations
- AND legacy destination/city names remain available as snapshots during migration

#### Scenario: Destination relation is unresolved

- GIVEN a legacy row cannot be matched by slug, id, or normalized name
- WHEN relation backfill is validated
- THEN the row is reported as unresolved
- AND no guessed relation is created

### Requirement: Hotel relational catalog

The system MUST connect hotels to destination(s), packages, room types, allotments, availability, prices, public content, and reseller catalog exposure through relations. `RoomType` and allotment data SHALL be authoritative for availability and package lodging; `Hotel.rooms` MAY remain as display cache until synchronized.

#### Scenario: Hotel exposes room inventory

- GIVEN a hotel has room types and allotments
- WHEN hotel availability or package lodging options are requested
- THEN room types, prices, occupancy, and allotment availability come from relational records
- AND cached legacy room JSON is not treated as the booking source of truth

#### Scenario: Hotel keeps migration compatibility

- GIVEN hotel legacy `cityId`, `cityName`, or room JSON exists
- WHEN hotel data is served during migration
- THEN those fields remain readable as snapshots/cache
- AND no requirement deletes them in this change

### Requirement: Package composition relations

The system MUST relate each package to a primary destination, optional additional destinations, hotels, room types, excursions, transport services, departure dates, itinerary/content, base prices, commission fields, and reseller catalog eligibility.

#### Scenario: Package detail hydrates full composition

- GIVEN a package has relational hotel, room type, excursion, transport, date, price, commission, and content rows
- WHEN package detail is requested
- THEN the response includes those related items with ordering and public visibility
- AND legacy `destinationName`, `includes`, and departure snapshots remain compatible

#### Scenario: Package relation violates compatibility

- GIVEN a package references an inactive, missing, template-incompatible, or unauthorized related entity
- WHEN the package relation is saved or validated
- THEN the system rejects or flags the relation with a testable validation error
- AND no orphan reference is accepted

### Requirement: Excursion and transport relations

The system MUST connect excursions to destination/city-zone, packages, category, prices, availability, and reseller catalog visibility; transport services MUST connect to provider, origin, destination, route, package, city-zone, service type, price, capacity, and reseller catalog visibility.

#### Scenario: Excursion filtering uses relations

- GIVEN excursions belong to destination or city-zone relations
- WHEN public, admin, or reseller users filter by destination
- THEN matching excursions are selected through relations rather than string-only city matching
- AND category, price, availability, and package inclusion are returned when visible

#### Scenario: Transport route is relational and display-safe

- GIVEN a transport service has provider, origin, destination, service type, capacity, price, and route display snapshots
- WHEN transport is listed or attached to a package
- THEN relational provider/location/package references are validated
- AND route text remains available for public display during migration

### Requirement: Migration and template safety

The system MUST add nullable relations first, preserve `isTemplate`, preserve public slugs, classify duplicate fields as source/snapshot/cache/legacy, detect duplicate relation rows, validate rollback, and defer destructive cleanup.

#### Scenario: Safe backfill

- GIVEN legacy rows contain slug, CUID, name, template, and duplicate field data
- WHEN migration/backfill runs in validation or dry-run mode
- THEN matches are deterministic, duplicate relations are skipped or reported, unresolved rows are listed, and `isTemplate` is unchanged

#### Scenario: Rollback preserves legacy behavior

- GIVEN relation rows or catalog cache rows were generated additively
- WHEN rollback is requested for this change
- THEN generated relation/cache rows can be removed without deleting legacy fields, snapshots, bookings, or public slugs

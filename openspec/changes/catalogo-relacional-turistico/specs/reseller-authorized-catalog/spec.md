# Reseller Authorized Catalog Specification

## Purpose

Define reseller and subagent access to authorized real catalog items with customization, commission, sale/booking snapshots, and source integrity while preventing master-data edits.

## Requirements

### Requirement: Authorized reseller catalog source

The system MUST let reseller users browse and add only authorized catalog items backed by typed source records or a compatible catalog-item resolver. The bridge `sourceType/sourceId` MAY remain during migration, but no new orphan source references SHALL be accepted.

#### Scenario: Reseller browses authorized products

- GIVEN active non-template catalog items exist for destinations, hotels, packages, excursions, or transport services
- WHEN a reseller browses available products by destination, type, price, commission, or search
- THEN only authorized compatible products are returned
- AND each item carries source identity, public display data, price, commission, and visibility status

#### Scenario: Source record is missing or inactive

- GIVEN a reseller catalog row points to a missing, inactive, unauthorized, or unresolved source
- WHEN the catalog is read or validated
- THEN the item is flagged or hidden according to policy
- AND sale creation from that broken source is blocked

### Requirement: Reseller customization boundaries

The system MUST allow reseller customization only on reseller-owned catalog rows: title, description, image, price override, visibility, and commission override where policy permits. Resellers MUST NOT edit master destination, hotel, package, excursion, transport, room, price, allotment, or provider data.

#### Scenario: Reseller customizes own listing

- GIVEN a reseller owns a catalog row for a source package, hotel, excursion, or transport service
- WHEN the reseller updates presentation or allowed commercial overrides
- THEN only the reseller catalog row changes
- AND master catalog records remain unchanged

#### Scenario: Reseller attempts master-data edit

- GIVEN a reseller request includes fields outside allowed customization
- WHEN the request is validated
- THEN the system rejects the forbidden fields
- AND no source catalog entity is modified

### Requirement: Sales and booking snapshots

The system MUST snapshot source identity, source type/id, selected destination, hotel, room type, package, excursion, transport, departure date, service options, unit price, net price, commission, reseller overrides, and customer-facing display text at sale/booking time.

#### Scenario: Booking preserves historical product data

- GIVEN a reseller sells a package with related hotel room, excursion, transport, date, price, and commission data
- WHEN a sale or booking is created
- THEN the booking stores immutable snapshots of selected product data and commercial terms
- AND later source catalog edits do not rewrite historical booking meaning

#### Scenario: Snapshot uses current valid source

- GIVEN the live source is available but reseller overrides exist
- WHEN the booking snapshot is generated
- THEN source identity and reseller overrides are both recorded
- AND the snapshot remains readable if the source is later archived

### Requirement: Catalog visibility and template policy

The reseller catalog MUST respect active status, authorization, destination visibility, and current non-template default behavior unless a later product decision changes it.

#### Scenario: Template-only catalog state

- GIVEN only template products exist for a catalog type
- WHEN reseller availability is evaluated
- THEN behavior is explicit and compatible with current policy
- AND any empty catalog state is presented as a valid state, not a data error

#### Scenario: Visibility override hides reseller item

- GIVEN a reseller marks an owned item hidden
- WHEN reseller storefront or booking options are listed
- THEN the item is excluded from sellable results
- AND the source catalog item remains unaffected

### Requirement: Reseller validation coverage

The system MUST verify authorized filtering, customization boundaries, source integrity, snapshot creation, and historical readability through automated tests when available or documented manual/API checks otherwise.

#### Scenario: Snapshot regression is checked

- GIVEN a booking was created from a reseller catalog item
- WHEN source data changes after booking
- THEN validation proves the booking still displays the original snapshot
- AND no live relation is required to understand historical sale details

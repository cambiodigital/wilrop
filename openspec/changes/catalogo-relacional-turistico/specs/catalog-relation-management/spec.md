# Catalog Relation Management Specification

## Purpose

Define admin UX and API behavior for creating, selecting, validating, and maintaining catalog relations without manual IDs, orphan references, or template regressions.

## Requirements

### Requirement: Relation option endpoints

The system MUST provide admin option endpoints for destinations, hotels, room types, excursions, transport services, and catalog items. Option payloads SHALL expose stable id/slug/label/subtitle/active/`isTemplate`/source-type data sufficient for selectors and validation.

#### Scenario: Selector loads valid options

- GIVEN an admin opens a relation selector in package, hotel, excursion, or transport management
- WHEN the selector requests options with active, template, destination, type, role, or search filters
- THEN the endpoint returns only compatible options with stable labels
- AND the admin is not required to type a raw ID

#### Scenario: Option endpoint has no results

- GIVEN no compatible options exist for the current filter
- WHEN the selector loads options
- THEN the UI shows an empty state with a create-missing-entity action when permitted
- AND it does not save a blank or fabricated relation

### Requirement: Relation management endpoints

The system MUST provide relation-management endpoints for packages, hotels, excursions, transport services, and reseller catalog customization. These endpoints SHALL validate ownership, entity existence, active/template compatibility, duplicate rows, and no-orphan-reference guarantees.

#### Scenario: Package relations are updated atomically

- GIVEN an admin submits package destinations, hotels, room types, excursions, transport, departure dates, included services, base prices, commission, and content metadata
- WHEN the relation update is accepted
- THEN the package relation set is stored consistently
- AND invalid or orphan references are rejected with field-level errors

#### Scenario: Relation update preserves snapshots

- GIVEN a relation update changes a package, hotel, excursion, or transport link
- WHEN legacy snapshot fields already exist
- THEN the endpoint preserves required snapshots/cache fields for compatibility
- AND does not require deleting legacy fields in this change

### Requirement: Admin selector UX

The admin interface MUST replace manual relation IDs with selectors and create-missing flows while keeping loading, empty, error, retry, disabled, and stale-data states visible and testable.

#### Scenario: Create missing entity from selector

- GIVEN an admin cannot find the needed destination, hotel, excursion, transport service, or room type
- WHEN the admin uses the create-missing action and creation succeeds
- THEN the new entity appears as the selected option
- AND the relation form can be saved without manual ID entry

#### Scenario: Selector request fails

- GIVEN an option endpoint returns an error or times out
- WHEN the selector renders
- THEN the UI shows a recoverable error and retry action
- AND saving the relation is blocked until a valid selection exists

### Requirement: Template and visibility compatibility

The system MUST preserve existing `isTemplate` behavior for admin and public lists. Admin relation tools SHOULD make template status visible and MUST prevent accidental template-to-real semantic changes.

#### Scenario: Template option is visible by policy

- GIVEN a selector includes templates by explicit filter or fallback policy
- WHEN options are displayed
- THEN template status is visible to the admin
- AND selecting it does not alter source `isTemplate` state

#### Scenario: Non-template catalog exists

- GIVEN existing behavior hides templates after real records exist for that type
- WHEN relation options are requested without an include-template override
- THEN the endpoint preserves that fallback behavior
- AND this change does not redefine template policy

### Requirement: Validation and testing expectations

The system MUST define verifiable checks for relation APIs, selector states, validation errors, migration compatibility, and no orphan references.

#### Scenario: Required checks are run

- GIVEN this change is verified
- WHEN validation is performed
- THEN Prisma validation/status/generation, TypeScript, lint, build, and available manual/API smoke checks are reported
- AND missing automated coverage is documented rather than implied

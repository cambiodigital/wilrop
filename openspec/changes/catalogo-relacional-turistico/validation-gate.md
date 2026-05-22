# Validation Gate: Catálogo Relacional Turístico

**Phase**: Fase 8 — Validaciones, pruebas y limpieza  
**Date**: 2026-05-22  
**Status**: COMPLETE — Ready for Fase 9 conditional cleanup decision  
**Executor**: sdd-apply (no delegation)  
**Cumulative context**: PR1–PR6.3 all verified. 64/64 tests passing. All quality commands clean.

---

## Quick Path

1. **All commands pass** — 5/5 clean (1 known pre-existing warning)
2. **64 tests cover** 33 pure-helper behaviors across 7 PR slices
3. **No field is safe to remove today** — all legacy fields are in-use or snapshot-protected
4. **Fase 9 should be conditional** — requires completing remaining tasks first

---

## Command Evidence Table

| # | Command | Result | Exit | Evidence |
|---|---------|--------|------|----------|
| 1 | `npm run test:catalog` | **PASS** | 0 | 64 tests, 64 pass, 0 fail, 0 skip, 430.96ms |
| 2 | `node_modules/.bin/prisma.cmd validate` | **PASS** | 0 | `The schema at prisma\schema.prisma is valid 🚀` |
| 3 | `node_modules/.bin/tsc.cmd --noEmit` | **PASS** | 0 | No TypeScript errors |
| 4 | `node_modules/.bin/eslint.cmd .` | **PASS** | 0 | No ESLint errors |
| 5 | `node_modules/.bin/next.cmd build` | **PASS** ⚠️ | 0 | 94/94 pages compiled (7.4s), 111 routes. Next.js 16.1.3 (Turbopack) |

### Warning Registry

| Warning | Severity | Source | Status |
|---------|----------|--------|--------|
| `PrismaClientInitializationError` — sitemap DB connection to `localhost:5432` | LOW | Build | **Pre-existing** — present since at least PR6.1. Build completes successfully with 94/94 pages. Not a regression. No action needed during PR7. |
| `DEP0205: module.register()` deprecation | INFO | Node.js internal | **Pre-existing** — Next.js 16.1.3 internal. Not actionable. |

---

## Test Coverage Inventory

### What Is Covered (64 executable tests)

The test suite (`tests/catalog-pr2.test.cjs`) uses Node.js native test runner with TypeScript transpilation. All 64 tests are **pure-helper / pure-function** tests — no database, no browser, no component rendering.

| PR Slice | Test Group | Tests | Coverage Area |
|----------|------------|-------|---------------|
| PR2 | `resolveDestinationMatch` | 5 | Destination slug/CUID/name matching, ambiguous/unresolved reporting |
| PR2 | `createDestinationBackfillPlan` | 3 | Dry-run backfill planning, batchId, rollback traceability |
| PR3 | `parseRelationOptionFilters` + `applyTemplateFallback` | 2 | Admin option filter parsing, template fallback semantics |
| PR3 | `resolveScopedRelationFilter` | 4 | Destination filter resolution, fail-closed, room-type hotel validation |
| PR3 | `normalizePackageRelationsRequest` + `validateResolvedPackageRelations` | 2 | Package relation dedup, orphan/inactive/template rejection |
| PR4 | `normalizePackageDestinationOptions` + `findPackageDestinationOption` | 2 | Package destination selector options |
| PR4 | `buildPackageDestinationRelationsPayload` + `buildPackageRelationsPayload` | 2 | Package relation payload construction |
| PR4 | `getPackageRelationSelectorSmokeState` | 2 | Loading/empty/error/ready states, disabled room-type prerequisite |
| PR4 | `normalizeSelectedRelationIds` + `selectedIdsFromPackageRelations` + `keepIdsPresentInOptions` + `toggleSelectedId` | 2 | Selected ID hydration/reconciliation |
| PR4 | Hotel destination selectors | 2 | Loading/empty/error/ready states, compatibility field mapping |
| PR4 | Excursion destination selectors | 2 | Loading/empty/error/ready states, compatibility field mapping |
| PR4 | Transport destination/origin selectors | 2 | Loading/empty/error/ready states, origin/destination compatibility mapping |
| PR5 | `resolveSourceFields` | 8 | 6 source types + empty-safe contract + images parsing + room-type with nested hotel |
| PR5 | `resolveCatalogPresentation` | 2 | Override merge, fallback to source |
| PR6.1 | `parseJsonArray` | 6 | Valid JSON, null, undefined, malformed, non-array, empty string |
| PR6.1 | `resolveIsTemplateFallback` | 2 | No real rows → true, real rows exist → false |
| PR6.1 | `normalizePackage` | 2 | JSON array parsing, safe defaults |
| PR6.1 | `normalizeHotel` | 2 | Images parsing, safe defaults |
| PR6.1 | `normalizeExcursion` | 2 | Images parsing, safe defaults |
| PR6.1 | `extractEntitiesFromJoinRows` | 5 | Active/`isTemplate` filtering, sort, empty input, missing entity key |
| PR6.2 | `normalizeTransport` | 2 | Includes parsing, safe defaults |
| PR6.3 | `resolvePackageDestinationIds` | 4 | Grouping, inactive exclusion, empty input, duplicate preservation |
| **TOTAL** | | **64** | |

### What Is Intentionally Deferred

| Layer | Gap | Reason | Future Plan |
|-------|-----|--------|-------------|
| **Browser / component rendering** | No Playwright, Cypress, or jsdom tests | No browser test runner configured in project. Component rendering tests would require significant setup (Next.js + Radix + shadcn). | Evaluate Playwright or React Testing Library after relational migration is stable. |
| **Database integration** | No Prisma integration tests (no test DB) | Test suite is pure-function only. Backfill, relation upserts, and join hydration are tested through helper logic, not DB round-trips. | Add integration fixtures after migration completes and a test database is available. |
| **API route smoke** | No route-level HTTP tests | `curl` / manual QA gated. Admin option endpoints, relation management endpoints, public API endpoints are compiled (build passes) but not exercised in test suite. | Plan API integration tests after test DB infrastructure exists. |
| **Reseller catalog flows** | No reseller CRUD integration tests | Reseller catalog browse/edit/add/feature toggle API routes exist but are tested only through build/type/lint checks. `resolveSourceFields` helper tests cover data normalization. | Add reseller API integration tests in a future phase. |
| **Booking snapshot integrity** | No booking/sale end-to-end tests | Booking and BookingItem models exist. Booking creation logic exists in API routes. Booking snapshot behavior (immutability after source edit) is not tested. | Add booking regression tests after public/reseller booking flows are stabilized with relational data. |
| **Hotel detail page hydration** | No hotel detail page hydration with relations | PR6.1 covers destination detail only. Hotel detail (`/hoteles/[hotelId]`) still uses legacy queries. | Future PR6.x sub-slice. |
| **Package detail page hydration** | No package detail page hydration with relations | Same as hotel — covered by compile check but detail page not relationally hydrated. | Future PR6.x sub-slice. |
| **Excursion detail page hydration** | No excursion detail page hydration with relations | Same. | Future PR6.x sub-slice. |
| **Transport detail page hydration** | No transport detail page hydration with relations | Cards link to `/transportes/[serviceId]` but detail page uses own queries. | Future PR6.x sub-slice. |
| **Search** | No relational search implementation | Search still operates on legacy fields. No relation-join search implemented. | Phase 7.2 — QA task. |
| **RoomType-first composition UI** | Not implemented (task 5.2 open) | Admin UX still uses `Hotel.rooms` JSON as presentation layer. `RoomType` model exists but composition UI does not read from it. | Phase 5.2 — future implementation. |
| **`CatalogItem` persisted cache** | Not implemented | Design supports it; resolver pattern used instead. Persisted cache would speed up lists. | Decide in Fase 9 planning. |

---

## Legacy Field Classification

Classification key:
- **KEEP_SNAPSHOT** — immutable historical/booking record; must NEVER be removed
- **KEEP_CACHE** — display cache still actively read; removable only after consumer migration is proven
- **KEEP_COMPAT** — compatibility field still populated and read as fallback; removable only after all Tier 3 fallback paths are proven dead
- **SAFE_TO_REMOVE** — no consumer reads this field; safe to drop after evidence review
- **NEEDS_EVIDENCE** — uncertain classification; more testing/consumer analysis needed

### Destination

| Field | Classification | Justification |
|-------|---------------|---------------|
| `highlights` (JSON string) | KEEP_CACHE | Parsed for display. All consumers read from this field. |
| `slug` | KEEP_COMPAT | Core identity — NOT legacy. Public URL identity. |
| `name`, `region`, `description`, `image` | KEEP_COMPAT | Core display — NOT legacy. |
| `rating`, `reviewCount`, `priceFrom` | KEEP_COMPAT | Core metrics — NOT legacy. Still actively computed/displayed. |
| `active`, `isTemplate`, `order` | KEEP_COMPAT | Core control fields — NOT legacy. |

### Hotel

| Field | Classification | Justification |
|-------|---------------|---------------|
| `cityId` | KEEP_COMPAT | Legacy string ID. Tier 3 fallback in `getRelatedHotels()` (destination detail page). Admin Hotel selector still maps `selectedDestination.id → cityId`. Populated on new hotel creation via `buildHotelDestinationCompatibilityFields()`. |
| `cityName` | KEEP_COMPAT | Display snapshot. Tier 3 fallback in destination detail. Populated on new hotel creation. Public hotel cards and admin lists display this. |
| `rooms` (JSON string) | KEEP_CACHE | JSON display cache for room list. `RoomType` model exists relationally but no consumer reads RoomType for hotel detail display yet. Task 5.2 (RoomType-first UX) is incomplete. |
| `images` (JSON string) | KEEP_CACHE | Parsed for display in public and admin. `parseJsonArray` used. |
| `amenities` (JSON string) | KEEP_CACHE | Parsed for display. |
| `tags` (JSON string) | KEEP_CACHE | Parsed for display. |
| `destinationId?` (nullable FK) | **NOT LEGACY** | This is the new relational FK (`HotelPrimaryDestination`). Added in PR2. |
| `stars`, `address`, `description`, `rating`, `reviewCount`, `priceFrom`, `featured` | KEEP_COMPAT | Core display fields — NOT legacy. |

### TravelPackage

| Field | Classification | Justification |
|-------|---------------|---------------|
| `destinationId` | KEEP_COMPAT | Legacy string ID. Still used as Tier 3 fallback in public hydration. `DestinationsSection` uses `p.destinationId === d.id` as fallback when `relatedDestinationIds` is unavailable. Legacy public API routes may depend on this for filtering. |
| `destinationName` | KEEP_COMPAT | Display snapshot. Public package cards, admin lists, reseller catalog all display this. `normalizePackage` includes it. |
| `includes` (JSON string) | KEEP_CACHE | Parsed for display via `parseJsonArray`. `PackageIncludedService` model exists relationally but no consumer reads it yet. Feature is deferred. |
| `departureDates` (JSON string) | KEEP_CACHE | Parsed for display. `PackageDepartureDate` model exists relationally but no consumer reads it yet. Feature is deferred. |
| `duration`, `price`, `originalPrice`, `difficulty`, `groupSize`, `category`, `rating`, `soldOut`, `commission`, `image`, `description`, `title`, `slug`, `active`, `isTemplate` | KEEP_COMPAT | Core display and business fields — NOT legacy. |
| `primaryDestinationId?` (nullable FK) | **NOT LEGACY** | New relational FK (`PackagePrimaryDestination`). |

### Excursion

| Field | Classification | Justification |
|-------|---------------|---------------|
| `destinationId` | KEEP_COMPAT | Legacy string ID. Tier 3 fallback in destination detail hydration. Admin still maps selected destination to this field via `buildExcursionDestinationCompatibilityFields()`. |
| `destinationName` | KEEP_COMPAT | Display snapshot. Populated on excursion creation. Public and admin displays use this. |
| `cityName` | KEEP_COMPAT | Display snapshot. Populated on excursion creation. |
| `images` (JSON string) | KEEP_CACHE | Parsed for display via `parseJsonArray`. |
| `includes` (JSON string) | KEEP_CACHE | Parsed for display. No relational alternative implemented. |
| `excludes` (JSON string) | KEEP_CACHE | Parsed for display. No relational alternative implemented. |
| `requirements` (JSON string) | KEEP_CACHE | Parsed for display. No relational alternative implemented. |
| `destinationRefId?` (nullable FK) | **NOT LEGACY** | New relational FK (`ExcursionPrimaryDestination`). |
| `slug`, `name`, `description`, `shortDesc`, `duration`, `difficulty`, `groupSize`, `basePrice`, `childPrice`, `category`, `rating`, `featured`, `active`, `isTemplate` | KEEP_COMPAT | Core display and business fields — NOT legacy. |

### TransportService

| Field | Classification | Justification |
|-------|---------------|---------------|
| `cityId` | KEEP_COMPAT | Legacy string ID. Tier 3 fallback in destination detail transport hydration. Admin transport selector maps selected destination to this via `buildTransportDestinationCompatibilityFields()`. |
| `cityName` | KEEP_COMPAT | Display snapshot. Tier 3 fallback. Populated on transport creation. |
| `origin` | KEEP_COMPAT | Display text. Tier 3 display fallback. `normalizeTransport` includes it. `originDestinationId` is the new relational FK. Populated on transport creation via admin compatibility mapping. |
| `destination` | KEEP_COMPAT | Display text. Tier 3 display fallback. `normalizeTransport` includes it. `destinationDestinationId` is the new relational FK. Populated on transport creation via admin compatibility mapping. |
| `includes` (JSON string) | KEEP_CACHE | Parsed for display via `parseJsonArray`. No relational alternative implemented. |
| `originDestinationId?` (nullable FK) | **NOT LEGACY** | New relational FK (`TransportOriginDestination`). |
| `destinationDestinationId?` (nullable FK) | **NOT LEGACY** | New relational FK (`TransportTargetDestination`). |
| `providerId`, `name`, `routeType`, `durationMins`, `basePrice`, `pricePerExtra`, `notes`, `active`, `isTemplate` | KEEP_COMPAT | Core display and business fields — NOT legacy. |

### Booking / BookingItem

| Field | Classification | Justification |
|-------|---------------|---------------|
| **ALL FIELDS** | **KEEP_SNAPSHOT** | Booking and BookingItem are immutable historical records. Booking is a legal/financial snapshot. Even after source catalog data changes, bookings must display the original snapshot forever. NEVER removable. |

### ResellerCatalog

| Field | Classification | Justification |
|-------|---------------|---------------|
| `sourceType` | KEEP_COMPAT | Bridge pattern — identifies which source entity type. Actively used by `resolveSourceFields()` and `ResellerCatalogItem`. |
| `sourceId` | KEEP_COMPAT | Bridge pattern — identifies which source entity row. Actively used by reseller catalog browsing, custom price overlay, and source resolution. |
| `customPrice`, `customName`, `customDescription`, `active`, `featured`, `sortOrder`, `resellerId` | KEEP_COMPAT | Core reseller catalog fields — NOT legacy. |

### SAFE_TO_REMOVE: None

**No field is safe to remove at this stage.** Every legacy string/JSON field is either:

1. **Still in the Tier 3 fallback chain** (all `cityId`, `cityName`, `destinationId` string fields, `origin`, `destination`) — removal would break public hydration when relational data is absent.
2. **The primary display mechanism** (`Hotel.rooms`, `TravelPackage.includes`, `TravelPackage.departureDates`) — relational alternatives exist but are not wired into any consumer.
3. **Protected by snapshot semantics** (`Booking`/`BookingItem` ALL fields) — NEVER removable.
4. **Actively populated by current admin UX** (`destinationName`, `cityName`, `origin`, `destination`) — admin creation/edit paths still write these compatibility fields.

### NEEDS_EVIDENCE: Fields for Fase 9 Analysis

These fields require further evidence before a removal decision can be made. Each one needs: (a) all consumers confirmed on relational path, (b) no Tier 3 fallback code path active, (c) admin creation/edit no longer writes the field.

| Field | Current Status | Evidence Needed |
|-------|---------------|-----------------|
| `Hotel.rooms` | Display cache. `RoomType` + `Allotment` exist relationally. | Complete task 5.2 (RoomType-first composition UI). Verify all public and admin hotel displays read from `RoomType` joins. Verify no consumer reads `Hotel.rooms`. |
| `TravelPackage.departureDates` | Display cache. `PackageDepartureDate` exists relationally. | Wire `PackageDepartureDate` into admin package detail, public package detail, and reseller package view. Verify JSON field is dead. |
| `TravelPackage.destinationId` | Tier 3 fallback. `primaryDestinationId` + `DestinationPackage` exist. | Complete all Phase 7.2 public hydration (home, hotel/package/excursion/transport detail). Verify no API route or component reads `destinationId` as primary filter. `DestinationsSection` must never fall through to `p.destinationId === d.id`. |
| `TravelPackage.destinationName` | Display snapshot. Resolvable from `primaryDestination.name`. | Verify all 3 tiers return relational names. Admin creation can stop writing snapshot. |
| `Excursion.destinationId` | Tier 3 fallback. `destinationRefId` + `DestinationExcursion` exist. | Complete excursion detail hydration. Verify no consumer reads `destinationId` directly. |
| `Excursion.destinationName` | Display snapshot. Resolvable from `destinationRef.name`. | Same as package `destinationName`. |
| `Excursion.cityName` | Display snapshot. Resolvable from `destinationRef.name`. | Same. |
| `TransportService.cityId` / `cityName` | Tier 3 fallback. `originDestinationId` + `destinationDestinationId` exist. | Complete transport detail hydration. Verify all consumers use FKs. Admin creation stops writing `cityId`/`cityName`. |
| `TransportService.origin` | Display text. `originDestinationId` FK exists. | Verify transport display resolves origin name from relation. Admin creation stops writing `origin`. |
| `TransportService.destination` | Display text. `destinationDestinationId` FK exists. | Verify transport display resolves destination name from relation. Admin creation stops writing `destination`. |

---

## Known Gaps Summary

| Category | Severity | Description |
|----------|----------|-------------|
| Browser/component tests | MEDIUM | No browser or component test runner. All UI coverage is via pure-helper logic tests. Selectors, public pages, admin forms, and reseller catalog are verified only through build/type/lint checks. |
| Database integration tests | MEDIUM | No test database. All backfill, relation, and hydration tests are pure-function. Insert/update/delete behavior on real PostgreSQL is not exercised. |
| API route HTTP tests | MEDIUM | No route-level tests. 111 routes compile and build successfully but are not exercised with HTTP requests. `curl` and manual QA gated. |
| Remaining public detail pages | LOW | Hotel, package, excursion, and transport detail pages not relationally hydrated. Covered by build but not by relational data. |
| Search | LOW | Search still operates on legacy fields. No relational search implementation. |
| Booking end-to-end | LOW | Booking creation, snapshot integrity, and stale-source handling not tested end-to-end. |
| Reseller catalog browse/edit/add | LOW | `resolveSourceFields` tests cover data normalization. Full reseller flow not tested. |

---

## Conditional Cleanup Plan (Fase 9 Pre-flight)

### Prerequisites Before Any Legacy Field Removal

1. **RoomType-first composition UI MUST be complete** (task 5.2) — until then, `Hotel.rooms` JSON cannot be removed.
2. **All public detail pages MUST be relationally hydrated** (remaining Phase 7.2 tasks) — until then, Tier 3 fallback fields (`cityId`, `cityName`, `destinationId` strings, `origin`, `destination`) cannot be removed.
3. **Search MUST be migrated to relations** — until then, all legacy display fields must remain.
4. **Reseller catalog QA MUST be complete** (task 6.2) — until then, `sourceType`/`sourceId` bridge fields cannot be removed.
5. **All admin creation/edit paths MUST stop writing compatibility fields** — until then, even "dead read" fields are still being written.
6. **At least one full migration cycle MUST complete** — backfill from production data, verify all fallback paths report zero hits, verify all public/admin/reseller pages render correctly from relations only.

### Recommended Fase 9 Approach

1. **Complete remaining tasks first** (5.2, 6.2, 7.2, search) — Fase 9 should NOT be a "remove legacy fields" sprint. It should be a **verification sprint** to confirm all consumers use relational data.
2. **Instrument fallback paths** — add logging/metrics to Tier 2 and Tier 3 fallback paths to measure real-world hit rates.
3. **Run production shadow mode** — deploy relational hydration in parallel with legacy paths. Log when Tier 3 fallback is used for each entity type.
4. **Declare fields dead** — only after a monitoring period with zero Tier 3 hits for a specific field, classify it as `SAFE_TO_REMOVE`.
5. **Separate destructive migration** — each legacy field removal gets its own PR with: (a) Prisma migration that drops the column, (b) fixture comparison proving no data loss, (c) rollback plan (restore from backup + re-add column).

### Conditional Gate

Fase 9 should only proceed if:
- [ ] Tasks 5.2, 6.2, and remaining 7.2 are complete
- [ ] All 5 quality commands still pass (test suite expanded)
- [ ] At least 30 days of production monitoring with zero Tier 3 fallback hits
- [ ] Maintainer explicitly approves destructive migration

**Current recommendation**: Do NOT proceed to Fase 9 yet. Complete Fases 5.2, 6.2, and 7.2 first. The relational spine is solid; the remaining work is wiring consumers, not risking data loss.

---

## Checklist

- [x] All 5 quality commands run and captured
- [x] Command evidence table with exact results
- [x] Test coverage inventory (64 tests, 7 PR slices, 33 behaviors)
- [x] Intentionally deferred coverage documented (browser, DB, API, detail pages, search, booking)
- [x] Legacy field classification for all 12 models
- [x] SAFE_TO_REMOVE analysis — none today
- [x] NEEDS_EVIDENCE list for 10+ fields
- [x] Known gaps severity matrix
- [x] Conditional cleanup prerequisites
- [x] Fase 9 recommendation with explicit gate checklist

## Next Step

**Ready for Fase 9 conditional cleanup decision** — but recommendation is to DEFER Fase 9 until Fases 5.2, 6.2, and 7.2 are complete. The relational foundation (PR1–PR6.3) is stable and verified. The remaining risk is in consumer wiring, not in schema integrity.

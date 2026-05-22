# Proposal: Catálogo Relacional Turístico

## Intent

Build an incremental relational spine for WILROP's tourism catalog. Exploration found real Prisma entities, but most catalog relationships are simulated with strings (`destinationId`, `cityName`, `sourceType`, `serviceId`) while `isTemplate` fallback, public slugs, reseller catalog entries, booking snapshots, and hotel room JSON create migration risk. The goal is stronger integrity without breaking current public, admin, reseller, or booking behavior.

## Scope

### In Scope
- Verify Prisma schema/migration/client drift before adding relations.
- Add nullable relational fields and join models around destinations, packages, hotels, room types, excursions, transport services, reseller catalog items, and public catalog hydration.
- Preserve legacy display fields as snapshot/cache/legacy fields until backfills and UI migrations prove safe.
- Replace admin manual IDs with selectors and create-missing-entity flows.
- Keep reseller/agent users working from authorized real catalog items with customization and booking snapshots.
- Phase delivery into reviewable slices under the 800-line budget.

### Out of Scope
- Hard delete of legacy display fields in this change.
- Breaking `isTemplate` fallback or public Spanish routes/slugs.
- Full CMS/media/category/tag normalization beyond fields needed for this relational spine.
- Rewriting booking history into live mutable product records.

## Capabilities

### New Capabilities
- `tourism-catalog-relations`: Destination/package/hotel/excursion/transport relational source of truth with compatibility snapshots.
- `catalog-relation-management`: Admin option and relation-management APIs plus selectors that avoid manual IDs.
- `reseller-authorized-catalog`: Typed reseller catalog references with commission/customization and no master-data edits.
- `public-catalog-hydration`: Public pages hydrated through relational queries while preserving slugs, featured content, filters, search, and CTAs.

### Modified Capabilities
- None found in `openspec/specs/`; this repo currently has no existing capability specs beyond `.gitkeep`.

## Proposed Prisma Relational Model

Use nullable FKs first, then backfill, then enforce where safe. Keep existing string display fields during migration.

| Model / relation | Cardinality | onDelete | Indexes / uniques | Source of truth vs snapshot/cache |
|---|---:|---|---|---|
| `Destination` → `DestinationHotel` → `Hotel` | Destination 1:N join rows; Hotel can map to one primary destination initially, N later if needed | Cascade join row when Destination/Hotel deleted | `@@unique([destinationId, hotelId])`, `@@index([hotelId])`, `@@index([destinationId, featured, order])` | FK is source; hotel `cityId/cityName` legacy snapshot/cache; `slug` remains public identity. |
| `Destination` → `DestinationPackage` → `TravelPackage` | 1:N, package MAY have multiple destinations for multi-city trips | Cascade join row | `@@unique([destinationId, packageId])`, `@@index([packageId])`, `@@index([destinationId, featured, order])` | Join source; package `destinationId/destinationName` legacy compatibility snapshot. |
| `Destination` → `DestinationExcursion` → `Excursion` | 1:N; excursion can belong to multiple destinations if route spans places | Cascade join row | `@@unique([destinationId, excursionId])`, `@@index([excursionId])`, `@@index([destinationId, featured, order])` | Join source; `destinationName/cityName` snapshot/cache. |
| `Destination` → `DestinationTransportService` → `TransportService` | 1:N; transport service may cover origin/destination destinations | Cascade join row | `@@unique([destinationId, transportServiceId, role])`, `@@index([transportServiceId])`, `@@index([destinationId, role])` | Join source for filters; `origin/destination/cityName` remain route-display snapshots. |
| `TravelPackage` → `PackageHotel` → `Hotel` | Package N:M Hotel | Cascade join row | `@@unique([packageId, hotelId])`, `@@index([hotelId])`, `@@index([packageId, order])` | Join source; package text may cache primary hotel names for display only if needed. |
| `TravelPackage` → `PackageExcursion` → `Excursion` | Package N:M Excursion | Cascade join row | `@@unique([packageId, excursionId])`, `@@index([excursionId])`, `@@index([packageId, order])` | Join source; package `includes` remains legacy/snapshot until service rows replace it. |
| `TravelPackage` → `PackageTransportService` → `TransportService` | Package N:M TransportService | Cascade join row | `@@unique([packageId, transportServiceId])`, `@@index([transportServiceId])`, `@@index([packageId, order])` | Join source for package logistics; transport route text remains service snapshot. |
| `TravelPackage` → `PackageRoomType` → `RoomType` | Package N:M RoomType, optionally scoped through `PackageHotel` | Cascade join row; SetNull if optional packageHotelId removed | `@@unique([packageId, roomTypeId])`, `@@index([roomTypeId])`, `@@index([packageId])` | `RoomType` source for hotel rooms/prices; `Hotel.rooms` JSON legacy cache until fully replaced. |
| `TravelPackage` → `PackageDepartureDate` | Package 1:N | Cascade | `@@index([packageId, startsAt])`, optional `@@unique([packageId, startsAt, endsAt])` | Row source; package `departureDates` JSON legacy cache. |
| `TravelPackage` → `PackageItineraryDay` | Package 1:N | Cascade | `@@unique([packageId, dayNumber])`, `@@index([packageId])` | Row source; no reliable existing source except package descriptions. |
| `TravelPackage` → `PackageIncludedService` | Package 1:N typed rows (`text`, `hotel`, `excursion`, `transport`, `meal`, etc.) | Cascade; referenced catalog item SetNull if optional | `@@index([packageId, type, order])` | Row source; package `includes` JSON legacy cache. |
| `CatalogItem` equivalent | 1:1 optional wrapper over typed source, or DB view/service resolver | Restrict/NoAction from source; do not delete source through wrapper | `@@unique([sourceType, sourceId])`, `@@index([active, isTemplate, sourceType])`, `@@index([destinationId])` | Recommended as a typed resolver/table for search/featured/authorized catalog. Cache fields: title, slug, image, priceFrom, active, isTemplate; source models remain authoritative. |
| `ResellerCatalogItem` typed/polymorphic | Reseller/Subagent 1:N catalog item rows; each row references either `catalogItemId` or typed nullable FK (`packageId`, `hotelId`, `excursionId`, `transportServiceId`) | Restrict for master-data delete or SetNull plus snapshot if historical sales exist | `@@unique([resellerId, catalogItemId])`, `@@index([resellerId, active])`, `@@index([sourceType, sourceId])` during bridge | Source FK/CatalogItem is source; reseller title/price/commission/customization and booking sale fields are snapshots/overrides. |

Recommended Prisma shape: add join models explicitly, add `Destination` relation arrays, add nullable FK fields where direct relation is useful (`Hotel.destinationId?`, `TravelPackage.primaryDestinationId?`, `Excursion.primaryDestinationId?`, `TransportService.primaryDestinationId?`), and add bridge fields to reseller catalog while retaining current `sourceType/sourceId` until migration is complete.

## Migration Strategy

1. **Schema drift gate:** run `bunx prisma migrate status`, inspect generated Prisma Client, reconcile `Reseller*` models from migration `20260518093439_agregar_modelos_reseller` into `schema.prisma` before relational work. Do not add new migrations while schema/client disagree.
2. **Nullable additive migration:** add join tables and optional FKs only. Do not drop or rename `destinationId`, `destinationName`, `cityId`, `cityName`, `rooms`, `includes`, `departureDates`, `sourceType`, `sourceId`, or booking snapshot fields.
3. **Slug/CUID bridge:** match legacy IDs by `Destination.slug`, then by `Destination.id`, then by normalized name. Keep public slugs as canonical URL/filter identity; internal FK may be CUID.
4. **Backfill destinations:** populate destination joins from package/excursion `destinationId` and hotel/transport `cityId`/`cityName`; log unresolved rows for admin correction rather than guessing.
5. **Backfill package composition:** parse current package JSON fields into candidate `PackageDepartureDate`, `PackageIncludedService`, and join rows only when source entities can be matched deterministically.
6. **Hotel rooms transition:** treat `RoomType` as source of truth for availability and package lodging. Keep `Hotel.rooms` JSON as public display cache until public hotel selection and admin hotel edit screens are migrated.
7. **Reseller bridge:** add typed/CatalogItem references to reseller catalog rows while keeping `sourceType/sourceId`; snapshot title, image, price, commission for resilience if source changes.
8. **Template preservation:** keep `isTemplate` on source models and carry it into `CatalogItem` cache. Do not change existing global per-type template fallback until a separate product decision says otherwise.
9. **Progressive enforcement:** after UI/API reads use relations and unresolved rows are fixed, add required constraints where safe. Legacy field removal is a later change.

## API Strategy

Follow existing App Router conventions under `src/app/api/**/route.ts`, Prisma singleton `src/lib/db.ts`, Zod validation where already used, and JSON responses compatible with current consumers.

### Relation option endpoints
- `GET /api/admin/relation-options/destinations?active=true&includeTemplates=true`
- `GET /api/admin/relation-options/hotels?destinationId=`
- `GET /api/admin/relation-options/room-types?hotelId=`
- `GET /api/admin/relation-options/excursions?destinationId=`
- `GET /api/admin/relation-options/transport-services?destinationId=&role=`
- `GET /api/admin/relation-options/catalog-items?type=&destinationSlug=&search=`

Option payloads should expose `{ id, slug, label, subtitle, active, isTemplate, sourceType }` so forms never need manual IDs.

### Relation management endpoints
- `PUT /api/admin/packages/[id]/relations` for destinations, hotels, room types, excursions, transport, departure dates, itinerary days, included services.
- `PUT /api/admin/hotels/[id]/relations` for destinations and room type synchronization.
- `PUT /api/admin/excursions/[id]/relations` for destinations.
- `PUT /api/admin/transport-services/[id]/relations` for origin/destination destination links.
- `PUT /api/reseller/catalog/[id]` limited to customization/visibility/commission overrides, never master-data edits.

Public APIs should hydrate via relations with legacy fallback paths until all rows are backfilled.

## Admin UX Strategy

- Replace manual `destinationId`, `destinationName`, `cityId`, `cityName`, hotel/room/package service IDs with selectors backed by option endpoints.
- Preserve current visual design: shadcn/Radix primitives, cards/dialogs/tabs, Tailwind brand tokens, Spanish labels.
- Every selector needs loading, empty, error, retry, and disabled states.
- Add create-missing-entity flow: inline CTA opens destination/hotel/excursion/transport create dialog, then returns selected new entity.
- Display legacy snapshot fields as read-only fallback/preview during migration, not as primary editable source.
- For hotel rooms, introduce explicit RoomType management and show if `Hotel.rooms` JSON cache is out of sync.

## Reseller / Agent Strategy

- Resellers/agents browse authorized real catalog items, filtered by active, non-template by default, destination, type, price, commission, and search.
- Resellers may customize title/description/image/price/visibility/commission only in their catalog row; they cannot edit master `Destination`, `Hotel`, `TravelPackage`, `Excursion`, or `TransportService` data.
- Booking and sale creation must snapshot product title, source type/id, selected room/date/services, unit/net/commission price, and reseller overrides to preserve historical records.
- Existing `sourceType/sourceId` remains as bridge until typed references are populated and read paths are switched.

## Public Web Hydration Strategy

- Home: featured destinations/hotels/packages/excursions/transport through `CatalogItem`/relation resolver with static fallback only during migration.
- Destinations: destination detail/list should use `Destination.slug` for URLs and related hotels/packages/excursions/transport through joins.
- Hotel pages: read destination relation and `RoomType` for selectable rooms; keep `Hotel.rooms` display fallback until synchronized.
- Package pages: hydrate hotels, room types, excursions, transport, departure dates, itinerary, included services from package relations; preserve CTAs and booking payload compatibility.
- Excursion/transport pages: filter by destination slug/related destination IDs, not string-only city matching.
- Search/filters: accept public slugs and resolve to destination IDs server-side; support legacy IDs during transition.
- CTAs/featured content: use cached display fields for fast cards but link to authoritative typed source pages.

## Validation and Testing Strategy

Available checks:
- `bunx prisma validate`
- `bunx prisma migrate status`
- `bun run db:generate`
- `bunx tsc --noEmit`
- `bun run lint`
- `bun run build`

Missing automated tests to propose/add in later phases:
- Prisma/backfill integration tests for slug-to-destination matching, unresolved rows, and template preservation.
- API tests for relation option endpoints, relation updates, reseller authorization, and public filter hydration.
- Component tests or Playwright smoke tests for admin selectors, create-missing flow, public pages, and reseller add-to-catalog.
- Regression fixtures for `isTemplate` behavior and booking snapshots.

## Delivery Phases

| Phase | Files to modify | Concrete changes | Risks | How to test | Acceptance criteria |
|---|---|---|---|---|---|
| Fase 1 — Auditoría y diagnóstico | `prisma/schema.prisma`, reseller migration notes, generated client docs if needed | Reconcile `Reseller*` schema drift; verify Prisma validates before new relational migrations. | Blocking drift may reveal missing generated-client assumptions. | `bunx prisma validate`, `bunx prisma migrate status`, `bun run db:generate`, `bunx tsc --noEmit`. | Schema, migrations, generated client, and code references agree; no catalog relation changes yet. |
| Fase 2 — Diseño Prisma relacional | `prisma/schema.prisma`, new migration | Add nullable direct FKs/join models listed above plus indexes/uniques. | Migration size and Prisma relation naming conflicts. | Prisma validate/generate; inspect SQL. | Additive migration only; no legacy field dropped; `isTemplate` untouched. |
| Fase 3 — Migración segura | `prisma/seed.ts`, `src/lib/catalog/*`, scripts/backfill if added | Implement slug/CUID/name matching, unresolved reports, CatalogItem resolver/cache, snapshot classification helpers. | Ambiguous matches; stale cache. | Dry-run backfill, tsc, lint, manual DB sample. | Existing data preserved; unresolved rows are reported, not guessed. |
| Fase 4 — APIs de relaciones | `src/app/api/admin/relation-options/**`, validators/libs | Add option endpoints with active/template/search filters and stable option payloads. | Over-fetching; inconsistent template fallback. | curl/manual, tsc, lint. | Forms can fetch options without manual IDs. |
| Fase 5 — Admin UX | admin catalog routes and `src/components/admin/*` | Replace manual IDs with selectors, loading/empty/error states, create-missing dialog, RoomType-first hotel rooms, and package composition management. | Large UI diff; cache invalidation; JSON-to-row mismatch; package display regressions. | Manual admin CRUD flows, package create/edit/detail manual test, build. | Admin can create/edit package/hotel/excursion/transport relations without typing IDs; package detail uses relations and still displays legacy fields when relation rows absent. |
| Fase 6 — Reseller UX | `src/lib/reseller/catalog.ts`, `src/app/api/reseller/catalog/**`, reseller components | Add typed/CatalogItem references, authorized filtering, customization/commission snapshots, no master-data edits. | Existing reseller rows with missing sources. | Reseller add/edit/sale manual tests; tsc/lint. | Reseller catalog works from real authorized products and preserves existing bridge refs. |
| Fase 7 — Web pública | public APIs, portal components, `src/hooks/use-cities.ts` | Resolve slugs to destination IDs, hydrate pages from relations, preserve CTAs/static fallback during transition. | SEO/public route regressions; filter mismatch. | Manual home/destinations/hotels/packages/excursions/transport/booking smoke; build. | Public pages work with relation data and legacy fallback. |
| Fase 8 — Validaciones, pruebas y limpieza | docs, OpenSpec verify report later, optional tests | Add/record automated test gaps, enforce safe constraints only after backfill, document legacy fields pending removal. | Premature constraint enforcement. | Full command suite and manual smoke. | Ready for later cleanup decision; no superficial compile-only changes claimed as complete. |
| Fase 9 — Retiro de campos legacy si procede | future cleanup migration/files only after evidence | Remove or stop exposing legacy fields only if relation reads, backfills, snapshots, reseller references, and booking history are proven safe. | Data loss or public/reseller/admin regressions if cleanup is premature. | Compare before/after fixtures, full command suite, manual public/admin/reseller booking smoke. | Legacy removal is explicitly conditional; if not safe, fields remain classified as snapshot/cache/legacy. |

## Review Workload Forecast

Selected budget: 800 changed lines. Strategy: `auto-forecast`.

- Forecast: this change will exceed 800 lines if implemented as one PR because it touches Prisma migrations, APIs, admin UI, reseller flows, public hydration, and validation docs.
- Chained PRs recommended: Yes.
- Suggested chain: PR1 Fase 1-2; PR2 Fase 3; PR3 Fase 4; PR4 Fase 5; PR5 Fase 6; PR6 Fase 7; PR7 Fase 8-9 readiness/conditional cleanup.
- Keep each PR independently reviewable with migration/rollback notes and local checks.
- Decision needed before apply: No, because `auto-forecast` selects chained delivery automatically when over budget.
- 800-line budget risk: High for single PR; Medium per chained slice.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `prisma/schema.prisma` / migrations | Modified | Add relational spine and reconcile reseller drift. |
| `prisma/seed.ts` | Modified | Preserve templates, add relation/backfill seed behavior without destructive surprises. |
| `src/lib/catalog/*` | New | Catalog resolver/cache and legacy snapshot helpers. |
| `src/app/api/admin/**` | Modified/New | Relation option and relation management endpoints. |
| `src/components/admin/*` | Modified | Selectors, create-missing flow, relation management. |
| `src/lib/reseller/*`, `src/app/api/reseller/catalog/**` | Modified | Typed authorized catalog with customization snapshots. |
| `src/app/api/public/**`, `src/components/portal/*`, `src/hooks/use-cities.ts` | Modified | Relational hydration and slug-compatible filtering. |
| `src/data/*` | Modified later | Keep as migration fallback; do not remove until public hydration is proven. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---:|---|
| Prisma schema drift blocks migrations | High | Make Phase 1 a hard gate. |
| `isTemplate` behavior changes accidentally | High | Preserve flags and fallback queries; add regression fixtures. |
| Slug/CUID mismatch corrupts backfill | High | Match by slug first; report unresolved rows; no guessing. |
| Hotel room JSON conflicts with RoomType | Medium | Treat RoomType as source, JSON as cache until UI migration complete. |
| Reseller catalog loses products if source changes | Medium | Add typed refs plus display/price/commission snapshots. |
| Public filters/routes regress | Medium | Keep slug URLs and resolve slugs server-side. |

## Rollback Plan

- Each chained PR must be reversible independently.
- Additive migrations can be rolled back by dropping new nullable FKs/join/cache tables before any legacy fields are removed.
- Backfill scripts must be dry-run/idempotent and record unresolved rows; rollback deletes only generated relation rows/cache entries.
- API/UI phases keep legacy read fallback, so disabling relation paths can restore current behavior.
- No destructive cleanup occurs in this change.

## Dependencies

- Working PostgreSQL `DATABASE_URL` for migration status/validation.
- Prisma Client generation after schema drift is reconciled.
- Product decision later if `isTemplate` global fallback should change; this proposal preserves it.

## Success Criteria

- [ ] Prisma schema/client/migrations are consistent before relational migrations.
- [ ] Destination, package, hotel, room type, excursion, transport, catalog, and reseller relationships are represented with nullable relational structures and safe constraints.
- [ ] Existing data, `isTemplate`, slugs, snapshots, booking history, and reseller catalog references keep working during migration.
- [ ] Admin users use selectors/create-missing flows instead of manual relation IDs.
- [ ] Reseller users see authorized real products and can customize only their catalog presentation/commission.
- [ ] Public pages hydrate from relational data with slug-compatible filters and legacy fallback.
- [ ] Validation commands pass and missing automated test coverage is explicitly tracked.

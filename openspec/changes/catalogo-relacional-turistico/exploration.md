## Exploration: catalogo-relacional-turistico

### Current State

WILROP already has catalog entities in Prisma for `Destination`, `Hotel`, `RoomType`, `Allotment`, `TravelPackage`, `Excursion`, `TransportProvider`, `TransportService`, `Booking`, `BookingItem`, `Subagent`, and admin auth/content entities. The tourist catalog is only partially relational: hotels have real relations to room types/allotments and transport services have a real provider relation, but destinations, packages, excursions, hotels, transport services, reseller catalog items, and booking items mostly connect through string fields such as `destinationId`, `destinationName`, `cityId`, `cityName`, `sourceType`, `sourceId`, `itemType`, and `serviceId`.

The current behavior intentionally falls back from real records to seeded/template records using `isTemplate`: if any active non-template record exists for a catalog type, public/admin queries hide templates for that entire type. This is a critical migration constraint because relation backfills and UI filters must preserve template fallback semantics until a real catalog is complete.

### Diagnostic Summary

| Area | Finding |
|---|---|
| Current entities | `Destination`, `Hotel`, `RoomType`, `Allotment`, `TravelPackage`, `Excursion`, `TransportProvider`, `TransportService`, `Booking`, `BookingItem`, `Subagent`; migrations also define `Reseller`, `ResellerCatalog`, `ResellerSale`, `ResellerClient`, `ResellerDocument`. |
| Actual relations | `Hotel -> RoomType[]`, `Hotel -> Allotment[]`, `RoomType -> Hotel/Allotment[]`, `Allotment -> Hotel/RoomType`, `TransportService -> TransportProvider`, `Subagent -> Booking[]`, `Booking -> BookingItem[]`, `Booking -> Subagent?`. Migrations add reseller relations, but `prisma/schema.prisma` does not currently declare the reseller models. |
| Simulated/string relations | `TravelPackage.destinationId/destinationName`, `Excursion.destinationId/destinationName/cityName`, `Hotel.cityId/cityName`, `TransportService.cityId/cityName/origin/destination`, `BookingItem.itemType/serviceId/serviceName/roomTypeId/roomName`, `ResellerCatalog.sourceType/sourceId`, static `src/data/*` IDs, `useCities()` mapping destination `slug || id` as city ID. |
| Missing relations | Destination to packages/hotels/excursions/transport; City/Place entity; package composition to hotels/room types/excursions/transport; booking item polymorphic catalog reference; reseller catalog source references; service snapshot model; normalized amenities/tags/categories/departure dates. |
| Duplicate fields | `destinationName`, `cityName`, `serviceName`, `roomName`, `priceFrom`, `rating`, `reviewCount`, hotel `rooms` JSON vs `RoomType`, static `src/data/*` vs seeded DB, package `includes/departureDates`, excursion images/includes/excludes/requirements, transport includes. Some should become booking snapshots/caches; others should be removed after relation migration. |
| Migration risks | Prisma schema drift: migration SQL defines reseller models/foreign keys while `schema.prisma` read for this audit does not. Existing API code calls `db.reseller*`; schema/client consistency must be verified before catalog migration. Template fallback can hide templates unexpectedly when the first real record is created per entity type. IDs in seeds and UI often use slugs, not CUID destination IDs. |

### Affected Areas

- `prisma/schema.prisma` — central schema; currently lacks destination relations and appears out of sync with reseller migrations.
- `prisma/seed.ts` — seeds templates with string destination/city IDs and `isTemplate: true`; destructive seed deletes catalog tables.
- `prisma/migrations/20260515120000_add_template_flags/migration.sql` — introduced `isTemplate` fallback across catalog types.
- `prisma/migrations/20260518093439_agregar_modelos_reseller/migration.sql` — creates reseller tables and string-polymorphic catalog references.
- `src/app/api/admin/destinations/route.ts`, `src/app/api/admin/hotels/route.ts`, `src/app/api/admin/packages/route.ts`, `src/app/api/admin/excursions/route.ts`, `src/app/api/admin/transport-services/route.ts` — CRUD/list APIs rely on string IDs, duplicated names, JSON arrays, and per-type template fallback.
- `src/app/api/public/destinations/route.ts`, `src/app/api/public/hotels/route.ts`, `src/app/api/public/packages/route.ts`, `src/app/api/public/excursions/route.ts`, `src/app/api/public/transport/route.ts`, `src/app/api/public/booking/route.ts` — public hydration and booking use string service references and snapshots.
- `src/app/api/reseller/catalog/**`, `src/lib/reseller/catalog.ts`, `src/lib/reseller/catalog-validators.ts` — reseller catalog is polymorphic by strings, not relations; hides template sources entirely.
- `src/components/admin/AdminDestinations.tsx`, `AdminHotels.tsx`, `AdminPackages.tsx`, `AdminExcursions.tsx`, `AdminTransport.tsx`, `AdminAllotments.tsx`, `AdminBookings.tsx` — admin forms expose manual IDs/names and JSON-like data rather than relational selectors.
- `src/components/reseller/ResellerCatalogBrowser.tsx`, `ResellerCatalogItem.tsx`, `ResellerAddToCatalogDialog.tsx`, `ResellerProducts.tsx`, sales/client components — reseller views depend on sourceType/sourceId and public catalog APIs.
- `src/components/portal/PublicPortalHome.tsx`, `HeroSection.tsx`, `DestinationsSection.tsx`, `HotelPreviewSection.tsx`, `HotelsPage.tsx`, `PackageDetail.tsx`, `ExcursionsPage.tsx`, `TransportPage.tsx`, `DynamicPackager.tsx`, `BookingFlow.tsx`, `HotelBookingFlow.tsx` — public web hydrates from DB where available but falls back to static data in several components.
- `src/data/destinations.ts`, `src/data/hotels.ts`, `src/data/packages.ts` — static mock/catalog fallback duplicates DB seed content and defines city/destination IDs used by filters.
- `AI_CONTEXT.md` — documents `isTemplate` fallback and relevant historical changes.

### Impact Diagnosis

#### Admin impact

- Admin package/excursion/hotel forms currently ask for `destinationId`, `destinationName`, `cityId`, and `cityName` manually; relation design should replace this with destination/city selectors while preserving displayed names as denormalized snapshots only where useful.
- Admin hotel rooms are currently JSON in `Hotel.rooms`, while `RoomType` exists relationally and allotments depend on `RoomType`; this is the biggest internal inconsistency for lodging.
- Admin transport has a real provider relation but location is still string-based (`cityId`, `cityName`, `origin`, `destination`).
- `isTemplate` fallback means admin lists can switch from showing all templates to only real records as soon as one real record exists for a type.

#### Reseller impact

- `ResellerCatalog` is a string-polymorphic table; it cannot enforce foreign keys to hotels/packages/excursions/transport/destinations/rooms.
- Available reseller products only include non-template records (`active: true, isTemplate: false`), unlike public APIs that fall back to templates. In a fresh/template-only catalog, reseller add-to-catalog can appear empty.
- Reseller display code reconstructs names, locations, images, and prices from source data at read time; if source products are deleted or become templates, catalog cards degrade to empty source data.

#### Public web impact

- Home, destinations, hotels, excursions, transport, package details, and dynamic package builder all hydrate from public APIs with static fallback in several components.
- Filters rely on slug-like strings: `useCities()` maps destination `slug || id`, while hotels/transports/excursions store `cityId`/`destinationId` as strings. A move to CUID foreign keys must preserve slug filters or introduce stable public slugs separately.
- DynamicPackager relates transport/hotel/excursion by matching `cityId`, `destinationId`, and `cityName`; this must become explicit destination/city relation logic.

#### Bookings/reservations impact

- `BookingItem` is intentionally snapshot-like today (`itemType`, `serviceId`, `serviceName`, `roomTypeId`, `roomName`, dates, quantities, prices, addons). This is appropriate for historical reservations, but should be formalized as a snapshot/cache strategy rather than treated as a live relation.
- Hotel availability uses real `RoomType`/`Allotment`, but public hotel selection reads room data from `Hotel.rooms` JSON, so booking can send room IDs that may not exist in `RoomType`/allotment unless data is synchronized.
- Bookings use string dates in `BookingItem`; `Booking.checkIn/checkOut` are DateTime in schema but code writes empty strings as fallback, which should be checked during design.

### Approaches

1. **Incremental relational spine** — introduce/complete a relational spine around `Destination`/`City` and add nullable FK fields while keeping string snapshots during migration.
   - Pros: safest; preserves public URLs, templates, reseller data, and bookings; allows backfill and phased UI changes.
   - Cons: temporarily duplicates source-of-truth fields; requires careful compatibility code.
   - Effort: High.

2. **Hard normalization rewrite** — replace string fields and polymorphic references directly with strict relations.
   - Pros: clean final model faster on paper.
   - Cons: high migration risk; breaks templates, reseller catalog, public filters, seeded IDs, and booking history unless solved all at once.
   - Effort: Very High.

3. **Snapshot-only cleanup** — keep current strings but rename/document them as snapshots and add helper utilities.
   - Pros: lowest immediate risk.
   - Cons: does not solve systemic relational objective; keeps data integrity weak.
   - Effort: Medium.

### Recommendation

Proceed with **Incremental relational spine**. First verify Prisma schema/client drift, then design a destination/city/catalog relation model with nullable FKs and explicit snapshot fields. Preserve `isTemplate` semantics and public slugs while gradually migrating admin selectors, public filters, reseller source references, and package composition.

### Risks

- Prisma schema drift between `schema.prisma`, migrations, generated client, and code references to `db.reseller*` can block or corrupt later migrations if not resolved first.
- Template fallback is global per entity type; partial real data can make seeded templates disappear from public/admin views.
- Backfilling relation IDs from strings is ambiguous because many fields contain slugs (`cartagena`) while Prisma IDs are CUIDs for created records.
- Hotel room data is split between JSON `Hotel.rooms` and relational `RoomType`; booking/allotment correctness depends on resolving this.
- Changing booking item references without snapshot discipline can damage historical reservation readability.

### Ready for Proposal

Yes — but the proposal should explicitly include a schema drift verification gate, `isTemplate` preservation, a backfill strategy from string IDs to relations, and a phased delivery plan under the 800-line review budget.

### Files Inspected

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma/migrations/20260515120000_add_template_flags/migration.sql`
- `prisma/migrations/20260518093439_agregar_modelos_reseller/migration.sql`
- `AI_CONTEXT.md`
- `openspec/config.yaml`
- `src/app/api/admin/destinations/route.ts`
- `src/app/api/admin/hotels/route.ts`
- `src/app/api/admin/packages/route.ts`
- `src/app/api/admin/excursions/route.ts`
- `src/app/api/admin/transport-services/route.ts`
- `src/app/api/admin/stats/route.ts`
- `src/app/api/public/destinations/route.ts`
- `src/app/api/public/hotels/route.ts`
- `src/app/api/public/packages/route.ts`
- `src/app/api/public/excursions/route.ts`
- `src/app/api/public/transport/route.ts`
- `src/app/api/public/booking/route.ts`
- `src/app/api/reseller/catalog/route.ts`
- `src/app/api/reseller/catalog/available/route.ts`
- `src/app/api/reseller/sales/route.ts`
- `src/lib/admin/hotels.ts`
- `src/lib/reseller/catalog.ts`
- `src/lib/reseller/catalog-validators.ts`
- `src/lib/reseller/sales.ts`
- `src/hooks/use-cities.ts`
- `src/components/admin/AdminHotels.tsx`
- `src/components/admin/AdminPackages.tsx`
- `src/components/reseller/ResellerCatalogBrowser.tsx`
- `src/components/reseller/ResellerCatalogItem.tsx`
- `src/components/reseller/ResellerAddToCatalogDialog.tsx`
- `src/components/reseller/ResellerProducts.tsx`
- `src/components/portal/PublicPortalHome.tsx`
- `src/components/portal/DestinationsSection.tsx`
- `src/components/portal/HotelPreviewSection.tsx`
- `src/components/portal/HotelsPage.tsx`
- `src/components/portal/PackageDetail.tsx`
- `src/components/portal/ExcursionsPage.tsx`
- `src/components/portal/TransportPage.tsx`
- `src/components/portal/DynamicPackager.tsx`
- `src/app/page.tsx`
- `src/app/destinos/page.tsx`
- `src/app/hoteles/page.tsx`
- `src/app/paquetes/[packageId]/page.tsx`
- `src/app/transportes/page.tsx`
- `src/data/destinations.ts`
- `src/data/hotels.ts`
- `src/data/packages.ts`

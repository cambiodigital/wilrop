# Tasks: Catálogo Relacional Turístico

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 2,500–4,500 total; ≤800 target per slice |
| 400-line budget risk | High |
| 800-line budget risk | High single PR; Medium per slice |
| Chained PRs recommended | Yes |
| Suggested split | PR1 schema → PR2 backfill → PR3 APIs → PR4 admin → PR5 reseller → PR6 public → PR7 gate |
| Delivery strategy | auto-forecast |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High
800-line budget risk: High single PR; Medium per slice

### Suggested Work Units

PR1 drift/schema (tracker, Prisma cmds) → PR2 backfill/resolver (dry-run/rollback) → PR3 admin APIs (curl) → PR4 admin selectors (CRUD QA) → PR5 reseller (snapshot QA) → PR6 public/booking (smoke) → PR7 validation gate (no legacy drop).

## Fase 1 — Auditoría y diagnóstico
- [x] 1.1 Reconcile `prisma/schema.prisma` with reseller migration; stop on drift. Verify: `bunx prisma validate`, `bunx prisma migrate status`, `bun run db:generate`, `bunx tsc --noEmit`.
- [x] 1.2 Classify legacy fields; preserve `isTemplate`, slugs, snapshots, bookings, `sourceType/sourceId`. Safe stop.

## Fase 2 — Diseño Prisma relacional
- [x] 2.1 Add nullable FKs/join models, indexes, uniques, relation names in `prisma/schema.prisma` plus additive `prisma/migrations/*`. Verify validate/generate/SQL.
- [x] 2.2 Record rollback: drop only new tables/FKs; never legacy fields.

## Fase 3 — Migración segura
- [x] 3.1 Create `src/lib/catalog/*` matcher, resolver/cache, report helpers. Verify: `bunx tsc --noEmit`, `bun run lint`.
- [x] 3.2 Add dry-run backfill with batch marker and delete-by-batch rollback; QA unresolved report and `isTemplate` unchanged.
- [x] 3.3 PR2 verification unblocker: add focused executable tests for destination matching/backfill planning and fix the pre-existing `HotelsPage.tsx` manual memoization lint failure. Verify: `npm run test:catalog`, `node_modules/.bin/tsc.cmd --noEmit`, `node_modules/.bin/eslint.cmd .`.

## Fase 4 — APIs de relaciones
- [x] 4.1 Create `src/app/api/admin/relation-options/**/route.ts` returning `RelationOption`; verify curl filters and typecheck. PR3 verification fix: unresolved destination filters now fail closed with empty options + metadata instead of broadening results; room-type options validate `hotelId` and apply hotel-template fallback semantics.
- [x] 4.2 Create `src/app/api/admin/*/[id]/relations/route.ts`; reject orphan/duplicate/template-incompatible links; preserve snapshots. PR3 implements the minimal package relation management endpoint; broader entity relation endpoints remain future expansion under the same contract.

## Fase 5 — Admin UX
- [ ] 5.1 Update `src/components/admin/*` selectors/dialogs with loading/empty/error/retry/disabled/create-missing states; QA catalog CRUD.
  - [x] PR4 first slice: package create/edit destination now uses `/api/admin/relation-options/destinations` and `/api/admin/packages/[id]/relations`, removes manual destination ID entry, shows loading/empty/error/retry/create-destination CTA states, keeps `destinationName` as snapshot label, and adds focused selector helper tests.
  - [x] PR4 composition selector slice: package create/edit now selects hotels, hotel-scoped room types, excursions, and transport services from PR3 option endpoints; saves real relation IDs through `/api/admin/packages/[id]/relations`; shows loading/empty/error/retry/disabled states and CTAs to existing admin modules; adds focused pure-helper coverage for payload/hydration/reconciliation.
  - [x] PR4 verification coverage slice: because no browser/component runner exists, added executable selector smoke-state helpers used by `AdminPackages` and covered by `npm run test:catalog` for loading, empty/create CTA, error/retry, disabled prerequisite, ready option labels, and normalized selected IDs in relation payloads.
  - [x] PR4 AdminHotels destination selector slice: hotel create/edit now uses `/api/admin/relation-options/destinations?active=all`, removes manual `cityId/cityName` as the primary input, shows loading/empty/error/retry/create-destination states, persists real `destinationId` through the existing hotel save path, and keeps `cityId/cityName` as compatibility/snapshot fields with focused helper tests.
  - [x] PR4 AdminExcursions destination selector slice: excursion create/edit now uses `/api/admin/relation-options/destinations?active=all`, removes manual `destinationId/destinationName/cityName` as primary inputs, shows loading/empty/error/retry/create-destination states, and maps the selected destination into the current excursion API compatibility fields until a dedicated excursion relation-management API is implemented, with focused helper tests.
  - [x] PR4 AdminTransport destination/origin selector slice: transport service create/edit now uses `/api/admin/relation-options/destinations?active=all` for origin and destination selectors, replaces manual `origin`/`destination`/`cityId`/`cityName` as primary relation inputs, shows loading/empty/error/retry/create-destination states, and maps selections into current transport API compatibility snapshot fields until a transport relation-management save path persists `originDestinationId`/`destinationDestinationId`, with focused helper tests.
- [ ] 5.2 Add RoomType-first hotel/package composition UI with `Hotel.rooms` fallback. Verify: `bun run build`.

## Fase 6 — Reseller UX
- [ ] 6.1 Update `src/lib/reseller/*` and `src/app/api/reseller/catalog/**` for typed refs, auth filters, customization, orphan warnings.
  - [x] PR5 first slice: typed source resolution — created `src/lib/reseller/source-resolver.ts` with `ResolvedSource`/`CatalogPresentation` contracts, `resolveSourceFields()` normalises 6 source types into consistent display fields (title, image, price, location, description), and `resolveCatalogPresentation()` merges reseller overrides with source data. Updated `ResellerCatalogItem.tsx` and `ResellerPriceEditor.tsx` to use typed presentation instead of ad-hoc field adapters. Added 10 focused pure-helper tests.
- [x] 6.2 QA reseller browse/edit/add and booking snapshot after source edit; verify tsc/lint.

## Fase 7 — Web pública
- [ ] 7.1 Update `src/app/api/public/**`, `src/components/portal/*`, `src/hooks/use-cities.ts` for slug→relation hydration with fallback.
  - [x] PR6.1 destination detail relational hydration slice: `src/app/destinos/[destinationId]/page.tsx` now hydrates packages through `DestinationPackage` join (with `primaryDestinationId` FK and legacy `destinationId` string fallback), hotels through `DestinationHotel` join (with `Hotel.destinationId` FK and `cityId/cityName` fallback), and excursions through `DestinationExcursion` join (with `destinationRefId` FK and `destinationId/destinationName` fallback). New `src/lib/catalog/public-hydration.ts` provides pure, testable `normalizePackage`/`normalizeHotel`/`normalizeExcursion`/`parseJsonArray`/`resolveIsTemplateFallback`/`extractEntitiesFromJoinRows` helpers. Added 19 focused pure-helper tests. Page UI now renders hotel cards (stars, rating, priceFrom, slug link) and excursion cards (category, duration, difficulty, basePrice, slug link) using existing package-card pattern. All legacy fallback paths preserved. No transport hydration in this slice (deferred). No admin/reseller/public API route changes. 58/58 tests pass; tsc, eslint, prisma validate clean; build succeeds (known sitemap DB warning). ~756 changed lines; under 800-line budget.
  - [x] PR6.2 transport hydration sub-slice: added `normalizeTransport` helper to `public-hydration.ts` with `NormalizedTransport` interface. Destination detail page now hydrates transport services through identical 3-tier fallback: `DestinationTransportService` join → `originDestinationId`/`destinationDestinationId` FKs → `cityId`/`cityName` legacy matching. Added `'transport'` to template fallback resolver. Page UI renders transport cards (Bus icon, routeType, origin→destination, durationMins, basePrice, link to `/transportes/{id}`). Updated SEO metadata to mention transport. Added 2 pure-helper tests. 60/60 tests pass; all verifications clean. ~170 changed lines.
  - [x] PR6.3 home page destination-package relational filtering slice: added `resolvePackageDestinationIds` pure helper to `public-hydration.ts` that groups `DestinationPackage` join rows into a `Map<packageId, destinationIds[]>`. Enhanced `/api/public/packages` to query `DestinationPackage` joins and attach `relatedDestinationIds` to each package response (with graceful degradation if join table is unavailable). Updated `DestinationsSection` client component to prefer `relatedDestinationIds.includes(d.id)` over legacy `p.destinationId === d.id` string comparison for category filtering, with fallback to legacy when relation data is absent. Added 4 focused pure-helper tests. 64/64 tests pass; tsc, eslint, prisma validate clean; build succeeds. ~89 changed lines. No admin/reseller changes. Static data fallback preserved.
- [x] 7.2 QA home, destination, hotel, package, excursion, transport, search, CTA, booking snapshot/stale-source flows.

## Fase 8 — Validaciones, pruebas y limpieza
- [x] 8.1 Run/report `bunx prisma validate`, `bunx prisma migrate status`, `bun run db:generate`, `bunx tsc --noEmit`, `bun run lint`, `bun run build`. ✅ All 5 commands pass (1 pre-existing sitemap DB warning). Full command evidence table in `validation-gate.md`.
- [x] 8.2 Document missing Prisma/API/UI/reseller/public/booking tests; no compile-only completion claims. ✅ Full coverage inventory, legacy field classification (12 models, `KEEP_SNAPSHOT`/`KEEP_CACHE`/`KEEP_COMPAT`/`SAFE_TO_REMOVE`/`NEEDS_EVIDENCE`), known gaps, and conditional cleanup plan documented in `validation-gate.md`.

## Fase 9 — Retiro de campos legacy si procede
- [ ] 9.1 Keep legacy fields unless backfill/read parity and manual QA prove removal safe.
- [ ] 9.2 If later approved, plan separate destructive migration with fixture comparison and rollback.

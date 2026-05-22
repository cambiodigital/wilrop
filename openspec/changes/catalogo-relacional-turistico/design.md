# Design: Catálogo Relacional Turístico

## Technical Approach

Implement an additive relational spine: reconcile Prisma drift, add nullable FKs/join tables, backfill deterministically, then move APIs/UI/public/reseller reads behind relation-aware resolvers with legacy fallback. Do not delete legacy fields or change `isTemplate`; classify fields as source, snapshot, cache, or legacy.

## Architecture Decisions

| Decision | Choice | Tradeoff / rationale |
|---|---|---|
| Prisma model shape | Explicit joins: `DestinationHotel`, `DestinationPackage`, `DestinationExcursion`, `DestinationTransportService`, `PackageHotel`, `PackageExcursion`, `PackageTransportService`, `PackageRoomType`, `PackageDepartureDate`, `PackageItineraryDay`, `PackageIncludedService`; optional FKs like `Hotel.destinationId?`, `TravelPackage.primaryDestinationId?`. | More tables, but removes hidden string coupling and supports multi-destination products. |
| Relation names/deletes | Name all Prisma relations. `Cascade` join rows; `SetNull` optional cache/bridge refs; `Restrict/NoAction` sources with sales. | Prevents product deletion from erasing history. |
| Constraints | `@@unique` on relation pairs/role tuples; indexes on FK, `active/isTemplate`, `slug`, ordered featured lists. | Supports selectors, public filters, and backfill idempotency. |
| Source vs snapshot | Source: FK rows, `RoomType`, package relation rows, `Destination.slug`. Snapshot/cache: names, `Hotel.rooms`, `includes`, `departureDates`, booking names/prices. Legacy bridge: `sourceType/sourceId`. | Duplication is safer than destructive normalization. |
| Catalog bridge | `CatalogItem` cache/resolver with `sourceType/sourceId`, cached title/slug/image/price/destination/isTemplate, plus typed nullable reseller refs. | Resolver lowers risk; cache speeds lists. |

## Data Flow

```text
Admin selector -> relation-options API -> Prisma joins/FKs
Admin save -> relation management API -> nullable FK/join upsert -> legacy snapshots retained
Public slug -> destination resolver -> relation hydration -> legacy/static fallback
Reseller -> authorized CatalogItem -> reseller overrides -> booking/sale snapshots
```

## File Changes

| File | Action | Description |
|---|---|---|
| `prisma/schema.prisma` | Modify | Restore `Reseller*` models from migration `20260518093439_agregar_modelos_reseller`; add nullable FKs, joins, indexes, uniques, relation names. |
| `prisma/migrations/*` | Create | Drift-fix if needed, then additive relational migration; no legacy drops. |
| `src/lib/catalog/*` | Create | `CatalogItem` resolver/cache, slug/CUID/name matcher, source/snapshot helpers, unresolved reports. |
| `src/app/api/admin/relation-options/**/route.ts` | Create | Options return `{ id, slug, label, subtitle, active, isTemplate, sourceType }`. |
| `src/app/api/admin/*/[id]/relations/route.ts` | Create/Modify | Package/hotel/excursion/transport relation upserts using `db` singleton and current JSON style. |
| `src/components/admin/*` | Modify | Replace manual IDs with selectors/dialogs; keep shadcn/Radix/Tailwind and Spanish labels. |
| `src/lib/reseller/*`, `src/app/api/reseller/catalog/**` | Modify | Authorized catalog bridge, overrides, commission, orphan fallback. |
| `src/app/api/public/**`, `src/components/portal/*`, `src/hooks/use-cities.ts` | Modify | Resolve slugs to IDs, hydrate through relations, preserve CTA/booking payloads. |

## Interfaces / Contracts

`RelationOption = { id: string; slug?: string; label: string; subtitle?: string; active: boolean; isTemplate?: boolean; sourceType?: string }`.
Backfill report: `{ entity, legacyValue, matchedId?, strategy: 'slug'|'cuid'|'name'|'unresolved'|'ambiguous', dryRun, reason? }`.
Booking/sale writes keep live refs optional and snapshot `sourceType/sourceId`, title/name, room/date/services, prices, commission, and reseller overrides.

## Migration / Rollout

1. Gate: `bunx prisma validate`, `bunx prisma migrate status`, `bun run db:generate`; schema/client/migrations must agree.
2. Add nullable schema only. Preserve `isTemplate` and every legacy field.
3. Dry-run idempotent backfill: match Destination by slug, then CUID, then normalized name; write only deterministic joins/FKs; emit unresolved/ambiguous CSV/JSON.
4. Backfill package composition and reseller bridge; do not infer when source is ambiguous. Preserve `isTemplate` on sources and cache.
5. Rollback: delete generated rows by batch marker and drop new nullable joins/FKs per PR; legacy reads still work.

## Admin / Reseller / Public / Booking UX

Admin selectors expose loading, empty, error, retry, disabled, and create-missing states. Resellers customize only their row; orphaned sources show snapshot warnings. Public filters accept slugs and legacy IDs. Bookings use live `RoomType/Allotment` for availability; `BookingItem` stays snapshot-first.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Prisma | Drift, relations, idempotent backfill, `isTemplate` | Manual commands now; later add integration fixtures. |
| API | options, relation upserts, reseller auth, public slug hydration | curl/manual checks; later route tests. |
| UI | selectors/create-missing/public/reseller booking smoke | Manual browser flows; later Playwright/component tests. |

Commands: `bunx prisma validate`, `bunx prisma migrate status`, `bun run db:generate`, `bunx tsc --noEmit`, `bun run lint`, `bun run build`.

## Phase Slicing

Auto-forecast: one PR exceeds 800 lines. Chain PR1 drift+schema, PR2 backfill/resolver, PR3 admin APIs, PR4 admin UX, PR5 reseller bridge, PR6 public hydration+booking compatibility, PR7 validation/docs/conditional cleanup. Legacy removal is future-only.

## Open Questions

- [ ] Should `CatalogItem` be a persisted table immediately or a resolver with optional cache? Design supports both; persisted cache is faster, resolver is lower migration risk.

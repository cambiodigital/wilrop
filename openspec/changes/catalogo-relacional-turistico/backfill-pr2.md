# PR2 Backfill / Resolver Notes

## Boundary

This slice adds compatibility helpers only. It does not create admin routes, public hydration changes, reseller UX changes, or destructive database writes.

## Matching order

Legacy destination references are resolved deterministically:

1. `Destination.slug`
2. `Destination.id`
3. normalized `Destination.name`

Ambiguous and unresolved rows are reported and are not guessed.

## Dry-run and rollback

`createDestinationBackfillPlan` returns an idempotent dry-run plan with a `batchId`, planned operations, unresolved/ambiguous reports, and rollback steps.

PR2 intentionally does not add marker columns to the additive catalog tables. Before any later write-mode backfill, persist the dry-run report and its `batchId`; rollback must delete/unset only the relation rows and nullable refs listed in that persisted report.

Legacy fields, public slugs, booking snapshots, `isTemplate`, `sourceType`, and `sourceId` remain untouched.

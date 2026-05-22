import { createDestinationMatchReport } from './matching'
import type {
  BackfillOperation,
  BackfillOperationType,
  BackfillPlan,
  BackfillRollbackStep,
  DestinationCandidate,
  LegacyDestinationRef,
} from './types'

export interface CreateDestinationBackfillPlanInput {
  destinations: DestinationCandidate[]
  legacyRefs: LegacyDestinationRef[]
  batchId?: string
  dryRun?: boolean
  generatedAt?: Date
}

export function createDestinationBackfillPlan(input: CreateDestinationBackfillPlanInput): BackfillPlan {
  const dryRun = input.dryRun ?? true
  const batchId = input.batchId ?? createCatalogBackfillBatchId()
  const generatedAt = input.generatedAt ?? new Date()
  const reports = input.legacyRefs.map((legacyRef) => createDestinationMatchReport({
    entity: legacyRef.entity,
    entityId: legacyRef.entityId,
    input: {
      slug: legacyRef.slug,
      id: legacyRef.id,
      name: legacyRef.name,
    },
    destinations: input.destinations,
    dryRun,
  }))

  const operations = reports.flatMap((report) => {
    if (!report.matchedId) return []

    const legacyRef = input.legacyRefs.find((ref) => ref.entity === report.entity && ref.entityId === report.entityId)
    if (!legacyRef) return []

    return buildDestinationOperations(legacyRef, report.matchedId, batchId, dryRun)
  })

  return {
    batchId,
    dryRun,
    generatedAt: generatedAt.toISOString(),
    reports,
    operations,
    rollback: {
      strategy: 'delete-by-persisted-batch-report',
      note: 'PR2 does not add marker columns to catalog tables. Persist this dry-run report with its batchId before any later write mode; rollback deletes only rows/nullable refs listed in the persisted batch report and never touches legacy fields, slugs, snapshots, isTemplate, sourceType, or sourceId.',
      steps: operations.flatMap(createRollbackSteps),
    },
    summary: {
      total: reports.length,
      planned: operations.length,
      unresolved: reports.filter((report) => report.strategy === 'unresolved').length,
      ambiguous: reports.filter((report) => report.strategy === 'ambiguous').length,
    },
  }
}

export function createCatalogBackfillBatchId(date: Date = new Date()): string {
  return `catalog-pr2-${date.toISOString().replace(/[:.]/g, '-')}`
}

function buildDestinationOperations(
  legacyRef: LegacyDestinationRef,
  destinationId: string,
  batchId: string,
  dryRun: boolean,
): BackfillOperation[] {
  const common = {
    batchId,
    entity: legacyRef.entity,
    entityId: legacyRef.entityId,
    destinationId,
    dryRun,
  }

  const relationData = {
    destinationId,
    featured: legacyRef.featured ?? false,
    sortOrder: legacyRef.sortOrder ?? 0,
    active: legacyRef.active ?? true,
  }

  switch (legacyRef.entity) {
    case 'hotel':
      return [
        operation('set-hotel-primary-destination', common, { destinationId }),
        operation('upsert-destination-hotel', common, { ...relationData, hotelId: legacyRef.entityId }),
      ]
    case 'package':
      return [
        operation('set-package-primary-destination', common, { primaryDestinationId: destinationId }),
        operation('upsert-destination-package', common, { ...relationData, packageId: legacyRef.entityId }),
      ]
    case 'excursion':
      return [
        operation('set-excursion-primary-destination', common, { destinationRefId: destinationId }),
        operation('upsert-destination-excursion', common, { ...relationData, excursionId: legacyRef.entityId }),
      ]
    case 'transport':
      return [
        operation('set-transport-destination', common, { destinationDestinationId: destinationId }),
        operation('upsert-destination-transport-service', common, {
          ...relationData,
          transportServiceId: legacyRef.entityId,
        }),
      ]
  }
}

function operation(
  type: BackfillOperationType,
  common: Omit<BackfillOperation, 'type' | 'data'>,
  data: BackfillOperation['data'],
): BackfillOperation {
  return { type, ...common, data }
}

function createRollbackSteps(operation: BackfillOperation): BackfillRollbackStep[] {
  switch (operation.type) {
    case 'set-hotel-primary-destination':
      return [{ operation: 'unset-foreign-key', model: 'Hotel', where: { id: operation.entityId } }]
    case 'upsert-destination-hotel':
      return [{ operation: 'delete-join-row', model: 'DestinationHotel', where: relationWhere(operation, 'hotelId') }]
    case 'set-package-primary-destination':
      return [{ operation: 'unset-foreign-key', model: 'TravelPackage', where: { id: operation.entityId } }]
    case 'upsert-destination-package':
      return [{ operation: 'delete-join-row', model: 'DestinationPackage', where: relationWhere(operation, 'packageId') }]
    case 'set-excursion-primary-destination':
      return [{ operation: 'unset-foreign-key', model: 'Excursion', where: { id: operation.entityId } }]
    case 'upsert-destination-excursion':
      return [{ operation: 'delete-join-row', model: 'DestinationExcursion', where: relationWhere(operation, 'excursionId') }]
    case 'set-transport-destination':
      return [{ operation: 'unset-foreign-key', model: 'TransportService', where: { id: operation.entityId } }]
    case 'upsert-destination-transport-service':
      return [{
        operation: 'delete-join-row',
        model: 'DestinationTransportService',
        where: relationWhere(operation, 'transportServiceId'),
      }]
  }
}

function relationWhere(operation: BackfillOperation, foreignKey: string): Record<string, string> {
  return {
    destinationId: operation.destinationId,
    [foreignKey]: operation.entityId,
  }
}

export type CatalogSourceType = 'destination' | 'hotel' | 'package' | 'excursion' | 'transport'

export type DestinationMatchStrategy = 'slug' | 'cuid' | 'name' | 'unresolved' | 'ambiguous'

export interface DestinationMatchInput {
  slug?: string | null
  id?: string | null
  name?: string | null
}

export interface DestinationCandidate {
  id: string
  slug: string
  name: string
  active?: boolean
  isTemplate?: boolean
}

export interface DestinationMatchReport {
  entity: CatalogSourceType
  entityId: string
  legacyValue: string
  matchedId?: string
  strategy: DestinationMatchStrategy
  dryRun: boolean
  reason?: string
  candidates?: Array<Pick<DestinationCandidate, 'id' | 'slug' | 'name'>>
}

export interface LegacyDestinationRef {
  entity: Exclude<CatalogSourceType, 'destination'>
  entityId: string
  slug?: string | null
  id?: string | null
  name?: string | null
  featured?: boolean
  sortOrder?: number
  active?: boolean
}

export type BackfillOperationType =
  | 'set-hotel-primary-destination'
  | 'upsert-destination-hotel'
  | 'set-package-primary-destination'
  | 'upsert-destination-package'
  | 'set-excursion-primary-destination'
  | 'upsert-destination-excursion'
  | 'set-transport-destination'
  | 'upsert-destination-transport-service'

export interface BackfillOperation {
  type: BackfillOperationType
  batchId: string
  entity: LegacyDestinationRef['entity']
  entityId: string
  destinationId: string
  dryRun: boolean
  data: Record<string, string | number | boolean | null>
}

export interface BackfillRollbackStep {
  operation: 'unset-foreign-key' | 'delete-join-row'
  model: string
  where: Record<string, string>
}

export interface BackfillPlan {
  batchId: string
  dryRun: boolean
  generatedAt: string
  reports: DestinationMatchReport[]
  operations: BackfillOperation[]
  rollback: {
    strategy: 'delete-by-persisted-batch-report'
    note: string
    steps: BackfillRollbackStep[]
  }
  summary: {
    total: number
    planned: number
    unresolved: number
    ambiguous: number
  }
}

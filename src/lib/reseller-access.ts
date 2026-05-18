export const resellerLevels = ['starter', 'standard', 'free_light'] as const

export type ResellerLevel = (typeof resellerLevels)[number]

export interface ResellerCapabilities {
  maxCatalogItems: number
  canCustomizePrices: boolean
  canUseWhiteLabel: boolean
  hasSalesApi: boolean
  hasAdvancedReports: boolean
  maxClients: number
}

const LEVEL_CONFIG: Record<ResellerLevel, ResellerCapabilities> = {
  starter: {
    maxCatalogItems: 10,
    canCustomizePrices: false,
    canUseWhiteLabel: false,
    hasSalesApi: false,
    hasAdvancedReports: false,
    maxClients: 20,
  },
  standard: {
    maxCatalogItems: 50,
    canCustomizePrices: true,
    canUseWhiteLabel: false,
    hasSalesApi: true,
    hasAdvancedReports: true,
    maxClients: 100,
  },
  free_light: {
    maxCatalogItems: Infinity,
    canCustomizePrices: true,
    canUseWhiteLabel: true,
    hasSalesApi: true,
    hasAdvancedReports: true,
    maxClients: Infinity,
  },
}

export function normalizeResellerLevel(value: unknown): ResellerLevel {
  return resellerLevels.includes(value as ResellerLevel) ? (value as ResellerLevel) : 'standard'
}

export function getResellerCapabilities(input: {
  sellerLevel?: unknown
  whiteLabelEnabled?: boolean
}): ResellerCapabilities {
  const sellerLevel = normalizeResellerLevel(input.sellerLevel)
  const base = LEVEL_CONFIG[sellerLevel]

  return {
    ...base,
    canUseWhiteLabel: base.canUseWhiteLabel || input.whiteLabelEnabled === true,
  }
}

export function getResellerLevelLabel(level: ResellerLevel): string {
  const labels: Record<ResellerLevel, string> = {
    starter: 'Novato',
    standard: 'Revendedor',
    free_light: 'Free Light',
  }

  return labels[level]
}

export function canAddMoreCatalogItems(currentCount: number, level: ResellerLevel): boolean {
  const max = LEVEL_CONFIG[level].maxCatalogItems
  return currentCount < max
}

export function getMaxCatalogItemsLabel(level: ResellerLevel): string {
  const max = LEVEL_CONFIG[level].maxCatalogItems
  return max === Infinity ? 'Ilimitado' : `${max}`
}

export function getMaxClientsLabel(level: ResellerLevel): string {
  const max = LEVEL_CONFIG[level].maxClients
  return max === Infinity ? 'Ilimitado' : `${max}`
}

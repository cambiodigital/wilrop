export const resellerLevels = ['starter', 'standard', 'free_light'] as const

export type ResellerLevel = (typeof resellerLevels)[number]

export interface ResellerCapabilities {
  canUseWhiteLabel: boolean
}

export function normalizeResellerLevel(value: unknown): ResellerLevel {
  return resellerLevels.includes(value as ResellerLevel) ? (value as ResellerLevel) : 'standard'
}

export function getResellerCapabilities(input: {
  sellerLevel?: unknown
  whiteLabelEnabled?: unknown
}): ResellerCapabilities {
  const sellerLevel = normalizeResellerLevel(input.sellerLevel)

  return {
    canUseWhiteLabel: sellerLevel === 'free_light' || input.whiteLabelEnabled === true,
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

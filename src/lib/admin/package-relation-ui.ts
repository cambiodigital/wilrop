export type PackageRelationOption = {
  id: string;
  slug?: string;
  label: string;
  subtitle?: string;
  active: boolean;
  isTemplate?: boolean;
  sourceType?: string;
};

export type PackageDestinationOption = PackageRelationOption;

export type PackageCompositionSelection = {
  destinationId: string;
  hotelIds: string[];
  roomTypeIds: string[];
  excursionIds: string[];
  transportServiceIds: string[];
};

export type PackageRelationSelectorSmokeState = {
  status: 'loading' | 'disabled' | 'error' | 'empty' | 'ready';
  statusLabel: string;
  hasRetry: boolean;
  createCta?: { href: string; label: string };
  options: Array<PackageRelationOption & { selected: boolean; stateLabel?: string }>;
};

type RelationOptionsResponse = {
  success?: boolean;
  data?: unknown;
};

function isPackageRelationOption(value: unknown): value is PackageRelationOption {
  if (!value || typeof value !== 'object') return false;
  const option = value as Partial<PackageRelationOption>;
  return typeof option.id === 'string' && typeof option.label === 'string' && typeof option.active === 'boolean';
}

export function normalizePackageRelationOptions(response: unknown): PackageRelationOption[] {
  const data = (response as RelationOptionsResponse | null)?.data;
  if (!Array.isArray(data)) return [];
  return data.filter(isPackageRelationOption);
}

export function normalizePackageDestinationOptions(response: unknown): PackageDestinationOption[] {
  return normalizePackageRelationOptions(response);
}

export function findPackageDestinationOption(
  options: PackageDestinationOption[],
  destinationId: string
): PackageDestinationOption | undefined {
  return options.find((option) => option.id === destinationId);
}

export function buildPackageRelationsPayload(selection: PackageCompositionSelection) {
  return {
    destinationIds: selection.destinationId.trim() ? [selection.destinationId] : [],
    hotelIds: normalizeSelectedRelationIds(selection.hotelIds),
    roomTypeIds: normalizeSelectedRelationIds(selection.roomTypeIds),
    excursionIds: normalizeSelectedRelationIds(selection.excursionIds),
    transportServiceIds: normalizeSelectedRelationIds(selection.transportServiceIds),
  };
}

export function buildPackageDestinationRelationsPayload(destinationId: string): { destinationIds: string[] } {
  return { destinationIds: destinationId.trim() ? [destinationId] : [] };
}

export function selectedIdsFromPackageRelations(relations: unknown, group: string, sourceKey: string): string[] {
  const items = (relations as Record<string, unknown> | null)?.[group];
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return undefined;
      const record = item as Record<string, unknown>;
      const source = record[sourceKey];
      if (source && typeof source === 'object' && typeof (source as { id?: unknown }).id === 'string') {
        return (source as { id: string }).id;
      }
      const directId = record[`${sourceKey}Id`];
      return typeof directId === 'string' ? directId : undefined;
    })
    .filter((id): id is string => Boolean(id));
}

export function toggleSelectedId(selectedIds: string[], id: string): string[] {
  return selectedIds.includes(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id];
}

export function normalizeSelectedRelationIds(selectedIds: string[]): string[] {
  return Array.from(new Set(selectedIds.map((id) => id.trim()).filter(Boolean)));
}

export function keepIdsPresentInOptions(selectedIds: string[], options: PackageRelationOption[]): string[] {
  const optionIds = new Set(options.map((option) => option.id));
  return selectedIds.filter((id) => optionIds.has(id));
}

export function getPackageRelationSelectorSmokeState(input: {
  options: PackageRelationOption[];
  selectedIds: string[];
  isLoading?: boolean;
  error?: string | null;
  disabledMessage?: string;
  createCtaHref: string;
  createCtaLabel: string;
}): PackageRelationSelectorSmokeState {
  if (input.isLoading) {
    return { status: 'loading', statusLabel: 'Cargando opciones...', hasRetry: false, options: [] };
  }

  if (input.disabledMessage) {
    return { status: 'disabled', statusLabel: input.disabledMessage, hasRetry: false, options: [] };
  }

  if (input.error) {
    return { status: 'error', statusLabel: input.error, hasRetry: true, options: [] };
  }

  if (input.options.length === 0) {
    return {
      status: 'empty',
      statusLabel: 'No hay opciones compatibles.',
      hasRetry: false,
      createCta: { href: input.createCtaHref, label: input.createCtaLabel },
      options: [],
    };
  }

  const selectedIds = new Set(normalizeSelectedRelationIds(input.selectedIds));
  return {
    status: 'ready',
    statusLabel: 'Opciones disponibles',
    hasRetry: false,
    options: input.options.map((option) => ({
      ...option,
      selected: selectedIds.has(option.id),
      stateLabel: [option.isTemplate ? 'Plantilla' : '', !option.active ? 'Inactivo' : ''].filter(Boolean).join(' '),
    })),
  };
}

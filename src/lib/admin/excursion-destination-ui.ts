export type ExcursionDestinationOption = {
  id: string;
  slug?: string;
  label: string;
  subtitle?: string;
  active: boolean;
  isTemplate?: boolean;
  sourceType?: string;
};

export type ExcursionDestinationSelectorState = {
  status: 'loading' | 'error' | 'empty' | 'ready';
  statusLabel: string;
  hasRetry: boolean;
  createCta?: { href: string; label: string };
  options: Array<ExcursionDestinationOption & { selected: boolean; stateLabel?: string }>;
};

type RelationOptionsResponse = {
  success?: boolean;
  data?: unknown;
};

function isExcursionDestinationOption(value: unknown): value is ExcursionDestinationOption {
  if (!value || typeof value !== 'object') return false;
  const option = value as Partial<ExcursionDestinationOption>;
  return typeof option.id === 'string' && typeof option.label === 'string' && typeof option.active === 'boolean';
}

export function normalizeExcursionDestinationOptions(response: unknown): ExcursionDestinationOption[] {
  const data = (response as RelationOptionsResponse | null)?.data;
  if (!Array.isArray(data)) return [];
  return data.filter(isExcursionDestinationOption);
}

export function findExcursionDestinationOption(
  options: ExcursionDestinationOption[],
  destinationId: string
): ExcursionDestinationOption | undefined {
  return options.find((option) => option.id === destinationId);
}

export function buildExcursionDestinationCompatibilityFields(option: ExcursionDestinationOption | undefined) {
  return {
    destinationId: option?.id ?? '',
    destinationName: option?.label ?? '',
    cityName: option?.label ?? '',
  };
}

export function getExcursionDestinationSelectorState(input: {
  options: ExcursionDestinationOption[];
  selectedId: string;
  isLoading?: boolean;
  error?: string | null;
  createCtaHref: string;
  createCtaLabel: string;
}): ExcursionDestinationSelectorState {
  if (input.isLoading) {
    return { status: 'loading', statusLabel: 'Cargando destinos...', hasRetry: false, options: [] };
  }

  if (input.error) {
    return { status: 'error', statusLabel: input.error, hasRetry: true, options: [] };
  }

  if (input.options.length === 0) {
    return {
      status: 'empty',
      statusLabel: 'No hay destinos compatibles.',
      hasRetry: false,
      createCta: { href: input.createCtaHref, label: input.createCtaLabel },
      options: [],
    };
  }

  return {
    status: 'ready',
    statusLabel: 'Destinos disponibles',
    hasRetry: false,
    options: input.options.map((option) => ({
      ...option,
      selected: option.id === input.selectedId,
      stateLabel: [option.isTemplate ? 'Plantilla' : '', !option.active ? 'Inactivo' : ''].filter(Boolean).join(' '),
    })),
  };
}

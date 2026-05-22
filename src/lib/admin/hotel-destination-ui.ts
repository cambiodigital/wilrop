export type HotelDestinationOption = {
  id: string;
  slug?: string;
  label: string;
  subtitle?: string;
  active: boolean;
  isTemplate?: boolean;
  sourceType?: string;
};

export type HotelDestinationSelectorState = {
  status: 'loading' | 'error' | 'empty' | 'ready';
  statusLabel: string;
  hasRetry: boolean;
  createCta?: { href: string; label: string };
  options: Array<HotelDestinationOption & { selected: boolean; stateLabel?: string }>;
};

type RelationOptionsResponse = {
  success?: boolean;
  data?: unknown;
};

function isHotelDestinationOption(value: unknown): value is HotelDestinationOption {
  if (!value || typeof value !== 'object') return false;
  const option = value as Partial<HotelDestinationOption>;
  return typeof option.id === 'string' && typeof option.label === 'string' && typeof option.active === 'boolean';
}

export function normalizeHotelDestinationOptions(response: unknown): HotelDestinationOption[] {
  const data = (response as RelationOptionsResponse | null)?.data;
  if (!Array.isArray(data)) return [];
  return data.filter(isHotelDestinationOption);
}

export function findHotelDestinationOption(
  options: HotelDestinationOption[],
  destinationId: string
): HotelDestinationOption | undefined {
  return options.find((option) => option.id === destinationId);
}

export function buildHotelDestinationCompatibilityFields(option: HotelDestinationOption | undefined) {
  return {
    destinationId: option?.id ?? '',
    cityId: option?.id ?? '',
    cityName: option?.label ?? '',
  };
}

export function getHotelDestinationSelectorState(input: {
  options: HotelDestinationOption[];
  selectedId: string;
  isLoading?: boolean;
  error?: string | null;
  createCtaHref: string;
  createCtaLabel: string;
}): HotelDestinationSelectorState {
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

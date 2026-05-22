export type TransportDestinationOption = {
  id: string;
  slug?: string;
  label: string;
  subtitle?: string;
  active: boolean;
  isTemplate?: boolean;
  sourceType?: string;
};

export type TransportDestinationSelectorState = {
  status: 'loading' | 'error' | 'empty' | 'ready';
  statusLabel: string;
  hasRetry: boolean;
  createCta?: { href: string; label: string };
  options: Array<TransportDestinationOption & { selected: boolean; stateLabel?: string }>;
};

type RelationOptionsResponse = {
  success?: boolean;
  data?: unknown;
};

function isTransportDestinationOption(value: unknown): value is TransportDestinationOption {
  if (!value || typeof value !== 'object') return false;
  const option = value as Partial<TransportDestinationOption>;
  return typeof option.id === 'string' && typeof option.label === 'string' && typeof option.active === 'boolean';
}

export function normalizeTransportDestinationOptions(response: unknown): TransportDestinationOption[] {
  const data = (response as RelationOptionsResponse | null)?.data;
  if (!Array.isArray(data)) return [];
  return data.filter(isTransportDestinationOption);
}

export function findTransportDestinationOption(
  options: TransportDestinationOption[],
  destinationId: string
): TransportDestinationOption | undefined {
  return options.find((option) => option.id === destinationId);
}

export function findTransportDestinationOptionByLabel(
  options: TransportDestinationOption[],
  label: string
): TransportDestinationOption | undefined {
  const normalizedLabel = label.trim().toLocaleLowerCase();
  if (!normalizedLabel) return undefined;
  return options.find((option) => option.label.trim().toLocaleLowerCase() === normalizedLabel);
}

export function buildTransportDestinationCompatibilityFields(input: {
  origin?: TransportDestinationOption;
  destination?: TransportDestinationOption;
}) {
  return {
    originDestinationId: input.origin?.id ?? '',
    destinationDestinationId: input.destination?.id ?? '',
    origin: input.origin?.label ?? '',
    destination: input.destination?.label ?? '',
    cityId: input.destination?.id ?? input.origin?.id ?? '',
    cityName: input.destination?.label ?? input.origin?.label ?? '',
  };
}

export function getTransportDestinationSelectorState(input: {
  options: TransportDestinationOption[];
  selectedId: string;
  isLoading?: boolean;
  error?: string | null;
  createCtaHref: string;
  createCtaLabel: string;
}): TransportDestinationSelectorState {
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

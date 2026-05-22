export type RelationOption = {
  id: string;
  slug?: string;
  label: string;
  subtitle?: string;
  active: boolean;
  isTemplate?: boolean;
  sourceType?: string;
};

export type RelationOptionFilters = {
  search?: string;
  active?: boolean;
  includeTemplates: boolean;
  destinationId?: string;
  destinationSlug?: string;
  hotelId?: string;
  role?: string;
};

export type ScopedRelationFilterScope = 'destination' | 'hotel';

export type ScopedRelationFilterState =
  | {
      status: 'not-provided';
      shouldApply: false;
      resolvedId?: undefined;
      meta?: undefined;
    }
  | {
      status: 'resolved';
      shouldApply: true;
      resolvedId: string;
      meta?: undefined;
    }
  | {
      status: 'unresolved' | 'invalid';
      shouldApply: false;
      resolvedId?: undefined;
      meta: {
        unresolvedFilter: {
          scope: ScopedRelationFilterScope;
          id?: string;
          slug?: string;
          reason: string;
        };
      };
    };

type TemplateAwareRecord = {
  isTemplate?: boolean;
};

export function parseBooleanFilter(value: string | null): boolean | undefined {
  if (value === null || value === '' || value === 'all') return undefined;
  if (['true', '1', 'yes'].includes(value.toLowerCase())) return true;
  if (['false', '0', 'no'].includes(value.toLowerCase())) return false;
  return undefined;
}

export function parseRelationOptionFilters(searchParams: URLSearchParams): RelationOptionFilters {
  const activeValue = searchParams.get('active');
  const active = activeValue === 'all' ? undefined : parseBooleanFilter(activeValue);
  const template = searchParams.get('template') ?? searchParams.get('includeTemplates');

  return {
    search: searchParams.get('search')?.trim() || undefined,
    active: activeValue === 'all' ? undefined : active ?? true,
    includeTemplates: parseBooleanFilter(template) === true,
    destinationId: searchParams.get('destinationId')?.trim() || undefined,
    destinationSlug: searchParams.get('slug')?.trim() || searchParams.get('destinationSlug')?.trim() || undefined,
    hotelId: searchParams.get('hotelId')?.trim() || undefined,
    role: searchParams.get('role')?.trim() || undefined,
  };
}

export function resolveTemplateFilter<T extends TemplateAwareRecord>(
  records: T[],
  includeTemplates: boolean
): boolean | undefined {
  if (includeTemplates) return undefined;
  return records.some((record) => record.isTemplate === false) ? false : true;
}

export function applyTemplateFallback<T extends TemplateAwareRecord>(records: T[], includeTemplates: boolean): T[] {
  const templateFilter = resolveTemplateFilter(records, includeTemplates);
  if (templateFilter === undefined) return records;
  return records.filter((record) => record.isTemplate === templateFilter);
}

export function resolveScopedRelationFilter({
  scope,
  id,
  slug,
  resolvedId,
}: {
  scope: ScopedRelationFilterScope;
  id?: string;
  slug?: string;
  resolvedId?: string;
}): ScopedRelationFilterState {
  if (!id && !slug) {
    return { status: 'not-provided', shouldApply: false };
  }

  if (!resolvedId) {
    return {
      status: 'unresolved',
      shouldApply: false,
      meta: {
        unresolvedFilter: {
          scope,
          id,
          slug,
          reason: `${scope} filter could not be resolved`,
        },
      },
    };
  }

  if (id && slug && id !== resolvedId) {
    return {
      status: 'invalid',
      shouldApply: false,
      meta: {
        unresolvedFilter: {
          scope,
          id,
          slug,
          reason: `${scope} id does not match slug`,
        },
      },
    };
  }

  return { status: 'resolved', shouldApply: true, resolvedId };
}

export function matchesSearch(values: Array<string | null | undefined>, search?: string): boolean {
  if (!search) return true;
  const needle = search.toLowerCase();
  return values.some((value) => value?.toLowerCase().includes(needle));
}

export function sortOptions(options: RelationOption[]): RelationOption[] {
  return [...options].sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

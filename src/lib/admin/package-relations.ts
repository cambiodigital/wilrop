export type PackageRelationInput = string | { id?: unknown; role?: unknown };

export type PackageRelationsRequest = {
  destinationIds?: unknown;
  hotelIds?: unknown;
  hotels?: unknown;
  roomTypeIds?: unknown;
  excursionIds?: unknown;
  transportServiceIds?: unknown;
  transportServices?: unknown;
  allowTemplateRelations?: unknown;
};

export type NormalizedPackageRelations = {
  destinationIds: string[];
  hotelIds: Array<{ id: string; role: string }>;
  roomTypeIds: string[];
  excursionIds: string[];
  transportServiceIds: Array<{ id: string; role: string }>;
  allowTemplateRelations: boolean;
};

export type TemplateState = {
  id: string;
  isTemplate?: boolean | null;
  active?: boolean | null;
};

export type RelationValidationResult =
  | { ok: true }
  | { ok: false; status: number; errors: Record<string, string> };

function readIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function readRoleItems(value: unknown, defaultRole: string): Array<{ id: string; role: string }> {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item === 'string' && item.trim()) return [{ id: item, role: defaultRole }];
    if (!item || typeof item !== 'object') return [];
    const candidate = item as { id?: unknown; role?: unknown };
    if (typeof candidate.id !== 'string' || !candidate.id.trim()) return [];
    return [
      {
        id: candidate.id,
        role: typeof candidate.role === 'string' && candidate.role.trim() ? candidate.role : defaultRole,
      },
    ];
  });
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function uniqueRoleItems(items: Array<{ id: string; role: string }>): Array<{ id: string; role: string }> {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.id}:${item.role}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizePackageRelationsRequest(body: PackageRelationsRequest): NormalizedPackageRelations {
  return {
    destinationIds: unique(readIds(body.destinationIds)),
    hotelIds: uniqueRoleItems([...readRoleItems(body.hotels, 'lodging'), ...readIds(body.hotelIds).map((id) => ({ id, role: 'lodging' }))]),
    roomTypeIds: unique(readIds(body.roomTypeIds)),
    excursionIds: unique(readIds(body.excursionIds)),
    transportServiceIds: uniqueRoleItems([
      ...readRoleItems(body.transportServices, 'transfer'),
      ...readIds(body.transportServiceIds).map((id) => ({ id, role: 'transfer' })),
    ]),
    allowTemplateRelations: body.allowTemplateRelations === true,
  };
}

export function validateResolvedPackageRelations(params: {
  packageIsTemplate: boolean;
  allowTemplateRelations: boolean;
  destinations: TemplateState[];
  hotels: TemplateState[];
  roomTypes: Array<TemplateState & { hotelId?: string | null }>;
  excursions: TemplateState[];
  transportServices: TemplateState[];
  requested: NormalizedPackageRelations;
}): RelationValidationResult {
  const errors: Record<string, string> = {};

  const requireAllFound = (field: string, requestedIds: string[], found: TemplateState[]) => {
    const foundIds = new Set(found.map((item) => item.id));
    const missing = requestedIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) errors[field] = `Referencias inexistentes: ${missing.join(', ')}`;
  };

  const validateCompatibility = (field: string, records: TemplateState[]) => {
    const inactive = records.filter((record) => record.active === false).map((record) => record.id);
    if (inactive.length > 0) errors[field] = `Referencias inactivas: ${inactive.join(', ')}`;

    if (!params.allowTemplateRelations) {
      const incompatible = records
        .filter((record) => Boolean(record.isTemplate) !== params.packageIsTemplate)
        .map((record) => record.id);
      if (incompatible.length > 0) {
        errors[field] = `Referencias incompatibles por plantilla: ${incompatible.join(', ')}`;
      }
    }
  };

  requireAllFound('destinationIds', params.requested.destinationIds, params.destinations);
  requireAllFound('hotelIds', params.requested.hotelIds.map((item) => item.id), params.hotels);
  requireAllFound('roomTypeIds', params.requested.roomTypeIds, params.roomTypes);
  requireAllFound('excursionIds', params.requested.excursionIds, params.excursions);
  requireAllFound('transportServiceIds', params.requested.transportServiceIds.map((item) => item.id), params.transportServices);

  validateCompatibility('destinationIds', params.destinations);
  validateCompatibility('hotelIds', params.hotels);
  validateCompatibility('roomTypeIds', params.roomTypes);
  validateCompatibility('excursionIds', params.excursions);
  validateCompatibility('transportServiceIds', params.transportServices);

  const hotelIds = new Set(params.hotels.map((hotel) => hotel.id));
  const roomTypesOutsideHotels = params.roomTypes
    .filter((roomType) => roomType.hotelId && !hotelIds.has(roomType.hotelId))
    .map((roomType) => roomType.id);
  if (roomTypesOutsideHotels.length > 0) {
    errors.roomTypeIds = `Room types no pertenecen a hoteles relacionados: ${roomTypesOutsideHotels.join(', ')}`;
  }

  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, status: 400, errors };
}

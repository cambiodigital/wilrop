type JsonArrayValue = string | unknown[] | null | undefined;

export interface AdminHotelRoom {
  id: string;
  name: string;
  maxGuests: number;
  beds: string;
  price: number;
  originalPrice?: number;
  includes: string[];
  available: number;
  roomImage: string;
  roomImages?: string[];
}

export interface AdminHotelPayload {
  slug?: string;
  name?: string;
  cityId?: string;
  cityName?: string;
  destinationId?: string | null;
  stars?: number;
  address?: string;
  description?: string;
  images?: string[];
  amenities?: string[];
  rooms?: AdminHotelRoom[];
  rating?: number;
  reviewCount?: number;
  priceFrom?: number;
  tags?: string[];
  featured?: boolean;
  active?: boolean;
}

interface RawHotel {
  images: string;
  amenities: string;
  rooms: string;
  tags: string;
  [key: string]: unknown;
}

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toJsonArray(value: JsonArrayValue): string {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') {
    const parsed = safeJsonParse<unknown[]>(value, []);
    return JSON.stringify(Array.isArray(parsed) ? parsed : []);
  }
  return '[]';
}

function toNumber(value: unknown, fallback: number): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function generateHotelSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatAdminHotel<T extends RawHotel>(hotel: T) {
  return {
    ...hotel,
    images: safeJsonParse<string[]>(hotel.images, []),
    amenities: safeJsonParse<string[]>(hotel.amenities, []),
    rooms: safeJsonParse<AdminHotelRoom[]>(hotel.rooms, []),
    tags: safeJsonParse<string[]>(hotel.tags, []),
  };
}

export function buildHotelCreateData(payload: AdminHotelPayload) {
  const name = payload.name?.trim();
  const cityName = payload.cityName?.trim();
  const cityId = payload.cityId?.trim();
  const destinationId = payload.destinationId?.trim();

  if (!name || !cityId || !cityName) {
    throw new Error('Nombre, ID de ciudad y nombre de ciudad son obligatorios');
  }

  return {
    slug: payload.slug?.trim() || generateHotelSlug(name),
    name,
    cityId,
    cityName,
    destinationId: destinationId || null,
    stars: toNumber(payload.stars, 3),
    address: payload.address ?? '',
    description: payload.description ?? '',
    images: toJsonArray(payload.images),
    amenities: toJsonArray(payload.amenities),
    rooms: toJsonArray(payload.rooms),
    rating: toNumber(payload.rating, 0),
    reviewCount: toNumber(payload.reviewCount, 0),
    priceFrom: toNumber(payload.priceFrom, 0),
    tags: toJsonArray(payload.tags),
    featured: toBoolean(payload.featured, false),
    active: toBoolean(payload.active, true),
  };
}

export function buildHotelUpdateData(payload: AdminHotelPayload) {
  const updates: Record<string, unknown> = {};

  if (payload.slug !== undefined) updates.slug = payload.slug.trim();
  if (payload.name !== undefined) updates.name = payload.name.trim();
  if (payload.cityId !== undefined) updates.cityId = payload.cityId.trim();
  if (payload.cityName !== undefined) updates.cityName = payload.cityName.trim();
  if (payload.destinationId !== undefined) updates.destinationId = payload.destinationId?.trim() || null;
  if (payload.stars !== undefined) updates.stars = toNumber(payload.stars, 3);
  if (payload.address !== undefined) updates.address = payload.address;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.images !== undefined) updates.images = toJsonArray(payload.images);
  if (payload.amenities !== undefined) updates.amenities = toJsonArray(payload.amenities);
  if (payload.rooms !== undefined) updates.rooms = toJsonArray(payload.rooms);
  if (payload.rating !== undefined) updates.rating = toNumber(payload.rating, 0);
  if (payload.reviewCount !== undefined) updates.reviewCount = toNumber(payload.reviewCount, 0);
  if (payload.priceFrom !== undefined) updates.priceFrom = toNumber(payload.priceFrom, 0);
  if (payload.tags !== undefined) updates.tags = toJsonArray(payload.tags);
  if (payload.featured !== undefined) updates.featured = payload.featured;
  if (payload.active !== undefined) updates.active = payload.active;

  return updates;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}

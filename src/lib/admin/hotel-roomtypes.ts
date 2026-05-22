/**
 * RoomType ↔ Hotel.rooms sync helpers for AdminHotels.
 *
 * RoomType rows (DB) are the primary source of truth.
 * Hotel.rooms JSON is a compatibility cache.
 */

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
}

export interface RoomTypeLike {
  id: string;
  name: string;
  maxGuests: number;
  beds: string;
  basePrice: number;
  originalPrice: number;
  includes: string; // JSON string
  roomImage: string;
  active: boolean;
}

/**
 * Parse a RoomType.includes JSON string into a string array.
 * Returns [] on any parse failure.
 */
export function parseRoomTypeIncludes(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Sync active RoomType rows → HotelRoom cache array.
 * Inactive RoomTypes are excluded from the cache.
 */
export function syncRoomTypesToHotelRooms(rtList: RoomTypeLike[]): AdminHotelRoom[] {
  return rtList
    .filter((rt) => rt.active)
    .map((rt) => ({
      id: rt.id,
      name: rt.name,
      maxGuests: rt.maxGuests,
      beds: rt.beds,
      price: rt.basePrice,
      originalPrice: rt.originalPrice > 0 ? rt.originalPrice : undefined,
      includes: parseRoomTypeIncludes(rt.includes),
      available: 1,
      roomImage: rt.roomImage,
    }));
}

/**
 * Build a RoomType includes array into a comma-separated string for form display.
 */
export function formatRoomTypeIncludesForForm(raw: string): string {
  return parseRoomTypeIncludes(raw).join(', ');
}

/**
 * Parse comma-separated form string back into a string array for API submission.
 */
export function parseRoomTypeIncludesFromForm(formValue: string): string[] {
  return formValue
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

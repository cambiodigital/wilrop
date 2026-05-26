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
  roomImages?: string[];
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
  roomImages?: string | string[]; // JSON string or array
  active: boolean;
}

/**
 * Parse a RoomType.includes JSON string or array into a string array.
 */
export function parseRoomTypeIncludes(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string' || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Parse a RoomType.roomImages JSON string or array into a string array.
 */
export function parseRoomImages(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string' || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Retrieve room images with a fallback to the single roomImage if roomImages is empty.
 */
export function getRoomImages(room: { roomImage?: string; roomImages?: any }): string[] {
  const images = parseRoomImages(room.roomImages);
  if (images.length === 0 && room.roomImage) {
    return [room.roomImage];
  }
  return images;
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
      roomImages: getRoomImages(rt),
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

export type PanelMode = "admin" | "reseller";

export interface UniversalHotelRoom {
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

export interface UniversalHotelRecord {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  cityName: string;
  destinationId?: string | null;
  stars: number;
  address: string;
  description: string;
  images: string[];
  amenities: string[];
  rooms: UniversalHotelRoom[];
  rating: number;
  reviewCount: number;
  priceFrom: number;
  tags: string[];
  featured: boolean;
  active: boolean;
  resellerId?: string | null;
}

export interface RoomTypeRow {
  id: string;
  hotelId: string;
  name: string;
  maxGuests: number;
  beds: string;
  basePrice: number;
  originalPrice: number;
  includes: string;
  roomImage: string;
  roomImages?: string[];
  active: boolean;
}

export interface UniversalHotelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel?: UniversalHotelRecord | null;
  mode: PanelMode;
  onSaved?: () => void | Promise<void>;
}

export interface RoomTypeFormData {
  name: string;
  maxGuests: number;
  beds: string;
  basePrice: number;
  originalPrice: number;
  includes: string[];
  roomImage: string;
  roomImages: string[];
  active: boolean;
}

export const emptyRoomTypeForm: RoomTypeFormData = {
  name: "",
  maxGuests: 2,
  beds: "1 cama doble",
  basePrice: 0,
  originalPrice: 0,
  includes: [],
  roomImage: "",
  roomImages: [],
  active: true,
};

export const emptyHotelForm: Omit<UniversalHotelRecord, "id"> = {
  name: "",
  slug: "",
  cityId: "",
  cityName: "",
  destinationId: "",
  stars: 3,
  address: "",
  description: "",
  images: [],
  amenities: [],
  rooms: [],
  rating: 0,
  reviewCount: 0,
  priceFrom: 0,
  tags: [],
  featured: false,
  active: true,
  resellerId: "",
};

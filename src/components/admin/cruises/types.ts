export interface Cabin {
  id?: string;
  name: string;
  capacity: number;
  beds: string;
  basePrice: number;
  originalPrice: number;
  includes: string[];
  cabinImage: string;
  active: boolean;
}

export interface ItineraryStop {
  day: number;
  title: string;
  description: string;
  activity?: string;
}

export interface Cruise {
  id: string;
  slug: string;
  name: string;
  description: string;
  shipName: string;
  operator: string;
  durationDays: number;
  images: string[];
  includes: string[];
  itinerary: ItineraryStop[];
  rating: number;
  reviewCount: number;
  priceFrom: number;
  tags: string[];
  featured: boolean;
  active: boolean;
  primaryDestinationId: string | null;
  cabins: Cabin[];
  destinations: string[];
  resellerId?: string | null;
}

export interface DestinationOption {
  id: string;
  name: string;
}

export const emptyCabin: Cabin = {
  name: '',
  capacity: 2,
  beds: '2 camas individuales',
  basePrice: 0,
  originalPrice: 0,
  includes: [],
  cabinImage: '',
  active: true,
};

export const emptyCruise = {
  slug: '',
  name: '',
  description: '',
  shipName: '',
  operator: '',
  durationDays: 3,
  images: [] as string[],
  includes: [] as string[],
  itinerary: [] as ItineraryStop[],
  rating: 4.5,
  reviewCount: 10,
  priceFrom: 0,
  tags: [] as string[],
  featured: false,
  active: true,
  primaryDestinationId: null as string | null,
  cabins: [] as Cabin[],
  destinations: [] as string[],
  resellerId: '',
};

export type CruiseFormData = typeof emptyCruise;

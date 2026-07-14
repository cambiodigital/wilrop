// ─── Hotel Types ──────────────────────────────────────────────
export interface HotelCity {
  id: string
  name: string
  country: string
  image: string
}

export interface HotelAmenity {
  id: string
  name: string
  icon: string // lucide icon name
}

export interface HotelRoom {
  id: string
  name: string
  maxGuests: number
  beds: string
  price: number // COP per night
  originalPrice?: number
  includes: string[]
  available: number
  roomImage: string
  roomImages?: string[]
}

export interface Hotel {
  id: string
  name: string
  slug?: string
  cityId: string
  cityName: string
  stars: number
  address: string
  description: string
  images: string[]
  amenities: string[] // amenity IDs
  rooms: HotelRoom[]
  rating: number
  reviewCount: number
  priceFrom: number
  tags: string[]
  featured: boolean
}

// ─── Cities ──────────────────────────────────────────────────
export const hotelCities: HotelCity[] = [
  { id: 'cartagena', name: 'Cartagena de Indias', country: 'Colombia', image: '/images/cartagena.png' },
  { id: 'medellin', name: 'Medellín', country: 'Colombia', image: '/images/medellin.png' },
  { id: 'san-andres', name: 'San Andrés', country: 'Colombia', image: '/images/san-andres.png' },
  { id: 'bogota', name: 'Bogotá', country: 'Colombia', image: '/images/bogota.png' },
  { id: 'santa-marta', name: 'Santa Marta', country: 'Colombia', image: '/images/eje-cafetero.png' },
  { id: 'villa-de-leyva', name: 'Villa de Leyva', country: 'Colombia', image: '/images/amazonia.png' },
  { id: 'cali', name: 'Cali', country: 'Colombia', image: '/images/hero.png' },
  { id: 'pereira', name: 'Pereira (Eje Cafetero)', country: 'Colombia', image: '/images/eje-cafetero.png' },
]

// ─── Amenities ───────────────────────────────────────────────
export const hotelAmenities: HotelAmenity[] = [
  { id: 'wifi', name: 'Wi-Fi', icon: 'Wifi' },
  { id: 'pool', name: 'Piscina', icon: 'Waves' },
  { id: 'restaurant', name: 'Restaurante', icon: 'UtensilsCrossed' },
  { id: 'parking', name: 'Parqueadero', icon: 'Car' },
  { id: 'gym', name: 'Gym', icon: 'Dumbbell' },
  { id: 'spa', name: 'Spa', icon: 'Sparkles' },
  { id: 'ac', name: 'Aire Acondicionado', icon: 'Thermometer' },
  { id: 'breakfast', name: 'Desayuno', icon: 'Coffee' },
  { id: 'bar', name: 'Bar', icon: 'Wine' },
  { id: 'reception', name: 'Recepción 24h', icon: 'Clock' },
  { id: 'transfer', name: 'Translado', icon: 'Plane' },
  { id: 'sea-view', name: 'Vista al mar', icon: 'Eye' },
]

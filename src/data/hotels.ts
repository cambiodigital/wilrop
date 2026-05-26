// ──────────────────────────────────────────────────────────────
// WILROP Colombia Travel — Hotels Data
// ──────────────────────────────────────────────────────────────

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

// ─── Hotels ──────────────────────────────────────────────────
export const hotels: Hotel[] = [
  {
    id: 'charleston-santa-teresa',
    name: 'Hotel Charleston Santa Teresa',
    cityId: 'cartagena',
    cityName: 'Cartagena de Indias',
    stars: 5,
    address: 'Calle de la Inquisición, Centro Histórico, Cartagena',
    description:
      'Un hotel de lujo en el corazón del Centro Histórico de Cartagena, alojado en un exconvento del siglo XVII restaurado. Disfruta de la elegancia colonial combinada con comodidades modernas, una terraza con piscina infinita con vista a la ciudad amurallada, spa de clase mundial y gastronomía de autor.',
    images: ['/images/cartagena.png'],
    amenities: ['wifi', 'pool', 'restaurant', 'spa', 'ac', 'bar', 'reception', 'gym'],
    rooms: [
      {
        id: 'cst-deluxe',
        name: 'Habitación Doble Deluxe',
        maxGuests: 2,
        beds: '1 cama king',
        price: 720000,
        originalPrice: 850000,
        includes: ['Desayuno buffet', 'Wi-Fi gratis', 'Aire acondicionado', 'Minibar'],
        available: 5,
        roomImage: '/images/cartagena.png',
      },
      {
        id: 'cst-suite',
        name: 'Suite Junior Colonial',
        maxGuests: 3,
        beds: '1 cama king + sofá cama',
        price: 850000,
        includes: ['Desayuno buffet', 'Wi-Fi gratis', 'Aire acondicionado', 'Minibar', 'Acceso spa'],
        available: 2,
        roomImage: '/images/cartagena.png',
      },
      {
        id: 'cst-master',
        name: 'Suite Master Terraza',
        maxGuests: 2,
        beds: '1 cama king',
        price: 1100000,
        includes: ['Desayuno buffet', 'Wi-Fi gratis', 'Terraza privada', 'Jacuzzi', 'Acceso spa', 'Late check-out'],
        available: 1,
        roomImage: '/images/cartagena.png',
      },
    ],
    rating: 9.2,
    reviewCount: 487,
    priceFrom: 720000,
    tags: ['Lujo', 'Popular'],
    featured: true,
  },
  {
    id: 'dann-carlton-medellin',
    name: 'Hotel Dann Carlton Medellín',
    cityId: 'medellin',
    cityName: 'Medellín',
    stars: 5,
    address: 'Carrera 43A # 7-50, El Poblado, Medellín',
    description:
      'Ubicado en la exclusiva zona de El Poblado, este hotel de cinco estrellas ofrece una experiencia de lujo contemporáneo con las mejores vistas de la ciudad. Cuenta con restaurante gourmet, piscina rooftop, gimnasio completo y el servicio impecable que caracteriza a la cadena Dann Carlton.',
    images: ['/images/medellin.png'],
    amenities: ['wifi', 'pool', 'restaurant', 'parking', 'gym', 'spa', 'ac', 'bar', 'reception'],
    rooms: [
      {
        id: 'dc-standard',
        name: 'Habitación Estándar',
        maxGuests: 2,
        beds: '1 cama queen',
        price: 380000,
        originalPrice: 450000,
        includes: ['Desayuno americano', 'Wi-Fi gratis', 'Aire acondicionado'],
        available: 12,
        roomImage: '/images/medellin.png',
      },
      {
        id: 'dc-executive',
        name: 'Habitación Ejecutiva',
        maxGuests: 2,
        beds: '1 cama king',
        price: 520000,
        includes: ['Desayuno americano', 'Wi-Fi gratis', 'Sala ejecutiva', 'Aire acondicionado', 'Minibar'],
        available: 6,
        roomImage: '/images/medellin.png',
      },
      {
        id: 'dc-suite',
        name: 'Suite Ejecutiva',
        maxGuests: 3,
        beds: '1 cama king + sofá cama',
        price: 680000,
        includes: ['Desayuno americano', 'Wi-Fi gratis', 'Sala ejecutiva', 'Aire acondicionado', 'Minibar', 'Acceso piscina rooftop'],
        available: 3,
        roomImage: '/images/medellin.png',
      },
    ],
    rating: 8.8,
    reviewCount: 623,
    priceFrom: 380000,
    tags: ['Popular', 'Descuento'],
    featured: true,
  },
  {
    id: 'decameron-isleno',
    name: 'Decameron Isleño',
    cityId: 'san-andres',
    cityName: 'San Andrés',
    stars: 4,
    address: 'Avenida Colón, Sector San Luis, San Andrés',
    description:
      'El resort todo incluido más popular de San Andrés, ubicado frente al mar de los siete colores. Ofrece actividades acuáticas, entretenimiento diurno y nocturno, múltiples restaurantes y bares, piscina con vista al mar y acceso directo a la playa. Ideal para familias y parejas.',
    images: ['/images/san-andres.png'],
    amenities: ['wifi', 'pool', 'restaurant', 'bar', 'reception', 'ac', 'breakfast', 'sea-view'],
    rooms: [
      {
        id: 'di-standard',
        name: 'Habitación Estándar Todo Incluido',
        maxGuests: 2,
        beds: '2 camas individuales',
        price: 450000,
        originalPrice: 520000,
        includes: ['Todo incluido', 'Wi-Fi gratis', 'Aire acondicionado', 'Actividades acuáticas'],
        available: 20,
        roomImage: '/images/san-andres.png',
      },
      {
        id: 'di-superior',
        name: 'Habitación Superior Vista al Mar',
        maxGuests: 2,
        beds: '1 cama queen',
        price: 580000,
        includes: ['Todo incluido', 'Wi-Fi gratis', 'Aire acondicionado', 'Vista al mar', 'Actividades acuáticas'],
        available: 8,
        roomImage: '/images/san-andres.png',
      },
      {
        id: 'di-junior-suite',
        name: 'Suite Junior Vista al Mar',
        maxGuests: 4,
        beds: '1 cama queen + 2 individuales',
        price: 720000,
        includes: ['Todo incluido', 'Wi-Fi gratis', 'Aire acondicionado', 'Vista al mar', 'Terraza', 'Late check-out'],
        available: 4,
        roomImage: '/images/san-andres.png',
      },
    ],
    rating: 8.4,
    reviewCount: 892,
    priceFrom: 450000,
    tags: ['Popular', 'Descuento'],
    featured: true,
  },
  {
    id: 'sofitel-bogota',
    name: 'Hotel Sofitel Bogotá Victoria Regia',
    cityId: 'bogota',
    cityName: 'Bogotá',
    stars: 5,
    address: 'Carrera 13 # 85-46, Zona Rosa, Bogotá',
    description:
      'En el exclusivo barrio de Zona Rosa, el Sofitel Victoria Regia combina la sofisticación francesa con el calor colombiano. Decoración elegante, restaurante de alta cocina, spa lujoso y ubicación privilegiada cerca de los mejores restaurantes y centros comerciales de la ciudad.',
    images: ['/images/bogota.png'],
    amenities: ['wifi', 'restaurant', 'parking', 'gym', 'spa', 'ac', 'bar', 'reception'],
    rooms: [
      {
        id: 'sv-luxury',
        name: 'Habitación Lujo',
        maxGuests: 2,
        beds: '1 cama king',
        price: 650000,
        includes: ['Desayuno buffet', 'Wi-Fi gratis', 'Aire acondicionado', 'Minibar'],
        available: 7,
        roomImage: '/images/bogota.png',
      },
      {
        id: 'sv-prestige',
        name: 'Habitación Prestige Club',
        maxGuests: 2,
        beds: '1 cama king',
        price: 820000,
        includes: ['Desayuno buffet', 'Wi-Fi gratis', 'Acceso Club Sofitel', 'Aperitivo nocturno', 'Aire acondicionado'],
        available: 3,
        roomImage: '/images/bogota.png',
      },
      {
        id: 'sv-suite-opera',
        name: 'Suite Opera',
        maxGuests: 3,
        beds: '1 cama king + sala separada',
        price: 1150000,
        includes: ['Desayuno buffet', 'Wi-Fi gratis', 'Acceso Club Sofitel', 'Aperitivo nocturno', 'Spa', 'Late check-out', 'Transfer'],
        available: 1,
        roomImage: '/images/bogota.png',
      },
    ],
    rating: 9.0,
    reviewCount: 356,
    priceFrom: 650000,
    tags: ['Lujo', 'Nuevo'],
    featured: true,
  },
  {
    id: 'irotama-resort',
    name: 'Irotama Resort',
    cityId: 'santa-marta',
    cityName: 'Santa Marta',
    stars: 4,
    address: 'Km 5 Vía a Rodadero, Santa Marta',
    description:
      'El resort más emblemático de Santa Marta, con más de 40 años de tradición. Extensos jardines tropicales, 5 piscinas, restaurante frente al mar, spa y actividades para toda la familia. Ubicación perfecta entre la Sierra Nevada y el mar Caribe.',
    images: ['/images/eje-cafetero.png'],
    amenities: ['wifi', 'pool', 'restaurant', 'parking', 'gym', 'spa', 'ac', 'bar', 'reception', 'breakfast', 'transfer'],
    rooms: [
      {
        id: 'ir-garden',
        name: 'Habitación Jardín',
        maxGuests: 2,
        beds: '1 cama queen',
        price: 340000,
        includes: ['Desayuno incluido', 'Wi-Fi gratis', 'Aire acondicionado', 'Piscinas'],
        available: 15,
        roomImage: '/images/eje-cafetero.png',
      },
      {
        id: 'ir-ocean',
        name: 'Habitación Vista al Mar',
        maxGuests: 2,
        beds: '1 cama queen',
        price: 480000,
        originalPrice: 560000,
        includes: ['Desayuno incluido', 'Wi-Fi gratis', 'Aire acondicionado', 'Vista al mar', 'Piscinas'],
        available: 8,
        roomImage: '/images/eje-cafetero.png',
      },
      {
        id: 'ir-bungalow',
        name: 'Bungalow Familiar',
        maxGuests: 5,
        beds: '1 cama queen + 2 individuales + sofá cama',
        price: 650000,
        includes: ['Desayuno incluido', 'Wi-Fi gratis', 'Aire acondicionado', 'Terraza privada', 'Piscinas', 'Kids Club'],
        available: 4,
        roomImage: '/images/eje-cafetero.png',
      },
    ],
    rating: 8.5,
    reviewCount: 745,
    priceFrom: 340000,
    tags: ['Popular'],
    featured: false,
  },
  {
    id: 'casa-adobe',
    name: 'Hotel Casa de Adobe',
    cityId: 'villa-de-leyva',
    cityName: 'Villa de Leyva',
    stars: 3,
    address: 'Calle 12 # 11-65, Villa de Leyva',
    description:
      'Un encantador hotel boutique construido en adobe y teja colonial, en el corazón de Villa de Leyva. Sus patios interiores con jardines, chimeneas y decoración rústica te transportan a otra época. Ideal para una escapada romántica y tranquila entre la arquitectura colonial del siglo XVI.',
    images: ['/images/amazonia.png'],
    amenities: ['wifi', 'restaurant', 'parking', 'ac', 'breakfast', 'reception'],
    rooms: [
      {
        id: 'ca-standard',
        name: 'Habitación Colonial',
        maxGuests: 2,
        beds: '1 cama matrimonial',
        price: 220000,
        includes: ['Desayuno casero', 'Wi-Fi gratis', 'Chimenea'],
        available: 6,
        roomImage: '/images/amazonia.png',
      },
      {
        id: 'ca-deluxe',
        name: 'Habitación Deluxe con Chimenea',
        maxGuests: 2,
        beds: '1 cama queen',
        price: 320000,
        includes: ['Desayuno casero', 'Wi-Fi gratis', 'Chimenea', 'Vista al jardín', 'Bañera'],
        available: 3,
        roomImage: '/images/amazonia.png',
      },
    ],
    rating: 8.9,
    reviewCount: 234,
    priceFrom: 220000,
    tags: ['Nuevo'],
    featured: false,
  },
  {
    id: 'hotel-spiwak',
    name: 'Hotel Spiwak Chipichape',
    cityId: 'cali',
    cityName: 'Cali',
    stars: 4,
    address: 'Carrera 38 Norte # 6N-100, Chipichape, Cali',
    description:
      'Conectado directamente al centro comercial Chipichape, el Hotel Spiwak es la opción perfecta para viajeros de negocios y turismo. Modernas instalaciones, casino, restaurante de autor, piscina en la azotea y el vibrante ambiente de la capital de la salsa.',
    images: ['/images/hero.png'],
    amenities: ['wifi', 'pool', 'restaurant', 'parking', 'gym', 'spa', 'ac', 'bar', 'reception'],
    rooms: [
      {
        id: 'sp-standard',
        name: 'Habitación Estándar',
        maxGuests: 2,
        beds: '1 cama queen',
        price: 290000,
        includes: ['Desayuno buffet', 'Wi-Fi gratis', 'Aire acondicionado'],
        available: 18,
        roomImage: '/images/hero.png',
      },
      {
        id: 'sp-executive',
        name: 'Habitación Ejecutiva',
        maxGuests: 2,
        beds: '1 cama king',
        price: 420000,
        includes: ['Desayuno buffet', 'Wi-Fi gratis', 'Aire acondicionado', 'Minibar', 'Acceso gym'],
        available: 9,
        roomImage: '/images/hero.png',
      },
      {
        id: 'sp-suite',
        name: 'Suite Spiwak',
        maxGuests: 3,
        beds: '1 cama king + sofá cama',
        price: 560000,
        originalPrice: 650000,
        includes: ['Desayuno buffet', 'Wi-Fi gratis', 'Aire acondicionado', 'Sala de estar', 'Acceso spa', 'Casino'],
        available: 3,
        roomImage: '/images/hero.png',
      },
    ],
    rating: 8.6,
    reviewCount: 512,
    priceFrom: 290000,
    tags: ['Descuento'],
    featured: false,
  },
  {
    id: 'hacienda-bambusa',
    name: 'Hacienda Bambusa',
    cityId: 'pereira',
    cityName: 'Pereira (Eje Cafetero)',
    stars: 4,
    address: 'Km 7 Vía Cerritos, Pereira',
    description:
      'Una auténtica hacienda cafetera transformada en hotel boutique rodeada de jardines tropicales y plantaciones de café. Experimenta la cultura del café desde su origen, disfruta de la gastronomía local, relájate en la piscina natural y explora los paisajes del Eje Cafetero.',
    images: ['/images/eje-cafetero.png'],
    amenities: ['wifi', 'pool', 'restaurant', 'parking', 'spa', 'breakfast', 'reception', 'transfer'],
    rooms: [
      {
        id: 'hb-superior',
        name: 'Habitación Superior Cafetal',
        maxGuests: 2,
        beds: '1 cama queen',
        price: 350000,
        includes: ['Desayuno campesino', 'Wi-Fi gratis', 'Tour del café', 'Aire acondicionado'],
        available: 8,
        roomImage: '/images/eje-cafetero.png',
      },
      {
        id: 'hb-junior',
        name: 'Suite Junior Hacienda',
        maxGuests: 3,
        beds: '1 cama king + sofá cama',
        price: 480000,
        includes: ['Desayuno campesino', 'Wi-Fi gratis', 'Tour del café', 'Vista a los cafetales', 'Bañera de hidromasaje'],
        available: 4,
        roomImage: '/images/eje-cafetero.png',
      },
      {
        id: 'hb-master',
        name: 'Suite Master Bambusa',
        maxGuests: 2,
        beds: '1 cama king',
        price: 620000,
        includes: ['Desayuno campesino', 'Wi-Fi gratis', 'Tour del café', 'Terraza privada', 'Spa', 'Late check-out'],
        available: 2,
        roomImage: '/images/eje-cafetero.png',
      },
    ],
    rating: 9.1,
    reviewCount: 289,
    priceFrom: 350000,
    tags: ['Nuevo', 'Popular'],
    featured: false,
  },
  {
    id: 'casa-quintero',
    name: 'Hotel Casa Quintero',
    cityId: 'cartagena',
    cityName: 'Cartagena de Indias',
    stars: 3,
    address: 'Calle Quintero # 3-42, Centro Histórico, Cartagena',
    description:
      'Un encantador hotel boutique en una casona colonial restaurada del siglo XVIII, ubicada a pasos de la Plaza de los Coches. Combina la autenticidad del Centro Histórico con servicios modernos. Terraza en la azotea con vista a la catedral y desayuno cartagenero.',
    images: ['/images/cartagena.png'],
    amenities: ['wifi', 'ac', 'breakfast', 'reception'],
    rooms: [
      {
        id: 'cq-classic',
        name: 'Habitación Clásica Colonial',
        maxGuests: 2,
        beds: '1 cama matrimonial',
        price: 280000,
        includes: ['Desayuno cartagenero', 'Wi-Fi gratis', 'Aire acondicionado'],
        available: 5,
        roomImage: '/images/cartagena.png',
      },
      {
        id: 'cq-patio',
        name: 'Habitación con Vista al Patio',
        maxGuests: 2,
        beds: '1 cama queen',
        price: 380000,
        originalPrice: 440000,
        includes: ['Desayuno cartagenero', 'Wi-Fi gratis', 'Aire acondicionado', 'Vista al patio colonial', 'Terraza'],
        available: 3,
        roomImage: '/images/cartagena.png',
      },
    ],
    rating: 8.7,
    reviewCount: 178,
    priceFrom: 280000,
    tags: ['Descuento', 'Nuevo'],
    featured: false,
  },
  {
    id: 'intercontinental-medellin',
    name: 'InterContinental Medellín',
    cityId: 'medellin',
    cityName: 'Medellín',
    stars: 5,
    address: 'Carrera 34 # 4A-15, Poblado, Medellín',
    description:
      'El hotel de negocios por excelencia de Medellín, ubicado en la financial district con acceso directo al centro comercial Santafé. Salas de conferencias de primer nivel, restaurante internacional, club ejecutivo y la reconocida calidad del grupo IHG.',
    images: ['/images/medellin.png'],
    amenities: ['wifi', 'pool', 'restaurant', 'parking', 'gym', 'spa', 'ac', 'bar', 'reception', 'transfer'],
    rooms: [
      {
        id: 'im-classic',
        name: 'Habitación Classic',
        maxGuests: 2,
        beds: '1 cama queen',
        price: 450000,
        includes: ['Desayuno buffet', 'Wi-Fi gratis', 'Aire acondicionado', 'Centro de negocios'],
        available: 14,
        roomImage: '/images/medellin.png',
      },
      {
        id: 'im-club',
        name: 'Habitación Club InterContinental',
        maxGuests: 2,
        beds: '1 cama king',
        price: 620000,
        includes: ['Desayuno buffet', 'Wi-Fi gratis', 'Club InterContinental', 'Aperitivo nocturno', 'Aire acondicionado'],
        available: 6,
        roomImage: '/images/medellin.png',
      },
      {
        id: 'im-suite',
        name: 'Suite Ejecutiva',
        maxGuests: 3,
        beds: '1 cama king + sofá cama',
        price: 780000,
        includes: ['Desayuno buffet', 'Wi-Fi gratis', 'Club InterContinental', 'Sala de estar', 'Spa', 'Transfer aeropuerto'],
        available: 2,
        roomImage: '/images/medellin.png',
      },
    ],
    rating: 8.9,
    reviewCount: 421,
    priceFrom: 450000,
    tags: ['Popular'],
    featured: false,
  },
  {
    id: 'hotel-gaira',
    name: 'Hotel Gaira del Mar',
    cityId: 'santa-marta',
    cityName: 'Santa Marta',
    stars: 4,
    address: 'Vía a Riohacha Km 3, Taganga, Santa Marta',
    description:
      'Ubicado entre la Sierra Nevada y el mar Caribe, este eco-resort ofrece una experiencia única de naturaleza y lujo. Piscina natural, restaurante de mariscos frente al mar, actividades de snorkel y senderismo. Perfecto para quienes buscan desconexión y aventura.',
    images: ['/images/san-andres.png'],
    amenities: ['wifi', 'pool', 'restaurant', 'parking', 'ac', 'bar', 'reception', 'breakfast', 'sea-view'],
    rooms: [
      {
        id: 'gm-ocean',
        name: 'Cabaña Vista al Mar',
        maxGuests: 2,
        beds: '1 cama queen',
        price: 390000,
        includes: ['Desayuno tropical', 'Wi-Fi gratis', 'Aire acondicionado', 'Vista al mar'],
        available: 7,
        roomImage: '/images/san-andres.png',
      },
      {
        id: 'gm-beachfront',
        name: 'Suite Frente al Mar',
        maxGuests: 3,
        beds: '1 cama king + sofá cama',
        price: 540000,
        originalPrice: 620000,
        includes: ['Desayuno tropical', 'Wi-Fi gratis', 'Aire acondicionado', 'Terraza frente al mar', 'Snorkel incluido'],
        available: 3,
        roomImage: '/images/san-andres.png',
      },
    ],
    rating: 8.3,
    reviewCount: 198,
    priceFrom: 390000,
    tags: ['Descuento'],
    featured: false,
  },
]

// ─── Helpers ─────────────────────────────────────────────────

export function getHotelsByCity(cityId: string): Hotel[] {
  return hotels.filter((h) => h.cityId === cityId)
}

export function getHotelById(id: string): Hotel | undefined {
  return hotels.find((h) => h.id === id)
}

export function getFeaturedHotels(): Hotel[] {
  return hotels.filter((h) => h.featured)
}

export function filterHotels(options: {
  cityId?: string
  minPrice?: number
  maxPrice?: number
  minStars?: number
  amenities?: string[]
  minRating?: number
  guests?: number
}): Hotel[] {
  return hotels.filter((h) => {
    if (options.cityId && h.cityId !== options.cityId) return false
    if (options.minPrice && h.priceFrom < options.minPrice) return false
    if (options.maxPrice && h.priceFrom > options.maxPrice) return false
    if (options.minStars && h.stars < options.minStars) return false
    if (options.amenities?.length) {
      if (!options.amenities.every((a) => h.amenities.includes(a))) return false
    }
    if (options.minRating && h.rating < options.minRating) return false
    if (options.guests) {
      const hasRoom = h.rooms.some((r) => r.maxGuests >= options.guests!)
      if (!hasRoom) return false
    }
    return true
  })
}

export function formatCOP(amount: number): string {
  return '$' + amount.toLocaleString('es-CO')
}

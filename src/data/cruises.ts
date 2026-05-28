// ──────────────────────────────────────────────────────────────
// WILROP Colombia Travel — Cruises Fallback Data
// ──────────────────────────────────────────────────────────────

export interface CruiseCabin {
  id: string
  cruiseId: string
  name: string
  capacity: number
  beds: string
  basePrice: number
  originalPrice: number | null
  includes: string[]
  cabinImage: string
  active: boolean
}

export interface CruiseItineraryItem {
  day: number
  stop: string
}

export interface Cruise {
  id: string
  slug: string
  name: string
  description: string
  shipName: string
  operator: string
  durationDays: number
  images: string[]
  includes: string[]
  itinerary: CruiseItineraryItem[]
  rating: number
  reviewCount: number
  priceFrom: number
  tags: string[]
  featured: boolean
  active: boolean
  isTemplate: boolean
  primaryDestinationId: string | null
  cabins: CruiseCabin[]
}

export const cruises: Cruise[] = [
  {
    id: 'caribe-premium',
    slug: 'caribe-premium',
    name: 'Caribe Premium',
    description: 'Disfruta de una experiencia de crucero inolvidable navegando por las aguas turquesas del Caribe. Este crucero incluye shows en vivo, múltiples piscinas, restaurantes buffet y a la carta, y paradas de ensueño.',
    shipName: 'Monarch of the Seas',
    operator: 'Pullmantur',
    durationDays: 5,
    images: ['/images/cruceros.png'],
    includes: ['Pensión completa', 'Bebidas ilimitadas', 'Acceso a shows', 'Piscinas', 'Gimnasio'],
    itinerary: [
      { day: 1, stop: 'Cartagena (Embarque)' },
      { day: 2, stop: 'Navegación' },
      { day: 3, stop: 'San Andrés (Parada)' },
      { day: 4, stop: 'Navegación' },
      { day: 5, stop: 'Cartagena (Desembarque)' },
    ],
    rating: 4.8,
    reviewCount: 145,
    priceFrom: 2350000,
    tags: ['Premium', 'Popular'],
    featured: true,
    active: true,
    isTemplate: true,
    primaryDestinationId: 'cartagena',
    cabins: [
      { id: 'cp-interior', cruiseId: 'caribe-premium', name: 'Camarote Interior Estándar', capacity: 2, beds: '2 camas individuales', basePrice: 2350000, originalPrice: 2800000, includes: ['Servicio de limpieza diario', 'TV satelital', 'Wi-Fi prepagado'], cabinImage: '/images/cruceros.png', active: true },
      { id: 'cp-exterior', cruiseId: 'caribe-premium', name: 'Camarote Exterior con Vista al Mar', capacity: 2, beds: '1 cama doble', basePrice: 2950000, originalPrice: 3500000, includes: ['Ventana al océano', 'Servicio de limpieza diario', 'TV satelital', 'Wi-Fi prepagado'], cabinImage: '/images/cruceros.png', active: true },
      { id: 'cp-suite', cruiseId: 'caribe-premium', name: 'Suite de Lujo con Balcón', capacity: 3, beds: '1 cama doble king + sofá cama', basePrice: 4200000, originalPrice: null, includes: ['Balcón privado', 'Acceso preferente', 'Servicio a la habitación 24/7', 'Minibar premium'], cabinImage: '/images/cruceros.png', active: true },
    ],
  },
  {
    id: 'san-andres-express',
    slug: 'san-andres-express',
    name: 'San Andrés Express',
    description: 'Una escapada rápida para explorar los cayos y arrecifes de coral en los alrededores de la isla de San Andrés.',
    shipName: 'Sea Explorer',
    operator: 'Caribbean Cruises',
    durationDays: 3,
    images: ['/images/cruceros.png'],
    includes: ['Alojamiento a bordo', 'Desayuno y almuerzo buffet', 'Actividades de snorkel'],
    itinerary: [
      { day: 1, stop: 'San Andrés (Embarque)' },
      { day: 2, stop: 'Johnny Cay y Haynes Cay' },
      { day: 3, stop: 'San Andrés (Desembarque)' },
    ],
    rating: 4.5,
    reviewCount: 82,
    priceFrom: 1450000,
    tags: ['Express'],
    featured: false,
    active: true,
    isTemplate: true,
    primaryDestinationId: 'san-andres',
    cabins: [
      { id: 'sa-standard', cruiseId: 'san-andres-express', name: 'Camarote Estándar Vista al Mar', capacity: 2, beds: '2 camas individuales', basePrice: 1450000, originalPrice: 1800000, includes: ['TV satelital', 'Aire acondicionado'], cabinImage: '/images/cruceros.png', active: true },
    ],
  },
  {
    id: 'islas-del-rosario-day-cruise',
    slug: 'islas-del-rosario-day-cruise',
    name: 'Islas del Rosario Day Cruise',
    description: 'Pasa un día espectacular navegando a bordo de nuestro exclusivo catamarán. Disfruta de barra libre nacional, almuerzo típico y desembarque en playa privada.',
    shipName: 'Catamarán Bora Bora',
    operator: 'Bora Bora S.A.',
    durationDays: 1,
    images: ['/images/cruceros.png'],
    includes: ['Barra libre nacional', 'Almuerzo típico', 'Equipos de snorkel', 'Acceso a playa privada'],
    itinerary: [
      { day: 1, stop: 'Muelle de Cartagena (Salida: 8:00 AM) -> Recorrido Islas del Rosario -> Playa Privada -> Retorno Cartagena (5:00 PM)' },
    ],
    rating: 4.7,
    reviewCount: 210,
    priceFrom: 680000,
    tags: ['Day Cruise', 'Nuevo'],
    featured: false,
    active: true,
    isTemplate: true,
    primaryDestinationId: 'cartagena',
    cabins: [
      { id: 'ir-pass', cruiseId: 'islas-del-rosario-day-cruise', name: 'Pase de Pasadía Estándar', capacity: 1, beds: 'Asiento reservado', basePrice: 680000, originalPrice: null, includes: ['Coctel de bienvenida', 'Almuerzo tradicional'], cabinImage: '/images/cruceros.png', active: true },
    ],
  },
]

export function getFeaturedCruises(): Cruise[] {
  return cruises.filter((c) => c.featured)
}

export function getCruiseById(id: string): Cruise | undefined {
  return cruises.find((c) => c.id === id)
}

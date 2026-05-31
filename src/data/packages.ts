import { formatCurrency } from '@/lib/currency';
export interface TravelPackage {
  id: string;
  destinationId: string;
  destinationName: string;
  title: string;
  description: string;
  duration: string;
  price: number; // COP
  originalPrice?: number; // for showing discounts
  includes: string[];
  image: string;
  difficulty: 'Fácil' | 'Moderado' | 'Avanzado';
  groupSize: string;
  departureDates: string[];
  rating: number;
  soldOut: boolean;
  category: 'Aventura' | 'Relax' | 'Cultural' | 'Naturaleza' | 'Playa';
  commission: number; // percentage for resellers (8–15 %)
}

export const travelPackages: TravelPackage[] = [
  // ─────────── Cartagena ───────────
  {
    id: 'cartagena-romantico',
    destinationId: 'cartagena',
    destinationName: 'Cartagena de Indias',
    title: 'Cartagena Romántica',
    description:
      'Un escape romántico por la Ciudad Amurallada: paseos en coche de caballos, cenas al atardecer frente al mar, tour privado por el Castillo San Felipe y un día en las Islas del Rosario.',
    duration: '4 días / 3 noches',
    price: 1250000,
    originalPrice: 1480000,
    includes: [
      'Alojamiento en hotel boutique 4★',
      'Desayuno buffet diario',
      'Tour privado Ciudad Amurallada',
      'Visita Castillo San Felipe',
      'Paseo en coche de caballos',
      'Excursión Isla del Rosario',
      'Traslados aeropuerto – hotel',
    ],
    image: '/images/cartagena.png',
    difficulty: 'Fácil',
    groupSize: '2 – 8 personas',
    departureDates: [
      '2025-07-15',
      '2025-08-10',
      '2025-09-05',
      '2025-10-12',
      '2025-11-20',
    ],
    rating: 4.9,
    soldOut: false,
    category: 'Relax',
    commission: 12,
  },
  {
    id: 'cartagena-cultural',
    destinationId: 'cartagena',
    destinationName: 'Cartagena de Indias',
    title: 'Cartagena Cultural e Histórica',
    description:
      'Sumérgete en la historia de Cartagena con visitas guiadas a museos, bazares de artesanías, clases de cocina caribeña y exploración de los barrios históricos de Getsemaní y La Matuna.',
    duration: '5 días / 4 noches',
    price: 1450000,
    includes: [
      'Alojamiento en hotel colonial 4★',
      'Desayuno diario + 2 almuerzos',
      'Tour histórico guiado completo',
      'Taller de cocina caribeña',
      'Visita al Museo Naval y Palacio de la Inquisición',
      'Recorrido por Getsemaní',
      'Traslados aeropuerto – hotel',
    ],
    image: '/images/cartagena.png',
    difficulty: 'Fácil',
    groupSize: '4 – 12 personas',
    departureDates: [
      '2025-07-22',
      '2025-08-18',
      '2025-09-15',
      '2025-10-08',
    ],
    rating: 4.7,
    soldOut: false,
    category: 'Cultural',
    commission: 10,
  },

  // ─────────── Medellín ───────────
  {
    id: 'medellin-innovacion',
    destinationId: 'medellin',
    destinationName: 'Medellín',
    title: 'Medellín: Innovación y Cultura Urbana',
    description:
      'Descubre la transformación de Medellín: tours por la Comuna 13, recorrido en Metrocable hasta el Parque Arví, visita a museos de arte moderno y las mejores miradores de la ciudad.',
    duration: '4 días / 3 noches',
    price: 980000,
    originalPrice: 1100000,
    includes: [
      'Alojamiento en hotel 4★ en Poblado',
      'Desayuno buffet diario',
      'Tour Comuna 13 – grafiti y transformación',
      'Metrocable + Parque Arví',
      'Tour ciudad y museos (MAMM, Casa de la Memoria)',
      'Visita a Guatapé y Piedra del Peñol',
      'Traslados aeropuerto – hotel',
    ],
    image: '/images/medellin.png',
    difficulty: 'Fácil',
    groupSize: '4 – 15 personas',
    departureDates: [
      '2025-07-10',
      '2025-08-05',
      '2025-09-02',
      '2025-10-15',
      '2025-11-08',
    ],
    rating: 4.8,
    soldOut: false,
    category: 'Cultural',
    commission: 12,
  },
  {
    id: 'medellin-aventura',
    destinationId: 'medellin',
    destinationName: 'Medellín',
    title: 'Aventura Paisa',
    description:
      'Para los más intrépidos: canopy en Santa Fe de Antioquia, rafting en el río San Juan, parapente sobre el Valle de Aburrá y senderismo en los cerros del oriente.',
    duration: '3 días / 2 noches',
    price: 870000,
    includes: [
      'Alojamiento en hotel 3★',
      'Desayuno diario',
      'Canopy en Santa Fe de Antioquia',
      'Rafting río San Juan (nivel II–III)',
      'Vuelo en parapente doble',
      'Traslados desde Medellín',
    ],
    image: '/images/medellin.png',
    difficulty: 'Moderado',
    groupSize: '6 – 12 personas',
    departureDates: [
      '2025-07-20',
      '2025-08-15',
      '2025-09-25',
    ],
    rating: 4.6,
    soldOut: true,
    category: 'Aventura',
    commission: 15,
  },

  // ─────────── San Andrés ───────────
  {
    id: 'san-andres-playa',
    destinationId: 'san-andres',
    destinationName: 'San Andrés y Providencia',
    title: 'Paraíso en el Caribe – Todo Incluido',
    description:
      'Disfruta del mar de los siete colores con un paquete todo incluido: snorkel en el cinturón de coral, tours a Cayo Acuario y Johnny Cay, gastronomía raizal y atardeceres inolvidables.',
    duration: '5 días / 4 noches',
    price: 1680000,
    originalPrice: 1950000,
    includes: [
      'Alojamiento resort todo incluido 4★',
      'Todas las comidas y bebidas',
      'Tour Cayo Acuario',
      'Tour Johnny Cay',
      'Snorkel en arrecife',
      'Tour isla en golf cart',
      'Traslados aeropuerto – hotel',
    ],
    image: '/images/san-andres.png',
    difficulty: 'Fácil',
    groupSize: '2 – 10 personas',
    departureDates: [
      '2025-07-18',
      '2025-08-08',
      '2025-09-12',
      '2025-10-20',
      '2025-11-15',
      '2025-12-10',
    ],
    rating: 4.9,
    soldOut: false,
    category: 'Playa',
    commission: 10,
  },
  {
    id: 'san-andres-buceo',
    destinationId: 'san-andres',
    destinationName: 'San Andrés y Providencia',
    title: 'Buceo y Naturaleza en Providencia',
    description:
      'Una expedición para amantes del buceo: immersiones en el tercer arrecife más grande del mundo, exploración de la isla de Providencia y contacto con la cultura raizal auténtica.',
    duration: '6 días / 5 noches',
    price: 2150000,
    includes: [
      'Alojamiento en hotel boutique frente al mar',
      'Desayuno diario + 3 cenas',
      '5 buceos con equipo incluido (PADI Open Water)',
      'Tour en lancha por los cayos',
      'Visita a Crab Cay y McBean Lagoon',
      'Traslado en catamarán San Andrés → Providencia',
      'Seguro de viaje',
    ],
    image: '/images/san-andres.png',
    difficulty: 'Moderado',
    groupSize: '4 – 8 personas',
    departureDates: [
      '2025-08-20',
      '2025-09-22',
      '2025-10-25',
    ],
    rating: 4.8,
    soldOut: false,
    category: 'Naturaleza',
    commission: 14,
  },

  // ─────────── Eje Cafetero ───────────
  {
    id: 'eje-cafetero-experiencia',
    destinationId: 'eje-cafetero',
    destinationName: 'Eje Cafetero',
    title: 'Experiencia Cafetera Completa',
    description:
      'Vive el proceso del café desde la semilla hasta la taza. Visita haciendas centenarias, explora el Valle del Cocora, disfruta de termales y conoce los pueblos más hermosos de Quindío y Risaralda.',
    duration: '5 días / 4 noches',
    price: 1120000,
    originalPrice: 1300000,
    includes: [
      'Alojamiento en hacienda cafetera tradicional',
      'Desayuno tipo casero + 2 almuerzos',
      'Tour finca cafetera (proceso completo + catación)',
      'Valle del Cocora + Salento',
      'Termales de Santa Rosa de Cabal',
      'Visita a Filandia y pueblo de los Artistas',
      'Traslados desde Pereira / Armenia',
    ],
    image: '/images/eje-cafetero.png',
    difficulty: 'Fácil',
    groupSize: '4 – 12 personas',
    departureDates: [
      '2025-07-12',
      '2025-08-02',
      '2025-09-10',
      '2025-10-05',
      '2025-11-18',
    ],
    rating: 4.9,
    soldOut: false,
    category: 'Cultural',
    commission: 12,
  },
  {
    id: 'eje-cafetero-aventura',
    destinationId: 'eje-cafetero',
    destinationName: 'Eje Cafetero',
    title: 'Aventura en los Andes Cafeteros',
    description:
      ' senderismo entre palmas de cera, canopy sobre cañones, rafting en el río La Vieja y ciclismo de montaña por los paisajes del Eje Cafetero. Acompañado de la mejor gastronomía local.',
    duration: '4 días / 3 noches',
    price: 950000,
    includes: [
      'Alojamiento en eco-lodge',
      'Desayuno + 2 almuerzos',
      'Trekking Valle del Cocora (6 h)',
      'Canopy Parque del Café',
      'Rafting río La Vieja (nivel III)',
      'Bicicleta de montaña por fincas',
      'Traslados desde Armenia',
    ],
    image: '/images/eje-cafetero.png',
    difficulty: 'Avanzado',
    groupSize: '6 – 10 personas',
    departureDates: [
      '2025-07-25',
      '2025-09-08',
      '2025-10-20',
    ],
    rating: 4.7,
    soldOut: true,
    category: 'Aventura',
    commission: 15,
  },

  // ─────────── Amazonía ───────────
  {
    id: 'amazonia-inmersion',
    destinationId: 'amazonia',
    destinationName: 'Amazonía Colombiana',
    title: 'Inmersión Amazónica',
    description:
      'Adéntrate en la selva con una expedición de 4 días: avistamiento de delfines rosados, caminatas nocturnas, pesca piranha, visita a comunidades indígenas y pernocta en maloca tradicional.',
    duration: '4 días / 3 noches',
    price: 1650000,
    includes: [
      'Alojamiento en maloca amazónica',
      'Todas las comidas (cocina local)',
      'Traslado Leticia – comunidad (canoa)',
      'Avistamiento de delfines rosados',
      'Caminata nocturna en la selva',
      'Pesca de piraña',
      'Visita a comunidad Tikuna',
      'Guía nativo bilingüe',
    ],
    image: '/images/amazonia.png',
    difficulty: 'Moderado',
    groupSize: '4 – 8 personas',
    departureDates: [
      '2025-08-01',
      '2025-09-15',
      '2025-10-20',
      '2025-11-10',
    ],
    rating: 4.8,
    soldOut: false,
    category: 'Naturaleza',
    commission: 14,
  },
  {
    id: 'amazonia-exploracion',
    destinationId: 'amazonia',
    destinationName: 'Amazonía Colombiana',
    title: 'Expedición Profunda al Amazonas',
    description:
      'Para los aventureros más exigentes: una semana en la selva virgen navegando el río Amazonas, campamento en la jungla, avistamiento de fauna mayor y convivencia con comunidades remotas.',
    duration: '7 días / 6 noches',
    price: 2850000,
    originalPrice: 3200000,
    includes: [
      'Alojamiento (hostal 2 noches + camping 3 noches + maloca 1 noche)',
      'Todas las comidas',
      'Navegación río Amazonas y afluentes',
      'Camping en selva virgen',
      'Avistamiento de fauna (monos, anacondas, aves)',
      'Talleres de supervivencia y plantas medicinales',
      'Visita a 2 comunidades indígenas',
      'Guía experto + guía nativo',
      'Seguro de expedición',
    ],
    image: '/images/amazonia.png',
    difficulty: 'Avanzado',
    groupSize: '4 – 6 personas',
    departureDates: [
      '2025-09-01',
      '2025-11-05',
    ],
    rating: 4.9,
    soldOut: false,
    category: 'Aventura',
    commission: 15,
  },

  // ─────────── Bogotá ───────────
  {
    id: 'bogota-gourmet',
    destinationId: 'bogota',
    destinationName: 'Bogotá',
    title: 'Bogotá Gourmet y Bohemia',
    description:
      'Un recorrido por los sabores y la cultura de la capital: mercados locales, restaurantes galardonados, barrios bohemios, museos y la mejor vista desde el Cerro de Monserrate.',
    duration: '3 días / 2 noches',
    price: 780000,
    includes: [
      'Alojamiento en hotel 4★ (La Candelaria / Zona G)',
      'Desayuno diario',
      'Tour gastronómico (Mercado de Paloquemao + Zona G)',
      'Visita Museo del Oro',
      'Cerro de Monserrate (teleférico)',
      'Recorrido por La Candelaria',
      'Traslados aeropuerto – hotel',
    ],
    image: '/images/bogota.png',
    difficulty: 'Fácil',
    groupSize: '4 – 10 personas',
    departureDates: [
      '2025-07-08',
      '2025-07-25',
      '2025-08-15',
      '2025-09-10',
      '2025-10-05',
      '2025-11-12',
      '2025-12-03',
    ],
    rating: 4.7,
    soldOut: false,
    category: 'Cultural',
    commission: 8,
  },
  {
    id: 'bogota-chingaza',
    destinationId: 'bogota',
    destinationName: 'Bogotá',
    title: 'Chingaza y los Páramos Andinos',
    description:
      'Explora el Parque Nacional Natural Chingaza, hogar del oso de anteojos y la frailejones. Caminatas por el páramo, lagunas de origen glaciar y experiencias de turismo rural en veredas cercanas.',
    duration: '2 días / 1 noche',
    price: 620000,
    includes: [
      'Alojamiento en finca rural',
      'Desayuno + almuerzo + cena',
      'Trekking Parque Chingaza (5 h)',
      'Visita a lagunas glaciar',
      'Charla sobre ecosistema páramo',
      'Transporte desde Bogotá (ida y vuelta)',
    ],
    image: '/images/bogota.png',
    difficulty: 'Moderado',
    groupSize: '6 – 12 personas',
    departureDates: [
      '2025-07-30',
      '2025-08-22',
      '2025-09-28',
    ],
    rating: 4.6,
    soldOut: false,
    category: 'Naturaleza',
    commission: 12,
  },
];

/**
 * Helper: format a COP price for display.
 * e.g. 1250000 → "$1.250.000"
 */
// Aliases used by other components
export const formatPrice = formatCurrency;
export { travelPackages as packages };

/**
 * Helper: get packages for a specific destination.
 */
export function getPackagesByDestination(destinationId: string): TravelPackage[] {
  return travelPackages.filter((p) => p.destinationId === destinationId);
}

/**
 * Helper: get a single package by ID.
 */
export function getPackageById(packageId: string): TravelPackage | undefined {
  return travelPackages.find((p) => p.id === packageId);
}

/**
 * Helper: get all unique categories.
 */
export function getPackageCategories(): string[] {
  return [...new Set(travelPackages.map((p) => p.category))];
}

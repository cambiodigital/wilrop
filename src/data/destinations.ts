export interface Destination {
  id: string;
  name: string;
  region: string;
  description: string;
  image: string;
  highlights: string[];
  rating: number;
  reviewCount: number;
  priceFrom: number;
}

export const destinations: Destination[] = [
  {
    id: 'cartagena',
    name: 'Cartagena de Indias',
    region: 'Caribe',
    description: 'La joya colonial del Caribe colombiano. Ciudades amuralladas, playas paradisíacas y una vida nocturna vibrante te esperan en esta ciudad patrimonio de la humanidad.',
    image: '/images/cartagena.png',
    highlights: ['Ciudad Amurallada', 'Playas del Bocagrande', 'Castillo San Felipe', 'Getsemaní'],
    rating: 4.8,
    reviewCount: 342,
    priceFrom: 870000,
  },
  {
    id: 'san-andres',
    name: 'San Andrés y Providencia',
    region: 'Caribe Insular',
    description: 'Un paraíso de aguas cristalinas en el mar Caribe. El archipiélago ofrece el mar de los siete colores, arrecifes de coral y una cultura raizal única.',
    image: '/images/san-andres.png',
    highlights: ['Mar de 7 Colores', 'Johnny Cay', 'Raízal Culture', 'Buceo'],
    rating: 4.7,
    reviewCount: 285,
    priceFrom: 980000,
  },
  {
    id: 'medellin',
    name: 'Medellín',
    region: 'Andina',
    description: 'La ciudad de la eterna primavera. Innovación, cultura, gastronomía y transformación social en un valle rodeado de montañas verdes.',
    image: '/images/medellin.png',
    highlights: ['Comuna 13', 'Pueblito Paisa', 'Jardín Botánico', 'Gastronomía'],
    rating: 4.6,
    reviewCount: 298,
    priceFrom: 620000,
  },
  {
    id: 'eje-cafetero',
    name: 'Eje Cafetero',
    region: 'Andina',
    description: 'El corazón del café colombiano. Haciendas cafeteras, paisajes verdes infinitos, pueblos pintorescos y la cultura del café que enamora al mundo.',
    image: '/images/eje-cafetero.png',
    highlights: ['Haciendas Café', 'Salento', 'Valle del Cocora', 'Parque del Café'],
    rating: 4.9,
    reviewCount: 412,
    priceFrom: 550000,
  },
  {
    id: 'amazonia',
    name: 'Amazonía Colombiana',
    region: 'Orinoquía-Amazonía',
    description: 'La selva más grande del planeta. Una aventura inolvidable entre ríos caudalosos, fauna exótica y comunidades indígenas milenarias.',
    image: '/images/amazonia.png',
    highlights: ['Río Amazonas', 'Dolphins Rosa', 'Maloca Indígena', 'Flora Exótica'],
    rating: 4.5,
    reviewCount: 156,
    priceFrom: 950000,
  },
  {
    id: 'bogota',
    name: 'Bogotá',
    region: 'Andina',
    description: 'La capital cosmopolita a 2.640 metros. Museos de clase mundial, gastronomía de autor, arte urbano y una oferta cultural inagotable.',
    image: '/images/bogota.png',
    highlights: ['Museo del Oro', 'Cerro Monserrate', 'Candelaria', 'Gastronomía'],
    rating: 4.4,
    reviewCount: 223,
    priceFrom: 380000,
  },
];

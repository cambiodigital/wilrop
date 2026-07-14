export interface TravelPackage {
  id: string;
  destinationId: string;
  destinationName: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  price: number;
  originalPrice?: number;
  commission: number;
  includes: string[];
  image: string;
  difficulty: string;
  groupSize: string;
  departureDates: string[];
  rating: number;
  soldOut: boolean;
  category: string;
  active: boolean;
  resellerId?: string | null;
}

export const emptyPackage: Omit<TravelPackage, 'id'> = {
  destinationId: '',
  destinationName: '',
  title: '',
  slug: '',
  description: '',
  duration: '',
  price: 0,
  originalPrice: undefined,
  commission: 10,
  includes: [],
  image: '',
  difficulty: 'Fácil',
  groupSize: '',
  departureDates: [],
  rating: 0,
  soldOut: false,
  category: 'Cultural',
  active: true,
  resellerId: '',
};

export const categories = ['Aventura', 'Relax', 'Cultural', 'Naturaleza', 'Playa'];
export const difficulties = ['Fácil', 'Moderado', 'Avanzado'];

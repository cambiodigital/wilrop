export interface Amenity {
  id: string
  name: string
  icon: string
}

export const amenities: Amenity[] = [
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
  { id: 'transfer', name: 'Traslado', icon: 'Plane' },
  { id: 'sea-view', name: 'Vista al mar', icon: 'Eye' },
]

export function getAmenity(id: string): Amenity | undefined {
  return amenities.find((a) => a.id === id)
}

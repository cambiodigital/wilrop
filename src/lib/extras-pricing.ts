export interface ExtraAddon {
  id: string
  type: string
  name: string
  description: string
  price: number
  perNight: boolean
}

export const extrasAddons: ExtraAddon[] = [
  {
    id: 'travel-insurance',
    type: 'travel-insurance',
    name: 'Seguro de viaje completo',
    description: 'Cobertura médica, cancelación y equipaje',
    price: 85000,
    perNight: false,
  },
  {
    id: 'airport-transfer',
    type: 'airport-transfer',
    name: 'Traslado aeropuerto - hotel',
    description: 'Ida y vuelta en vehículo privado',
    price: 120000,
    perNight: false,
  },
  {
    id: 'photo-package',
    type: 'photo-package',
    name: 'Paquete fotográfico profesional',
    description: 'Sesión de fotos durante el viaje (50+ fotos editadas)',
    price: 150000,
    perNight: false,
  },
  {
    id: 'breakfast',
    type: 'breakfast',
    name: 'Desayuno buffet adicional',
    description: 'Para todos los huéspedes, todas las mañanas',
    price: 45000,
    perNight: true,
  },
  {
    id: 'late-checkout',
    type: 'late-checkout',
    name: 'Late Check-out (14:00)',
    description: 'Extender la salida hasta las 2:00 PM',
    price: 65000,
    perNight: false,
  },
]

export function getAddon(type: string): ExtraAddon | undefined {
  return extrasAddons.find((a) => a.type === type)
}

export function getAddonByType(type: string): ExtraAddon | undefined {
  return extrasAddons.find((a) => a.type === type)
}

export function calculateExtrasTotal(selectedTypes: string[], nights = 1): number {
  return selectedTypes.reduce((total, type) => {
    const addon = getAddon(type)
    if (!addon) return total
    return total + (addon.perNight ? addon.price * nights : addon.price)
  }, 0)
}

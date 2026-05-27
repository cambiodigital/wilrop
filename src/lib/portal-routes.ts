import type { HotelBookingData } from '@/store/useNavigationStore'

export type PortalView =
  | 'portal-home'
  | 'portal-destinations'
  | 'portal-hotels'
  | 'portal-package-detail'
  | 'portal-booking'
  | 'portal-hotel-booking'
  | 'portal-hotel-detail'
  | 'portal-about'
  | 'portal-contact'
  | 'portal-excursions'
  | 'portal-excursion-detail'
  | 'portal-transport'
  | 'portal-transport-detail'
  | 'portal-destination-detail'
  | 'portal-cruises'
  | 'portal-cruise-detail'
  | 'portal-cruise-booking'
  | 'admin-login'
  | 'reseller-login'
  | 'admin-dashboard'
  | 'reseller-dashboard'

export const portalPaths = {
  home: '/',
  destinations: '/destinos',
  hotels: '/hoteles',
  about: '/sobre-nosotros',
  contact: '/contacto',
  excursions: '/excursiones',
  transport: '/transportes',
  cruises: '/cruceros',
  excursionDetail: (slug: string) => `/excursiones/${slug}`,
  transportDetail: (serviceId: string) => `/transportes/${serviceId}`,
  destinationDetail: (destinationId: string) => `/destinos/${destinationId}`,
  packageDetail: (packageId: string) => `/paquetes/${packageId}`,
  packageBooking: (packageId: string) => `/paquetes/${packageId}/reserva`,
  hotelDetail: (hotelId: string) => `/hoteles/${hotelId}`,
  hotelBooking: (hotelId: string) => `/hoteles/${hotelId}/reserva`,
  cruiseDetail: (slug: string) => `/cruceros/${slug}`,
  cruiseBooking: (slug: string) => `/cruceros/${slug}/reserva`,
  orderDetail: (bookingCode: string) => `/pedidos/${bookingCode}`,
  adminLogin: '/admin/login',
  resellerLogin: '/reseller/login',
} as const

export function getPortalViewFromPath(pathname: string): PortalView {
  if (pathname === portalPaths.home) return 'portal-home'
  if (pathname === portalPaths.destinations) return 'portal-destinations'
  if (pathname === portalPaths.hotels) return 'portal-hotels'
  if (pathname.startsWith('/paquetes/')) return pathname.endsWith('/reserva') ? 'portal-booking' : 'portal-package-detail'
  if (pathname.startsWith('/hoteles/')) return pathname.endsWith('/reserva') ? 'portal-hotel-booking' : 'portal-hotel-detail'
  if (pathname.startsWith('/cruceros/')) return pathname.endsWith('/reserva') ? 'portal-cruise-booking' : 'portal-cruise-detail'
  if (pathname === portalPaths.cruises) return 'portal-cruises'
  if (pathname === portalPaths.about) return 'portal-about'
  if (pathname === portalPaths.contact) return 'portal-contact'
  if (pathname.startsWith('/excursiones/')) return 'portal-excursion-detail'
  if (pathname === portalPaths.excursions) return 'portal-excursions'
  if (pathname.startsWith('/transportes/')) return 'portal-transport-detail'
  if (pathname === portalPaths.transport) return 'portal-transport'
  if (pathname.startsWith('/destinos/')) return 'portal-destination-detail'

  return 'portal-home'
}

export function buildHotelBookingQuery(data: HotelBookingData): string {
  const params = new URLSearchParams()

  params.set('roomId', data.roomId)
  if (data.checkIn) params.set('checkIn', data.checkIn)
  if (data.checkOut) params.set('checkOut', data.checkOut)
  params.set('adults', String(data.adults))
  params.set('children', String(data.children))

  if (data.childrenAges.length > 0) {
    params.set('childrenAges', data.childrenAges.join(','))
  }

  return params.toString()
}

export function parseChildrenAges(value?: string | string[]): number[] {
  if (!value) return []

  const source = Array.isArray(value) ? value.join(',') : value

  return source
    .split(',')
    .map((entry) => Number(entry.trim()))
    .filter((entry) => Number.isFinite(entry) && entry > 0)
}
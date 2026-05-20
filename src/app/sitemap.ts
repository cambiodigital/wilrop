import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const FALLBACK_SITE_URL = 'https://wilroptravel.com'

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL
  return raw.replace(/\/$/, '')
}

function toAbsolute(path: string): string {
  return `${getBaseUrl()}${path}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: toAbsolute('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: toAbsolute('/destinos'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: toAbsolute('/hoteles'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: toAbsolute('/excursiones'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: toAbsolute('/transportes'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: toAbsolute('/sobre-nosotros'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: toAbsolute('/contacto'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  let dbDestinations: any[] = []
  let dbHotels: any[] = []
  let dbPackages: any[] = []
  let dbExcursions: any[] = []
  let dbTransportServices: any[] = []

  try {
    const destRealCount = await db.destination.count({ where: { active: true, isTemplate: false } })
    const htlRealCount = await db.hotel.count({ where: { active: true, isTemplate: false } })
    const pkgRealCount = await db.travelPackage.count({ where: { active: true, isTemplate: false } })
    const excRealCount = await db.excursion.count({ where: { active: true, isTemplate: false } })

    const [d, h, p, e, t] = await Promise.all([
      db.destination.findMany({ where: { active: true, isTemplate: destRealCount > 0 ? false : true } }),
      db.hotel.findMany({ where: { active: true, isTemplate: htlRealCount > 0 ? false : true } }),
      db.travelPackage.findMany({ where: { active: true, isTemplate: pkgRealCount > 0 ? false : true } }),
      db.excursion.findMany({ where: { active: true, isTemplate: excRealCount > 0 ? false : true } }),
      db.transportService.findMany({ where: { active: true } }),
    ])

    dbDestinations = d
    dbHotels = h
    dbPackages = p
    dbExcursions = e
    dbTransportServices = t
  } catch (error) {
    console.error('Error generating sitemap dynamic paths:', error)
  }

  const destinationRoutes: MetadataRoute.Sitemap = dbDestinations.map((destination) => ({
    url: toAbsolute(`/destinos/${destination.id}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const hotelRoutes: MetadataRoute.Sitemap = dbHotels.map((hotel) => ({
    url: toAbsolute(`/hoteles/${hotel.id}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const packageRoutes: MetadataRoute.Sitemap = dbPackages.map((travelPackage) => ({
    url: toAbsolute(`/paquetes/${travelPackage.id}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const excursionRoutes: MetadataRoute.Sitemap = dbExcursions.map((excursion) => ({
    url: toAbsolute(`/excursiones/${excursion.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const transportRoutes: MetadataRoute.Sitemap = dbTransportServices.map((transport) => ({
    url: toAbsolute(`/transportes/${transport.id}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...destinationRoutes,
    ...hotelRoutes,
    ...packageRoutes,
    ...excursionRoutes,
    ...transportRoutes,
  ]
}

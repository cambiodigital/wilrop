import type { MetadataRoute } from 'next'
import { destinations } from '@/data/destinations'
import { hotels } from '@/data/hotels'
import { travelPackages } from '@/data/packages'
import { db } from '@/lib/db'

const FALLBACK_SITE_URL = 'https://wilroptravel.com'

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL
  return raw.replace(/\/$/, '')
}

function toAbsolute(path: string): string {
  return `${getBaseUrl()}${path}`
}

async function getDynamicPathsFromDb(): Promise<string[]> {
  try {
    const [excursions, transportServices] = await Promise.all([
      db.excursion.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
      }),
      db.transportService.findMany({
        where: { active: true },
        select: { id: true, updatedAt: true },
      }),
    ])

    return [
      ...excursions.map((item) => `/excursiones/${item.slug}`),
      ...transportServices.map((item) => `/transportes/${item.id}`),
    ]
  } catch {
    // If DB is unavailable during build, keep sitemap generation resilient.
    return []
  }
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

  const destinationRoutes: MetadataRoute.Sitemap = destinations.map((destination) => ({
    url: toAbsolute(`/destinos/${destination.id}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const hotelRoutes: MetadataRoute.Sitemap = hotels.map((hotel) => ({
    url: toAbsolute(`/hoteles/${hotel.id}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const packageRoutes: MetadataRoute.Sitemap = travelPackages.map((travelPackage) => ({
    url: toAbsolute(`/paquetes/${travelPackage.id}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const dbDynamicPaths = await getDynamicPathsFromDb()
  const dbRoutes: MetadataRoute.Sitemap = dbDynamicPaths.map((path) => ({
    url: toAbsolute(path),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...destinationRoutes,
    ...hotelRoutes,
    ...packageRoutes,
    ...dbRoutes,
  ]
}

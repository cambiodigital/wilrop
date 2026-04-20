import type { MetadataRoute } from 'next'

const FALLBACK_SITE_URL = 'https://wilroptravel.com'

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL
  return raw.replace(/\/$/, '')
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/destinos', '/hoteles', '/paquetes', '/excursiones', '/transportes', '/contacto', '/sobre-nosotros'],
        disallow: ['/admin/', '/reseller/', '/subagent/', '/api/', '/pedidos/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/destinos', '/hoteles', '/paquetes', '/excursiones', '/transportes', '/contacto', '/sobre-nosotros'],
        disallow: ['/admin/', '/reseller/', '/subagent/', '/api/', '/pedidos/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

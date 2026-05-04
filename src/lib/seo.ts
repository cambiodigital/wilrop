import type { Metadata } from 'next'
import { brand } from '@/lib/brand'

const FALLBACK_SITE_URL = 'https://wilroptravel.com'

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL
  return raw.replace(/\/$/, '')
}

function buildCanonical(path: string): string {
  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  return `${getBaseUrl()}${path}`
}

interface PublicSeoInput {
  title: string
  description: string
  path: string
  ogImage?: string
  noIndex?: boolean
}

function resolveOgImage(imagePath?: string): string {
  if (!imagePath) {
    return `${getBaseUrl()}/images/hero.png`
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${getBaseUrl()}${normalizedPath}`
}

export function buildPublicMetadata({ title, description, path, ogImage, noIndex = false }: PublicSeoInput): Metadata {
  const canonical = buildCanonical(path)
  const resolvedOgImage = resolveOgImage(ogImage)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: brand.name,
      type: 'website',
      locale: 'es_CO',
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [resolvedOgImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
        },
  }
}

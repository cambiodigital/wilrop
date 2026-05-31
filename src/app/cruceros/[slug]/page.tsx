import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortalShell from '@/components/portal/PortalShell'
import CruiseDetailPage from '@/components/portal/CruiseDetailPage'
import { db } from '@/lib/db'
import { buildPublicMetadata } from '@/lib/seo'
import { normalizeCruise } from '@/lib/catalog/public-hydration'
import { cruises as fallbackCruises } from '@/data/cruises'

interface CruiseDetailRouteProps {
  params: Promise<{
    slug: string
  }>
}

async function getCruiseData(slug: string) {
  const realCount = await db.cruise.count({
    where: { active: true, isTemplate: false },
  })
  const isTemplateQuery = realCount > 0 ? false : true

  const cruise = await db.cruise.findFirst({
    where: {
      OR: [
        { id: slug },
        { slug: slug },
      ],
      active: true,
      isTemplate: isTemplateQuery,
    },
    include: {
      cabins: true,
    },
  })

  if (!cruise) {
    const staticCruise = fallbackCruises.find(c => c.id === slug || c.slug === slug)
    return staticCruise || null
  }
  return normalizeCruise(cruise as Record<string, unknown>)
}

export async function generateMetadata({ params }: CruiseDetailRouteProps): Promise<Metadata> {
  const { slug } = await params
  const cruise = await getCruiseData(slug)

  if (!cruise) {
    return buildPublicMetadata({
      title: 'Crucero no encontrado | WILROP',
      description: 'El crucero solicitado no existe o ya no está disponible.',
      path: '/cruceros',
      noIndex: true,
    })
  }

  return buildPublicMetadata({
    title: `${cruise.name} | Cruceros WILROP`,
    description: `Descubre el crucero ${cruise.name} a bordo del barco ${cruise.shipName}. Revisa camarotes y precios con WILROP.`,
    path: `/cruceros/${slug}`,
    ogImage: cruise.images[0] || '/images/cruceros.png',
  })
}

export default async function CruiseDetailRoutePage({ params }: CruiseDetailRouteProps) {
  const { slug } = await params
  const cruise = await getCruiseData(slug)

  if (!cruise) {
    notFound()
  }

  return (
    <PortalShell>
      <div className="pt-16" />
      <CruiseDetailPage cruise={cruise as any} />
    </PortalShell>
  )
}

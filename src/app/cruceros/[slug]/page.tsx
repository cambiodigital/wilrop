import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortalShell from '@/components/portal/PortalShell'
import PortalBreadcrumbs from '@/components/portal/PortalBreadcrumbs'
import CruiseDetailPage from '@/components/portal/CruiseDetailPage'
import { db } from '@/lib/db'
import { buildPublicMetadata } from '@/lib/seo'
import { normalizeCruise } from '@/lib/catalog/public-hydration'

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

  if (!cruise) return null
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
      <div className="w-full bg-neutral-50/90 border-b border-neutral-200/50 backdrop-blur-xs pt-16 shadow-xs">
        <div className="mx-auto max-w-5xl px-5 py-3 sm:px-6">
          <PortalBreadcrumbs
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Cruceros', href: '/cruceros' },
              { label: cruise.name },
            ]}
          />
        </div>
      </div>
      <CruiseDetailPage cruise={cruise as any} />
    </PortalShell>
  )
}

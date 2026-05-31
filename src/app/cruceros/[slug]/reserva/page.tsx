import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortalShell from '@/components/portal/PortalShell'
import CruiseBookingFlow from '@/components/portal/CruiseBookingFlow'
import { db } from '@/lib/db'
import { buildPublicMetadata } from '@/lib/seo'
import { normalizeCruise } from '@/lib/catalog/public-hydration'
import { cruises as fallbackCruises } from '@/data/cruises'

interface CruiseBookingRouteProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
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

export async function generateMetadata({ params }: CruiseBookingRouteProps): Promise<Metadata> {
  const { slug } = await params
  const cruise = await getCruiseData(slug)

  if (!cruise) {
    return buildPublicMetadata({
      title: 'Reserva no disponible | WILROP',
      description: 'El crucero que intentas reservar no está disponible.',
      path: '/cruceros',
      noIndex: true,
    })
  }

  return buildPublicMetadata({
    title: `Reserva en ${cruise.name} | WILROP`,
    description: `Completa tu reserva de cabina en el crucero ${cruise.name} de forma segura con WILROP.`,
    path: `/cruceros/${slug}/reserva`,
  })
}

export default async function CruiseBookingRoutePage({ params, searchParams }: CruiseBookingRouteProps) {
  const { slug } = await params
  const query = await searchParams
  const cruise = await getCruiseData(slug)

  if (!cruise) {
    notFound()
  }

  const cabinId = Array.isArray(query.cabinId) ? query.cabinId[0] : query.cabinId

  if (!cabinId || !cruise.cabins.some((cabin: any) => cabin.id === cabinId)) {
    notFound()
  }

  return (
    <PortalShell>
      <CruiseBookingFlow
        cruise={cruise as any}
        cabinId={cabinId}
      />
    </PortalShell>
  )
}

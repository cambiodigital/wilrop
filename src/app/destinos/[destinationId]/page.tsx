import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import PortalShell from '@/components/portal/PortalShell'
import { buildPublicMetadata } from '@/lib/seo'
import { getDestinationData } from '@/lib/catalog/destinations'
import DestinationHero from '@/components/portal/destination/DestinationHero'
import DestinationDetailsList from '@/components/portal/destination/DestinationDetailsList'

interface DestinationDetailRouteProps {
  params: Promise<{
    destinationId: string
  }>
  searchParams: Promise<{
    date?: string
  }>
}

export async function generateMetadata({ params }: DestinationDetailRouteProps): Promise<Metadata> {
  const { destinationId } = await params
  const data = await getDestinationData(destinationId)

  if (!data) {
    return buildPublicMetadata({
      title: 'Destino no encontrado | WILROP',
      description: 'El destino solicitado no existe o no está disponible en este momento.',
      path: '/destinos',
      noIndex: true,
    })
  }

  const { destination } = data

  return buildPublicMetadata({
    title: `${destination.name} | Destinos WILROP`,
    description: `Explora paquetes, hoteles, excursiones y servicios de transporte en ${destination.name}, ${destination.region}.`,
    path: `/destinos/${destinationId}`,
    ogImage: destination.image,
  })
}

export default async function DestinationDetailRoutePage({ params, searchParams }: DestinationDetailRouteProps) {
  const { destinationId } = await params
  const { date } = await searchParams
  const data = await getDestinationData(destinationId)

  if (!data) {
    notFound()
  }

  const { destination, packages, hotels, excursions, transportServices, cruises } = data

  const filteredPackages = date
    ? packages.filter((pkg) => pkg.departureDates.includes(date))
    : packages

  return (
    <PortalShell>
      <div className="min-h-screen bg-neutral-50 pt-20 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/destinos"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-amber-600"
          >
            <ArrowLeft className="size-4" />
            Volver a destinos
          </Link>

          <div className="space-y-10">
            <DestinationHero destination={destination as any} />

            <DestinationDetailsList
              destination={destination as any}
              packages={packages}
              hotels={hotels}
              excursions={excursions}
              transportServices={transportServices}
              cruises={cruises}
              date={date}
              filteredPackages={filteredPackages}
            />
          </div>
        </div>
      </div>
    </PortalShell>
  )
}

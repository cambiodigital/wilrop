import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Star, ArrowRight } from 'lucide-react'
import PortalShell from '@/components/portal/PortalShell'
import { db } from '@/lib/db'
import { buildPublicMetadata } from '@/lib/seo'

interface DestinationDetailRouteProps {
  params: Promise<{
    destinationId: string
  }>
}

async function getDestinationData(destinationId: string) {
  const realCount = await db.destination.count({
    where: { active: true, isTemplate: false },
  })
  const isTemplateQuery = realCount > 0 ? false : true

  const destination = await db.destination.findFirst({
    where: {
      id: destinationId,
      active: true,
      isTemplate: isTemplateQuery,
    },
  })

  if (!destination) return null

  const highlights = (() => {
    try {
      return JSON.parse(destination.highlights || '[]') as string[]
    } catch {
      return []
    }
  })()

  // Get packages for this destination
  const packagesRealCount = await db.travelPackage.count({
    where: { active: true, isTemplate: false },
  })
  const packagesIsTemplateQuery = packagesRealCount > 0 ? false : true

  const rawPackages = await db.travelPackage.findMany({
    where: {
      destinationId: destination.id,
      active: true,
      isTemplate: packagesIsTemplateQuery,
    },
    orderBy: { rating: 'desc' },
  })

  const packages = rawPackages.map((pkg) => {
    return {
      ...pkg,
      includes: (() => {
        try {
          return JSON.parse(pkg.includes || '[]') as string[]
        } catch {
          return []
        }
      })(),
      departureDates: (() => {
        try {
          return JSON.parse(pkg.departureDates || '[]') as string[]
        } catch {
          return []
        }
      })(),
    }
  })

  return {
    destination: {
      ...destination,
      highlights,
    },
    packages,
  }
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
    description: `Explora paquetes para ${destination.name}, ${destination.region}.`,
    path: `/destinos/${destinationId}`,
    ogImage: destination.image,
  })
}

export default async function DestinationDetailRoutePage({ params }: DestinationDetailRouteProps) {
  const { destinationId } = await params
  const data = await getDestinationData(destinationId)

  if (!data) {
    notFound()
  }

  const { destination, packages: destinationPackages } = data

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

          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="relative h-72 sm:h-96">
              <img src={destination.image} alt={destination.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                <p className="text-xs uppercase tracking-widest text-white/80">Destino</p>
                <h1 className="mt-2 text-2xl font-bold sm:text-4xl">{destination.name}</h1>
                <div className="mt-3 flex items-center gap-4 text-sm text-white/90">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {destination.region}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-4 fill-amber-300 text-amber-300" />
                    {destination.rating.toFixed(1)} ({destination.reviewCount} reseñas)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-sm leading-relaxed text-neutral-600">{destination.description}</p>

              {destination.highlights.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {destination.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Paquetes en {destination.name}</h2>
                <p className="mt-1 text-sm text-neutral-500">{destinationPackages.length} opciones disponibles</p>
              </div>
            </div>

            {destinationPackages.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
                Aún no hay paquetes activos para este destino.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {destinationPackages.map((pkg) => (
                  <article key={pkg.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <img src={pkg.image} alt={pkg.title} className="h-44 w-full object-cover" />
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-wide text-amber-600">{pkg.category}</p>
                      <h3 className="mt-1 text-lg font-semibold text-neutral-900">{pkg.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{pkg.description}</p>
                      <p className="mt-3 text-xl font-bold text-amber-600">${pkg.price.toLocaleString('es-CO')}</p>
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/paquetes/${pkg.id}`}
                          className="inline-flex flex-1 items-center justify-center rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
                        >
                          Ver detalle
                        </Link>
                        <Link
                          href={`/paquetes/${pkg.id}/reserva`}
                          className="inline-flex flex-1 items-center justify-center rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                        >
                          Reservar
                          <ArrowRight className="ml-1.5 size-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PortalShell>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Star, ArrowRight, Building2, Compass, Bus, Ship } from 'lucide-react'
import PortalShell from '@/components/portal/PortalShell'
import { db } from '@/lib/db'
import { buildPublicMetadata } from '@/lib/seo'
import {
  parseJsonArray,
  resolveIsTemplateFallback,
  normalizePackage,
  normalizeHotel,
  normalizeExcursion,
  normalizeTransport,
  normalizeCruise,
  extractEntitiesFromJoinRows,
} from '@/lib/catalog/public-hydration'
import type { NormalizedPackage, NormalizedHotel, NormalizedExcursion, NormalizedTransport, NormalizedCruise } from '@/lib/catalog/public-hydration'

interface DestinationDetailRouteProps {
  params: Promise<{
    destinationId: string
  }>
  searchParams: Promise<{
    date?: string
  }>
}

// ─── isTemplate resolution ─────────────────────────────────────────

async function resolveTemplateFallbackForEntity(
  model: 'destination' | 'package' | 'hotel' | 'excursion' | 'transport' | 'cruise',
): Promise<boolean> {
  const where = { active: true, isTemplate: false }
  let count: number
  switch (model) {
    case 'destination':
      count = await db.destination.count({ where })
      break
    case 'package':
      count = await db.travelPackage.count({ where })
      break
    case 'hotel':
      count = await db.hotel.count({ where })
      break
    case 'excursion':
      count = await db.excursion.count({ where })
      break
    case 'transport':
      count = await db.transportService.count({ where })
      break
    case 'cruise':
      count = await db.cruise.count({ where })
      break
  }
  return resolveIsTemplateFallback(count)
}

// ─── Relational package hydration ───────────────────────────────────

async function getRelatedPackages(
  destinationId: string,
  isTemplateFallback: boolean,
): Promise<NormalizedPackage[]> {
  // 1. Try DestinationPackage join model first
  const joinRows = await db.destinationPackage.findMany({
    where: { destinationId, active: true },
    include: { package: true },
    orderBy: { sortOrder: 'asc' },
  })

  if (joinRows.length > 0) {
    const fromJoin = extractEntitiesFromJoinRows(joinRows, 'package', isTemplateFallback)
    if (fromJoin.length > 0) {
      return (fromJoin as Array<Record<string, unknown>>).map(normalizePackage).sort((a, b) => b.rating - a.rating)
    }
  }

  // 2. Fallback: primary destination FK on TravelPackage
  const viaFk = await db.travelPackage.findMany({
    where: { primaryDestinationId: destinationId, active: true, isTemplate: isTemplateFallback },
    orderBy: { rating: 'desc' },
  })
  if (viaFk.length > 0) {
    return viaFk.map((p) => normalizePackage(p as unknown as Record<string, unknown>))
  }

  // 3. Legacy fallback: string destinationId field
  const viaLegacy = await db.travelPackage.findMany({
    where: { destinationId, active: true, isTemplate: isTemplateFallback },
    orderBy: { rating: 'desc' },
  })
  return viaLegacy.map((p) => normalizePackage(p as unknown as Record<string, unknown>))
}

// ─── Relational hotel hydration ─────────────────────────────────────

async function getRelatedHotels(
  destinationId: string,
  destinationName: string,
  isTemplateFallback: boolean,
): Promise<NormalizedHotel[]> {
  // 1. Try DestinationHotel join model first
  const joinRows = await db.destinationHotel.findMany({
    where: { destinationId, active: true },
    include: { hotel: true },
    orderBy: { sortOrder: 'asc' },
  })

  if (joinRows.length > 0) {
    const fromJoin = extractEntitiesFromJoinRows(joinRows, 'hotel', isTemplateFallback)
    if (fromJoin.length > 0) {
      return (fromJoin as Array<Record<string, unknown>>).map(normalizeHotel)
    }
  }

  // 2. Fallback: Hotel.destinationId nullable FK
  const viaFk = await db.hotel.findMany({
    where: { destinationId, active: true, isTemplate: isTemplateFallback },
  })
  if (viaFk.length > 0) {
    return viaFk.map((h) => normalizeHotel(h as unknown as Record<string, unknown>))
  }

  // 3. Legacy fallback: cityId matches destination id OR cityName matches destination name
  const viaLegacy = await db.hotel.findMany({
    where: {
      active: true,
      isTemplate: isTemplateFallback,
      OR: [{ cityId: destinationId }, { cityName: destinationName }],
    },
  })
  return viaLegacy.map((h) => normalizeHotel(h as unknown as Record<string, unknown>))
}

// ─── Relational excursion hydration ─────────────────────────────────

async function getRelatedExcursions(
  destinationId: string,
  destinationName: string,
  isTemplateFallback: boolean,
): Promise<NormalizedExcursion[]> {
  // 1. Try DestinationExcursion join model first
  const joinRows = await db.destinationExcursion.findMany({
    where: { destinationId, active: true },
    include: { excursion: true },
    orderBy: { sortOrder: 'asc' },
  })

  if (joinRows.length > 0) {
    const fromJoin = extractEntitiesFromJoinRows(joinRows, 'excursion', isTemplateFallback)
    if (fromJoin.length > 0) {
      return (fromJoin as Array<Record<string, unknown>>).map(normalizeExcursion)
    }
  }

  // 2. Fallback: Excursion.destinationRefId nullable FK
  const viaFk = await db.excursion.findMany({
    where: { destinationRefId: destinationId, active: true, isTemplate: isTemplateFallback },
  })
  if (viaFk.length > 0) {
    return viaFk.map((e) => normalizeExcursion(e as unknown as Record<string, unknown>))
  }

  // 3. Legacy fallback: string destinationId field or destinationName match
  const viaLegacy = await db.excursion.findMany({
    where: {
      active: true,
      isTemplate: isTemplateFallback,
      OR: [{ destinationId }, { destinationName }],
    },
  })
  return viaLegacy.map((e) => normalizeExcursion(e as unknown as Record<string, unknown>))
}

// ─── Relational transport hydration ────────────────────────────────

async function getRelatedTransportServices(
  destinationId: string,
  destinationName: string,
  isTemplateFallback: boolean,
): Promise<NormalizedTransport[]> {
  // 1. Try DestinationTransportService join model first
  const joinRows = await db.destinationTransportService.findMany({
    where: { destinationId, active: true },
    include: {
      transportService: {
        include: {
          provider: {
            select: { id: true, name: true, vehicleType: true, capacity: true },
          },
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  if (joinRows.length > 0) {
    const fromJoin = extractEntitiesFromJoinRows(joinRows, 'transportService', isTemplateFallback)
    if (fromJoin.length > 0) {
      return (fromJoin as Array<Record<string, unknown>>).map(normalizeTransport)
    }
  }

  // 2. Fallback: TransportService nullable FKs (originDestinationId or destinationDestinationId)
  const viaFk = await db.transportService.findMany({
    where: {
      active: true,
      isTemplate: isTemplateFallback,
      OR: [
        { originDestinationId: destinationId },
        { destinationDestinationId: destinationId },
      ],
    },
    include: {
      provider: {
        select: { id: true, name: true, vehicleType: true, capacity: true },
      },
    },
  })
  if (viaFk.length > 0) {
    return viaFk.map((t) => normalizeTransport(t as unknown as Record<string, unknown>))
  }

  // 3. Legacy fallback: cityId matches destination id OR cityName matches destination name
  const viaLegacy = await db.transportService.findMany({
    where: {
      active: true,
      isTemplate: isTemplateFallback,
      OR: [{ cityId: destinationId }, { cityName: destinationName }],
    },
    include: {
      provider: {
        select: { id: true, name: true, vehicleType: true, capacity: true },
      },
    },
  })
  return viaLegacy.map((t) => normalizeTransport(t as unknown as Record<string, unknown>))
}

// ─── Relational cruise hydration ───────────────────────────────────

async function getRelatedCruises(
  destinationId: string,
  isTemplateFallback: boolean,
): Promise<NormalizedCruise[]> {
  // 1. Try DestinationCruise join model first
  const joinRows = await db.destinationCruise.findMany({
    where: { destinationId, active: true },
    include: { cruise: { include: { cabins: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  if (joinRows.length > 0) {
    const fromJoin = extractEntitiesFromJoinRows(joinRows, 'cruise', isTemplateFallback)
    if (fromJoin.length > 0) {
      return (fromJoin as Array<Record<string, unknown>>).map(normalizeCruise)
    }
  }

  // 2. Fallback: primary destination ID on Cruise
  const viaFk = await db.cruise.findMany({
    where: { primaryDestinationId: destinationId, active: true, isTemplate: isTemplateFallback },
    include: { cabins: true },
  })
  
  return viaFk.map((c) => normalizeCruise(c as unknown as Record<string, unknown>))
}

// ─── Main data loader ───────────────────────────────────────────────

async function getDestinationData(destinationId: string) {
  const isTemplateQuery = await resolveTemplateFallbackForEntity('destination')

  const destination = await db.destination.findFirst({
    where: {
      id: destinationId,
      active: true,
      isTemplate: isTemplateQuery,
    },
  })

  if (!destination) return null

  const highlights = parseJsonArray<string>(destination.highlights)

  const packagesIsTemplate = await resolveTemplateFallbackForEntity('package')
  const hotelsIsTemplate = await resolveTemplateFallbackForEntity('hotel')
  const excursionsIsTemplate = await resolveTemplateFallbackForEntity('excursion')
  const transportIsTemplate = await resolveTemplateFallbackForEntity('transport')
  const cruisesIsTemplate = await resolveTemplateFallbackForEntity('cruise')

  const [packages, hotels, excursions, transportServices, cruises] = await Promise.all([
    getRelatedPackages(destination.id, packagesIsTemplate),
    getRelatedHotels(destination.id, destination.name, hotelsIsTemplate),
    getRelatedExcursions(destination.id, destination.name, excursionsIsTemplate),
    getRelatedTransportServices(destination.id, destination.name, transportIsTemplate),
    getRelatedCruises(destination.id, cruisesIsTemplate),
  ])

  return {
    destination: {
      ...destination,
      highlights,
    },
    packages,
    hotels,
    excursions,
    transportServices,
    cruises,
  }
}

// ─── Metadata ───────────────────────────────────────────────────────

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

// ─── Page Component ─────────────────────────────────────────────────

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

          {/* ── Destination Hero ─────────────────────────────── */}
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
                  {destination.highlights.map((highlight: string) => (
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

          {/* ── Packages Section ─────────────────────────────── */}
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Paquetes en {destination.name}</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {date 
                    ? `${filteredPackages.length} de ${packages.length} opciones disponibles para esta fecha`
                    : `${packages.length} opciones disponibles`
                  }
                </p>
              </div>
            </div>

            {date && (
              <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-900">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>
                    Mostrando paquetes disponibles para la fecha de salida: <strong>{date}</strong>
                  </span>
                </div>
                <Link
                  href={`/destinos/${destination.id}`}
                  className="font-semibold text-amber-700 underline hover:text-amber-800 transition-colors"
                >
                  Ver todas las fechas
                </Link>
              </div>
            )}

            {filteredPackages.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
                {date ? (
                  <div>
                    <p>No hay paquetes programados para salir el <strong>{date}</strong> en este destino.</p>
                    <div className="mt-4">
                      <Link
                        href={`/destinos/${destination.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 shadow-md shadow-amber-500/10"
                      >
                        Ver todos los paquetes (otras fechas)
                      </Link>
                    </div>
                  </div>
                ) : (
                  "Aún no hay paquetes activos para este destino."
                )}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredPackages.map((pkg) => (
                  <article key={pkg.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md">
                    <img src={pkg.image} alt={pkg.title} className="h-44 w-full object-cover" />
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-wide text-amber-600">{pkg.category}</p>
                      <h3 className="mt-1 text-lg font-semibold text-neutral-900">{pkg.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{pkg.description}</p>
                      <p className="mt-3 text-xl font-bold text-amber-600">
                        ${pkg.price.toLocaleString('es-CO')}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/paquetes/${pkg.id}`}
                          className="inline-flex flex-1 items-center justify-center rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
                        >
                          Ver detalle
                        </Link>
                        <Link
                          href={`/paquetes/${pkg.id}/reserva${date ? `?date=${date}` : ''}`}
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

          {/* ── Hotels Section ────────────────────────────────── */}
          <section className="mt-10">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-amber-600" />
                <h2 className="text-2xl font-bold text-neutral-900">Hoteles en {destination.name}</h2>
              </div>
              <p className="mt-1 text-sm text-neutral-500">{hotels.length} alojamientos disponibles</p>
            </div>

            {hotels.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
                Aún no hay hoteles activos para este destino.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {hotels.map((hotel) => (
                  <article key={hotel.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <img
                      src={hotel.images[0] ?? '/placeholder-hotel.png'}
                      alt={hotel.name}
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Star key={i} className="size-3.5 fill-current" />
                        ))}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold text-neutral-900">{hotel.name}</h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                        <MapPin className="size-3" />
                        {hotel.cityName}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{hotel.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                          {hotel.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-neutral-500">{hotel.reviewCount} reseñas</span>
                      </div>
                      <p className="mt-3 text-xl font-bold text-amber-600">
                        ${hotel.priceFrom.toLocaleString('es-CO')}
                        <span className="text-xs font-normal text-neutral-400"> / noche</span>
                      </p>
                      <Link
                        href={`/hoteles/${hotel.slug || hotel.id}`}
                        className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                      >
                        Ver hotel
                        <ArrowRight className="ml-1.5 size-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* ── Excursions Section ────────────────────────────── */}
          <section className="mt-10">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <Compass className="size-5 text-amber-600" />
                <h2 className="text-2xl font-bold text-neutral-900">Excursiones en {destination.name}</h2>
              </div>
              <p className="mt-1 text-sm text-neutral-500">{excursions.length} actividades disponibles</p>
            </div>

            {excursions.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
                Aún no hay excursiones activas para este destino.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {excursions.map((exc) => (
                  <article key={exc.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <img
                      src={exc.images[0] ?? '/placeholder-excursion.png'}
                      alt={exc.name}
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-wide text-amber-600">{exc.category || 'Excursión'}</p>
                      <h3 className="mt-1 text-lg font-semibold text-neutral-900">{exc.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{exc.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500">
                        {exc.duration && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5">{exc.duration}</span>
                        )}
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5">{exc.difficulty}</span>
                      </div>
                      <p className="mt-3 text-xl font-bold text-amber-600">
                        ${exc.basePrice.toLocaleString('es-CO')}
                        <span className="text-xs font-normal text-neutral-400"> / persona</span>
                      </p>
                      <Link
                        href={`/excursiones/${exc.slug || exc.id}`}
                        className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                      >
                        Ver excursión
                        <ArrowRight className="ml-1.5 size-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* ── Transport Section ─────────────────────────────── */}
          <section className="mt-10">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <Bus className="size-5 text-amber-600" />
                <h2 className="text-2xl font-bold text-neutral-900">Transporte en {destination.name}</h2>
              </div>
              <p className="mt-1 text-sm text-neutral-500">{transportServices.length} servicios disponibles</p>
            </div>

            {transportServices.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
                Aún no hay servicios de transporte activos para este destino.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {transportServices.map((ts) => (
                  <article key={ts.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <img
                      src="/placeholder-transport.png"
                      alt={ts.name}
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-wide text-amber-600">{ts.routeType || 'Transporte'}</p>
                      <h3 className="mt-1 text-lg font-semibold text-neutral-900">{ts.name}</h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                        <MapPin className="size-3" />
                        {ts.origin} → {ts.destination}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{ts.notes}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500">
                        {ts.durationMins > 0 && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5">{ts.durationMins} min</span>
                        )}
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5">{ts.cityName}</span>
                      </div>
                      <p className="mt-3 text-xl font-bold text-amber-600">
                        ${ts.basePrice.toLocaleString('es-CO')}
                        <span className="text-xs font-normal text-neutral-400"> / persona</span>
                      </p>
                      <Link
                        href={`/transportes/${ts.id}`}
                        className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                      >
                        Ver servicio
                        <ArrowRight className="ml-1.5 size-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* ── Cruises Section ──────────────────────────────── */}
          <section className="mt-10">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <Ship className="size-5 text-amber-600" />
                <h2 className="text-2xl font-bold text-neutral-900">Cruceros en {destination.name}</h2>
              </div>
              <p className="mt-1 text-sm text-neutral-500">{cruises.length} cruceros disponibles</p>
            </div>

            {cruises.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
                Aún no hay cruceros activos zarpando o visitando este destino.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {cruises.map((cruise) => (
                  <article key={cruise.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm flex flex-col justify-between">
                    <img
                      src={cruise.images[0] ?? '/images/cruceros.png'}
                      alt={cruise.name}
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-amber-600">{cruise.operator}</p>
                        <h3 className="text-lg font-semibold text-neutral-900 leading-snug">{cruise.name}</h3>
                        <p className="text-xs text-neutral-500">Barco: <span className="font-semibold">{cruise.shipName}</span></p>
                        <p className="line-clamp-2 text-sm text-neutral-600">{cruise.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5">{cruise.durationDays} días / {cruise.durationDays - 1} noches</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-neutral-400 block">Desde</span>
                          <span className="text-lg font-extrabold text-sky-800">${cruise.priceFrom.toLocaleString('es-CO')}</span>
                        </div>
                        <Link
                          href={`/cruceros/${cruise.slug || cruise.id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
                        >
                          Ver crucero
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

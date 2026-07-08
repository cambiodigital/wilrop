import Link from 'next/link'
import { ArrowRight, Building2, Compass, Bus, Ship, MapPin, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'

interface DestinationDetailsListProps {
  destination: {
    id: string
    name: string
  }
  packages: any[]
  hotels: any[]
  excursions: any[]
  transportServices: any[]
  cruises: any[]
  date?: string
  filteredPackages: any[]
}

// ─── Reusable Section Wrapper ─────────────────────────────
// Only renders when data is non-empty. If everything is empty,
// a single helpful message appears instead of N "no hay" sections.
// ────────────────────────────────────────────────────────────

function Section({
  visible,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  visible: boolean
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  if (!visible) return null
  return (
    <section>
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-amber-600" />
          <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
        </div>
        <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

export default function DestinationDetailsList({
  destination,
  packages,
  hotels,
  excursions,
  transportServices,
  cruises,
  date,
  filteredPackages,
}: DestinationDetailsListProps) {

  const sections = [
    { key: 'packages',     visible: filteredPackages.length > 0, count: filteredPackages.length },
    { key: 'hotels',       visible: hotels.length > 0,           count: hotels.length },
    { key: 'excursions',   visible: excursions.length > 0,       count: excursions.length },
    { key: 'transport',    visible: transportServices.length > 0, count: transportServices.length },
    { key: 'cruises',      visible: cruises.length > 0,          count: cruises.length },
  ]

  const anySection = sections.some((s) => s.visible)

  if (!anySection) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-neutral-200 bg-white px-8 py-12">
          <MapPin className="size-12 text-amber-300" />
          <h2 className="mt-4 text-xl font-bold text-neutral-800">
            Estamos preparando {destination.name}
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Pronto tendremos productos disponibles para este destino.
            Mientras tanto, explora nuestros otros destinos.
          </p>
          <Link
            href="/destinos"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 shadow-md shadow-amber-500/10"
          >
            Ver todos los destinos
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* ── Packages Section ─────────────────────────────── */}
      <Section
        visible={filteredPackages.length > 0}
        icon={({ className }) => <span className={className}>🎒</span>}
        title={`Paquetes en ${destination.name}`}
        subtitle={
          date
            ? `${filteredPackages.length} de ${packages.length} opciones disponibles para esta fecha`
            : `${filteredPackages.length} opciones disponibles`
        }
      >
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

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <article key={pkg.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md">
              <img src={pkg.image} alt={pkg.title} className="h-44 w-full object-cover" />
              <div className="p-4">
                <p className="text-xs uppercase tracking-wide text-amber-600">{pkg.category}</p>
                <h3 className="mt-1 text-lg font-semibold text-neutral-900">{pkg.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{pkg.description}</p>
                <p className="mt-3 text-xl font-bold text-amber-600">
                  {formatCurrency(pkg.price)}
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
      </Section>

      {/* ── Hotels Section ────────────────────────────────── */}
      <Section
        visible={hotels.length > 0}
        icon={Building2}
        title={`Hoteles en ${destination.name}`}
        subtitle={`${hotels.length} alojamientos disponibles`}
      >
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
                  {formatCurrency(hotel.priceFrom)}
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
      </Section>

      {/* ── Excursions Section ────────────────────────────── */}
      <Section
        visible={excursions.length > 0}
        icon={Compass}
        title={`Excursiones en ${destination.name}`}
        subtitle={`${excursions.length} actividades disponibles`}
      >
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
                  {formatCurrency(exc.basePrice)}
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
      </Section>

      {/* ── Transport Section ─────────────────────────────── */}
      <Section
        visible={transportServices.length > 0}
        icon={Bus}
        title={`Transporte en ${destination.name}`}
        subtitle={`${transportServices.length} servicios disponibles`}
      >
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
                  {formatCurrency(ts.basePrice)}
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
      </Section>

      {/* ── Cruises Section ──────────────────────────────── */}
      <Section
        visible={cruises.length > 0}
        icon={Ship}
        title={`Cruceros en ${destination.name}`}
        subtitle={`${cruises.length} cruceros disponibles`}
      >
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
                    <span className="text-lg font-extrabold text-sky-800">{formatCurrency(cruise.priceFrom)}</span>
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
      </Section>
    </div>
  )
}

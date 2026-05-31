import { safeJsonParse } from '@/lib/json'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Bus, Clock, MapPin, Shield, Users } from 'lucide-react'
import PortalShell from '@/components/portal/PortalShell'
import { db } from '@/lib/db'
import { buildPublicMetadata } from '@/lib/seo'

interface TransportDetailRouteProps {
  params: Promise<{
    serviceId: string
  }>
}


async function getServiceById(serviceId: string) {
  const service = await db.transportService.findUnique({
    where: { id: serviceId },
    include: {
      provider: {
        select: { id: true, name: true, vehicleType: true, capacity: true },
      },
    },
  })

  if (!service || !service.active) {
    return null
  }

  return {
    ...service,
    includes: safeJsonParse<string[]>(service.includes, []),
  }
}

export async function generateMetadata({ params }: TransportDetailRouteProps): Promise<Metadata> {
  const { serviceId } = await params
  const service = await getServiceById(serviceId)

  if (!service) {
    return buildPublicMetadata({
      title: 'Servicio no encontrado | WILROP',
      description: 'El servicio de transporte solicitado no existe o ya no está disponible.',
      path: '/transportes',
      noIndex: true,
    })
  }

  return buildPublicMetadata({
    title: `${service.name} | Transporte WILROP`,
    description: `Revisa el servicio ${service.name} para traslados en ${service.cityName}.`,
    path: `/transportes/${serviceId}`,
  })
}

export default async function TransportDetailRoutePage({ params }: TransportDetailRouteProps) {
  const { serviceId } = await params
  const service = await getServiceById(serviceId)

  if (!service) {
    notFound()
  }

  return (
    <PortalShell>
      <div className="min-h-screen bg-neutral-50 pt-20 pb-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/transportes"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-amber-600"
          >
            <ArrowLeft className="size-4" />
            Volver a transportes
          </Link>

          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-8 text-white sm:px-8">
              <p className="text-xs uppercase tracking-widest text-white/80">Servicio de transporte</p>
              <h1 className="mt-2 text-2xl font-bold sm:text-4xl">{service.name}</h1>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/90">
                <MapPin className="size-4" />
                {service.origin} → {service.destination}
              </p>
            </div>

            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs uppercase tracking-wider text-neutral-500">Duración</p>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">
                      <Clock className="size-4 text-amber-500" />
                      {service.durationMins} minutos
                    </p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs uppercase tracking-wider text-neutral-500">Capacidad</p>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">
                      <Users className="size-4 text-amber-500" />
                      {service.provider.capacity} pasajeros
                    </p>
                  </div>
                </div>

                <section>
                  <h2 className="text-lg font-semibold text-neutral-900">Proveedor</h2>
                  <p className="mt-2 text-sm text-neutral-600">
                    {service.provider.name} · Vehículo tipo {service.provider.vehicleType}
                  </p>
                </section>

                {service.includes.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-neutral-900">Incluye</h2>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {service.includes.map((item) => (
                        <li key={item} className="inline-flex items-start gap-2 text-sm text-neutral-600">
                          <Shield className="mt-0.5 size-4 text-emerald-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {service.notes && (
                  <section>
                    <h2 className="text-lg font-semibold text-neutral-900">Notas</h2>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">{service.notes}</p>
                  </section>
                )}
              </div>

              <aside className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-xs uppercase tracking-widest text-neutral-500">Tarifa base</p>
                <p className="mt-1 text-3xl font-bold text-amber-600">${service.basePrice.toLocaleString('es-CO')}</p>
                <p className="mt-1 text-sm text-neutral-500">+ ${service.pricePerExtra.toLocaleString('es-CO')} por pasajero extra</p>

                <div className="mt-6 space-y-2">
                  <Link
                    href="/transportes"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                  >
                    <Bus className="mr-2 size-4" />
                    Reservar transporte
                  </Link>
                  <Link
                    href="/contacto"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
                  >
                    Solicitar asistencia
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  )
}

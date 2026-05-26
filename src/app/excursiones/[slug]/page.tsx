import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Clock, Star, ArrowLeft, Check, X } from 'lucide-react'
import PortalShell from '@/components/portal/PortalShell'
import ExcursionGallery from '@/components/portal/ExcursionGallery'
import { db } from '@/lib/db'
import { buildPublicMetadata } from '@/lib/seo'

interface ExcursionDetailRouteProps {
  params: Promise<{
    slug: string
  }>
}

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

async function getExcursionBySlug(slug: string) {
  const excursion = await db.excursion.findFirst({
    where: { slug, active: true },
  })

  if (!excursion) {
    return null
  }

  return {
    ...excursion,
    images: safeJsonParse<string[]>(excursion.images, []),
    includes: safeJsonParse<string[]>(excursion.includes, []),
    excludes: safeJsonParse<string[]>(excursion.excludes, []),
    requirements: safeJsonParse<string[]>(excursion.requirements, []),
  }
}

export async function generateMetadata({ params }: ExcursionDetailRouteProps): Promise<Metadata> {
  const { slug } = await params
  const excursion = await getExcursionBySlug(slug)

  if (!excursion) {
    return buildPublicMetadata({
      title: 'Excursión no encontrada | WILROP',
      description: 'La excursión solicitada no existe o ya no está disponible.',
      path: '/excursiones',
      noIndex: true,
    })
  }

  return buildPublicMetadata({
    title: `${excursion.name} | Excursiones WILROP`,
    description: excursion.shortDesc || `Conoce la excursión ${excursion.name} y planea tu experiencia en ${excursion.destinationName}.`,
    path: `/excursiones/${slug}`,
    ogImage: excursion.images[0],
  })
}

export default async function ExcursionDetailRoutePage({ params }: ExcursionDetailRouteProps) {
  const { slug } = await params
  const excursion = await getExcursionBySlug(slug)

  if (!excursion) {
    notFound()
  }

  return (
    <PortalShell>
      <div className="min-h-screen bg-neutral-50 pt-20 pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/excursiones"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-amber-600"
          >
            <ArrowLeft className="size-4" />
            Volver a excursiones
          </Link>

          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="relative h-72 sm:h-96">
              <ExcursionGallery images={excursion.images} name={excursion.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                <p className="text-xs uppercase tracking-widest text-white/80">Excursión</p>
                <h1 className="mt-2 text-2xl font-bold sm:text-4xl">{excursion.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/90">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {excursion.cityName || excursion.destinationName}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {excursion.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-4 fill-amber-300 text-amber-300" />
                    {excursion.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <section>
                  <h2 className="text-lg font-semibold text-neutral-900">Descripción</h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{excursion.description}</p>
                </section>

                {excursion.includes.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-neutral-900">Incluye</h2>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {excursion.includes.map((item) => (
                        <li key={item} className="inline-flex items-start gap-2 text-sm text-neutral-600">
                          <Check className="mt-0.5 size-4 text-emerald-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {excursion.excludes.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-neutral-900">No incluye</h2>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {excursion.excludes.map((item) => (
                        <li key={item} className="inline-flex items-start gap-2 text-sm text-neutral-600">
                          <X className="mt-0.5 size-4 text-rose-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {excursion.requirements.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-neutral-900">Requisitos</h2>
                    <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                      {excursion.requirements.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              <aside className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-xs uppercase tracking-widest text-neutral-500">Precio desde</p>
                <p className="mt-1 text-3xl font-bold text-amber-600">${excursion.basePrice.toLocaleString('es-CO')}</p>
                {excursion.childPrice > 0 && (
                  <p className="mt-1 text-sm text-neutral-500">Niños: ${excursion.childPrice.toLocaleString('es-CO')}</p>
                )}
                <p className="mt-3 text-sm text-neutral-600">Categoría: <span className="font-semibold">{excursion.category}</span></p>
                <p className="mt-1 text-sm text-neutral-600">Dificultad: <span className="font-semibold">{excursion.difficulty}</span></p>

                <div className="mt-6 space-y-2">
                  <Link
                    href="/excursiones"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                  >
                    Reservar esta excursión
                  </Link>
                  <Link
                    href="/contacto"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
                  >
                    Solicitar asesoría
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

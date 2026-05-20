'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Clock,
  Users,
  Star,
  Check,
  Calendar,
  ArrowLeft,
  Shield,
  Mountain,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { packages, getPackagesByDestination } from '@/data/packages'
import { useNavigationStore } from '@/store/useNavigationStore'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'

const difficultyConfig: Record<string, { color: string; bg: string; icon: typeof Mountain }> = {
  'Fácil': { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: Shield },
  'Moderado': { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Mountain },
  'Avanzado': { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: Mountain },
}

interface PackageDetailProps {
  packageId?: string
  pkg?: any
  relatedPackages?: any[]
}

export default function PackageDetail({ packageId, pkg: initialPkg, relatedPackages: initialRelatedPackages }: PackageDetailProps) {
  const selectedPackageId = useNavigationStore((state) => state.selectedPackageId)
  const { navigate } = usePortalNavigation()

  const pkg = useMemo(
    () => initialPkg || packages.find((p) => p.id === (packageId ?? selectedPackageId)),
    [initialPkg, packageId, selectedPackageId]
  )

  const relatedPackages = useMemo(
    () =>
      initialRelatedPackages ||
      (pkg
        ? getPackagesByDestination(pkg.destinationId).filter((p) => p.id !== pkg.id)
        : []),
    [initialRelatedPackages, pkg]
  )

  if (!pkg) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-lg text-neutral-500">Paquete no encontrado</p>
          <Button
            onClick={() => navigate('portal-destinations')}
            variant="outline"
            className="mt-4 rounded-xl"
          >
            Volver a Destinos
          </Button>
        </div>
      </div>
    )
  }

  const diffConfig = difficultyConfig[pkg.difficulty] || difficultyConfig['Fácil']
  const DiffIcon = diffConfig.icon
  const hasDiscount = pkg.originalPrice && pkg.originalPrice > pkg.price
  const discount = hasDiscount
    ? Math.round(((pkg.originalPrice! - pkg.price) / pkg.originalPrice!) * 100)
    : 0

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 md:h-96">
        <img
          src={pkg.image}
          alt={pkg.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                variant="ghost"
                onClick={() => navigate('portal-destinations')}
                className="mb-4 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="mr-2 size-4" />
                Volver a Destinos
              </Button>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full bg-amber-500 text-white">
                  <MapPin className="mr-1 size-3" />
                  {pkg.destinationName}
                </Badge>
                <Badge className={`rounded-full border ${diffConfig.bg} ${diffConfig.color}`}>
                  <DiffIcon className="mr-1 size-3" />
                  {pkg.difficulty}
                </Badge>
                {pkg.soldOut && (
                  <Badge variant="destructive" className="rounded-full">
                    Agotado
                  </Badge>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                {pkg.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {pkg.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-4" />
                  {pkg.groupSize}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {pkg.rating}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-neutral-900">Descripción</h2>
              <p className="mt-3 leading-relaxed text-neutral-600">{pkg.description}</p>
            </motion.div>

            <Separator className="my-8" />

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-neutral-900">Qué incluye</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {pkg.includes.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                      <Check className="size-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-neutral-600">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <Separator className="my-8" />

            {/* Departure Dates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-neutral-900">Fechas de Salida</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pkg.departureDates.map((date, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3"
                  >
                    <Calendar className="size-4 text-amber-500" />
                    <span className="text-sm font-medium text-neutral-700">
                      {formatDate(date)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Related Packages */}
            {relatedPackages.length > 0 && (
              <>
                <Separator className="my-8" />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-xl font-bold text-neutral-900">Otros Paquetes en {pkg.destinationName}</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {relatedPackages.map((related) => (
                      <Card
                        key={related.id}
                        className="cursor-pointer border-neutral-200 py-0 transition-all hover:shadow-md"
                        onClick={() => navigate('portal-package-detail', related.id)}
                      >
                        <div className="flex gap-4 p-4">
                          <img
                            src={related.image}
                            alt={related.title}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-semibold text-neutral-900">
                              {related.title}
                            </h3>
                            <p className="mt-1 text-xs text-neutral-500">{related.duration}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-sm font-bold text-amber-600">
                                ${related.price.toLocaleString('es-CO')}
                              </span>
                              {related.soldOut && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                  Agotado
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-24 border-neutral-200 p-6">
                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-neutral-900">
                    ${pkg.price.toLocaleString('es-CO')}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-neutral-400 line-through">
                        ${pkg.originalPrice!.toLocaleString('es-CO')}
                      </span>
                      <Badge className="rounded-full bg-red-50 text-red-600 text-xs border border-red-200">
                        -{discount}%
                      </Badge>
                    </>
                  )}
                </div>
                <p className="mt-1 text-sm text-neutral-500">por persona</p>

                <Separator className="my-5" />

                {/* Quick Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Duración</span>
                    <span className="font-medium text-neutral-800">{pkg.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Grupo</span>
                    <span className="font-medium text-neutral-800">{pkg.groupSize}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Dificultad</span>
                    <span className={`font-medium ${diffConfig.color}`}>{pkg.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Categoría</span>
                    <span className="font-medium text-neutral-800">{pkg.category}</span>
                  </div>
                </div>

                <Separator className="my-5" />

                {/* CTA */}
                <Button
                  onClick={() => navigate('portal-booking', pkg.id)}
                  disabled={pkg.soldOut}
                  className="w-full rounded-xl bg-amber-500 py-5 text-base font-semibold text-white hover:bg-amber-600 disabled:bg-neutral-300"
                  size="lg"
                >
                  {pkg.soldOut ? 'Agotado' : 'Reservar Ahora'}
                </Button>

                {pkg.soldOut && (
                  <p className="mt-3 text-center text-sm text-neutral-500">
                    Este paquete está agotado. Pronto tendremos nuevas fechas.
                  </p>
                )}

                {/* Trust signals */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Check className="size-3.5 text-emerald-500" />
                    Cancelación gratuita hasta 48h antes
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Check className="size-3.5 text-emerald-500" />
                    Sin cargos ocultos
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Check className="size-3.5 text-emerald-500" />
                    Pago seguro
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

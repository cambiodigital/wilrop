'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Star, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { destinations as staticDestinations } from '@/data/destinations'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'
import { useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

const categories = ['Todos', 'Playa', 'Aventura', 'Cultural', 'Naturaleza', 'Relax'] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

interface DestinationsSectionProps {
  limit?: number
}

export default function DestinationsSection({ limit }: DestinationsSectionProps) {
  const { navigate } = usePortalNavigation()
  const searchParams = useSearchParams()
  const dateParam = searchParams ? searchParams.get('date') : null
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [loading, setLoading] = useState<boolean>(true)
  const [destinationsList, setDestinationsList] = useState<any[]>([])

  const handleNavigateDetail = (destinationId: string) => {
    const path = dateParam ? `/destinos/${destinationId}?date=${dateParam}` : `/destinos/${destinationId}`
    navigate(path)
  }
  const isPreview = typeof limit === 'number'

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeCategory && activeCategory !== 'Todos') {
      params.append('category', activeCategory)
    }
    if (isPreview && typeof limit === 'number') {
      params.append('limit', String(limit))
    }

    fetch(`/api/public/destinations?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setDestinationsList(res.data)
        }
      })
      .catch((err) => console.error('Error fetching destinations:', err))
      .finally(() => setLoading(false))
  }, [activeCategory, limit, isPreview])

  const displayDestinations = useMemo(() => {
    if (destinationsList.length > 0) {
      return destinationsList
    }
    return loading ? [] : staticDestinations
  }, [destinationsList, loading])

  return (
    <section id="destinations" className="bg-brand-surface-light py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Badge variant="secondary" className="mb-4 rounded-full bg-amber-50 text-amber-700">
            Explora Colombia
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Nuestros Destinos
          </h2>
          <p className="mt-3 text-lg text-neutral-500">
            {isPreview ? 'Los destinos más populares de Colombia' : 'Explora lo mejor de Colombia'}
          </p>
        </motion.div>

        {/* Category Tabs — only on full page */}
        {!isPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-10 flex flex-wrap justify-center gap-2"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {/* Destination Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: limit || 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border-neutral-200 py-0 shadow-sm rounded-xl bg-white">
                <Skeleton className="h-56 w-full rounded-none" />
                <CardContent className="p-4 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-xl" />
                </CardContent>
              </Card>
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {displayDestinations.map((destination) => (
                <motion.div
                  key={destination.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                >
                  <Card
                    onClick={() => handleNavigateDetail(destination.id)}
                    className="group cursor-pointer overflow-hidden border-neutral-200 py-0 transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <Badge className="absolute top-3 left-3 rounded-full bg-white/90 text-neutral-700 backdrop-blur-sm text-xs font-medium">
                        <MapPin className="mr-1 size-3 text-amber-500" />
                        {destination.region}
                      </Badge>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-lg font-bold text-white">
                          {destination.name}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="line-clamp-2 text-sm text-neutral-500">
                        {destination.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-neutral-700">
                            {destination.rating}
                          </span>
                          <span className="text-xs text-neutral-400">
                            ({destination.reviewCount})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-neutral-400">Desde</span>
                          <p className="text-sm font-bold text-amber-600">
                            ${destination.priceFrom.toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNavigateDetail(destination.id)
                        }}
                      >
                        <Button
                          variant="outline"
                          className="mt-4 w-full rounded-xl border-amber-200 text-white hover:bg-amber-50 hover:text-amber-700"
                        >
                          Ver Paquetes
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* See All Button — only on preview */}
        {isPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 text-center"
          >
            <Button
              onClick={() => navigate('portal-destinations')}
              size="lg"
              className="rounded-xl bg-amber-500 px-8 font-semibold text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/30"
            >
              Ver todos los destinos
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}

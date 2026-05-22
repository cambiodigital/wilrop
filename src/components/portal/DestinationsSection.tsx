'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Star, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { destinations as staticDestinations } from '@/data/destinations'
import { packages as staticPackages } from '@/data/packages'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'

const categories = ['Todos', 'Playa', 'Aventura', 'Cultural', 'Naturaleza', 'Relax'] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [destinationsList, setDestinationsList] = useState<any[]>(staticDestinations)
  const [packagesList, setPackagesList] = useState<any[]>(staticPackages)
  const isPreview = typeof limit === 'number'

  useEffect(() => {
    Promise.all([
      fetch('/api/public/destinations').then((res) => res.json()),
      fetch('/api/public/packages').then((res) => res.json()),
    ])
      .then(([destRes, pkgRes]) => {
        if (destRes.success && Array.isArray(destRes.data) && destRes.data.length > 0) {
          setDestinationsList(destRes.data)
        }
        if (pkgRes.success && Array.isArray(pkgRes.data) && pkgRes.data.length > 0) {
          setPackagesList(pkgRes.data)
        }
      })
      .catch((err) => console.error('Error fetching destinations or packages:', err))
  }, [])

  /**
   * Filter destinations by active category using relational destination IDs
   * when available (from DestinationPackage join), falling back to legacy
   * `p.destinationId === d.id` string comparison for migration safety.
   */
  const filteredDestinations =
    activeCategory === 'Todos'
      ? destinationsList
      : destinationsList.filter((d) =>
          packagesList.some((p) => {
            if (p.category !== activeCategory) return false
            const relatedIds = p.relatedDestinationIds
            if (Array.isArray(relatedIds) && relatedIds.length > 0) {
              return relatedIds.includes(d.id)
            }
            // Legacy fallback: direct string comparison
            return p.destinationId === d.id
          })
        )

  const displayDestinations = isPreview ? filteredDestinations.slice(0, limit) : filteredDestinations

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
                  onClick={() => navigate('portal-destination-detail', destination.id)}
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
                      navigate('portal-destination-detail', destination.id)
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

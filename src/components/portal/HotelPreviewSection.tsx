'use client'
import { formatCurrency } from '@/lib/currency'


import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Star, ArrowRight, Building2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Hotel } from '@/lib/hotel-amenities'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'
import { Skeleton } from '@/components/ui/skeleton'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const hotelGradients = [
  'from-amber-600/40 to-orange-500/30',
  'from-emerald-600/40 to-teal-500/30',
  'from-sky-600/40 to-blue-500/30',
  'from-rose-600/40 to-pink-500/30',
]

function RatingBadge({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const color =
    rating >= 9
      ? 'bg-emerald-500 text-white'
      : rating >= 8
        ? 'bg-emerald-500 text-white'
        : 'bg-amber-500 text-white'

  const label =
    rating >= 9
      ? 'Excepcional'
      : rating >= 8
        ? 'Excelente'
        : rating >= 7
          ? 'Muy bueno'
          : 'Bueno'

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center justify-center rounded-md px-2 py-1 text-xs font-bold ${color}`}>
        {rating.toFixed(1)}
      </div>
      <span className="text-xs text-neutral-500">
        {label} ({reviewCount})
      </span>
    </div>
  )
}

function StarsDisplay({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
        />
      ))}
    </div>
  )
}

export default function HotelPreviewSection() {
  const { navigate } = usePortalNavigation()
  const [hotelsList, setHotelsList] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    requestAnimationFrame(() => setLoading(true))
    fetch('/api/public/hotels?featured=true&limit=4')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setHotelsList(res.data)
        }
      })
      .catch((err) => console.error('Error fetching hotels:', err))
      .finally(() => setLoading(false))
  }, [])

  const featuredHotels = useMemo(() => {
    if (hotelsList.length > 0) {
      return hotelsList
    }
    return loading ? [] : []
  }, [hotelsList, loading])

  return (
    <section className="bg-gradient-to-b from-brand-surface-light to-amber-50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center">
          <Badge className="mb-4 rounded-full bg-amber-100 px-4 py-1.5 text-amber-700 border-amber-200 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="mr-1.5 size-3" />
            Alojamiento
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            Hoteles en Colombia
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-neutral-500 sm:text-lg">
            Alojamiento para cada estilo de viaje
          </p>
        </motion.div>

        {/* Featured Hotels Grid */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 space-y-4 shadow-sm">
                <Skeleton className="h-36 w-full rounded-lg" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ))
          ) : (
            featuredHotels.map((hotel, idx) => (
              <HotelCard key={hotel.id} hotel={hotel} gradient={hotelGradients[idx % hotelGradients.length]} />
            ))
          )}
        </div>

        {/* Bottom CTA */}
        <motion.div variants={itemVariants} className="mt-12 text-center">
          <Button
            onClick={() => navigate('portal-hotels')}
            size="lg"
            className="rounded-xl bg-amber-500 px-8 font-semibold text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/30"
          >
            Buscar todos los hoteles
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

function HotelCard({ hotel, gradient }: { hotel: Hotel; gradient: string }) {
  const { openHotelDetail } = usePortalNavigation()

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      className="group cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
      onClick={() => openHotelDetail(hotel.id)}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={hotel.images[0] || '/placeholder-hotel.png'}
          alt={hotel.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient}`} />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hotel.featured && (
            <Badge className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white border-transparent shadow-sm">
              <Sparkles className="mr-1 size-3" />
              Destacado
            </Badge>
          )}
          {hotel.rooms[0]?.originalPrice && (
            <Badge className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white border-transparent shadow-sm">
              {Math.round(((hotel.rooms[0].originalPrice - hotel.rooms[0].price) / hotel.rooms[0].originalPrice) * 100)}% OFF
            </Badge>
          )}
        </div>
        {hotel.tags[0] && (
          <Badge className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-neutral-900 border-transparent shadow-sm">
            {hotel.tags[0]}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <StarsDisplay stars={hotel.stars} />
        <h4 className="mt-1.5 text-sm font-bold text-neutral-900 leading-snug line-clamp-1">
          {hotel.name}
        </h4>
        <div className="mt-1 flex items-center gap-1 text-neutral-500">
          <MapPin className="size-3" />
          <span className="text-xs">{hotel.cityName}</span>
        </div>
        <div className="mt-2">
          <RatingBadge rating={hotel.rating} reviewCount={hotel.reviewCount} />
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="text-xs text-neutral-400">Desde</span>
            <p className="text-lg font-bold text-amber-600">{formatCurrency(hotel.priceFrom)}<span className="text-xs font-normal text-neutral-400">/ noche</span></p>
          </div>
        </div>
        <Button
          className="mt-3 w-full rounded-xl bg-amber-500 py-2 text-xs font-semibold text-white transition-all hover:bg-amber-600"
          onClick={(e) => {
            e.stopPropagation()
            openHotelDetail(hotel.id)
          }}
        >
          Reservar
        </Button>
      </div>
    </motion.div>
  )
}

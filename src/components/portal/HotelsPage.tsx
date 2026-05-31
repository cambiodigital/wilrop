'use client'
import { formatCurrency } from '@/lib/currency'


import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  Star,
  Users,
  SlidersHorizontal,
  X,
  ChevronDown,
  Wifi,
  Waves,
  UtensilsCrossed,
  Car,
  Dumbbell,
  Sparkles,
  Thermometer,
  Coffee,
  Wine,
  Clock,
  Plane,
  Eye,
  ArrowRight,
  Bed,
  Minus,
  Plus,
  Check,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { hotels as allHotels, hotelCities, hotelAmenities, type Hotel } from '@/data/hotels'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'
import { useEffect } from 'react'

// ─── Icon map ────────────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi, Waves, UtensilsCrossed, Car, Dumbbell, Sparkles, Thermometer, Coffee, Wine, Clock, Plane, Eye,
}

// ─── Animation variants ─────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// ─── Main Component ─────────────────────────────────────────
export default function HotelsPage() {
  const { goBack, openHotelDetail } = usePortalNavigation()
  const [hotelsList, setHotelsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Search state
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [guestsOpen, setGuestsOpen] = useState(false)

  // Filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([150000, 1200000])
  const [starFilters, setStarFilters] = useState<number[]>([])
  const [amenityFilters, setAmenityFilters] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<string>('recommended')

  // Pagination state
  const [page, setPage] = useState(1)
  const [paginationInfo, setPaginationInfo] = useState<any>(null)
  const limit = 10

  // Mobile filter sheet
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Has searched
  const [hasSearched, setHasSearched] = useState(false)

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1
    const d1 = new Date(checkIn)
    const d2 = new Date(checkOut)
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 1
  }, [checkIn, checkOut])

  const totalGuests = adults + children

  // Debounced server fetch triggered on any query filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCity) params.append('cityId', selectedCity)
      params.append('priceMin', String(priceRange[0]))
      params.append('priceMax', String(priceRange[1]))
      if (starFilters.length > 0) params.append('stars', starFilters.join(','))
      if (amenityFilters.length > 0) params.append('amenities', amenityFilters.join(','))
      if (minRating > 0) params.append('minRating', String(minRating))
      if (sortBy) params.append('sortBy', sortBy)
      if (hasSearched && totalGuests > 0) params.append('guests', String(totalGuests))
      params.append('page', String(page))
      params.append('limit', String(limit))

      fetch(`/api/public/hotels?${params.toString()}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setHotelsList(res.data)
            if (res.pagination) {
              setPaginationInfo(res.pagination)
            }
          }
        })
        .catch((err) => console.error('Error fetching hotels:', err))
        .finally(() => setLoading(false))
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [
    selectedCity,
    priceRange,
    starFilters,
    amenityFilters,
    minRating,
    sortBy,
    hasSearched,
    totalGuests,
    page,
  ])

  const filteredHotels = hotelsList

  // Toggle helpers
  const toggleStar = useCallback((star: number) => {
    setStarFilters((prev) => (prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]))
    setPage(1)
  }, [])

  const toggleAmenity = useCallback((amenityId: string) => {
    setAmenityFilters((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId],
    )
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setPriceRange([150000, 1200000])
    setStarFilters([])
    setAmenityFilters([])
    setMinRating(0)
    setSelectedCity('')
    setPage(1)
  }, [])

  const handleSearch = useCallback(() => {
    setHasSearched(true)
    setPage(1)
  }, [])

  const cityName = selectedCity
    ? hotelCities.find((c) => c.id === selectedCity)?.name ?? 'Colombia'
    : 'Colombia'

  // ─── Filters sidebar content (shared desktop/mobile) ─────
  const filtersContent = (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-neutral-900">Rango de precio</h4>
        <Slider
          value={priceRange}
          onValueChange={(v) => { setPriceRange(v as [number, number]); setPage(1) }}
          min={150000}
          max={1200000}
          step={50000}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>{formatCurrency(priceRange[0])}</span>
          <span>{formatCurrency(priceRange[1])}</span>
        </div>
      </div>

      <Separator />

      {/* Star Rating */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-neutral-900">Estrellas</h4>
        <div className="space-y-2">
          {[3, 4, 5].map((star) => (
            <label
              key={star}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-50"
            >
              <Checkbox
                checked={starFilters.includes(star)}
                onCheckedChange={() => toggleStar(star)}
              />
              <div className="flex items-center gap-0.5">
                {Array.from({ length: star }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-neutral-600">
                {star} {star === 3 ? 'estrellas' : 'estrellas'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Amenities */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-neutral-900">Servicios</h4>
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {hotelAmenities.map((amenity) => {
            const AmenityIcon = iconMap[amenity.icon]
            return (
              <label
                key={amenity.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-50"
              >
                <Checkbox
                  checked={amenityFilters.includes(amenity.id)}
                  onCheckedChange={() => toggleAmenity(amenity.id)}
                />
                {AmenityIcon && <AmenityIcon className="size-3.5 text-neutral-500" />}
                <span className="text-sm text-neutral-600">{amenity.name}</span>
              </label>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Guest Rating */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-neutral-900">Calificación de huéspedes</h4>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-50">
            <Checkbox
              checked={minRating === 0}
              onCheckedChange={() => { setMinRating(0); setPage(1) }}
            />
            <span className="text-sm text-neutral-600">Todas</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-50">
            <Checkbox
              checked={minRating === 8}
              onCheckedChange={() => { setMinRating(minRating === 8 ? 0 : 8); setPage(1) }}
            />
            <span className="text-sm text-neutral-600">8+ Excelente</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-50">
            <Checkbox
              checked={minRating === 9}
              onCheckedChange={() => { setMinRating(minRating === 9 ? 0 : 9); setPage(1) }}
            />
            <span className="text-sm text-neutral-600">9+ Excepcional</span>
          </label>
        </div>
      </div>

      <Separator />

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full rounded-xl border-neutral-200 text-neutral-600 hover:bg-neutral-50"
        onClick={clearFilters}
      >
        <X className="mr-2 size-4" />
        Limpiar filtros
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ─── Sticky Search Bar ─────────────────────────────── */}
      <div className="sticky top-16 z-40 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* City */}
            <div className="flex-1">
              <Select value={selectedCity} onValueChange={(v) => { setSelectedCity(v === 'all' ? '' : v); setPage(1) }}>
                <SelectTrigger className="w-full rounded-xl border-neutral-200 bg-white">
                  <MapPin className="mr-2 size-4 text-amber-500" />
                  <SelectValue placeholder="¿A dónde viajas?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ciudades</SelectItem>
                  {hotelCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Check-in */}
            <div className="lg:w-40">
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="[color-scheme:light] rounded-xl border-neutral-200 bg-white"
                placeholder="Check-in"
              />
            </div>

            {/* Check-out */}
            <div className="lg:w-40">
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="[color-scheme:light] rounded-xl border-neutral-200 bg-white"
                placeholder="Check-out"
              />
            </div>

            {/* Guests */}
            <div className="relative lg:w-48">
              <button
                onClick={() => setGuestsOpen(!guestsOpen)}
                className="flex w-full items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm transition-colors hover:border-amber-300"
              >
                <Users className="size-4 text-amber-500" />
                <span className="text-neutral-700">
                  {adults} adulto{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} niño${children !== 1 ? 's' : ''}` : ''}
                </span>
                <ChevronDown className="ml-auto size-4 text-neutral-400" />
              </button>
              <AnimatePresence>
                {guestsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 z-50 mt-2 w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-700">Adultos</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="flex size-7 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:border-neutral-400"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{adults}</span>
                          <button
                            onClick={() => setAdults(Math.min(10, adults + 1))}
                            className="flex size-7 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:border-neutral-400"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-700">Niños</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            className="flex size-7 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:border-neutral-400"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{children}</span>
                          <button
                            onClick={() => setChildren(Math.min(6, children + 1))}
                            className="flex size-7 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:border-neutral-400"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </div>
                      <Button
                        className="mt-2 w-full rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                        size="sm"
                        onClick={() => setGuestsOpen(false)}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search button */}
            <Button
              onClick={handleSearch}
              className="rounded-xl bg-amber-500 px-6 py-2 font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 lg:w-auto w-full"
            >
              <Search className="mr-2 size-4" />
              Buscar Hoteles
            </Button>

            {/* Mobile filters toggle */}
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="lg:hidden rounded-xl border-neutral-200"
                >
                  <SlidersHorizontal className="mr-2 size-4" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="size-5 text-amber-500" />
                    Filtros
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {filtersContent}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* ─── Main Content ──────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back + Results Header */}
        <motion.div {...fadeInUp} className="mb-6">
          <button
            onClick={() => goBack()}
            className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-amber-600"
          >
            ← Volver al inicio
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                {hasSearched || selectedCity ? 'Hoteles' : 'Todos los hoteles'}
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                <span className="font-semibold text-neutral-700">{paginationInfo?.total ?? filteredHotels.length}</span>{' '}
                hoteles encontrados en{' '}
                <span className="font-medium text-amber-600">{cityName}</span>
                {nights > 1 && (
                  <span> · <span className="font-medium">{nights} noches</span></span>
                )}
              </p>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 whitespace-nowrap">Ordenar:</span>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}>
                <SelectTrigger className="w-44 rounded-xl border-neutral-200 text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recomendados</SelectItem>
                  <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                  <SelectItem value="stars">Estrellas</SelectItem>
                  <SelectItem value="rating">Calificación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* ─── Desktop Filters Sidebar ──────────────────── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-36 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <SlidersHorizontal className="size-4 text-amber-500" />
                Filtros
              </h3>
              {filtersContent}
            </div>
          </aside>

          {/* ─── Hotel Listing ────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-48 w-full md:h-56 rounded-xl bg-neutral-100 animate-pulse border border-neutral-200"
                    />
                  ))}
                </div>
              ) : filteredHotels.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <Building2 className="size-12 text-neutral-300 mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-700">No se encontraron hoteles</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="mt-4 rounded-xl"
                  >
                    Limpiar filtros
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <motion.div
                    key="list"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-4"
                  >
                    {filteredHotels.map((hotel) => (
                      <HotelListingCard
                        key={hotel.id}
                        hotel={hotel}
                        nights={nights}
                        onClick={() => openHotelDetail(hotel.id)}
                      />
                    ))}
                  </motion.div>

                  {/* Pagination Controls */}
                  {paginationInfo && paginationInfo.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-neutral-200"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Anterior
                      </Button>
                      
                      {Array.from({ length: paginationInfo.totalPages }).map((_, idx) => {
                        const pageNum = idx + 1
                        const isCurrent = page === pageNum
                        return (
                          <Button
                            key={pageNum}
                            variant={isCurrent ? 'default' : 'outline'}
                            size="sm"
                            className={`rounded-xl h-8 w-8 p-0 ${
                              isCurrent
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                            }`}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}

                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-neutral-200"
                        onClick={() => setPage((p) => Math.min(paginationInfo.totalPages, p + 1))}
                        disabled={page === paginationInfo.totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Hotel Listing Card ──────────────────────────────────────
function HotelListingCard({
  hotel,
  nights,
  onClick,
}: {
  hotel: Hotel
  nights: number
  onClick: () => void
}) {
  const ratingColor =
    hotel.rating >= 9
      ? 'bg-emerald-500 text-white'
      : hotel.rating >= 8
        ? 'bg-emerald-500 text-white'
        : 'bg-amber-500 text-white'

  const ratingLabel =
    hotel.rating >= 9
      ? 'Excepcional'
      : hotel.rating >= 8
        ? 'Excelente'
        : hotel.rating >= 7
          ? 'Muy bueno'
          : 'Bueno'

  // Discount percentage
  const cheapestRoom = hotel.rooms[0]
  const discount =
    cheapestRoom && cheapestRoom.originalPrice
      ? Math.round(((cheapestRoom.originalPrice - cheapestRoom.price) / cheapestRoom.originalPrice) * 100)
      : 0

  return (
    <motion.div variants={staggerItem}>
      <div
        onClick={onClick}
        className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md md:flex-row"
      >
        {/* Image */}
        <div className="relative h-48 w-full flex-shrink-0 md:h-56 md:w-56">
          <img
            src={hotel.images[0] || '/placeholder-hotel.png'}
            alt={hotel.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hotel.featured && (
              <Badge className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white border-transparent shadow-sm">
                <Sparkles className="mr-1 size-3" />
                Destacado
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white border-transparent shadow-sm">
                {discount}% OFF
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-4 md:p-5">
          {/* Row 1: Name, Stars, Tags */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 leading-tight group-hover:text-amber-600 transition-colors">
                  {hotel.name}
                </h3>
                <div className="mt-1 flex items-center gap-1">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div className="flex flex-shrink-0 flex-wrap gap-1.5 justify-end">
                {hotel.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full text-xs bg-neutral-100 text-neutral-600 border-transparent"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: City + Address */}
          <div className="mt-1.5 flex items-center gap-1 text-sm text-neutral-500">
            <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
            <span className="line-clamp-1">{hotel.address}</span>
          </div>

          {/* Row 3: Rating */}
          <div className="mt-2 flex items-center gap-2">
            <div className={`flex items-center justify-center rounded-lg px-2.5 py-1 text-sm font-bold ${ratingColor}`}>
              {hotel.rating.toFixed(1)}
            </div>
            <span className="text-sm font-medium text-neutral-700">{ratingLabel}</span>
            <span className="text-xs text-neutral-400">({hotel.reviewCount} reseñas)</span>
          </div>

          {/* Row 4: Amenities icons */}
          <div className="mt-2 flex items-center gap-1.5">
            {hotel.amenities.slice(0, 4).map((amenityId) => {
              const amenity = hotelAmenities.find((a) => a.id === amenityId)
              if (!amenity) return null
              const Icon = iconMap[amenity.icon]
              return Icon ? (
                <div
                  key={amenityId}
                  className="flex size-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"
                  title={amenity.name}
                >
                  <Icon className="size-3.5" />
                </div>
              ) : null
            })}
            {hotel.amenities.length > 4 && (
              <span className="text-xs text-neutral-400 ml-1">
                +{hotel.amenities.length - 4} más
              </span>
            )}
          </div>

          {/* Row 5: Price + CTA */}
          <div className="mt-3 flex items-end justify-between border-t border-neutral-100 pt-3">
            <div>
              {cheapestRoom?.originalPrice && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatCurrency(cheapestRoom.originalPrice)}
                </span>
              )}
              <div>
                <span className="text-xs text-neutral-500">
                  Desde <span className="text-lg font-bold text-amber-600">{formatCurrency(hotel.priceFrom)}</span>
                  <span className="text-xs font-normal text-neutral-400">/ noche</span>
                </span>
                {nights > 1 && (
                  <p className="text-xs text-neutral-400">
                    {formatCurrency(hotel.priceFrom * nights)} total ({nights} noches)
                  </p>
                )}
              </div>
            </div>
            <Button
              className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-600 shadow-sm"
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
            >
              Ver habitaciones
              <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

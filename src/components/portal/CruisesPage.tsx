'use client'
import { formatCurrency } from '@/lib/currency'


import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  X,
  ChevronDown,
  Clock,
  ArrowRight,
  Ship,
  Anchor,
  Sparkles,
  HelpCircle,
  Calendar,
  Users,
  Minus,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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

import { usePortalNavigation } from '@/hooks/use-portal-navigation'

// Animation variants
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

interface SidebarFiltersProps {
  searchTerm: string
  setSearchTerm: (v: string) => void
  selectedDestination: string
  setSelectedDestination: (v: string) => void
  destinations: any[]
  priceRange: [number, number]
  setPriceRange: (v: [number, number]) => void
  durationDays: number | null
  setDurationDays: (v: number | null) => void
  clearFilters: () => void
}

function SidebarFilters({
  searchTerm,
  setSearchTerm,
  selectedDestination,
  setSelectedDestination,
  destinations,
  priceRange,
  setPriceRange,
  durationDays,
  setDurationDays,
  clearFilters,
}: SidebarFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Buscar</h3>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Barco, naviera o nombre..."
            className="pl-9 rounded-xl border-neutral-200"
          />
        </div>
      </div>

      <Separator />

      {/* Destination Selector */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Destino de Salida / Escala</h3>
        <Select value={selectedDestination} onValueChange={setSelectedDestination}>
          <SelectTrigger className="rounded-xl border-neutral-200">
            <SelectValue placeholder="Todos los destinos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los destinos</SelectItem>
            {destinations.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-900">Rango de Precios</h3>
          <span className="text-xs font-semibold text-amber-600">COP</span>
        </div>
        <Slider
          min={500000}
          max={6000000}
          step={100000}
          value={[priceRange[0], priceRange[1]]}
          onValueChange={(val) => setPriceRange([val[0], val[1]])}
          className="my-4"
        />
        <div className="flex items-center justify-between gap-2">
          <div className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 w-[45%] text-center">
            {formatCurrency(priceRange[0])}
          </div>
          <span className="text-neutral-400 text-xs">—</span>
          <div className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 w-[45%] text-center">
            {formatCurrency(priceRange[1])}
          </div>
        </div>
      </div>

      <Separator />

      {/* Duración */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Duración del Viaje</h3>
        <div className="space-y-2">
          {[3, 4, 5, 7, 10].map((days) => (
            <div key={days} className="flex items-center gap-2">
              <Checkbox
                id={`days-${days}`}
                checked={durationDays === days}
                onCheckedChange={(checked) => {
                  setDurationDays(checked ? days : null)
                }}
              />
              <label
                htmlFor={`days-${days}`}
                className="text-sm font-medium text-neutral-600 cursor-pointer select-none"
              >
                {days} días ({days - 1} noches)
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full rounded-xl border-dashed border-neutral-300 hover:border-neutral-400"
      >
        Limpiar Filtros
      </Button>
    </div>
  )
}

export default function CruisesPage() {
  const { navigate } = usePortalNavigation()
  
  // List states
  const [cruisesList, setCruisesList] = useState<any[]>([])
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Search & Filter state
  const [selectedDestination, setSelectedDestination] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([500000, 6000000])
  const [durationDays, setDurationDays] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<string>('recommended')
  const [searchTerm, setSearchTerm] = useState('')

  // Sticky Search Bar extra state
  const [departureDate, setDepartureDate] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [guestsOpen, setGuestsOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Pagination state
  const [page, setPage] = useState(1)
  const [paginationInfo, setPaginationInfo] = useState<any>(null)
  const limit = 9

  // Mobile filter sheet
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Load Destinations on mount
  useEffect(() => {
    fetch('/api/public/destinations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDestinations(data.data)
        }
      })
      .catch(err => console.error('Error loading public destinations:', err))
  }, [])

  // Debounced server fetch triggered on search/filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedDestination && selectedDestination !== 'all') {
        params.append('destinationId', selectedDestination)
      }
      params.append('priceMin', String(priceRange[0]))
      params.append('priceMax', String(priceRange[1]))
      if (durationDays !== null) {
        params.append('durationDays', String(durationDays))
      }
      if (sortBy) {
        params.append('sortBy', sortBy)
      }
      params.append('page', String(page))
      params.append('limit', String(limit))

      fetch(`/api/public/cruises?${params.toString()}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setCruisesList(res.data)
            if (res.pagination) {
              setPaginationInfo(res.pagination)
            }
          }
        })
        .catch((err) => console.error('Error fetching public cruises:', err))
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [selectedDestination, priceRange, durationDays, sortBy, page])

  // In-memory search filter — all other filtering (price, destination, duration)
  // is handled server-side by the API. Only free-text search runs client-side.
  const filteredCruises = useMemo(() => {
    if (cruisesList.length === 0) return []

    if (!searchTerm.trim()) return cruisesList

    const query = searchTerm.toLowerCase().trim()
    return cruisesList.filter((c) => {
      return (
        c.name.toLowerCase().includes(query) ||
        (c.shipName && c.shipName.toLowerCase().includes(query)) ||
        (c.operator && c.operator.toLowerCase().includes(query))
      )
    })
  }, [cruisesList, searchTerm])

  const clearFilters = useCallback(() => {
    setPriceRange([500000, 6000000])
    setDurationDays(null)
    setSelectedDestination('all')
    setSortBy('recommended')
    setSearchTerm('')
    setDepartureDate('')
    setAdults(2)
    setChildren(0)
    setHasSearched(false)
    setPage(1)
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* ─── Sticky Search/Filter Bar ──────────────────────── */}
      <div className="sticky top-16 z-40 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Destination */}
            <div className="flex-1">
              <Select
                value={selectedDestination || 'all'}
                onValueChange={(v) => setSelectedDestination(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="w-full rounded-xl border-neutral-200 bg-white">
                  <MapPin className="mr-2 size-4 text-amber-500" />
                  <SelectValue placeholder="¿A dónde viajas?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los destinos</SelectItem>
                  {destinations.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Departure Date */}
            <div className="lg:w-40">
              <Input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="[color-scheme:light] rounded-xl border-neutral-200 bg-white"
                placeholder="Fecha de salida"
              />
            </div>

            {/* Duration */}
            <div className="lg:w-48">
              <Select
                value={durationDays ? String(durationDays) : 'all'}
                onValueChange={(v) => setDurationDays(v === 'all' ? null : Number(v))}
              >
                <SelectTrigger className="w-full rounded-xl border-neutral-200 bg-white">
                  <Clock className="mr-2 size-4 text-amber-500" />
                  <SelectValue placeholder="Duración del viaje" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier duración</SelectItem>
                  {[3, 4, 5, 7, 10].map((days) => (
                    <SelectItem key={days} value={String(days)}>
                      {days} días ({days - 1} noches)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Passengers */}
            <div className="relative lg:w-48">
              <button
                onClick={() => setGuestsOpen(!guestsOpen)}
                className="flex w-full items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm transition-colors hover:border-amber-300"
              >
                <Users className="size-4 text-amber-500" />
                <span className="text-neutral-700">
                  {adults} adulto{adults !== 1 ? 's' : ''}
                  {children > 0 ? `, ${children} niño${children !== 1 ? 's' : ''}` : ''}
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

            {/* Search Button */}
            <Button
              onClick={() => setHasSearched(true)}
              className="rounded-xl bg-amber-500 px-6 py-2 font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 lg:w-auto w-full"
            >
              <Search className="mr-2 size-4" />
              Buscar Cruceros
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Main Content ──────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back + Results Header */}
        <motion.div {...fadeInUp} className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-amber-600"
          >
            ← Volver al inicio
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                {hasSearched || selectedDestination ? 'Cruceros' : 'Todos los cruceros'}
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                <span className="font-semibold text-neutral-700">{filteredCruises.length}</span>{' '}
                cruceros encontrados en{' '}
                <span className="font-medium text-amber-600">
                  {selectedDestination && selectedDestination !== 'all'
                    ? destinations.find((d) => d.id === selectedDestination)?.name ?? 'Colombia'
                    : 'Colombia'}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <Card className="sticky top-24 border-neutral-200/60 bg-white/70 p-5 shadow-xs backdrop-blur-md rounded-2xl">
                    <SidebarFilters
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      selectedDestination={selectedDestination}
                      setSelectedDestination={setSelectedDestination}
                      destinations={destinations}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                      durationDays={durationDays}
                      setDurationDays={setDurationDays}
                      clearFilters={clearFilters}
                    />
            </Card>
          </aside>

          {/* Results Area */}
          <div className="flex-1 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-800">
                  {filteredCruises.length} cruceros
                </span>
                <span className="text-xs text-neutral-400">encontrados</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Filter Trigger */}
                <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl lg:hidden gap-2">
                      <SlidersHorizontal className="size-4" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader className="mb-4">
                      <SheetTitle className="text-left font-bold">Filtros de Búsqueda</SheetTitle>
                    </SheetHeader>
              <SidebarFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedDestination={selectedDestination}
                setSelectedDestination={setSelectedDestination}
                destinations={destinations}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                durationDays={durationDays}
                setDurationDays={setDurationDays}
                clearFilters={clearFilters}
              />
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44 rounded-xl border-neutral-200 text-xs font-semibold">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recomendados</SelectItem>
                    <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                    <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="h-[380px] rounded-2xl overflow-hidden">
                    <Skeleton className="h-44 w-full" />
                    <CardContent className="p-4 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCruises.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-16 text-center shadow-xs">
                <Ship className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                <h3 className="text-lg font-bold text-neutral-800">No encontramos cruceros</h3>
                <p className="text-sm text-neutral-500 mt-1">Intenta ajustando los filtros o el rango de precios en el menú.</p>
                <Button onClick={clearFilters} className="mt-6 rounded-xl">
                  Mostrar todos los cruceros
                </Button>
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredCruises.map((cruise) => (
                    <motion.div
                      key={cruise.id}
                      variants={staggerItem}
                      layout
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:border-neutral-300"
                    >
                      {/* Image block */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                        {cruise.images && cruise.images[0] ? (
                          <img
                            src={cruise.images[0]}
                            alt={cruise.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                            <Ship className="size-12 opacity-40" />
                          </div>
                        )}

                        {cruise.featured && (
                          <Badge className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-[10px] font-bold shadow-sm flex items-center gap-0.5 border-transparent">
                            <Sparkles className="size-3 fill-current" />
                            Popular
                          </Badge>
                        )}
                        
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
                          {cruise.operator}
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-neutral-900 group-hover:text-amber-600 transition-colors text-base line-clamp-1">
                              {cruise.name}
                            </h3>
                          </div>
                          
                          <p className="text-xs text-neutral-500 flex items-center gap-1">
                            <Anchor className="size-3 text-amber-500" />
                            Barco: <span className="font-semibold text-neutral-800">{cruise.shipName}</span>
                          </p>

                          <div className="flex flex-wrap gap-1.5 py-1">
                            <Badge variant="outline" className="text-[10px] bg-amber-50/50 text-amber-700 border-amber-100 flex items-center gap-1">
                              <Clock className="size-3" />
                              {cruise.durationDays} días / {cruise.durationDays - 1} noches
                            </Badge>
                            
                            {cruise.rating > 0 && (
                              <Badge variant="outline" className="text-[10px] bg-amber-50/50 text-amber-700 border-amber-100 flex items-center gap-0.5">
                                <Star className="size-3 fill-amber-400 text-amber-400" />
                                {cruise.rating}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-neutral-100">
                          <div className="flex items-end justify-between">
                            <div>
                              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Tarifa desde</span>
                              <span className="text-lg font-extrabold text-amber-600">{formatCurrency(cruise.priceFrom)}</span>
                            </div>
                            <Button
                              onClick={() => navigate('portal-cruise-detail', cruise.slug)}
                              size="sm"
                              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs"
                            >
                              Ver detalles
                              <ArrowRight className="ml-1 size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Pagination Controls */}
            {paginationInfo && paginationInfo.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="rounded-xl"
                >
                  Anterior
                </Button>
                <div className="text-sm font-semibold text-neutral-600 px-4">
                  Página {page} de {paginationInfo.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= paginationInfo.totalPages}
                  onClick={() => setPage(p => Math.min(paginationInfo.totalPages, p + 1))}
                  className="rounded-xl"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

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
import { formatCOP } from '@/data/packages'
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
    setLoading(true)
    const timer = setTimeout(() => {
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

  // In-memory text filter for name/ship/operator
  const filteredCruises = useMemo(() => {
    if (!searchTerm.trim()) return cruisesList
    const query = searchTerm.toLowerCase().trim()
    return cruisesList.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.shipName.toLowerCase().includes(query) ||
        c.operator.toLowerCase().includes(query)
    )
  }, [cruisesList, searchTerm])

  const clearFilters = useCallback(() => {
    setPriceRange([500000, 6000000])
    setDurationDays(null)
    setSelectedDestination('all')
    setSortBy('recommended')
    setSearchTerm('')
    setPage(1)
  }, [])

  const SidebarFilters = () => (
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
          <span className="text-xs font-semibold text-sky-600">COP</span>
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
            {formatCOP(priceRange[0])}
          </div>
          <span className="text-neutral-400 text-xs">—</span>
          <div className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 w-[45%] text-center">
            {formatCOP(priceRange[1])}
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

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden bg-slate-900 pt-28 pb-16 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-950/80 to-slate-900/90 z-10" />
        <div className="absolute -right-20 -top-20 size-[350px] rounded-full bg-sky-500/10 blur-[80px]" />
        <div className="absolute -left-20 -bottom-20 size-[350px] rounded-full bg-indigo-500/10 blur-[80px]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-2xl">
            <Badge className="mb-4 rounded-full bg-sky-500/20 text-sky-200 border-sky-400/20 text-xs font-semibold px-3 py-1">
              <Ship className="mr-1.5 size-3" />
              Vacaciones Soñadas
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Cruceros por el Caribe
            </h1>
            <p className="mt-4 text-base text-sky-100/80 sm:text-lg">
              Descubre itinerarios espectaculares zarpando desde los puertos colombianos.
              Compara camarotes, navieras y reserva tu próximo gran viaje todo incluido.
            </p>
          </div>
        </div>
      </div>

      {/* Main Catalog Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <Card className="sticky top-24 border-neutral-200/60 bg-white/70 p-5 shadow-xs backdrop-blur-md rounded-2xl">
              <SidebarFilters />
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
                    <SidebarFilters />
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
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-400 to-indigo-500 text-white">
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
                            <h3 className="font-bold text-neutral-900 group-hover:text-sky-600 transition-colors text-base line-clamp-1">
                              {cruise.name}
                            </h3>
                          </div>
                          
                          <p className="text-xs text-neutral-500 flex items-center gap-1">
                            <Anchor className="size-3 text-sky-500" />
                            Barco: <span className="font-semibold text-neutral-800">{cruise.shipName}</span>
                          </p>

                          <div className="flex flex-wrap gap-1.5 py-1">
                            <Badge variant="outline" className="text-[10px] bg-sky-50/50 text-sky-700 border-sky-100 flex items-center gap-1">
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
                              <span className="text-lg font-extrabold text-sky-800">{formatCOP(cruise.priceFrom)}</span>
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

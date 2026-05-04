'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Check,
  ChevronRight,
  ChevronLeft,
  Bus,
  MapPin,
  Clock,
  Users,
  Calendar,
  Mountain,
  Star,
  Building2,
  Bed,
  ArrowRight,
  SkipForward,
  AlertCircle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'
import { formatCOP } from '@/data/packages'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────
interface TransportService {
  id: string
  name: string
  routeType: string
  origin: string
  destination: string
  cityId: string
  cityName: string
  durationMins: number
  basePrice: number
  pricePerExtra: number
  includes: string[]
  provider: { name: string; vehicleType: string; capacity: number }
}

interface Hotel {
  id: string
  name: string
  cityId: string
  cityName: string
  stars: number
  address: string
  description: string
  images: string[]
  amenities: string[]
  rating: number
  priceFrom: number
  rooms: any[]
}

interface RoomType {
  id: string
  hotelId: string
  name: string
  maxGuests: number
  beds: string
  basePrice: number
  originalPrice: number
  includes: string[]
}

interface Excursion {
  id: string
  name: string
  destinationId: string
  cityName: string
  destinationName: string
  duration: string
  difficulty: string
  groupSize: string
  basePrice: number
  childPrice: number
  includes: string[]
  category: string
  rating: number
  shortDesc: string
  images: string[]
}

interface SelectedTransport {
  service: TransportService
  date: string
  adults: number
  children: number
  totalPrice: number
}

interface SelectedHotel {
  hotel: any
  room: any
  checkIn: string
  checkOut: string
  rooms: number
  nights: number
  totalPrice: number
}

interface SelectedExcursion {
  excursion: Excursion
  date: string
  adults: number
  children: number
  totalPrice: number
}

const steps = [
  { id: 1, label: 'Transporte', icon: Bus },
  { id: 2, label: 'Hotel', icon: Building2 },
  { id: 3, label: 'Excursión', icon: Mountain },
  { id: 4, label: 'Resumen', icon: Package },
]

const vehicleTypeLabels: Record<string, string> = {
  auto: 'Auto', van: 'Van', bus: 'Buseta', suv: 'SUV',
}

const difficultyConfig: Record<string, { color: string; bg: string }> = {
  'Fácil': { color: 'text-emerald-700', bg: 'bg-emerald-100' },
  'Moderado': { color: 'text-amber-700', bg: 'bg-amber-100' },
  'Difícil': { color: 'text-red-700', bg: 'bg-red-100' },
}

// ─── Animation ──────────────────────────────────────────────
const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

// ─── Main Component ─────────────────────────────────────────
export default function DynamicPackager() {
  const { goBack } = usePortalNavigation()

  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Data state
  const [transportServices, setTransportServices] = useState<TransportService[]>([])
  const [hotels, setHotels] = useState<any[]>([])
  const [excursions, setExcursions] = useState<Excursion[]>([])
  const [loadingTransport, setLoadingTransport] = useState(false)
  const [loadingHotels, setLoadingHotels] = useState(false)
  const [loadingExcursions, setLoadingExcursions] = useState(false)

  // Selected items
  const [selectedTransport, setSelectedTransport] = useState<SelectedTransport | null>(null)
  const [selectedHotel, setSelectedHotel] = useState<SelectedHotel | null>(null)
  const [selectedExcursion, setSelectedExcursion] = useState<SelectedExcursion | null>(null)

  // Guest info
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestNotes, setGuestNotes] = useState('')

  // Transport form
  const [tCity, setTCity] = useState('')
  const [tServiceId, setTServiceId] = useState('')
  const [tDate, setTDate] = useState('')
  const [tAdults, setTAdults] = useState(1)
  const [tChildren, setTChildren] = useState(0)

  // Hotel form
  const [hCity, setHCity] = useState('')
  const [hHotelId, setHHotelId] = useState('')
  const [hRoomId, setHRoomId] = useState('')
  const [hCheckIn, setHCheckIn] = useState('')
  const [hCheckOut, setHCheckOut] = useState('')
  const [hRooms, setHRooms] = useState(1)

  // Excursion form
  const [eServiceId, setEServiceId] = useState('')
  const [eDate, setEDate] = useState('')
  const [eAdults, setEAdults] = useState(1)
  const [eChildren, setEChildren] = useState(0)

  // Fetch data on mount
  const fetchTransport = useCallback(async (cityId?: string) => {
    setLoadingTransport(true)
    try {
      const url = cityId ? `/api/public/transport?cityId=${cityId}` : '/api/public/transport'
      const res = await fetch(url)
      const json = await res.json()
      if (json.success) setTransportServices(json.data)
    } catch { /* ignore */ } finally { setLoadingTransport(false) }
  }, [])

  const fetchHotels = useCallback(async () => {
    setLoadingHotels(true)
    try {
      const res = await fetch('/api/public/hotels')
      const json = await res.json()
      if (json.success) setHotels(json.data)
    } catch { /* ignore */ } finally { setLoadingHotels(false) }
  }, [])

  const fetchExcursions = useCallback(async () => {
    setLoadingExcursions(true)
    try {
      const res = await fetch('/api/public/excursions')
      const json = await res.json()
      if (json.success) setExcursions(json.data)
    } catch { /* ignore */ } finally { setLoadingExcursions(false) }
  }, [])

  useEffect(() => {
    fetchTransport()
    fetchHotels()
    fetchExcursions()
  }, [fetchTransport, fetchHotels, fetchExcursions])

  // Refetch transport on city change
  useEffect(() => {
    if (currentStep === 1) fetchTransport(tCity)
  }, [tCity, currentStep, fetchTransport])

  // Calculations
  const selectedHotelData = useMemo(() => {
    if (!hHotelId) return null
    return hotels.find((h: any) => h.id === hHotelId) || null
  }, [hHotelId, hotels])

  const selectedRoom = useMemo(() => {
    if (!selectedHotelData || !hRoomId) return null
    return selectedHotelData.rooms?.find((r: any) => r.id === hRoomId) || null
  }, [selectedHotelData, hRoomId])

  const nights = useMemo(() => {
    if (!hCheckIn || !hCheckOut) return 1
    const d1 = new Date(hCheckIn)
    const d2 = new Date(hCheckOut)
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 1
  }, [hCheckIn, hCheckOut])

  const filteredHotels = useMemo(() => {
    if (!hCity) return hotels
    return hotels.filter((h: any) => h.cityId === hCity)
  }, [hCity, hotels])

  const selectedTransportService = useMemo(() => {
    return transportServices.find((s) => s.id === tServiceId) || null
  }, [tServiceId, transportServices])

  const selectedExcursionData = useMemo(() => {
    return excursions.find((e) => e.id === eServiceId) || null
  }, [eServiceId, excursions])

  const filteredExcursions = useMemo(() => {
    const cityId = selectedHotel?.hotel.cityId || hCity || tCity
    if (!cityId) return excursions

    return excursions.filter(
      (excursion) =>
        excursion.destinationId === cityId ||
        excursion.cityName.toLowerCase() === cityId.toLowerCase(),
    )
  }, [excursions, hCity, selectedHotel, tCity])

  // Navigate steps
  const goNext = () => {
    if (currentStep === 1 && tServiceId && tDate) {
      const svc = selectedTransportService
      if (svc) {
        const totalPax = tAdults + tChildren
        const totalPrice = svc.basePrice + (totalPax > 1 ? (totalPax - 1) * svc.pricePerExtra : 0)
        setSelectedTransport({ service: svc, date: tDate, adults: tAdults, children: tChildren, totalPrice })
      }
      setCurrentStep(2)
    } else if (currentStep === 1) {
      // Skip transport
      setSelectedTransport(null)
      setCurrentStep(2)
    } else if (currentStep === 2 && hHotelId && hRoomId && hCheckIn && hCheckOut) {
      const hotel = selectedHotelData
      const room = selectedRoom
      if (hotel && room) {
        setSelectedHotel({
          hotel, room, checkIn: hCheckIn, checkOut: hCheckOut,
          rooms: hRooms, nights, totalPrice: room.price * nights * hRooms,
        })
      }
      setCurrentStep(3)
    } else if (currentStep === 2) {
      setSelectedHotel(null)
      setCurrentStep(3)
    } else if (currentStep === 3 && eServiceId && eDate) {
      const exc = selectedExcursionData
      if (exc) {
        const totalPrice = eAdults * exc.basePrice + eChildren * (exc.childPrice || exc.basePrice)
        setSelectedExcursion({ excursion: exc, date: eDate, adults: eAdults, children: eChildren, totalPrice })
      }
      setCurrentStep(4)
    } else if (currentStep === 3) {
      setSelectedExcursion(null)
      setCurrentStep(4)
    }
  }

  const goPrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  // Grand total
  const grandTotal = useMemo(() => {
    let total = 0
    if (selectedTransport) total += selectedTransport.totalPrice
    if (selectedHotel) total += selectedHotel.totalPrice
    if (selectedExcursion) total += selectedExcursion.totalPrice
    return total
  }, [selectedTransport, selectedHotel, selectedExcursion])

  // Submit
  const handleSubmit = async () => {
    if (!guestName || !guestEmail || !guestPhone) {
      toast.error('Completa los datos del pasajero')
      return
    }
    if (!selectedTransport && !selectedHotel && !selectedExcursion) {
      toast.error('Selecciona al menos un servicio')
      return
    }

    setSubmitting(true)
    try {
      const items: any[] = []
      let checkIn = ''
      let checkOut = ''

      if (selectedTransport) {
        items.push({
          itemType: 'transport',
          serviceId: selectedTransport.service.id,
          serviceName: selectedTransport.service.name,
          dateFrom: selectedTransport.date,
          quantity: selectedTransport.adults + selectedTransport.children,
          unitPrice: selectedTransport.service.basePrice,
          totalPrice: selectedTransport.totalPrice,
        })
        checkIn = selectedTransport.date
      }

      if (selectedHotel) {
        items.push({
          itemType: 'hotel',
          serviceId: selectedHotel.hotel.id,
          serviceName: selectedHotel.hotel.name,
          roomTypeId: selectedHotel.room.id,
          roomName: selectedHotel.room.name,
          dateFrom: selectedHotel.checkIn,
          dateTo: selectedHotel.checkOut,
          quantity: selectedHotel.rooms,
          unitPrice: selectedHotel.room.price,
          totalPrice: selectedHotel.totalPrice,
        })
        checkIn = selectedHotel.checkIn
        checkOut = selectedHotel.checkOut
      }

      if (selectedExcursion) {
        items.push({
          itemType: 'excursion',
          serviceId: selectedExcursion.excursion.id,
          serviceName: selectedExcursion.excursion.name,
          dateFrom: selectedExcursion.date,
          quantity: selectedExcursion.adults + selectedExcursion.children,
          unitPrice: selectedExcursion.excursion.basePrice,
          totalPrice: selectedExcursion.totalPrice,
        })
        if (!checkIn) checkIn = selectedExcursion.date
      }

      const res = await fetch('/api/public/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          guestEmail,
          guestPhone,
          adults: 1,
          children: 0,
          notes: guestNotes,
          totalPrice: grandTotal,
          checkIn,
          checkOut,
          items,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`¡Paquete ${json.data.code} reservado exitosamente!`)
        setCurrentStep(1)
        setSelectedTransport(null)
        setSelectedHotel(null)
        setSelectedExcursion(null)
        setGuestName('')
        setGuestEmail('')
        setGuestPhone('')
        setGuestNotes('')
      } else {
        toast.error(json.error || 'Error al crear la reserva')
      }
    } catch (err) {
      console.error('Error creating booking:', err)
      toast.error('Error al crear la reserva')
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-brand-surface-light">
      {/* ─── Hero ────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-gradient-to-br from-brand-page via-brand-surface to-secondary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 text-white/20">
            <Package className="size-40" />
          </div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Package className="size-5 text-white" />
              <span className="text-sm font-medium text-white">Arma tu Viaje</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Paquete Personalizado
            </h1>
            <p className="text-brand-text text-lg max-w-xl mx-auto">
              Combina transporte, hotel y excursión para crear tu experiencia ideal en Colombia
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── Progress Steps ──────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white border-b border-neutral-200 shadow-sm">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center size-10 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                          : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      {isCompleted ? (
                        <Check className="size-5" />
                      ) : (
                        <StepIcon className="size-5" />
                      )}
                    </div>
                    <span className={`mt-1.5 text-xs font-medium ${
                      isActive ? 'text-amber-600' : isCompleted ? 'text-emerald-600' : 'text-neutral-400'
                    }`}>
                      Paso {step.id}
                    </span>
                    <span className={`text-[11px] ${
                      isActive ? 'text-neutral-800 font-semibold' : 'text-neutral-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 mb-5 transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-neutral-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── Step Content ────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <button
          onClick={() => goBack('/')}
          className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-amber-600"
        >
          ← Volver al inicio
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial="enter"
            animate="center"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
          >
            {/* ── Step 1: Transport ────────────────────────── */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                      <Bus className="size-6 text-amber-500" />
                      Transporte
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">Selecciona tu servicio de transporte o sáltalo</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="rounded-xl text-sm"
                  >
                    <SkipForward className="mr-2 size-4" />
                    Saltar
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ciudad</Label>
                      <Select value={tCity} onValueChange={(v) => setTCity(v === 'all' ? '' : v)}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Todas las ciudades" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="cartagena">Cartagena</SelectItem>
                          <SelectItem value="medellin">Medellín</SelectItem>
                          <SelectItem value="bogota">Bogotá</SelectItem>
                          <SelectItem value="eje-cafetero">Eje Cafetero</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Servicio</Label>
                      <Select value={tServiceId} onValueChange={setTServiceId}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona un servicio" /></SelectTrigger>
                        <SelectContent>
                          {transportServices.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} — {s.origin} → {s.destination}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedTransportService && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-neutral-800">{selectedTransportService.name}</span>
                        <span className="text-lg font-bold text-amber-600">{formatCOP(selectedTransportService.basePrice)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span className="flex items-center gap-1"><MapPin className="size-3.5 text-amber-500" />{selectedTransportService.origin} → {selectedTransportService.destination}</span>
                        <span className="flex items-center gap-1"><Clock className="size-3.5 text-amber-500" />{selectedTransportService.durationMins} min</span>
                        <span className="flex items-center gap-1"><Users className="size-3.5 text-amber-500" />{selectedTransportService.provider.capacity} pax</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                        <Input type="date" min={today} value={tDate} onChange={(e) => setTDate(e.target.value)} className="pl-10 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Adultos</Label>
                      <Input type="number" min={1} max={selectedTransportService?.provider.capacity || 4} value={tAdults} onChange={(e) => setTAdults(Math.max(1, parseInt(e.target.value) || 1))} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Niños</Label>
                      <Input type="number" min={0} value={tChildren} onChange={(e) => setTChildren(Math.max(0, parseInt(e.target.value) || 0))} className="rounded-xl" />
                    </div>
                  </div>

                  {selectedTransportService && tDate && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm">
                      <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                        <Check className="size-4" />
                        Transporte seleccionado: {formatCOP(selectedTransportService.basePrice + (tAdults + tChildren - 1) * selectedTransportService.pricePerExtra)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 2: Hotel ────────────────────────────── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                      <Building2 className="size-6 text-amber-500" />
                      Hotel
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">Elige tu alojamiento o sáltalo</p>
                  </div>
                  <Button variant="outline" onClick={() => setCurrentStep(3)} className="rounded-xl text-sm">
                    <SkipForward className="mr-2 size-4" />
                    Saltar
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ciudad</Label>
                      <Select value={hCity} onValueChange={(v) => setHCity(v === 'all' ? '' : v)}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Todas las ciudades" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="cartagena">Cartagena</SelectItem>
                          <SelectItem value="medellin">Medellín</SelectItem>
                          <SelectItem value="bogota">Bogotá</SelectItem>
                          <SelectItem value="eje-cafetero">Eje Cafetero</SelectItem>
                          <SelectItem value="san-andres">San Andrés</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Hotel</Label>
                      <Select value={hHotelId} onValueChange={(v) => { setHHotelId(v); setHRoomId('') }}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona un hotel" /></SelectTrigger>
                        <SelectContent>
                          {filteredHotels.map((h: any) => (
                            <SelectItem key={h.id} value={h.id}>{h.name} — {h.cityName} ({h.stars}★)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedHotelData && (
                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-800">{selectedHotelData.name}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: selectedHotelData.stars }).map((_, i) => (
                              <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-neutral-500">Desde {formatCOP(selectedHotelData.priceFrom)}/noche</span>
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de habitación</Label>
                        <Select value={hRoomId} onValueChange={setHRoomId}>
                          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona habitación" /></SelectTrigger>
                          <SelectContent>
                            {selectedHotelData.rooms?.map((r: any) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name} — {formatCOP(r.price)}/noche ({r.maxGuests} huéspedes)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Check-in</Label>
                      <Input type="date" min={today} value={hCheckIn} onChange={(e) => setHCheckIn(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out</Label>
                      <Input type="date" min={hCheckIn || today} value={hCheckOut} onChange={(e) => setHCheckOut(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>N° Habitaciones</Label>
                      <Input type="number" min={1} max={5} value={hRooms} onChange={(e) => setHRooms(Math.max(1, parseInt(e.target.value) || 1))} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Noches</Label>
                      <div className="flex items-center h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-3">
                        <span className="text-sm font-semibold text-neutral-700">{nights}</span>
                      </div>
                    </div>
                  </div>

                  {selectedRoom && hCheckIn && hCheckOut && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm">
                      <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                        <Check className="size-4" />
                        Hotel seleccionado: {selectedRoom.name} × {nights} noche{nights !== 1 ? 's' : ''} × {hRooms} hab. = {formatCOP(selectedRoom.price * nights * hRooms)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 3: Excursion ────────────────────────── */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                      <Mountain className="size-6 text-amber-500" />
                      Excursión
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">Agrega una experiencia o sáltalo</p>
                  </div>
                  <Button variant="outline" onClick={() => setCurrentStep(4)} className="rounded-xl text-sm">
                    <SkipForward className="mr-2 size-4" />
                    Saltar
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Excursión</Label>
                    <Select value={eServiceId} onValueChange={setEServiceId}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona una excursión" /></SelectTrigger>
                      <SelectContent>
                        {filteredExcursions.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name} — {e.cityName || e.destinationName} ({formatCOP(e.basePrice)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedExcursionData && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-neutral-800">{selectedExcursionData.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${difficultyConfig[selectedExcursionData.difficulty]?.bg || 'bg-neutral-100'} ${difficultyConfig[selectedExcursionData.difficulty]?.color || 'text-neutral-600'} border-transparent text-xs`}>
                              {selectedExcursionData.difficulty}
                            </Badge>
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                              <Clock className="size-3" />{selectedExcursionData.duration}
                            </span>
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                              <MapPin className="size-3" />{selectedExcursionData.cityName || selectedExcursionData.destinationName}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-amber-600">{formatCOP(selectedExcursionData.basePrice)}</p>
                          {selectedExcursionData.childPrice > 0 && (
                            <p className="text-xs text-neutral-500">Niño: {formatCOP(selectedExcursionData.childPrice)}</p>
                          )}
                        </div>
                      </div>
                      {selectedExcursionData.shortDesc && (
                        <p className="text-xs text-neutral-500 mt-1">{selectedExcursionData.shortDesc}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                        <Input type="date" min={today} value={eDate} onChange={(e) => setEDate(e.target.value)} className="pl-10 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Adultos</Label>
                      <Input type="number" min={1} value={eAdults} onChange={(e) => setEAdults(Math.max(1, parseInt(e.target.value) || 1))} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Niños</Label>
                      <Input type="number" min={0} value={eChildren} onChange={(e) => setEChildren(Math.max(0, parseInt(e.target.value) || 0))} className="rounded-xl" />
                    </div>
                  </div>

                  {selectedExcursionData && eDate && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm">
                      <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                        <Check className="size-4" />
                        Excursión seleccionada: {eAdults} adultos × {formatCOP(selectedExcursionData.basePrice)}
                        {eChildren > 0 && <> + {eChildren} niños × {formatCOP(selectedExcursionData.childPrice || selectedExcursionData.basePrice)}</>}
                        {' = '}{formatCOP(eAdults * selectedExcursionData.basePrice + eChildren * (selectedExcursionData.childPrice || selectedExcursionData.basePrice))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 4: Summary ─────────────────────────── */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                  <Package className="size-6 text-amber-500" />
                  Resumen del Paquete
                </h2>

                {(!selectedTransport && !selectedHotel && !selectedExcursion) ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
                    <AlertCircle className="size-10 text-amber-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-amber-700">No has seleccionado ningún servicio</p>
                    <p className="text-xs text-amber-600 mt-1">Vuelve a los pasos anteriores para agregar servicios a tu paquete</p>
                    <Button variant="outline" className="mt-3 rounded-xl" onClick={() => setCurrentStep(1)}>
                      <ChevronLeft className="mr-2 size-4" />
                      Volver al Paso 1
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Selected services */}
                    <div className="space-y-3">
                      {selectedTransport && (
                        <div className="rounded-xl border border-neutral-200 bg-white p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="size-8 rounded-lg bg-green-100 flex items-center justify-center">
                              <Bus className="size-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-neutral-800">{selectedTransport.service.name}</p>
                              <p className="text-xs text-neutral-500">{selectedTransport.service.origin} → {selectedTransport.service.destination} · {selectedTransport.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-amber-600">{formatCOP(selectedTransport.totalPrice)}</p>
                              <p className="text-[11px] text-neutral-400">{selectedTransport.adults + selectedTransport.children} pasajeros</p>
                            </div>
                          </div>
                          <button onClick={() => setCurrentStep(1)} className="text-xs text-amber-600 hover:underline">Modificar</button>
                        </div>
                      )}

                      {selectedHotel && (
                        <div className="rounded-xl border border-neutral-200 bg-white p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Building2 className="size-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-neutral-800">{selectedHotel.hotel.name}</p>
                              <p className="text-xs text-neutral-500">{selectedHotel.room.name} · {selectedHotel.checkIn} → {selectedHotel.checkOut} ({selectedHotel.nights} noches × {selectedHotel.rooms} hab.)</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-amber-600">{formatCOP(selectedHotel.totalPrice)}</p>
                              <p className="text-[11px] text-neutral-400">{formatCOP(selectedHotel.room.price)}/noche</p>
                            </div>
                          </div>
                          <button onClick={() => setCurrentStep(2)} className="text-xs text-amber-600 hover:underline">Modificar</button>
                        </div>
                      )}

                      {selectedExcursion && (
                        <div className="rounded-xl border border-neutral-200 bg-white p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="size-8 rounded-lg bg-purple-100 flex items-center justify-center">
                              <Mountain className="size-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-neutral-800">{selectedExcursion.excursion.name}</p>
                              <p className="text-xs text-neutral-500">{selectedExcursion.excursion.cityName || selectedExcursion.excursion.destinationName} · {selectedExcursion.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-amber-600">{formatCOP(selectedExcursion.totalPrice)}</p>
                              <p className="text-[11px] text-neutral-400">{selectedExcursion.adults + selectedExcursion.children} participantes</p>
                            </div>
                          </div>
                          <button onClick={() => setCurrentStep(3)} className="text-xs text-amber-600 hover:underline">Modificar</button>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 text-sm">Total del Paquete</p>
                          <p className="text-3xl font-bold">{formatCOP(grandTotal)}</p>
                          <p className="text-amber-200 text-xs mt-1">COP · impuestos incluidos</p>
                        </div>
                        <Package className="size-12 text-white/20" />
                      </div>
                    </div>

                    <Separator />

                    {/* Guest info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                        <Users className="size-5 text-amber-500" />
                        Datos del Pasajero
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nombre completo *</Label>
                          <Input placeholder="Juan Pérez" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input type="email" placeholder="correo@ejemplo.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label>Teléfono *</Label>
                          <Input type="tel" placeholder="+57 300 123 4567" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="rounded-xl" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Notas adicionales</Label>
                        <Textarea placeholder="Solicitudes especiales, alergias, preferencias..." value={guestNotes} onChange={(e) => setGuestNotes(e.target.value)} className="rounded-xl resize-none" rows={2} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── Navigation Buttons ──────────────────────────── */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentStep === 1}
            className="rounded-xl"
          >
            <ChevronLeft className="mr-2 size-4" />
            Anterior
          </Button>

          {currentStep < 4 ? (
            <Button onClick={goNext} className="rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20 font-semibold">
              Siguiente
              <ChevronRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || (!selectedTransport && !selectedHotel && !selectedExcursion)}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 font-semibold"
            >
              {submitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Confirmar Reserva
                  <Package className="ml-2 size-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

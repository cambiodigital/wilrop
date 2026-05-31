'use client'
import { formatCurrency } from '@/lib/currency'
import {
  applyResellerMarkup,
  calculatePackageTotal,
} from '@/lib/package-pricing'

import { useState, useMemo } from 'react'
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
  ArrowRight,
  SkipForward,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'
import { useCities } from '@/hooks/use-cities'
import { useResellerContext } from '@/hooks/use-reseller-context'
import { usePackageTransport } from '@/hooks/use-package-transport'
import { usePackageHotel } from '@/hooks/use-package-hotel'
import { usePackageExcursion } from '@/hooks/use-package-excursion'
import { toast } from 'sonner'

// ─── Constants ─────────────────────────────────────────────

const steps = [
  { id: 1, label: 'Transporte', icon: Bus },
  { id: 2, label: 'Hotel', icon: Building2 },
  { id: 3, label: 'Excursión', icon: Mountain },
  { id: 4, label: 'Resumen', icon: Package },
]

const difficultyConfig: Record<string, { color: string; bg: string }> = {
  'Fácil': { color: 'text-emerald-700', bg: 'bg-emerald-100' },
  'Moderado': { color: 'text-amber-700', bg: 'bg-amber-100' },
  'Difícil': { color: 'text-red-700', bg: 'bg-red-100' },
}

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

// ─── Main Component ─────────────────────────────────────────

export default function DynamicPackager() {
  const { goBack } = usePortalNavigation()
  const { cities } = useCities()
  const reseller = useResellerContext()

  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Guest info
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestNotes, setGuestNotes] = useState('')

  // Step hooks — each manages its own data fetching and form state
  const transport = usePackageTransport({
    resellerId: reseller.resellerId,
    resellerCommission: reseller.commission,
  })

  const hotel = usePackageHotel({
    resellerId: reseller.resellerId,
    resellerCommission: reseller.commission,
  })

  const excursion = usePackageExcursion({
    resellerId: reseller.resellerId,
    resellerCommission: reseller.commission,
    cityContext: hotel.selected?.hotel.cityId || hotel.cityId || transport.cityId,
  })

  // ─── Grand Total (with reseller markup) ─────────────────

  const grandTotal = useMemo(() => {
    const base = calculatePackageTotal({
      transport: transport.selected?.totalPrice,
      hotel: hotel.selected?.totalPrice,
      excursion: excursion.selected?.totalPrice,
    })
    return base
  }, [transport.selected, hotel.selected, excursion.selected])

  const displayTotal = useMemo(() => {
    return applyResellerMarkup({
      basePrice: grandTotal,
      commissionPercent: reseller.commission,
    })
  }, [grandTotal, reseller.commission])

  // ─── Navigation ─────────────────────────────────────────

  const goNext = () => {
    if (currentStep === 1) {
      // Transport step: confirm or skip
      if (transport.serviceId && transport.date) {
        transport.confirmSelection()
      } else {
        transport.clearSelection()
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // Hotel step: confirm or skip
      if (hotel.hotelId && hotel.roomId && hotel.checkIn && hotel.checkOut) {
        hotel.confirmSelection()
      } else {
        hotel.clearSelection()
      }
      setCurrentStep(3)
    } else if (currentStep === 3) {
      // Excursion step: confirm or skip
      if (excursion.serviceId && excursion.date) {
        excursion.confirmSelection()
      } else {
        excursion.clearSelection()
      }
      setCurrentStep(4)
    }
  }

  const goPrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  // ─── Submit ─────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!guestName || !guestEmail || !guestPhone) {
      toast.error('Completa los datos del pasajero')
      return
    }
    if (!transport.selected && !hotel.selected && !excursion.selected) {
      toast.error('Selecciona al menos un servicio')
      return
    }

    setSubmitting(true)
    try {
      const items: any[] = []
      let checkIn = ''
      let checkOut = ''

      if (transport.selected) {
        items.push({
          itemType: 'transport',
          serviceId: transport.selected.service.id,
          serviceName: transport.selected.service.name,
          dateFrom: transport.selected.date,
          quantity: transport.selected.adults + transport.selected.children,
          unitPrice: transport.selected.service.basePrice,
          totalPrice: transport.selected.totalPrice,
        })
        checkIn = transport.selected.date
      }

      if (hotel.selected) {
        items.push({
          itemType: 'hotel',
          serviceId: hotel.selected.hotel.id,
          serviceName: hotel.selected.hotel.name,
          roomTypeId: hotel.selected.room.id,
          roomName: hotel.selected.room.name,
          dateFrom: hotel.selected.checkIn,
          dateTo: hotel.selected.checkOut,
          quantity: hotel.selected.rooms,
          unitPrice: hotel.selected.room.price,
          totalPrice: hotel.selected.totalPrice,
        })
        checkIn = hotel.selected.checkIn
        checkOut = hotel.selected.checkOut
      }

      if (excursion.selected) {
        items.push({
          itemType: 'excursion',
          serviceId: excursion.selected.excursion.id,
          serviceName: excursion.selected.excursion.name,
          dateFrom: excursion.selected.date,
          quantity: excursion.selected.adults + excursion.selected.children,
          unitPrice: excursion.selected.excursion.basePrice,
          totalPrice: excursion.selected.totalPrice,
        })
        if (!checkIn) checkIn = excursion.selected.date
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
          totalPrice: displayTotal,
          checkIn,
          checkOut,
          resellerId: reseller.resellerId,
          bookedBy: reseller.isReseller ? 'custom-package' : 'b2c',
          items,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`¡Paquete ${json.data.code} reservado exitosamente!`)
        // Reset
        setCurrentStep(1)
        transport.clearSelection()
        hotel.clearSelection()
        excursion.clearSelection()
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

  // ─── Render ─────────────────────────────────────────────

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
            {/* Reseller banner */}
            {reseller.isReseller && reseller.companyName && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <span className="text-sm text-white/90">
                  Distribuido por <strong className="text-white">{reseller.companyName}</strong>
                </span>
              </div>
            )}
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
                    onClick={() => { transport.clearSelection(); setCurrentStep(2) }}
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
                      <Select value={transport.cityId} onValueChange={(v) => transport.setCityId(v === 'all' ? '' : v)}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Todas las ciudades" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {cities.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Servicio</Label>
                      <Select value={transport.serviceId} onValueChange={transport.setServiceId}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona un servicio" /></SelectTrigger>
                        <SelectContent>
                          {transport.services.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} — {s.origin} → {s.destination}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {transport.selectedService && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-neutral-800">{transport.selectedService.name}</span>
                        <span className="text-lg font-bold text-amber-600">
                          {formatCurrency(applyResellerMarkup({ basePrice: transport.selectedService.basePrice, commissionPercent: reseller.commission }))}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span className="flex items-center gap-1"><MapPin className="size-3.5 text-amber-500" />{transport.selectedService.origin} → {transport.selectedService.destination}</span>
                        <span className="flex items-center gap-1"><Clock className="size-3.5 text-amber-500" />{transport.selectedService.durationMins} min</span>
                        <span className="flex items-center gap-1"><Users className="size-3.5 text-amber-500" />{transport.selectedService.provider.capacity} pax</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                        <Input type="date" min={today} value={transport.date} onChange={(e) => transport.setDate(e.target.value)} className="pl-10 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Adultos</Label>
                      <Input type="number" min={1} max={transport.selectedService?.provider.capacity || 4} value={transport.adults} onChange={(e) => transport.setAdults(Math.max(1, parseInt(e.target.value) || 1))} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Niños</Label>
                      <Input type="number" min={0} value={transport.children} onChange={(e) => transport.setChildren(Math.max(0, parseInt(e.target.value) || 0))} className="rounded-xl" />
                    </div>
                  </div>

                  {transport.selectedService && transport.date && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm">
                      <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                        <Check className="size-4" />
                        Transporte seleccionado: {formatCurrency(applyResellerMarkup({
                          basePrice: transport.selectedService.basePrice + (transport.adults + transport.children - 1) * transport.selectedService.pricePerExtra,
                          commissionPercent: reseller.commission,
                        }))}
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
                  <Button variant="outline" onClick={() => { hotel.clearSelection(); setCurrentStep(3) }} className="rounded-xl text-sm">
                    <SkipForward className="mr-2 size-4" />
                    Saltar
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ciudad</Label>
                      <Select value={hotel.cityId} onValueChange={(v) => hotel.setCityId(v === 'all' ? '' : v)}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Todas las ciudades" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {cities.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Hotel</Label>
                      <Select value={hotel.hotelId} onValueChange={(v) => hotel.setHotelId(v)}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona un hotel" /></SelectTrigger>
                        <SelectContent>
                          {hotel.filteredHotels.map((h) => (
                            <SelectItem key={h.id} value={h.id}>{h.name} — {h.cityName} ({h.stars}★)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {hotel.selectedHotel && (
                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-800">{hotel.selectedHotel.name}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: hotel.selectedHotel.stars }).map((_, i) => (
                              <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-neutral-500">
                          Desde {formatCurrency(applyResellerMarkup({ basePrice: hotel.selectedHotel.priceFrom, commissionPercent: reseller.commission }))}/noche
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de habitación</Label>
                        <Select value={hotel.roomId} onValueChange={hotel.setRoomId}>
                          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona habitación" /></SelectTrigger>
                          <SelectContent>
                            {hotel.selectedHotel.rooms?.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name} — {formatCurrency(applyResellerMarkup({ basePrice: r.price, commissionPercent: reseller.commission }))}/noche ({r.maxGuests} huéspedes)
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
                      <Input type="date" min={today} value={hotel.checkIn} onChange={(e) => hotel.setCheckIn(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out</Label>
                      <Input type="date" min={hotel.checkIn || today} value={hotel.checkOut} onChange={(e) => hotel.setCheckOut(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>N° Habitaciones</Label>
                      <Input type="number" min={1} max={5} value={hotel.roomCount} onChange={(e) => hotel.setRoomCount(Math.max(1, parseInt(e.target.value) || 1))} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Noches</Label>
                      <div className="flex items-center h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-3">
                        <span className="text-sm font-semibold text-neutral-700">{hotel.nights}</span>
                      </div>
                    </div>
                  </div>

                  {hotel.selectedRoom && hotel.checkIn && hotel.checkOut && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm">
                      <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                        <Check className="size-4" />
                        Hotel seleccionado: {hotel.selectedRoom.name} × {hotel.nights} noche{hotel.nights !== 1 ? 's' : ''} × {hotel.roomCount} hab. = {formatCurrency(applyResellerMarkup({
                          basePrice: hotel.selectedRoom.price * hotel.nights * hotel.roomCount,
                          commissionPercent: reseller.commission,
                        }))}
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
                  <Button variant="outline" onClick={() => { excursion.clearSelection(); setCurrentStep(4) }} className="rounded-xl text-sm">
                    <SkipForward className="mr-2 size-4" />
                    Saltar
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Excursión</Label>
                    <Select value={excursion.serviceId} onValueChange={excursion.setServiceId}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona una excursión" /></SelectTrigger>
                      <SelectContent>
                        {excursion.filteredExcursions.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name} — {e.cityName || e.destinationName} ({formatCurrency(applyResellerMarkup({ basePrice: e.basePrice, commissionPercent: reseller.commission }))})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {excursion.selectedExcursion && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-neutral-800">{excursion.selectedExcursion.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${difficultyConfig[excursion.selectedExcursion.difficulty]?.bg || 'bg-neutral-100'} ${difficultyConfig[excursion.selectedExcursion.difficulty]?.color || 'text-neutral-600'} border-transparent text-xs`}>
                              {excursion.selectedExcursion.difficulty}
                            </Badge>
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                              <Clock className="size-3" />{excursion.selectedExcursion.duration}
                            </span>
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                              <MapPin className="size-3" />{excursion.selectedExcursion.cityName || excursion.selectedExcursion.destinationName}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-amber-600">
                            {formatCurrency(applyResellerMarkup({ basePrice: excursion.selectedExcursion.basePrice, commissionPercent: reseller.commission }))}
                          </p>
                          {excursion.selectedExcursion.childPrice > 0 && (
                            <p className="text-xs text-neutral-500">
                              Niño: {formatCurrency(applyResellerMarkup({ basePrice: excursion.selectedExcursion.childPrice, commissionPercent: reseller.commission }))}
                            </p>
                          )}
                        </div>
                      </div>
                      {excursion.selectedExcursion.shortDesc && (
                        <p className="text-xs text-neutral-500 mt-1">{excursion.selectedExcursion.shortDesc}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                        <Input type="date" min={today} value={excursion.date} onChange={(e) => excursion.setDate(e.target.value)} className="pl-10 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Adultos</Label>
                      <Input type="number" min={1} value={excursion.adults} onChange={(e) => excursion.setAdults(Math.max(1, parseInt(e.target.value) || 1))} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Niños</Label>
                      <Input type="number" min={0} value={excursion.children} onChange={(e) => excursion.setChildren(Math.max(0, parseInt(e.target.value) || 0))} className="rounded-xl" />
                    </div>
                  </div>

                  {excursion.selectedExcursion && excursion.date && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm">
                      <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                        <Check className="size-4" />
                        Excursión seleccionada: {excursion.adults} adultos × {formatCurrency(applyResellerMarkup({ basePrice: excursion.selectedExcursion.basePrice, commissionPercent: reseller.commission }))}
                        {excursion.children > 0 && <> + {excursion.children} niños × {formatCurrency(applyResellerMarkup({ basePrice: excursion.selectedExcursion.childPrice || excursion.selectedExcursion.basePrice, commissionPercent: reseller.commission }))}</>}
                        {' = '}{formatCurrency(applyResellerMarkup({
                          basePrice: excursion.adults * excursion.selectedExcursion.basePrice + excursion.children * (excursion.selectedExcursion.childPrice || excursion.selectedExcursion.basePrice),
                          commissionPercent: reseller.commission,
                        }))}
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

                {(!transport.selected && !hotel.selected && !excursion.selected) ? (
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
                      {transport.selected && (
                        <div className="rounded-xl border border-neutral-200 bg-white p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="size-8 rounded-lg bg-green-100 flex items-center justify-center">
                              <Bus className="size-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-neutral-800">{transport.selected.service.name}</p>
                              <p className="text-xs text-neutral-500">{transport.selected.service.origin} → {transport.selected.service.destination} · {transport.selected.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-amber-600">{formatCurrency(transport.selected.displayPrice)}</p>
                              <p className="text-[11px] text-neutral-400">{transport.selected.adults + transport.selected.children} pasajeros</p>
                            </div>
                          </div>
                          <button onClick={() => setCurrentStep(1)} className="text-xs text-amber-600 hover:underline">Modificar</button>
                        </div>
                      )}

                      {hotel.selected && (
                        <div className="rounded-xl border border-neutral-200 bg-white p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Building2 className="size-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-neutral-800">{hotel.selected.hotel.name}</p>
                              <p className="text-xs text-neutral-500">{hotel.selected.room.name} · {hotel.selected.checkIn} → {hotel.selected.checkOut} ({hotel.selected.nights} noches × {hotel.selected.rooms} hab.)</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-amber-600">{formatCurrency(hotel.selected.displayPrice)}</p>
                              <p className="text-[11px] text-neutral-400">{formatCurrency(applyResellerMarkup({ basePrice: hotel.selected.room.price, commissionPercent: reseller.commission }))}/noche</p>
                            </div>
                          </div>
                          <button onClick={() => setCurrentStep(2)} className="text-xs text-amber-600 hover:underline">Modificar</button>
                        </div>
                      )}

                      {excursion.selected && (
                        <div className="rounded-xl border border-neutral-200 bg-white p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="size-8 rounded-lg bg-purple-100 flex items-center justify-center">
                              <Mountain className="size-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-neutral-800">{excursion.selected.excursion.name}</p>
                              <p className="text-xs text-neutral-500">{excursion.selected.excursion.cityName || excursion.selected.excursion.destinationName} · {excursion.selected.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-amber-600">{formatCurrency(excursion.selected.displayPrice)}</p>
                              <p className="text-[11px] text-neutral-400">{excursion.selected.adults + excursion.selected.children} participantes</p>
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
                          <p className="text-3xl font-bold">{formatCurrency(displayTotal)}</p>
                          <p className="text-amber-200 text-xs mt-1">COP · impuestos incluidos</p>
                          {reseller.isReseller && reseller.commission > 0 && (
                            <p className="text-amber-200 text-xs mt-0.5">
                              Incluye comisión de distribución ({reseller.commission}%)
                            </p>
                          )}
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
              disabled={submitting || (!transport.selected && !hotel.selected && !excursion.selected)}
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

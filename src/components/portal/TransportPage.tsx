'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bus,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Calendar,
  Shield,
  Luggage,
  Phone,
  Star,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useNavigationStore } from '@/store/useNavigationStore'
import { formatCOP } from '@/data/packages'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────
interface TransportService {
  id: string
  providerId: string
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
  notes: string
  active: boolean
  provider: {
    id: string
    name: string
    vehicleType: string
    capacity: number
  }
}

const cityTabs = [
  { id: '', label: 'Todas' },
  { id: 'cartagena', label: 'Cartagena' },
  { id: 'medellin', label: 'Medellín' },
  { id: 'bogota', label: 'Bogotá' },
  { id: 'eje-cafetero', label: 'Eje Cafetero' },
]

const routeTypeLabels: Record<string, string> = {
  'aeropuerto-hotel': 'Aeropuerto → Hotel',
  'hotel-aeropuerto': 'Hotel → Aeropuerto',
  'punto-a-punto': 'Punto a Punto',
  'ciudad-a-ciudad': 'Ciudad a Ciudad',
}

const vehicleTypeLabels: Record<string, string> = {
  auto: 'Auto',
  van: 'Van',
  bus: 'Buseta',
  suv: 'SUV',
}

const vehicleTypeIcons: Record<string, React.ReactNode> = {
  auto: <Users className="size-4" />,
  van: <Users className="size-4" />,
  bus: <Bus className="size-4" />,
  suv: <Users className="size-4" />,
}

// ─── Animation variants ─────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ─── Main Component ─────────────────────────────────────────
export default function TransportPage() {
  const { goBack } = useNavigationStore()

  const [activeCity, setActiveCity] = useState('')
  const [services, setServices] = useState<TransportService[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingService, setBookingService] = useState<TransportService | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Booking form state
  const [bookingDate, setBookingDate] = useState('')
  const [bookingAdults, setBookingAdults] = useState(1)
  const [bookingChildren, setBookingChildren] = useState(0)
  const [bookingName, setBookingName] = useState('')
  const [bookingEmail, setBookingEmail] = useState('')
  const [bookingPhone, setBookingPhone] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch transport services
  const fetchServices = useCallback(async (cityId: string) => {
    setLoading(true)
    try {
      const url = cityId ? `/api/public/transport?cityId=${cityId}` : '/api/public/transport'
      const res = await fetch(url)
      const json = await res.json()
      if (json.success) {
        setServices(json.data)
      }
    } catch (err) {
      console.error('Error fetching transport services:', err)
      toast.error('Error al cargar los servicios de transporte')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices(activeCity)
  }, [activeCity, fetchServices])

  // Open booking dialog
  const handleOpenBooking = (service: TransportService) => {
    setBookingService(service)
    setDialogOpen(true)
    // Reset form
    setBookingDate('')
    setBookingAdults(1)
    setBookingChildren(0)
    setBookingName('')
    setBookingEmail('')
    setBookingPhone('')
    setBookingNotes('')
  }

  // Calculate total price
  const calcTotal = () => {
    if (!bookingService) return 0
    const totalPax = bookingAdults + bookingChildren
    return bookingService.basePrice + (totalPax > 1 ? (totalPax - 1) * bookingService.pricePerExtra : 0)
  }

  // Submit booking
  const handleSubmitBooking = async () => {
    if (!bookingService || !bookingDate || !bookingName || !bookingEmail || !bookingPhone) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    setSubmitting(true)
    try {
      const totalPax = bookingAdults + bookingChildren
      const totalPrice = bookingService.basePrice + (totalPax > 1 ? (totalPax - 1) * bookingService.pricePerExtra : 0)

      const res = await fetch('/api/public/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: bookingName,
          guestEmail: bookingEmail,
          guestPhone: bookingPhone,
          adults: bookingAdults,
          children: bookingChildren,
          notes: bookingNotes,
          totalPrice,
          checkIn: bookingDate,
          items: [{
            itemType: 'transport',
            serviceId: bookingService.id,
            serviceName: bookingService.name,
            dateFrom: bookingDate,
            quantity: totalPax,
            unitPrice: bookingService.basePrice,
            totalPrice,
          }],
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`¡Reserva ${json.data.code} creada exitosamente!`)
        setDialogOpen(false)
        setBookingService(null)
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

  // Get min date for booking (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ─── Hero ────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-white/20">
            <Bus className="size-32" />
          </div>
          <div className="absolute bottom-10 right-10 text-white/20">
            <MapPin className="size-24" />
          </div>
          <div className="absolute top-20 right-1/3 text-white/20">
            <ArrowRight className="size-20" />
          </div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Bus className="size-5 text-white" />
              <span className="text-sm font-medium text-white">Servicios de Transporte</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              Transporte Privado en Colombia
            </h1>
            <p className="text-amber-100 text-lg max-w-2xl mx-auto">
              Traslados seguros y cómodos desde y hacia aeropuertos, hoteles y destinos turísticos en las principales ciudades del país
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── City Filter Tabs ────────────────────────────────── */}
      <div className="sticky top-16 z-40 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            {cityTabs.map((city) => (
              <button
                key={city.id}
                onClick={() => setActiveCity(city.id)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCity === city.id
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Main Content ────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <motion.div {...fadeInUp} className="mb-6">
          <button
            onClick={goBack}
            className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-amber-600"
          >
            ← Volver al inicio
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Servicios Disponibles
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                <span className="font-semibold text-neutral-700">{services.length}</span> servicios de transporte encontrados
              </p>
            </div>
          </div>
        </motion.div>

        {/* Service Cards */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <Bus className="size-12 text-neutral-300 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700">No hay servicios disponibles</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Prueba seleccionando otra ciudad
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {services.map((service) => (
                <motion.div key={service.id} variants={staggerItem}>
                  <TransportCard service={service} onBook={handleOpenBooking} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Booking Dialog ──────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Bus className="size-5 text-amber-500" />
              Reservar Transporte
            </DialogTitle>
            <DialogDescription className="text-neutral-500">
              {bookingService?.name} — {bookingService?.origin} → {bookingService?.destination}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Service Summary */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-neutral-800">{bookingService?.name}</span>
                <Badge className="bg-amber-100 text-amber-700 border-transparent text-xs">
                  {routeTypeLabels[bookingService?.routeType || ''] || bookingService?.routeType}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-amber-500" />
                  {bookingService?.origin} → {bookingService?.destination}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5 text-amber-500" />
                  {bookingService?.durationMins} min
                </span>
                <span className="flex items-center gap-1">
                  {vehicleTypeIcons[bookingService?.provider?.vehicleType || 'auto']}
                  {vehicleTypeLabels[bookingService?.provider?.vehicleType || 'auto']} ({bookingService?.provider?.capacity} pax)
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="booking-date">Fecha del servicio *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <Input
                  id="booking-date"
                  type="date"
                  min={today}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="pl-10 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Passengers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking-adults">Adultos *</Label>
                <Input
                  id="booking-adults"
                  type="number"
                  min={1}
                  max={bookingService?.provider?.capacity || 4}
                  value={bookingAdults}
                  onChange={(e) => setBookingAdults(Math.max(1, parseInt(e.target.value) || 1))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-children">Niños</Label>
                <Input
                  id="booking-children"
                  type="number"
                  min={0}
                  max={bookingService?.provider?.capacity ? (bookingService.provider.capacity - bookingAdults) : 3}
                  value={bookingChildren}
                  onChange={(e) => setBookingChildren(Math.max(0, parseInt(e.target.value) || 0))}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Guest Info */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <p className="text-sm font-semibold text-neutral-800">Datos del pasajero</p>
              <div className="space-y-2">
                <Label htmlFor="booking-name">Nombre completo *</Label>
                <Input
                  id="booking-name"
                  placeholder="Juan Pérez"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="booking-email">Email *</Label>
                  <Input
                    id="booking-email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-phone">Teléfono *</Label>
                  <Input
                    id="booking-phone"
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="booking-notes">Solicitudes especiales</Label>
              <Textarea
                id="booking-notes"
                placeholder="Número de vuelo, horario de llegada, silla para niño..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="rounded-xl resize-none"
                rows={2}
              />
            </div>

            {/* Price + Submit */}
            <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-500">Total estimado</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCOP(calcTotal())}</p>
                  <p className="text-xs text-neutral-400">COP · por servicio</p>
                </div>
                <Button
                  onClick={handleSubmitBooking}
                  disabled={submitting}
                  className="rounded-xl bg-amber-500 px-6 font-semibold text-white hover:bg-amber-600 shadow-md shadow-amber-500/20"
                >
                  {submitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      Reservar
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Transport Card ──────────────────────────────────────────
function TransportCard({ service, onBook }: { service: TransportService; onBook: (s: TransportService) => void }) {
  const includesIcons: Record<string, React.ReactNode> = {
    seguro: <Shield className="size-3" />,
    equipaje: <Luggage className="size-3" />,
    'agua': <Star className="size-3" />,
    wifi: <Star className="size-3" />,
  }

  return (
    <div className="group flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden">
      {/* Header with route type */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-white/20 text-white border-transparent text-xs backdrop-blur-sm">
            {routeTypeLabels[service.routeType] || service.routeType}
          </Badge>
          <div className="flex items-center gap-1 text-white/90 text-xs">
            <Clock className="size-3.5" />
            {service.durationMins} min
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <h3 className="font-bold text-neutral-900 text-lg leading-tight mb-2 group-hover:text-amber-600 transition-colors">
          {service.name}
        </h3>

        {/* Route */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-sm text-neutral-600">
            <div className="size-2 rounded-full bg-amber-500" />
            <span className="font-medium">{service.origin}</span>
          </div>
          <ArrowRight className="size-3.5 text-neutral-300" />
          <div className="flex items-center gap-1.5 text-sm text-neutral-600">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span className="font-medium">{service.destination}</span>
          </div>
        </div>

        {/* Info badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="secondary" className="rounded-full bg-neutral-100 text-neutral-600 border-transparent text-xs">
            <Users className="mr-1 size-3" />
            {service.provider.capacity} pasajeros
          </Badge>
          <Badge variant="secondary" className="rounded-full bg-neutral-100 text-neutral-600 border-transparent text-xs">
            {vehicleTypeIcons[service.provider.vehicleType]}
            <span className="ml-1">{vehicleTypeLabels[service.provider.vehicleType]}</span>
          </Badge>
          {service.cityName && (
            <Badge variant="secondary" className="rounded-full bg-neutral-100 text-neutral-600 border-transparent text-xs">
              <MapPin className="mr-1 size-3" />
              {service.cityName}
            </Badge>
          )}
        </div>

        {/* Includes */}
        {service.includes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {service.includes.slice(0, 4).map((inc) => (
              <span
                key={inc}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
              >
                {includesIcons[inc.toLowerCase()] || <Shield className="size-3" />}
                {inc}
              </span>
            ))}
            {service.includes.length > 4 && (
              <span className="text-xs text-neutral-400">+{service.includes.length - 4} más</span>
            )}
          </div>
        )}

        {/* Provider */}
        <p className="text-xs text-neutral-400 flex items-center gap-1">
          <Phone className="size-3" />
          Operado por {service.provider.name}
        </p>
      </div>

      {/* Footer: Price + CTA */}
      <div className="border-t border-neutral-100 px-4 py-3 flex items-end justify-between">
        <div>
          <span className="text-xs text-neutral-400">Desde</span>
          <p className="text-xl font-bold text-amber-600">{formatCOP(service.basePrice)}</p>
          <p className="text-[11px] text-neutral-400">por viaje</p>
        </div>
        <Button
          onClick={() => onBook(service)}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 shadow-sm transition-all"
        >
          Reservar
          <ArrowRight className="ml-1.5 size-4" />
        </Button>
      </div>
    </div>
  )
}

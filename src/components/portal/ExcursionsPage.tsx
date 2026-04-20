'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mountain,
  Clock,
  Star,
  Users,
  Calendar,
  MapPin,
  ArrowRight,
  Check,
  X,
  Info,
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
interface Excursion {
  id: string
  slug: string
  name: string
  destinationId: string
  destinationName: string
  cityName: string
  description: string
  shortDesc: string
  images: string[]
  duration: string
  difficulty: string
  groupSize: number
  basePrice: number
  childPrice: number
  includes: string[]
  excludes: string[]
  requirements: string[]
  category: string
  rating: number
  featured: boolean
  active: boolean
}

const categoryTabs = [
  { id: '', label: 'Todas' },
  { id: 'Cultural', label: 'Cultural' },
  { id: 'Aventura', label: 'Aventura' },
  { id: 'Naturaleza', label: 'Naturaleza' },
  { id: 'Gastronomía', label: 'Gastronomía' },
]

const difficultyConfig: Record<string, { color: string; bg: string; label: string }> = {
  'Fácil': { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Fácil' },
  'Moderado': { color: 'text-amber-700', bg: 'bg-amber-100', label: 'Moderado' },
  'Difícil': { color: 'text-red-700', bg: 'bg-red-100', label: 'Difícil' },
}

const categoryConfig: Record<string, { color: string; bg: string }> = {
  Cultural: { color: 'text-blue-700', bg: 'bg-blue-100' },
  Aventura: { color: 'text-purple-700', bg: 'bg-purple-100' },
  Naturaleza: { color: 'text-emerald-700', bg: 'bg-emerald-100' },
  Gastronomía: { color: 'text-orange-700', bg: 'bg-orange-100' },
}

// ─── Animation variants ─────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// ─── Main Component ─────────────────────────────────────────
export default function ExcursionsPage() {
  const { goBack } = usePortalNavigation()

  const [activeCategory, setActiveCategory] = useState('')
  const [activeDestination, setActiveDestination] = useState('')
  const [excursions, setExcursions] = useState<Excursion[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingExcursion, setBookingExcursion] = useState<Excursion | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Booking form state
  const [bookingDate, setBookingDate] = useState('')
  const [bookingAdults, setBookingAdults] = useState(1)
  const [bookingChildren, setBookingChildren] = useState(0)
  const [childAges, setChildAges] = useState<number[]>([])
  const [bookingName, setBookingName] = useState('')
  const [bookingEmail, setBookingEmail] = useState('')
  const [bookingPhone, setBookingPhone] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch excursions
  const fetchExcursions = useCallback(async (category: string, destinationId: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (destinationId) params.set('destinationId', destinationId)
      if (category) params.set('cityId', category) // use cityId param as category filter is not directly supported
      const url = `/api/public/excursions${params.toString() ? '?' + params.toString() : ''}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.success) {
        let data = json.data
        // Filter by category client-side if needed
        if (category) {
          data = data.filter((e: Excursion) => e.category === category)
        }
        setExcursions(data)
      }
    } catch (err) {
      console.error('Error fetching excursions:', err)
      toast.error('Error al cargar las excursiones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExcursions(activeCategory, activeDestination)
  }, [activeCategory, activeDestination, fetchExcursions])

  // Open booking dialog
  const handleOpenBooking = (excursion: Excursion) => {
    setBookingExcursion(excursion)
    setDialogOpen(true)
    setBookingDate('')
    setBookingAdults(1)
    setBookingChildren(0)
    setChildAges([])
    setBookingName('')
    setBookingEmail('')
    setBookingPhone('')
    setBookingNotes('')
  }

  // Calculate total price
  const calcTotal = () => {
    if (!bookingExcursion) return 0
    const adultTotal = bookingAdults * bookingExcursion.basePrice
    const childTotal = bookingChildren * (bookingExcursion.childPrice || bookingExcursion.basePrice)
    return adultTotal + childTotal
  }

  // Update child ages array
  useEffect(() => {
    if (bookingChildren > childAges.length) {
      setChildAges((prev) => [...prev, ...Array(bookingChildren - prev.length).fill(0)])
    } else if (bookingChildren < childAges.length) {
      setChildAges((prev) => prev.slice(0, bookingChildren))
    }
  }, [bookingChildren, childAges.length])

  // Submit booking
  const handleSubmitBooking = async () => {
    if (!bookingExcursion || !bookingDate || !bookingName || !bookingEmail || !bookingPhone) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    setSubmitting(true)
    try {
      const adultTotal = bookingAdults * bookingExcursion.basePrice
      const childTotal = bookingChildren * (bookingExcursion.childPrice || bookingExcursion.basePrice)
      const totalPrice = adultTotal + childTotal

      const res = await fetch('/api/public/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: bookingName,
          guestEmail: bookingEmail,
          guestPhone: bookingPhone,
          adults: bookingAdults,
          children: bookingChildren,
          childrenAges: childAges.filter((a) => a > 0),
          notes: bookingNotes,
          totalPrice,
          checkIn: bookingDate,
          items: [{
            itemType: 'excursion',
            serviceId: bookingExcursion.id,
            serviceName: bookingExcursion.name,
            dateFrom: bookingDate,
            quantity: bookingAdults + bookingChildren,
            unitPrice: bookingExcursion.basePrice,
            totalPrice,
            addons: childAges.filter((a) => a > 0).length > 0 ? { childAges: childAges.filter((a) => a > 0) } : [],
          }],
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`¡Reserva ${json.data.code} creada exitosamente!`)
        setDialogOpen(false)
        setBookingExcursion(null)
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

  // Get unique destinations from loaded excursions
  const destinations = Array.from(new Set(excursions.map((e) => e.destinationName).filter(Boolean)))

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ─── Hero ────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-white/20">
            <Mountain className="size-32" />
          </div>
          <div className="absolute bottom-10 right-10 text-white/20">
            <MapPin className="size-24" />
          </div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Mountain className="size-5 text-white" />
              <span className="text-sm font-medium text-white">Excursiones y Actividades</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              Vive Experiencias Únicas
            </h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
              Explora tours culturales, aventuras extremas, naturaleza y gastronomía en los destinos más impresionantes de Colombia
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── Filters ─────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
              {categoryTabs.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Destination dropdown */}
            <Select value={activeDestination} onValueChange={(v) => setActiveDestination(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-48 rounded-xl border-neutral-200 text-sm">
                <MapPin className="mr-2 size-4 text-amber-500" />
                <SelectValue placeholder="Destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los destinos</SelectItem>
                {destinations.map((dest) => (
                  <SelectItem key={dest} value={dest}>
                    {dest}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ─── Main Content ────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="mb-6">
          <button
            onClick={() => goBack()}
            className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-amber-600"
          >
            ← Volver al inicio
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Excursiones Disponibles</h2>
              <p className="mt-1 text-sm text-neutral-500">
                <span className="font-semibold text-neutral-700">{excursions.length}</span> experiencias encontradas
              </p>
            </div>
          </div>
        </motion.div>

        {/* Excursion Cards */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          ) : excursions.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <Mountain className="size-12 text-neutral-300 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700">No hay excursiones disponibles</h3>
              <p className="mt-1 text-sm text-neutral-500">Prueba con otros filtros</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {excursions.map((excursion) => (
                <motion.div key={excursion.id} variants={staggerItem}>
                  <ExcursionCard excursion={excursion} onBook={handleOpenBooking} />
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
              <Mountain className="size-5 text-amber-500" />
              Reservar Excursión
            </DialogTitle>
            <DialogDescription className="text-neutral-500">
              {bookingExcursion?.name} — {bookingExcursion?.cityName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Excursion Summary */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-neutral-800">{bookingExcursion?.name}</span>
                <div className="flex gap-1.5">
                  <Badge className={`${difficultyConfig[bookingExcursion?.difficulty || 'Fácil']?.bg} ${difficultyConfig[bookingExcursion?.difficulty || 'Fácil']?.color} border-transparent text-xs`}>
                    {difficultyConfig[bookingExcursion?.difficulty || 'Fácil']?.label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5 text-amber-500" />
                  {bookingExcursion?.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3.5 text-amber-500" />
                  Hasta {bookingExcursion?.groupSize} personas
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {bookingExcursion?.rating?.toFixed(1)}
                </span>
              </div>
              {bookingExcursion?.shortDesc && (
                <p className="mt-2 text-xs text-neutral-500">{bookingExcursion.shortDesc}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="exc-booking-date">Fecha de la excursión *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <Input
                  id="exc-booking-date"
                  type="date"
                  min={today}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="pl-10 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exc-adults">Adultos *</Label>
                <Input
                  id="exc-adults"
                  type="number"
                  min={1}
                  max={bookingExcursion?.groupSize || 20}
                  value={bookingAdults}
                  onChange={(e) => setBookingAdults(Math.max(1, parseInt(e.target.value) || 1))}
                  className="rounded-xl"
                />
                <p className="text-xs text-amber-600">{formatCOP(bookingExcursion?.basePrice || 0)} / adulto</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exc-children">Niños</Label>
                <Input
                  id="exc-children"
                  type="number"
                  min={0}
                  max={bookingExcursion?.groupSize ? bookingExcursion.groupSize - bookingAdults : 10}
                  value={bookingChildren}
                  onChange={(e) => setBookingChildren(Math.max(0, parseInt(e.target.value) || 0))}
                  className="rounded-xl"
                />
                {bookingExcursion?.childPrice && bookingExcursion.childPrice > 0 ? (
                  <p className="text-xs text-amber-600">{formatCOP(bookingExcursion.childPrice)} / niño</p>
                ) : (
                  <p className="text-xs text-neutral-400">Mismo precio que adulto</p>
                )}
              </div>
            </div>

            {/* Child ages */}
            {bookingChildren > 0 && (
              <div className="space-y-2">
                <Label>Edades de los niños</Label>
                <div className="flex gap-2">
                  {childAges.map((age, idx) => (
                    <Input
                      key={idx}
                      type="number"
                      min={0}
                      max={17}
                      placeholder={`${idx + 1}°`}
                      value={age || ''}
                      onChange={(e) => {
                        const newAges = [...childAges]
                        newAges[idx] = parseInt(e.target.value) || 0
                        setChildAges(newAges)
                      }}
                      className="w-20 rounded-xl text-center"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {bookingExcursion?.requirements && bookingExcursion.requirements.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-semibold text-amber-800 flex items-center gap-1 mb-2">
                  <Info className="size-3.5" />
                  Requisitos
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bookingExcursion.requirements.map((req) => (
                    <span key={req} className="text-xs text-amber-700">• {req}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Guest Info */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <p className="text-sm font-semibold text-neutral-800">Datos del reservante</p>
              <div className="space-y-2">
                <Label htmlFor="exc-name">Nombre completo *</Label>
                <Input
                  id="exc-name"
                  placeholder="Juan Pérez"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="exc-email">Email *</Label>
                  <Input
                    id="exc-email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exc-phone">Teléfono *</Label>
                  <Input
                    id="exc-phone"
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
              <Label htmlFor="exc-notes">Requerimientos especiales</Label>
              <Textarea
                id="exc-notes"
                placeholder="Alergias, restricciones alimentarias, necesidades especiales..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="rounded-xl resize-none"
                rows={2}
              />
            </div>

            {/* Price + Submit */}
            <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-neutral-600">
                  {bookingAdults} adulto{bookingAdults !== 1 ? 's' : ''} × {formatCOP(bookingExcursion?.basePrice || 0)}
                  {bookingChildren > 0 && (
                    <> + {bookingChildren} niño{bookingChildren !== 1 ? 's' : ''} × {formatCOP(bookingExcursion?.childPrice || bookingExcursion?.basePrice || 0)}</>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-500">Total</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCOP(calcTotal())}</p>
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

// ─── Excursion Card ──────────────────────────────────────────
function ExcursionCard({ excursion, onBook }: { excursion: Excursion; onBook: (e: Excursion) => void }) {
  const diff = difficultyConfig[excursion.difficulty] || difficultyConfig['Fácil']
  const cat = categoryConfig[excursion.category] || categoryConfig['Cultural']

  return (
    <div className="group flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {excursion.images && excursion.images.length > 0 ? (
          <img
            src={excursion.images[0]}
            alt={excursion.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <Mountain className="size-12 text-white/60" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {excursion.featured && (
            <Badge className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white border-transparent shadow-sm">
              <Star className="mr-1 size-3 fill-white" />
              Destacado
            </Badge>
          )}
          <Badge className={`rounded-full ${cat.bg} ${cat.color} px-2 py-0.5 text-xs font-semibold border-transparent`}>
            {excursion.category}
          </Badge>
        </div>

        {/* Difficulty badge */}
        <div className="absolute top-3 right-3">
          <Badge className={`rounded-full ${diff.bg} ${diff.color} px-2 py-0.5 text-xs font-semibold border-transparent`}>
            {diff.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <h3 className="font-bold text-neutral-900 text-base leading-tight mb-1.5 group-hover:text-amber-600 transition-colors">
          {excursion.name}
        </h3>

        {/* Location + Duration */}
        <div className="flex items-center gap-3 text-sm text-neutral-500 mb-2">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5 text-amber-500" />
            {excursion.cityName || excursion.destinationName}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5 text-amber-500" />
            {excursion.duration}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-3.5 ${i < Math.round(excursion.rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`}
            />
          ))}
          <span className="text-xs text-neutral-500 ml-1">{excursion.rating?.toFixed(1)}</span>
        </div>

        {/* Includes */}
        {excursion.includes && excursion.includes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {excursion.includes.slice(0, 3).map((inc) => (
              <span
                key={inc}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700"
              >
                <Check className="size-3" />
                {inc}
              </span>
            ))}
            {excursion.includes.length > 3 && (
              <span className="text-[11px] text-neutral-400">+{excursion.includes.length - 3} más</span>
            )}
          </div>
        )}

        {/* Excludes */}
        {excursion.excludes && excursion.excludes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {excursion.excludes.slice(0, 2).map((exc) => (
              <span
                key={exc}
                className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-600"
              >
                <X className="size-3" />
                {exc}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Price + CTA */}
      <div className="border-t border-neutral-100 px-4 py-3 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div>
              <span className="text-xs text-neutral-400">Adulto</span>
              <p className="text-lg font-bold text-amber-600">{formatCOP(excursion.basePrice)}</p>
            </div>
            {excursion.childPrice && excursion.childPrice > 0 && (
              <div>
                <span className="text-xs text-neutral-400">Niño</span>
                <p className="text-sm font-semibold text-neutral-500">{formatCOP(excursion.childPrice)}</p>
              </div>
            )}
          </div>
          <p className="text-[11px] text-neutral-400">COP / por persona</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-xl px-3 py-2 text-sm font-semibold">
            <Link href={`/excursiones/${excursion.slug}`}>
              Ver detalle
            </Link>
          </Button>
          <Button
            onClick={() => onBook(excursion)}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 shadow-sm transition-all"
          >
            Reservar
            <ArrowRight className="ml-1.5 size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

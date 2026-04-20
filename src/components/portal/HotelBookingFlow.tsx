'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  MapPin,
  Star,
  Users,
  CreditCard,
  Shield,
  Banknote,
  Building2,
  Baby,
  CalendarDays,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { hotels, formatCOP } from '@/data/hotels'
import { useNavigationStore } from '@/store/useNavigationStore'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────
interface HotelBookingPayload {
  contactName: string
  contactEmail: string
  contactPhone: string
  contactDocumentType: string
  contactDocumentNumber: string
  contactNationality: string
  contactCity: string
  adults: number
  children: number
  childrenAges: number[]
  specialRequests: string
  paymentMethod: string
  breakfastAdd: boolean
  lateCheckout: boolean
  acceptTerms: boolean
  acceptPrivacy: boolean
}

const initialForm: HotelBookingPayload = {
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  contactDocumentType: 'CC',
  contactDocumentNumber: '',
  contactNationality: 'colombiana',
  contactCity: '',
  adults: 1,
  children: 0,
  childrenAges: [],
  specialRequests: '',
  paymentMethod: '',
  breakfastAdd: false,
  lateCheckout: false,
  acceptTerms: false,
  acceptPrivacy: false,
}

const steps = [
  { id: 1, label: 'Datos Personales', icon: User },
  { id: 2, label: 'Huéspedes', icon: Users },
  { id: 3, label: 'Pago', icon: CreditCard },
  { id: 4, label: 'Confirmación', icon: CheckCircle2 },
]

interface HotelBookingFlowProps {
  hotelId?: string
  roomId?: string
  checkIn?: string
  checkOut?: string
  adults?: number
  children?: number
  childrenAges?: number[]
}

export default function HotelBookingFlow({
  hotelId,
  roomId,
  checkIn: initialCheckIn,
  checkOut: initialCheckOut,
  adults: initialAdults,
  children: initialChildren,
  childrenAges: initialChildrenAges,
}: HotelBookingFlowProps) {
  const hotelBookingData = useNavigationStore((state) => state.hotelBookingData)
  const { navigate, goBack, openOrderDetail } = usePortalNavigation()
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingRef] = useState(() => 'WIL-HTL-' + Math.random().toString(36).substring(2, 8).toUpperCase())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const bookingData = hotelId
    ? {
        hotelId,
        roomId: roomId ?? '',
        checkIn: initialCheckIn ?? '',
        checkOut: initialCheckOut ?? '',
        adults: initialAdults ?? 1,
        children: initialChildren ?? 0,
        childrenAges: initialChildrenAges ?? [],
      }
    : hotelBookingData

  const [form, setForm] = useState<HotelBookingPayload>({
    ...initialForm,
    adults: bookingData?.adults ?? 1,
    children: bookingData?.children ?? 0,
    childrenAges: bookingData?.childrenAges ?? [],
  })

  const hotel = hotels.find((h) => h.id === bookingData?.hotelId)
  const room = hotel?.rooms.find((r) => r.id === bookingData?.roomId)

  const checkIn = bookingData?.checkIn ?? ''
  const checkOut = bookingData?.checkOut ?? ''
  const nights = (() => {
    if (!checkIn || !checkOut) return 1
    const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    return Math.max(1, Math.round(diff))
  })()

  const breakfastPrice = 45000
  const lateCheckoutPrice = 65000
  const roomSubtotal = room ? room.price * nights : 0
  const extrasTotal = (form.breakfastAdd ? breakfastPrice * nights : 0) + (form.lateCheckout ? lateCheckoutPrice : 0)
  const total = roomSubtotal + extrasTotal

  const set = (partial: Partial<HotelBookingPayload>) => setForm((prev) => ({ ...prev, ...partial }))

  const handleConfirm = async () => {
    if (!hotel || !room) return

    setIsSubmitting(true)

    try {
      const addons = [
        form.breakfastAdd ? { type: 'breakfast', price: breakfastPrice * nights } : null,
        form.lateCheckout ? { type: 'late-checkout', price: lateCheckoutPrice } : null,
      ].filter(Boolean)

      const response = await fetch('/api/public/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: form.contactName,
          guestEmail: form.contactEmail,
          guestPhone: form.contactPhone,
          guestCountry: form.contactNationality,
          adults: form.adults,
          children: form.children,
          childrenAges: form.childrenAges,
          notes: form.specialRequests,
          totalPrice: total,
          checkIn,
          checkOut,
          items: [
            {
              itemType: 'hotel',
              serviceId: hotel.id,
              serviceName: hotel.name,
              roomTypeId: room.id,
              roomName: room.name,
              dateFrom: checkIn,
              dateTo: checkOut,
              quantity: nights,
              unitPrice: room.price,
              totalPrice: roomSubtotal,
              addons,
            },
          ],
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'No se pudo crear la reserva del hotel')
      }

      toast.success(`Reserva ${result.data.code} creada correctamente`)
      openOrderDetail(result.data.code)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear la reserva del hotel'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hotel || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-lg text-neutral-500">Reserva no encontrada</p>
          <Button onClick={() => navigate('portal-hotels')} variant="outline" className="mt-4 rounded-xl">Volver a Hoteles</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => goBack()} className="mb-4 text-neutral-500 hover:text-neutral-700">
            <ArrowLeft className="mr-2 size-4" /> Volver al Hotel
          </Button>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Reservar Hotel</h1>
          <p className="mt-1 text-sm text-neutral-500">Ref: <span className="font-mono font-semibold text-amber-600">{bookingRef}</span></p>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${currentStep > step.id ? 'bg-emerald-500 text-white' : currentStep === step.id ? 'bg-amber-500 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                    {currentStep > step.id ? <CheckCircle2 className="size-5" /> : step.id}
                  </div>
                  <span className="mt-2 hidden text-xs font-medium text-neutral-500 sm:block">{step.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`mx-3 h-0.5 w-16 sm:w-24 transition-colors ${currentStep > step.id ? 'bg-emerald-500' : 'bg-neutral-200'}`} />}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 4) * 100} className="mt-4 h-1.5" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* ─── Step 1: Contact ──────────────────────── */}
              {currentStep === 1 && (
                <motion.div key="hs1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <Card className="border-neutral-200 p-6">
                    <h2 className="text-lg font-semibold text-neutral-900">Datos del Huésped Principal</h2>
                    <p className="mt-1 text-sm text-neutral-500">Información de quien realiza la reserva</p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label htmlFor="hname">Nombre Completo *</Label>
                        <Input id="hname" placeholder="María García López" className="mt-1.5 rounded-xl" value={form.contactName} onChange={(e) => set({ contactName: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="hemail">Correo Electrónico *</Label>
                        <Input id="hemail" type="email" placeholder="maria@ejemplo.com" className="mt-1.5 rounded-xl" value={form.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="hphone">Teléfono / WhatsApp *</Label>
                        <Input id="hphone" placeholder="+57 300 123 4567" className="mt-1.5 rounded-xl" value={form.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
                      </div>
                      <div>
                        <Label>Tipo de Documento *</Label>
                        <Select value={form.contactDocumentType} onValueChange={(v) => set({ contactDocumentType: v })}>
                          <SelectTrigger className="mt-1.5 w-full rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CC">Cédula de Ciudadanía (CC)</SelectItem>
                            <SelectItem value="CE">Cédula de Extranjería (CE)</SelectItem>
                            <SelectItem value="PP">Pasaporte (PP)</SelectItem>
                            <SelectItem value="TI">Tarjeta de Identidad (TI)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="hdoc">Número de Documento *</Label>
                        <Input id="hdoc" placeholder="1234567890" className="mt-1.5 rounded-xl" value={form.contactDocumentNumber} onChange={(e) => set({ contactDocumentNumber: e.target.value })} />
                      </div>
                      <div>
                        <Label>Nacionalidad</Label>
                        <Select value={form.contactNationality} onValueChange={(v) => set({ contactNationality: v })}>
                          <SelectTrigger className="mt-1.5 w-full rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="colombiana">Colombiana</SelectItem>
                            <SelectItem value="argentina">Argentina</SelectItem>
                            <SelectItem value="chilena">Chilena</SelectItem>
                            <SelectItem value="mexicana">Mexicana</SelectItem>
                            <SelectItem value="española">Española</SelectItem>
                            <SelectItem value="estadounidense">Estadounidense</SelectItem>
                            <SelectItem value="venezolana">Venezolana</SelectItem>
                            <SelectItem value="peruana">Peruana</SelectItem>
                            <SelectItem value="otra">Otra</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="hcity">Ciudad de Residencia</Label>
                        <Input id="hcity" placeholder="Bogotá" className="mt-1.5 rounded-xl" value={form.contactCity} onChange={(e) => set({ contactCity: e.target.value })} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ─── Step 2: Guests ───────────────────────── */}
              {currentStep === 2 && (
                <motion.div key="hs2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <Card className="border-neutral-200 p-6">
                    <h2 className="text-lg font-semibold text-neutral-900">Detalle de Huéspedes</h2>
                    <p className="mt-1 text-sm text-neutral-500">Cantidad y edades de los huéspedes</p>
                    <div className="mt-6 space-y-6">
                      {/* Dates summary */}
                      <div className="rounded-xl bg-amber-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                          <CalendarDays className="size-4" />
                          Fechas de la Reserva
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div><span className="text-neutral-500">Check-in</span><p className="font-semibold text-neutral-900">{checkIn || '—'}</p></div>
                          <div><span className="text-neutral-500">Check-out</span><p className="font-semibold text-neutral-900">{checkOut || '—'}</p></div>
                          <div><span className="text-neutral-500">Noches</span><p className="font-semibold text-neutral-900">{nights}</p></div>
                        </div>
                      </div>

                      {/* Adults / Children */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-neutral-200 p-4">
                          <div className="flex items-center justify-between">
                            <div><span className="font-medium text-neutral-900">Adultos</span><p className="text-xs text-neutral-500">Mayores de 12 años</p></div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => set({ adults: Math.max(1, form.adults - 1) })} disabled={form.adults <= 1}><Minus className="size-3" /></Button>
                              <span className="w-8 text-center font-bold">{form.adults}</span>
                              <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => set({ adults: Math.min(room.maxGuests, form.adults + 1) })} disabled={form.adults >= room.maxGuests}><Plus className="size-3" /></Button>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-neutral-200 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5"><span className="font-medium text-neutral-900">Niños</span><Baby className="size-4 text-amber-500" /><p className="text-xs text-neutral-500">2-11 años</p></div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => set({ children: Math.max(0, form.children - 1) })} disabled={form.children <= 0}><Minus className="size-3" /></Button>
                              <span className="w-8 text-center font-bold">{form.children}</span>
                              <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => set({ children: Math.min(4, form.children + 1) })} disabled={form.children >= 4}><Plus className="size-3" /></Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {form.children > 0 && (
                        <div className="rounded-xl bg-amber-50 p-4">
                          <Label className="text-sm font-medium text-amber-800">Edad de los niños</Label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Array.from({ length: form.children }).map((_, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="text-xs text-neutral-600">Niño {i + 1}:</span>
                                <Select value={String(form.childrenAges[i] || '')} onValueChange={(v) => { const a = [...form.childrenAges]; a[i] = Number(v); set({ childrenAges: a }) }}>
                                  <SelectTrigger className="w-20 h-8 rounded-lg text-xs"><SelectValue placeholder="Edad" /></SelectTrigger>
                                  <SelectContent>{Array.from({ length: 10 }, (_, n) => n + 2).map((age) => (<SelectItem key={age} value={String(age)}>{age} años</SelectItem>))}</SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Special requests */}
                      <div>
                        <Label htmlFor="hreq">Peticiones Especiales</Label>
                        <Textarea id="hreq" placeholder="Habitación en piso alto, cama extra, cuna, alergias, hora de llegada estimada..." className="mt-1.5 rounded-xl" rows={3} value={form.specialRequests} onChange={(e) => set({ specialRequests: e.target.value })} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ─── Step 3: Payment ──────────────────────── */}
              {currentStep === 3 && (
                <motion.div key="hs3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="space-y-6">
                  {/* Extras */}
                  <Card className="border-neutral-200 p-6">
                    <h2 className="text-lg font-semibold text-neutral-900">Servicios Adicionales</h2>
                    <div className="mt-5 space-y-3">
                      <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${form.breakfastAdd ? 'border-amber-300 bg-amber-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                        <Checkbox checked={form.breakfastAdd} onCheckedChange={(c) => set({ breakfastAdd: c === true })} />
                        <div className="flex-1">
                          <span className="font-medium text-neutral-900 text-sm">Desayuno buffet adicional</span>
                          <p className="text-xs text-neutral-500">Para todos los huéspedes, todas las mañanas</p>
                        </div>
                        <span className="text-sm font-bold text-neutral-900 whitespace-nowrap">+${formatCOP(breakfastPrice)}/noche</span>
                      </label>
                      <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${form.lateCheckout ? 'border-amber-300 bg-amber-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                        <Checkbox checked={form.lateCheckout} onCheckedChange={(c) => set({ lateCheckout: c === true })} />
                        <div className="flex-1">
                          <span className="font-medium text-neutral-900 text-sm">Late Check-out (14:00)</span>
                          <p className="text-xs text-neutral-500">Extender la salida hasta las 2:00 PM</p>
                        </div>
                        <span className="text-sm font-bold text-neutral-900">+${formatCOP(lateCheckoutPrice)}</span>
                      </label>
                    </div>
                  </Card>

                  {/* Payment method */}
                  <Card className="border-neutral-200 p-6">
                    <h2 className="text-lg font-semibold text-neutral-900">Método de Pago</h2>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        { value: 'card', label: 'Tarjeta', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
                        { value: 'transfer', label: 'Transferencia', icon: Building2, desc: 'Bancolombia, Davivienda...' },
                        { value: 'cash', label: 'Efectivo', icon: Banknote, desc: 'Punto físico / Efecty' },
                      ].map((method) => (
                        <button key={method.value} onClick={() => set({ paymentMethod: method.value })} className={`rounded-xl border p-4 text-left transition-all ${form.paymentMethod === method.value ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200' : 'border-neutral-200 hover:border-neutral-300'}`}>
                          <method.icon className={`size-5 ${form.paymentMethod === method.value ? 'text-amber-600' : 'text-neutral-400'}`} />
                          <p className={`mt-2 text-sm font-semibold ${form.paymentMethod === method.value ? 'text-amber-700' : 'text-neutral-800'}`}>{method.label}</p>
                          <p className="text-xs text-neutral-500">{method.desc}</p>
                        </button>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ─── Step 4: Review ───────────────────────── */}
              {currentStep === 4 && (
                <motion.div key="hs4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <Card className="border-neutral-200 p-6">
                    <h2 className="text-lg font-semibold text-neutral-900">Revisar y Confirmar</h2>
                    <p className="mt-1 text-sm text-neutral-500">Verifica los datos de tu reserva</p>
                    <div className="mt-6 space-y-4">
                      <div className="rounded-xl bg-neutral-50 p-4">
                        <h3 className="text-sm font-semibold text-neutral-700">Huésped Principal</h3>
                        <div className="mt-2 grid gap-1.5 text-sm text-neutral-600 sm:grid-cols-2">
                          <p><span className="font-medium">Nombre:</span> {form.contactName || '—'}</p>
                          <p><span className="font-medium">Email:</span> {form.contactEmail || '—'}</p>
                          <p><span className="font-medium">Teléfono:</span> {form.contactPhone || '—'}</p>
                          <p><span className="font-medium">Documento:</span> {form.contactDocumentType} {form.contactDocumentNumber || '—'}</p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-neutral-50 p-4">
                        <h3 className="text-sm font-semibold text-neutral-700">Detalles de la Reserva</h3>
                        <div className="mt-2 grid gap-1.5 text-sm text-neutral-600 sm:grid-cols-2">
                          <p><span className="font-medium">Hotel:</span> {hotel.name}</p>
                          <p><span className="font-medium">Habitación:</span> {room.name}</p>
                          <p><span className="font-medium">Check-in:</span> {checkIn || '—'}</p>
                          <p><span className="font-medium">Check-out:</span> {checkOut || '—'}</p>
                          <p><span className="font-medium">Noches:</span> {nights}</p>
                          <p><span className="font-medium">Huéspedes:</span> {form.adults} adulto{form.adults !== 1 ? 's' : ''}{form.children > 0 ? `, ${form.children} niño${form.children !== 1 ? 's' : ''}` : ''}</p>
                          {form.childrenAges.length > 0 && <p className="sm:col-span-2"><span className="font-medium">Edades niños:</span> {form.childrenAges.map((a) => `${a} años`).join(', ')}</p>}
                          {form.specialRequests && <p className="sm:col-span-2"><span className="font-medium">Peticiones:</span> {form.specialRequests}</p>}
                        </div>
                      </div>

                      <div className="rounded-xl bg-amber-50 p-4">
                        <h3 className="text-sm font-semibold text-neutral-700">Resumen de Pago</h3>
                        <div className="mt-2 space-y-1.5 text-sm">
                          <div className="flex justify-between text-neutral-600"><span>{room.name} × {nights} noche{nights !== 1 ? 's' : ''}</span><span>${roomSubtotal.toLocaleString('es-CO')}</span></div>
                          {form.breakfastAdd && <div className="flex justify-between text-neutral-600"><span>Desayuno adicional</span><span>${(breakfastPrice * nights).toLocaleString('es-CO')}</span></div>}
                          {form.lateCheckout && <div className="flex justify-between text-neutral-600"><span>Late check-out</span><span>${lateCheckoutPrice.toLocaleString('es-CO')}</span></div>}
                          <Separator />
                          <div className="flex justify-between text-lg font-bold text-neutral-900"><span>Total</span><span>${total.toLocaleString('es-CO')}</span></div>
                          <p className="text-xs text-neutral-500">Método: {{ card: 'Tarjeta', transfer: 'Transferencia bancaria', cash: 'Efectivo' }[form.paymentMethod] || 'No seleccionado'}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4 cursor-pointer">
                          <Checkbox checked={form.acceptTerms} onCheckedChange={(c) => set({ acceptTerms: c === true })} className="mt-0.5" />
                          <span className="text-sm text-neutral-600 leading-relaxed">Acepto los <span className="font-medium text-amber-600">términos y condiciones</span> y la <span className="font-medium text-amber-600">política de cancelación</span> de WILROP Colombia Travel.</span>
                        </label>
                        <label className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4 cursor-pointer">
                          <Checkbox checked={form.acceptPrivacy} onCheckedChange={(c) => set({ acceptPrivacy: c === true })} className="mt-0.5" />
                          <span className="text-sm text-neutral-600 leading-relaxed">Autorizo el tratamiento de mis datos personales conforme a la <span className="font-medium text-amber-600">política de privacidad</span>.</span>
                        </label>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav */}
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} className="rounded-xl">
                <ArrowLeft className="mr-2 size-4" /> Anterior
              </Button>
              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)} className="rounded-xl bg-amber-500 text-white hover:bg-amber-600">
                  Siguiente <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button onClick={handleConfirm} disabled={!form.acceptTerms || !form.acceptPrivacy || isSubmitting} className="rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-neutral-300">
                  <CheckCircle2 className="mr-2 size-4" /> {isSubmitting ? 'Creando pedido...' : 'Confirmar Reserva'}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-neutral-200 p-0 overflow-hidden">
              <div className="relative h-40">
                <img src={hotel.images[0]} alt={hotel.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <div className="flex gap-0.5">{Array.from({ length: hotel.stars }).map((_, i) => <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />)}</div>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="font-semibold text-neutral-900">{hotel.name}</h3>
                <p className="mt-0.5 text-xs text-neutral-500 flex items-center gap-1"><MapPin className="size-3 text-amber-500" />{hotel.address}</p>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-500">Habitación</span><span className="font-medium text-right text-xs max-w-[150px] truncate">{room.name}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Precio / noche</span><span className="font-semibold">${room.price.toLocaleString('es-CO')}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">× {nights} noche{nights !== 1 ? 's' : ''}</span><span className="font-semibold">${roomSubtotal.toLocaleString('es-CO')}</span></div>
                  {extrasTotal > 0 && <div className="flex justify-between"><span className="text-neutral-500">Extras</span><span className="font-semibold text-amber-600">+${extrasTotal.toLocaleString('es-CO')}</span></div>}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-neutral-900"><span>Total</span><span>${total.toLocaleString('es-CO')}</span></div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-500"><Shield className="size-3.5 text-emerald-500" />Pago 100% seguro</div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500"><CreditCard className="size-3.5 text-emerald-500" />Cancelación gratuita 48h</div>
                </div>
                {room.includes.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Incluye</p>
                    <div className="mt-2 space-y-1">
                      {room.includes.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-xs text-neutral-600"><CheckCircle2 className="size-3 text-emerald-500" />{item}</div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

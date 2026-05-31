'use client'
import { formatCurrency } from '@/lib/currency'


import { useState, useMemo, useEffect } from 'react'
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
  CalendarDays,
  Anchor,
  Ship,
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

import { usePortalNavigation } from '@/hooks/use-portal-navigation'
import { toast } from 'sonner'

interface Cabin {
  id: string;
  name: string;
  capacity: number;
  beds: string;
  basePrice: number;
  originalPrice: number;
  includes: string[];
  cabinImage: string;
  active: boolean;
}

interface ItineraryStop {
  day: number;
  title: string;
  description: string;
  activity?: string;
}

interface Cruise {
  id: string;
  slug: string;
  name: string;
  description: string;
  shipName: string;
  operator: string;
  durationDays: number;
  images: string[];
  includes: string[];
  itinerary: ItineraryStop[];
  rating: number;
  reviewCount: number;
  priceFrom: number;
  tags: string[];
  featured: boolean;
  active: boolean;
  primaryDestinationId: string | null;
  cabins: Cabin[];
}

interface CruiseBookingFlowProps {
  cruise: Cruise
  cabinId: string
}

interface BookingFormPayload {
  contactName: string
  contactEmail: string
  contactPhone: string
  contactDocumentType: string
  contactDocumentNumber: string
  contactNationality: string
  contactCity: string
  departureDate: string
  adults: number
  children: number
  specialRequests: string
  paymentMethod: string
  acceptTerms: boolean
  acceptPrivacy: boolean
}

const steps = [
  { id: 1, label: 'Datos Personales', icon: User },
  { id: 2, label: 'Pasajeros y Fecha', icon: Users },
  { id: 3, label: 'Método de Pago', icon: CreditCard },
  { id: 4, label: 'Confirmación', icon: CheckCircle2 },
]

export default function CruiseBookingFlow({ cruise, cabinId }: CruiseBookingFlowProps) {
  const { navigate, goBack, openOrderDetail } = usePortalNavigation()
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingRef] = useState(() => 'WIL-CRU-' + Math.random().toString(36).substring(2, 8).toUpperCase())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cabin = useMemo(() => {
    return cruise.cabins.find(c => c.id === cabinId) || cruise.cabins[0]
  }, [cruise, cabinId])

  // Get tomorrow's date for default departure date
  const tomorrowStr = useMemo(() => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split('T')[0]
  }, [])

  const [form, setForm] = useState<BookingFormPayload>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactDocumentType: 'CC',
    contactDocumentNumber: '',
    contactNationality: 'colombiana',
    contactCity: '',
    departureDate: tomorrowStr,
    adults: 2,
    children: 0,
    specialRequests: '',
    paymentMethod: 'card',
    acceptTerms: false,
    acceptPrivacy: false,
  })

  // Calculate return date based on duration
  const returnDate = useMemo(() => {
    if (!form.departureDate) return ''
    const d = new Date(form.departureDate + 'T00:00:00')
    d.setDate(d.getDate() + (cruise.durationDays - 1))
    return d.toISOString().split('T')[0]
  }, [form.departureDate, cruise.durationDays])

  // Pricing: Price is per cabin, but let's assume cabin base price is per person double occupancy.
  // Standard pricing formula: (Adults * basePrice)
  const subtotal = useMemo(() => {
    if (!cabin) return 0
    return cabin.basePrice * form.adults
  }, [cabin, form.adults])

  const total = subtotal

  const updateForm = (partial: Partial<BookingFormPayload>) => {
    setForm(prev => ({ ...prev, ...partial }))
  }

  const handleConfirm = async () => {
    if (!cabin) return

    setIsSubmitting(true)
    try {
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
          notes: form.specialRequests,
          totalPrice: total,
          checkIn: form.departureDate,
          checkOut: returnDate,
          items: [
            {
              itemType: 'cruise',
              serviceId: cruise.id,
              serviceName: `${cruise.name} - Barco ${cruise.shipName}`,
              roomTypeId: cabin.id,
              roomName: cabin.name,
              dateFrom: form.departureDate,
              dateTo: returnDate,
              quantity: 1, // 1 cabin
              unitPrice: cabin.basePrice,
              totalPrice: subtotal,
            },
          ],
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'No se pudo crear la reserva de crucero')
      }

      toast.success(`Reserva ${result.data.code} creada con éxito`)
      openOrderDetail(result.data.code)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear la reserva del crucero'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!cabin) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-lg text-neutral-500">Cabina no encontrada</p>
          <Button onClick={() => navigate('portal-cruises')} variant="outline" className="mt-4 rounded-xl">Volver a Cruceros</Button>
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
            <ArrowLeft className="mr-2 size-4" /> Volver al Crucero
          </Button>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Reservar Camarote en Crucero</h1>
          <p className="mt-1 text-sm text-neutral-500">Ref de reserva: <span className="font-mono font-semibold text-sky-600">{bookingRef}</span></p>
        </div>

        {/* Progress bar */}
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
          {/* Form Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <Card className="border-neutral-200 p-6">
                    <h2 className="text-lg font-semibold text-neutral-900">Datos de Contacto del Pasajero</h2>
                    <p className="mt-1 text-sm text-neutral-500">Información del titular de la reserva</p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label htmlFor="cname">Nombre Completo *</Label>
                        <Input id="cname" placeholder="María García López" className="mt-1.5 rounded-xl" value={form.contactName} onChange={(e) => updateForm({ contactName: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="cemail">Correo Electrónico *</Label>
                        <Input id="cemail" type="email" placeholder="maria@ejemplo.com" className="mt-1.5 rounded-xl" value={form.contactEmail} onChange={(e) => updateForm({ contactEmail: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="cphone">Teléfono / WhatsApp *</Label>
                        <Input id="cphone" placeholder="+57 300 123 4567" className="mt-1.5 rounded-xl" value={form.contactPhone} onChange={(e) => updateForm({ contactPhone: e.target.value })} />
                      </div>
                      <div>
                        <Label>Tipo de Documento *</Label>
                        <Select value={form.contactDocumentType} onValueChange={(v) => updateForm({ contactDocumentType: v })}>
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
                        <Label htmlFor="cdoc">Número de Documento *</Label>
                        <Input id="cdoc" placeholder="1234567890" className="mt-1.5 rounded-xl" value={form.contactDocumentNumber} onChange={(e) => updateForm({ contactDocumentNumber: e.target.value })} />
                      </div>
                      <div>
                        <Label>Nacionalidad</Label>
                        <Select value={form.contactNationality} onValueChange={(v) => updateForm({ contactNationality: v })}>
                          <SelectTrigger className="mt-1.5 w-full rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="colombiana">Colombiana</SelectItem>
                            <SelectItem value="argentina">Argentina</SelectItem>
                            <SelectItem value="chilena">Chilena</SelectItem>
                            <SelectItem value="mexicana">Mexicana</SelectItem>
                            <SelectItem value="española">Española</SelectItem>
                            <SelectItem value="estadounidense">Estadounidense</SelectItem>
                            <SelectItem value="otra">Otra</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="ccity">Ciudad de Origen</Label>
                        <Input id="ccity" placeholder="Cartagena" className="mt-1.5 rounded-xl" value={form.contactCity} onChange={(e) => updateForm({ contactCity: e.target.value })} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Passengers and Date */}
              {currentStep === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <Card className="border-neutral-200 p-6 space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900">Fecha de Zarpe e Integrantes</h2>
                      <p className="mt-1 text-sm text-neutral-500">Selecciona el día de salida y cantidad de pasajeros</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="departureDate">Fecha de Salida (Zarpe) *</Label>
                      <Input
                        id="departureDate"
                        type="date"
                        min={tomorrowStr}
                        className="rounded-xl mt-1"
                        value={form.departureDate}
                        onChange={(e) => updateForm({ departureDate: e.target.value })}
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">El crucero dura {cruise.durationDays} días. Regreso estimado: <span className="font-semibold text-neutral-800">{returnDate}</span>.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-neutral-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-neutral-900">Adultos</span>
                            <p className="text-xs text-neutral-500">A partir de 12 años</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 rounded-lg"
                              onClick={() => updateForm({ adults: Math.max(1, form.adults - 1) })}
                              disabled={form.adults <= 1}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-8 text-center font-bold">{form.adults}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 rounded-lg"
                              onClick={() => updateForm({ adults: Math.min(cabin.capacity, form.adults + 1) })}
                              disabled={form.adults >= cabin.capacity}
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-neutral-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-neutral-900">Niños</span>
                            <p className="text-xs text-neutral-500">2-11 años</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 rounded-lg"
                              onClick={() => updateForm({ children: Math.max(0, form.children - 1) })}
                              disabled={form.children <= 0}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-8 text-center font-bold">{form.children}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 rounded-lg"
                              onClick={() => updateForm({ children: Math.min(2, form.children + 1) })}
                              disabled={form.children >= 2}
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sreq">Peticiones Especiales o Comentarios</Label>
                      <Textarea
                        id="sreq"
                        placeholder="Restricciones alimenticias, requerimientos de accesibilidad, celebración especial..."
                        className="mt-1.5 rounded-xl"
                        rows={3}
                        value={form.specialRequests}
                        onChange={(e) => updateForm({ specialRequests: e.target.value })}
                      />
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="space-y-6">
                  <Card className="border-neutral-200 p-6">
                    <h2 className="text-lg font-semibold text-neutral-900">Método de Pago</h2>
                    <p className="mt-1 text-sm text-neutral-500">Selecciona tu opción preferida para garantizar tu cabina</p>
                    
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        { value: 'card', label: 'Tarjeta', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
                        { value: 'transfer', label: 'Transferencia', icon: Building2, desc: 'Bancolombia, Davivienda...' },
                        { value: 'cash', label: 'Efectivo', icon: Banknote, desc: 'Corresponsales / Efecty' },
                      ].map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => updateForm({ paymentMethod: method.value })}
                          className={`rounded-xl border p-4 text-left transition-all ${
                            form.paymentMethod === method.value
                              ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <method.icon className={`size-5 ${form.paymentMethod === method.value ? 'text-sky-600' : 'text-neutral-400'}`} />
                          <p className={`mt-2 text-sm font-semibold ${form.paymentMethod === method.value ? 'text-sky-700' : 'text-neutral-800'}`}>{method.label}</p>
                          <p className="text-xs text-neutral-500">{method.desc}</p>
                        </button>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Confirmation / Review */}
              {currentStep === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <Card className="border-neutral-200 p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-neutral-900">Revisar y Confirmar</h2>
                    <p className="mt-1 text-sm text-neutral-500">Verifica los datos de tu reserva de crucero antes de proceder</p>
                    
                    <div className="rounded-xl bg-neutral-50 p-4 space-y-2 text-sm text-neutral-600">
                      <h3 className="font-semibold text-neutral-700 text-xs uppercase tracking-wider">Titular de Reserva</h3>
                      <p><span className="font-medium text-neutral-800">Nombre:</span> {form.contactName}</p>
                      <p><span className="font-medium text-neutral-800">Email:</span> {form.contactEmail}</p>
                      <p><span className="font-medium text-neutral-800">Teléfono:</span> {form.contactPhone}</p>
                      <p><span className="font-medium text-neutral-800">Documento:</span> {form.contactDocumentType} {form.contactDocumentNumber}</p>
                    </div>

                    <div className="rounded-xl bg-neutral-50 p-4 space-y-2 text-sm text-neutral-600">
                      <h3 className="font-semibold text-neutral-700 text-xs uppercase tracking-wider">Detalles de Itinerario</h3>
                      <p><span className="font-medium text-neutral-800">Crucero:</span> {cruise.name}</p>
                      <p><span className="font-medium text-neutral-800">Barco:</span> {cruise.shipName} ({cruise.operator})</p>
                      <p><span className="font-medium text-neutral-800">Cabina reservada:</span> {cabin.name} (Max {cabin.capacity} pax)</p>
                      <p><span className="font-medium text-neutral-800">Fecha zarpe:</span> {form.departureDate}</p>
                      <p><span className="font-medium text-neutral-800">Fecha retorno:</span> {returnDate}</p>
                      <p><span className="font-medium text-neutral-800">Pasajeros:</span> {form.adults} Adulto{form.adults > 1 ? 's' : ''} {form.children > 0 ? `y ${form.children} Niño(s)` : ''}</p>
                      {form.specialRequests && <p><span className="font-medium text-neutral-800">Peticiones:</span> {form.specialRequests}</p>}
                    </div>

                    <div className="rounded-xl bg-sky-50 p-4 space-y-2 text-sm text-neutral-600">
                      <h3 className="font-semibold text-neutral-700 text-xs uppercase tracking-wider">Resumen de Liquidación</h3>
                      <div className="flex justify-between font-medium">
                        <span>Base Camarote ({cabin.name} × {form.adults} Pax)</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-neutral-900 text-base">
                        <span>Total Liquidado</span>
                        <span className="text-sky-800">{formatCurrency(total)}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400">Método de pago seleccionado: {{ card: 'Tarjeta', transfer: 'Transferencia bancaria', cash: 'Efectivo' }[form.paymentMethod]}</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4 cursor-pointer">
                        <Checkbox checked={form.acceptTerms} onCheckedChange={(c) => updateForm({ acceptTerms: c === true })} className="mt-0.5" />
                        <span className="text-xs text-neutral-600 leading-relaxed">Acepto los <span className="font-medium text-sky-600">términos y condiciones de abordo</span> y la política de cancelación de WILROP Colombia Travel.</span>
                      </label>
                      <label className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4 cursor-pointer">
                        <Checkbox checked={form.acceptPrivacy} onCheckedChange={(c) => updateForm({ acceptPrivacy: c === true })} className="mt-0.5" />
                        <span className="text-xs text-neutral-600 leading-relaxed">Autorizo el tratamiento de mis datos personales para la reserva y facturación del viaje.</span>
                      </label>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wizard Navigation */}
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1 || isSubmitting}
                className="rounded-xl"
              >
                <ArrowLeft className="mr-2 size-4" /> Anterior
              </Button>
              {currentStep < 4 ? (
                <Button
                  onClick={() => {
                    if (currentStep === 1 && (!form.contactName || !form.contactEmail || !form.contactPhone || !form.contactDocumentNumber)) {
                      toast.error('Complete todos los campos obligatorios del titular')
                      return
                    }
                    if (currentStep === 2 && !form.departureDate) {
                      toast.error('Seleccione una fecha de zarpe válida')
                      return
                    }
                    setCurrentStep(currentStep + 1)
                  }}
                  className="rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                >
                  Siguiente <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleConfirm}
                  disabled={!form.acceptTerms || !form.acceptPrivacy || isSubmitting}
                  className="rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-neutral-300"
                >
                  <CheckCircle2 className="mr-2 size-4" /> {isSubmitting ? 'Registrando Reserva...' : 'Confirmar y Reservar'}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar Invoice summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-neutral-200 p-0 overflow-hidden rounded-2xl shadow-sm">
              <div className="relative h-32">
                <img
                  src={cruise.images && cruise.images[0] ? cruise.images[0] : "/images/cruceros.png"}
                  alt={cruise.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
                  <Anchor className="size-4.5 text-sky-300" />
                  <span className="text-xs font-bold">{cruise.shipName}</span>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-neutral-900 text-sm leading-snug">{cruise.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Operado por {cruise.operator}</p>
                <Separator className="my-4" />
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Categoría</span>
                    <span className="font-semibold text-neutral-800">{cabin.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Zarpe</span>
                    <span className="font-semibold text-neutral-800">{form.departureDate || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Retorno</span>
                    <span className="font-semibold text-neutral-800">{returnDate || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Pasajeros</span>
                    <span className="font-semibold text-neutral-800">{form.adults} Adulto(s) {form.children > 0 ? `, ${form.children} Niño(s)` : ''}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-neutral-900 font-semibold">
                    <span>Base Camarote</span>
                    <span>{formatCurrency(cabin.basePrice)} × {form.adults}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-extrabold text-sky-800 pt-1">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500"><Shield className="size-3.5 text-emerald-500" />Reserva Segura SSL</div>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500"><CalendarDays className="size-3.5 text-emerald-500" />Cancelación flexible abordo</div>
                </div>

                {cabin.includes.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Incluye Camarote</p>
                    <div className="mt-2 space-y-1">
                      {cabin.includes.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-600">
                          <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
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

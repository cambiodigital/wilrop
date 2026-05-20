'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  MapPin,
  Clock,
  Users,
  CreditCard,
  Shield,
  Banknote,
  Building2,
  Trash2,
  Baby,
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
import { packages } from '@/data/packages'
import { useNavigationStore } from '@/store/useNavigationStore'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'
import { toast } from 'sonner'
import { getAddon, calculateExtrasTotal } from '@/lib/extras-pricing'

// ─── Types for API-ready payload ───────────────────────────────
interface GuestInfo {
  fullName: string
  documentType: string
  documentNumber: string
  birthdate: string
}

interface BookingPayload {
  // Personal
  contactName: string
  contactEmail: string
  contactPhone: string
  contactDocumentType: string
  contactDocumentNumber: string
  contactNationality: string
  contactCity: string
  // Travel
  departureDate: string
  adults: number
  children: number
  childrenAges: number[]
  guests: GuestInfo[]
  specialRequests: string
  // Payment
  paymentMethod: string
  // Extras
  travelInsurance: boolean
  airportTransfer: boolean
  photoPackage: boolean
  // Terms
  acceptTerms: boolean
  acceptPrivacy: boolean
}

const initialPayload: BookingPayload = {
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  contactDocumentType: 'CC',
  contactDocumentNumber: '',
  contactNationality: 'colombiana',
  contactCity: '',
  departureDate: '',
  adults: 2,
  children: 0,
  childrenAges: [],
  guests: [],
  specialRequests: '',
  paymentMethod: '',
  travelInsurance: false,
  airportTransfer: false,
  photoPackage: false,
  acceptTerms: false,
  acceptPrivacy: false,
}

const steps = [
  { id: 1, label: 'Datos Personales', icon: User },
  { id: 2, label: 'Viajeros', icon: Users },
  { id: 3, label: 'Pago', icon: CreditCard },
  { id: 4, label: 'Confirmación', icon: CheckCircle2 },
]

interface BookingFlowProps {
  packageId?: string
  pkg?: any
}

export default function BookingFlow({ packageId, pkg: initialPkg }: BookingFlowProps) {
  const selectedPackageId = useNavigationStore((state) => state.selectedPackageId)
  const { navigate, openOrderDetail } = usePortalNavigation()
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingRef] = useState(() => 'WIL-PKG-' + Math.random().toString(36).substring(2, 8).toUpperCase())
  const [form, setForm] = useState<BookingPayload>({ ...initialPayload })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pkg = useMemo(
    () => initialPkg || packages.find((p) => p.id === (packageId ?? selectedPackageId)),
    [initialPkg, packageId, selectedPackageId],
  )
  const totalGuests = form.adults + form.children

  const extrasTotal = calculateExtrasTotal([
    ...(form.travelInsurance ? ['travel-insurance'] as const : []),
    ...(form.airportTransfer ? ['airport-transfer'] as const : []),
    ...(form.photoPackage ? ['photo-package'] as const : []),
  ])
  const subtotal = pkg ? pkg.price * totalGuests : 0
  const total = subtotal + extrasTotal

  // Sync guest list when adults/children change
  const syncGuestList = useCallback((newAdults: number, newChildren: number) => {
    const target = newAdults + newChildren
    setForm((prev) => {
      const current = prev.guests.length
      if (target > current) {
        const newGuests = [...prev.guests]
        for (let i = newGuests.length; i < target; i++) {
          newGuests.push({ fullName: '', documentType: 'CC', documentNumber: '', birthdate: '' })
        }
        return { ...prev, guests: newGuests }
      } else if (target < current) {
        return { ...prev, guests: prev.guests.slice(0, target) }
      }
      return prev
    })
  }, [])

  const updateGuest = (index: number, field: keyof GuestInfo, value: string) => {
    setForm((prev) => {
      const guests = [...prev.guests]
      guests[index] = { ...guests[index], [field]: value }
      return { ...prev, guests }
    })
  }

  const handleConfirm = async () => {
    if (!pkg) return

    setIsSubmitting(true)

    try {
      const addons = [
        form.travelInsurance ? { type: 'travel-insurance', price: getAddon('travel-insurance')?.price ?? 0 } : null,
        form.airportTransfer ? { type: 'airport-transfer', price: getAddon('airport-transfer')?.price ?? 0 } : null,
        form.photoPackage ? { type: 'photo-package', price: getAddon('photo-package')?.price ?? 0 } : null,
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
          checkIn: form.departureDate,
          items: [
            {
              itemType: 'package',
              serviceId: pkg.id,
              serviceName: pkg.title,
              dateFrom: form.departureDate,
              quantity: totalGuests,
              unitPrice: pkg.price,
              totalPrice: subtotal,
              addons,
            },
          ],
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'No se pudo crear la reserva')
      }

      toast.success(`Reserva ${result.data.code} creada correctamente`)
      openOrderDetail(result.data.code)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear la reserva'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!pkg) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-lg text-neutral-500">Paquete no encontrado</p>
          <Button onClick={() => navigate('portal-destinations')} variant="outline" className="mt-4 rounded-xl">Volver a Destinos</Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const set = (partial: Partial<BookingPayload>) => setForm((prev) => ({ ...prev, ...partial }))

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('portal-package-detail', pkg.id)} className="mb-4 text-neutral-500 hover:text-neutral-700">
            <ArrowLeft className="mr-2 size-4" /> Volver al Paquete
          </Button>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Completar Reserva</h1>
          <p className="mt-1 text-sm text-neutral-500">Ref: <span className="font-mono font-semibold text-amber-600">{bookingRef}</span></p>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    currentStep > step.id ? 'bg-emerald-500 text-white' : currentStep === step.id ? 'bg-amber-500 text-white' : 'bg-neutral-200 text-neutral-500'
                  }`}>
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
              {/* ─── Step 1: Personal Data ─────────────────── */}
              {currentStep === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <Card className="border-neutral-200 p-6">
                    <h2 className="text-lg font-semibold text-neutral-900">Datos del Contacto Principal</h2>
                    <p className="mt-1 text-sm text-neutral-500">Información de quien realiza la reserva</p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label htmlFor="cname">Nombre Completo *</Label>
                        <Input id="cname" placeholder="María García López" className="mt-1.5 rounded-xl" value={form.contactName} onChange={(e) => set({ contactName: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="cemail">Correo Electrónico *</Label>
                        <Input id="cemail" type="email" placeholder="maria@ejemplo.com" className="mt-1.5 rounded-xl" value={form.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="cphone">Teléfono / WhatsApp *</Label>
                        <Input id="cphone" placeholder="+57 300 123 4567" className="mt-1.5 rounded-xl" value={form.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
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
                        <Label htmlFor="cdoc">Número de Documento *</Label>
                        <Input id="cdoc" placeholder="1234567890" className="mt-1.5 rounded-xl" value={form.contactDocumentNumber} onChange={(e) => set({ contactDocumentNumber: e.target.value })} />
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
                        <Label htmlFor="ccity">Ciudad de Residencia</Label>
                        <Input id="ccity" placeholder="Bogotá" className="mt-1.5 rounded-xl" value={form.contactCity} onChange={(e) => set({ contactCity: e.target.value })} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ─── Step 2: Travelers ─────────────────────── */}
              {currentStep === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <Card className="border-neutral-200 p-6">
                    <h2 className="text-lg font-semibold text-neutral-900">Detalle de Viajeros</h2>
                    <p className="mt-1 text-sm text-neutral-500">Fecha, cantidad y datos de cada viajero</p>

                    <div className="mt-6 space-y-6">
                      {/* Date */}
                      <div>
                        <Label>Fecha de Salida *</Label>
                        <Select value={form.departureDate} onValueChange={(v) => set({ departureDate: v })}>
                          <SelectTrigger className="mt-1.5 w-full rounded-xl"><SelectValue placeholder="Selecciona una fecha" /></SelectTrigger>
                          <SelectContent>
                            {pkg.departureDates.map((date, i) => (
                              <SelectItem key={i} value={date}>{formatDate(date)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Adults / Children */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-neutral-200 p-4">
                          <div className="flex items-center justify-between">
                            <div><span className="font-medium text-neutral-900">Adultos</span><p className="text-xs text-neutral-500">Mayores de 12 años</p></div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => { set({ adults: Math.max(1, form.adults - 1) }); syncGuestList(Math.max(1, form.adults - 1), form.children) }} disabled={form.adults <= 1}><Minus className="size-3" /></Button>
                              <span className="w-8 text-center font-bold">{form.adults}</span>
                              <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => { set({ adults: Math.min(12, form.adults + 1) }); syncGuestList(Math.min(12, form.adults + 1), form.children) }} disabled={form.adults >= 12}><Plus className="size-3" /></Button>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-neutral-200 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5"><span className="font-medium text-neutral-900">Niños</span><Baby className="size-4 text-amber-500" /><p className="text-xs text-neutral-500">2-11 años</p></div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => { set({ children: Math.max(0, form.children - 1) }); syncGuestList(form.adults, Math.max(0, form.children - 1)) }} disabled={form.children <= 0}><Minus className="size-3" /></Button>
                              <span className="w-8 text-center font-bold">{form.children}</span>
                              <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => { set({ children: Math.min(6, form.children + 1) }); syncGuestList(form.adults, Math.min(6, form.children + 1)) }} disabled={form.children >= 6}><Plus className="size-3" /></Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Children ages */}
                      {form.children > 0 && (
                        <div className="rounded-xl bg-amber-50 p-4">
                          <Label className="text-sm font-medium text-amber-800">Edad de los niños</Label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Array.from({ length: form.children }).map((_, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="text-xs text-neutral-600">Niño {i + 1}:</span>
                                <Select value={String(form.childrenAges[i] || '')} onValueChange={(v) => {
                                  const ages = [...form.childrenAges]; ages[i] = Number(v); set({ childrenAges: ages })
                                }}>
                                  <SelectTrigger className="w-20 h-8 rounded-lg text-xs"><SelectValue placeholder="Edad" /></SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 10 }, (_, a) => a + 2).map((age) => (
                                      <SelectItem key={age} value={String(age)}>{age} años</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Guest list */}
                      <div>
                        <Label className="text-sm font-medium text-neutral-900">Datos de cada viajero</Label>
                        <p className="text-xs text-neutral-500">Completa al menos el nombre del contacto principal</p>
                        <div className="mt-3 space-y-3">
                          {form.guests.map((guest, idx) => (
                            <div key={idx} className="rounded-xl border border-neutral-200 p-3 sm:p-4">
                              <p className="mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                {idx < form.adults ? `Adulto ${idx + 1}` : `Niño ${idx - form.adults + 1}`}
                                {idx === 0 && <Badge className="ml-2 bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0">Contacto</Badge>}
                              </p>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                  <Input placeholder="Nombre completo" className="rounded-lg text-sm" value={guest.fullName} onChange={(e) => updateGuest(idx, 'fullName', e.target.value)} />
                                </div>
                                <Select value={guest.documentType} onValueChange={(v) => updateGuest(idx, 'documentType', v)}>
                                  <SelectTrigger className="rounded-lg text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="CC">CC</SelectItem>
                                    <SelectItem value="CE">CE</SelectItem>
                                    <SelectItem value="PP">Pasaporte</SelectItem>
                                    <SelectItem value="TI">TI</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input placeholder="Número documento" className="rounded-lg text-sm" value={guest.documentNumber} onChange={(e) => updateGuest(idx, 'documentNumber', e.target.value)} />
                                <div className="sm:col-span-2">
                                  <Label className="text-xs">Fecha de nacimiento</Label>
                                  <Input type="date" className="mt-1 rounded-lg text-sm" value={guest.birthdate} onChange={(e) => updateGuest(idx, 'birthdate', e.target.value)} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Special requests */}
                      <div>
                        <Label htmlFor="sreq">Peticiones Especiales</Label>
                        <Textarea id="sreq" placeholder="Alergias, dieta, cumpleaños, requerimientos de accesibilidad..." className="mt-1.5 rounded-xl" rows={3} value={form.specialRequests} onChange={(e) => set({ specialRequests: e.target.value })} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ─── Step 3: Payment ─────────────────────── */}
              {currentStep === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="space-y-6">
                  {/* Extras */}
                  <Card className="border-neutral-200 p-6">
                    <h2 className="text-lg font-semibold text-neutral-900">Servicios Adicionales</h2>
                    <p className="mt-1 text-sm text-neutral-500">Añade extras a tu reserva</p>
                    <div className="mt-5 space-y-3">
                      {[
                        { key: 'travelInsurance' as const, ...getAddon('travel-insurance')!, icon: Shield },
                        { key: 'airportTransfer' as const, ...getAddon('airport-transfer')!, icon: Building2 },
                        { key: 'photoPackage' as const, ...getAddon('photo-package')!, icon: CreditCard },
                      ].map((extra) => (
                        <label key={extra.key} className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${form[extra.key] ? 'border-amber-300 bg-amber-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                          <Checkbox checked={form[extra.key]} onCheckedChange={(c) => set({ [extra.key]: c === true })} className="mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <extra.icon className="size-4 text-amber-500" />
                              <span className="font-medium text-neutral-900 text-sm">{extra.name}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-neutral-500">{extra.description}</p>
                          </div>
                          <span className="text-sm font-bold text-neutral-900">+${extra.price.toLocaleString('es-CO')}</span>
                        </label>
                      ))}
                    </div>
                  </Card>

                  {/* Payment Method */}
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

              {/* ─── Step 4: Confirmation ─────────────────── */}
              {currentStep === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <Card className="border-neutral-200 p-6">
                    <h2 className="text-lg font-semibold text-neutral-900">Revisar y Confirmar</h2>
                    <p className="mt-1 text-sm text-neutral-500">Verifica que todo esté correcto antes de confirmar</p>

                    <div className="mt-6 space-y-4">
                      {/* Contact */}
                      <div className="rounded-xl bg-neutral-50 p-4">
                        <h3 className="text-sm font-semibold text-neutral-700">Contacto Principal</h3>
                        <div className="mt-2 grid gap-1.5 text-sm text-neutral-600 sm:grid-cols-2">
                          <p><span className="font-medium">Nombre:</span> {form.contactName || '—'}</p>
                          <p><span className="font-medium">Email:</span> {form.contactEmail || '—'}</p>
                          <p><span className="font-medium">Teléfono:</span> {form.contactPhone || '—'}</p>
                          <p><span className="font-medium">Documento:</span> {form.contactDocumentType} {form.contactDocumentNumber || '—'}</p>
                          <p><span className="font-medium">Ciudad:</span> {form.contactCity || '—'}</p>
                        </div>
                      </div>

                      {/* Travelers */}
                      <div className="rounded-xl bg-neutral-50 p-4">
                        <h3 className="text-sm font-semibold text-neutral-700">Viajeros</h3>
                        <div className="mt-2 space-y-1.5 text-sm text-neutral-600">
                          <p><span className="font-medium">Fecha:</span> {form.departureDate ? formatDate(form.departureDate) : '—'}</p>
                          <p><span className="font-medium">Grupo:</span> {form.adults} adulto{form.adults !== 1 ? 's' : ''}{form.children > 0 ? `, ${form.children} niño${form.children !== 1 ? 's' : ''}` : ''}</p>
                          {form.childrenAges.length > 0 && <p><span className="font-medium">Edades niños:</span> {form.childrenAges.map((a) => `${a} años`).join(', ')}</p>}
                          {form.guests.filter((g) => g.fullName).map((g, i) => (
                            <p key={i}><span className="font-medium">Viajero {i + 1}:</span> {g.fullName} ({g.documentType}: {g.documentNumber || '—'})</p>
                          ))}
                          {form.specialRequests && <p><span className="font-medium">Peticiones:</span> {form.specialRequests}</p>}
                        </div>
                      </div>

                      {/* Price breakdown */}
                      <div className="rounded-xl bg-amber-50 p-4">
                        <h3 className="text-sm font-semibold text-neutral-700">Resumen de Pago</h3>
                        <div className="mt-2 space-y-1.5 text-sm">
                          <div className="flex justify-between text-neutral-600"><span>Paquete × {totalGuests} viajeros</span><span>${subtotal.toLocaleString('es-CO')}</span></div>
                          {form.travelInsurance && <div className="flex justify-between text-neutral-600"><span>{getAddon('travel-insurance')?.name}</span><span>${getAddon('travel-insurance')?.price.toLocaleString('es-CO')}</span></div>}
                          {form.airportTransfer && <div className="flex justify-between text-neutral-600"><span>{getAddon('airport-transfer')?.name}</span><span>${getAddon('airport-transfer')?.price.toLocaleString('es-CO')}</span></div>}
                          {form.photoPackage && <div className="flex justify-between text-neutral-600"><span>{getAddon('photo-package')?.name}</span><span>${getAddon('photo-package')?.price.toLocaleString('es-CO')}</span></div>}
                          <Separator />
                          <div className="flex justify-between text-lg font-bold text-neutral-900"><span>Total</span><span>${total.toLocaleString('es-CO')}</span></div>
                          <p className="text-xs text-neutral-500">Método de pago: {{ card: 'Tarjeta de crédito/débito', transfer: 'Transferencia bancaria', cash: 'Efectivo' }[form.paymentMethod] || 'No seleccionado'}</p>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4 cursor-pointer">
                          <Checkbox checked={form.acceptTerms} onCheckedChange={(c) => set({ acceptTerms: c === true })} className="mt-0.5" />
                          <span className="text-sm text-neutral-600 leading-relaxed">
                            Acepto los <span className="font-medium text-amber-600">términos y condiciones</span> y la <span className="font-medium text-amber-600">política de cancelación</span> de WILROP Colombia Travel.
                          </span>
                        </label>
                        <label className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4 cursor-pointer">
                          <Checkbox checked={form.acceptPrivacy} onCheckedChange={(c) => set({ acceptPrivacy: c === true })} className="mt-0.5" />
                          <span className="text-sm text-neutral-600 leading-relaxed">
                            Autorizo el tratamiento de mis datos personales conforme a la <span className="font-medium text-amber-600">política de privacidad</span>.
                          </span>
                        </label>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
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
                <img src={pkg.image} alt={pkg.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <CardContent className="p-5">
                <h3 className="font-semibold text-neutral-900">{pkg.title}</h3>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1"><MapPin className="size-3 text-amber-500" />{pkg.destinationName}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3 text-amber-500" />{pkg.duration}</span>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-500">Precio / persona</span><span className="font-semibold">${pkg.price.toLocaleString('es-CO')}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">× {totalGuests} viajeros</span><span className="font-semibold">${subtotal.toLocaleString('es-CO')}</span></div>
                  {extrasTotal > 0 && <div className="flex justify-between"><span className="text-neutral-500">Extras</span><span className="font-semibold text-amber-600">+${extrasTotal.toLocaleString('es-CO')}</span></div>}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-neutral-900"><span>Total</span><span>${total.toLocaleString('es-CO')}</span></div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-500"><Shield className="size-3.5 text-emerald-500" />Pago 100% seguro</div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500"><CreditCard className="size-3.5 text-emerald-500" />Cancelación gratuita 48h</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

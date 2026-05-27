'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Ship,
  Clock,
  MapPin,
  Star,
  Anchor,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Info,
  ChevronDown,
  ArrowRight,
  Users,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCOP } from '@/data/packages'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'

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
  destinations: string[];
}

interface CruiseDetailPageProps {
  cruise: Cruise
}

export default function CruiseDetailPage({ cruise }: CruiseDetailPageProps) {
  const { navigate } = usePortalNavigation()
  const [activeImage, setActiveImage] = useState(cruise.images[0] || '/images/cruceros.png')
  const [expandedStop, setExpandedStop] = useState<number | null>(1)

  const handleBooking = (cabinId: string) => {
    // Navigate to booking page with cabinId in search params
    navigate(`/cruceros/${cruise.slug}/reserva?cabinId=${cabinId}`)
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Detail Header / Hero Section */}
      <div className="relative h-[55vh] w-full overflow-hidden bg-slate-950">
        <img
          src={activeImage}
          alt={cruise.name}
          className="h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />
        
        {/* Float tags */}
        <div className="absolute bottom-6 left-0 right-0 z-20">
          <div className="mx-auto max-w-5xl px-5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-sky-500/20 text-sky-200 border-sky-400/20 text-xs font-semibold">
                <Ship className="mr-1 size-3" />
                {cruise.operator}
              </Badge>
              {cruise.featured && (
                <Badge className="bg-amber-500 text-white border-transparent text-xs font-semibold">
                  Recomendado
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl tracking-tight">
              {cruise.name}
            </h1>
            <p className="mt-3 text-sky-100/90 text-sm sm:text-base flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1">
                <Anchor className="size-4 text-sky-400" />
                Barco: <span className="font-semibold text-white">{cruise.shipName}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-4 text-sky-400" />
                {cruise.durationDays} días / {cruise.durationDays - 1} noches
              </span>
              {cruise.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {cruise.rating} ({cruise.reviewCount} opiniones)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mx-auto max-w-5xl px-5 pt-8 sm:px-6">
        {/* Thumbnails Gallery */}
        {cruise.images && cruise.images.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-thin">
            {cruise.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  activeImage === img ? 'border-sky-500 scale-103 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Left Column: Description, Itinerary, Cabins */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card className="rounded-2xl border-neutral-200/60 shadow-xs bg-white">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-neutral-900">Resumen del Viaje</h2>
                <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {cruise.description}
                </p>

                {cruise.tags && cruise.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {cruise.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* General Inclusions */}
            <Card className="rounded-2xl border-neutral-200/60 shadow-xs bg-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">¿Qué incluye esta experiencia a bordo?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cruise.includes && cruise.includes.length > 0 ? (
                    cruise.includes.map((inc, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-neutral-600">
                        <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start gap-2 text-sm text-neutral-600">
                        <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Pensión completa (Desayunos, almuerzos y cenas)</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-neutral-600">
                        <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Bebidas ilimitadas básicas</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-neutral-600">
                        <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Acceso a piscinas, jacuzzis y áreas deportivas</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-neutral-600">
                        <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Shows musicales y entretenimiento en vivo</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Itinerary */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Itinerario Día por Día</h2>
              {cruise.itinerary && cruise.itinerary.length > 0 ? (
                <div className="relative border-l-2 border-sky-100 ml-4 pl-6 space-y-6">
                  {cruise.itinerary.map((stop) => {
                    const isExpanded = expandedStop === stop.day
                    return (
                      <div key={stop.day} className="relative">
                        {/* Dot Indicator */}
                        <div className={`absolute -left-[35px] top-1.5 size-4.5 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                          isExpanded ? 'border-sky-500 ring-4 ring-sky-50' : 'border-sky-200'
                        }`}>
                          <div className={`size-1.5 rounded-full ${isExpanded ? 'bg-sky-500' : 'bg-sky-300'}`} />
                        </div>

                        {/* Stop card */}
                        <div
                          onClick={() => setExpandedStop(isExpanded ? null : stop.day)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                            isExpanded ? 'border-sky-200 shadow-xs' : 'border-neutral-200/60 hover:bg-neutral-100/50'
                          }`}
                        >
                          <div className="flex justify-between items-center gap-2">
                            <div>
                              <Badge className="bg-sky-500 hover:bg-sky-500 text-white text-[10px] font-bold py-0 rounded">
                                DÍA {stop.day}
                              </Badge>
                              <h3 className="font-bold text-sm text-neutral-900 mt-1">{stop.title}</h3>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {stop.activity && (
                                <Badge variant="outline" className="text-[10px] py-0 border-sky-200 text-sky-700 bg-sky-50">
                                  {stop.activity}
                                </Badge>
                              )}
                              <ChevronDown className={`size-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3"
                            >
                              {stop.description}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Card className="rounded-2xl border-neutral-200/60 shadow-xs bg-white p-6 text-center text-muted-foreground">
                  <Info className="size-8 mx-auto text-neutral-400 mb-2" />
                  <p className="text-sm">Consulte el itinerario detallado con nuestros asesores de reservas.</p>
                </Card>
              )}
            </div>

            {/* Cabins Selection */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Camarotes y Tarifas</h2>
              <p className="text-xs text-neutral-500 mb-4">Tarifas con base en acomodación doble por persona. Incluye propinas generales.</p>
              
              {cruise.cabins && cruise.cabins.length > 0 ? (
                <div className="space-y-4">
                  {cruise.cabins.filter(c => c.active).map((cabin) => (
                    <Card key={cabin.id} className="overflow-hidden border-neutral-200/60 shadow-xs bg-white group hover:border-sky-300 transition-all duration-300">
                      <div className="flex flex-col md:flex-row">
                        {/* Cabin Image */}
                        <div className="w-full md:w-48 aspect-[16/10] md:aspect-auto bg-neutral-100 shrink-0 relative overflow-hidden">
                          {cabin.cabinImage ? (
                            <img src={cabin.cabinImage} alt={cabin.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-400">
                              <Ship className="size-10 opacity-40" />
                            </div>
                          )}
                        </div>

                        {/* Cabin Details */}
                        <div className="flex-1 p-5 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-base text-neutral-900">{cabin.name}</h3>
                              <Badge className="bg-sky-50 text-sky-700 border-sky-100 flex items-center gap-1" variant="outline">
                                <Users className="size-3" />
                                Capacidad: {cabin.capacity} pax
                              </Badge>
                            </div>
                            <p className="text-xs text-neutral-500 font-medium">Distribución: <span className="text-neutral-800">{cabin.beds}</span></p>
                            
                            {cabin.includes && cabin.includes.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {cabin.includes.map((inc, idx) => (
                                  <span key={idx} className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200/50 rounded px-1.5 py-0.5">
                                    {inc}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mt-4 pt-4 border-t border-neutral-100">
                            <div>
                              <span className="text-[10px] text-neutral-400 block uppercase tracking-wider">Tarifa por persona</span>
                              <span className="text-lg font-extrabold text-sky-800">{formatCOP(cabin.basePrice)}</span>
                              {cabin.originalPrice > cabin.basePrice && (
                                <span className="block text-xs line-through text-neutral-400 font-medium">{formatCOP(cabin.originalPrice)}</span>
                              )}
                            </div>
                            <Button
                              onClick={() => handleBooking(cabin.id)}
                              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs w-full sm:w-auto"
                            >
                              Reservar Categoría
                              <ArrowRight className="ml-1.5 size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="rounded-2xl border-neutral-200/60 shadow-xs bg-white p-6 text-center text-muted-foreground">
                  <AlertTriangle className="size-8 mx-auto text-amber-500 mb-2" />
                  <p className="text-sm">No hay camarotes disponibles cargados para este crucero. Comunícate con soporte.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column: Reservation Sidebar Card */}
          <div className="space-y-6">
            <Card className="sticky top-24 border-neutral-200/60 shadow-md bg-white rounded-2xl overflow-hidden">
              <div className="bg-sky-950 text-white p-5">
                <Badge className="bg-sky-500/20 text-sky-200 border-sky-400/20 text-[10px] uppercase font-bold mb-2">
                  Tarifas Todo Incluido
                </Badge>
                <p className="text-xs text-sky-200/70">Precios desde</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-white">{formatCOP(cruise.priceFrom)}</span>
                  <span className="text-xs text-sky-200/70">/persona</span>
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <Calendar className="size-4.5 text-sky-600 shrink-0" />
                    <span>Fechas de salida disponibles: consulte disponibilidad</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <Ship className="size-4.5 text-sky-600 shrink-0" />
                    <span>Barco: <span className="font-semibold text-neutral-800">{cruise.shipName}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <Anchor className="size-4.5 text-sky-600 shrink-0" />
                    <span>Naviera: <span className="font-semibold text-neutral-800">{cruise.operator}</span></span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Políticas de Viaje</h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    * Tarifas no incluyen tasas portuarias locales ni impuestos de salida turística del país si aplica.
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    * Se requiere pasaporte con vigencia mínima de 6 meses para itinerarios internacionales.
                  </p>
                </div>

                {cruise.cabins && cruise.cabins.length > 0 && (
                  <Button
                    onClick={() => {
                      const firstCabin = cruise.cabins.filter(c => c.active)[0] || cruise.cabins[0];
                      if (firstCabin) handleBooking(firstCabin.id);
                    }}
                    className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-md"
                  >
                    Cotizar Camarotes
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

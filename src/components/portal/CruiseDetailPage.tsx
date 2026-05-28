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
  ChevronLeft,
  ArrowLeft,
  Info,
  ChevronDown,
  ArrowRight,
  Users,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatCOP } from '@/data/packages'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'

interface Cabin {
  id: string;
  name: string;
  capacity: number;
  beds: string;
  basePrice: number;
  originalPrice: number | null;
  includes: string[];
  cabinImage: string;
  active: boolean;
}

interface ItineraryStop {
  day: number;
  title?: string;
  stop?: string;
  description?: string;
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
  destinations?: string[];
}

interface CruiseDetailPageProps {
  cruise: Cruise
}

export default function CruiseDetailPage({ cruise }: CruiseDetailPageProps) {
  const { navigate } = usePortalNavigation()
  const [activeImgIdx, setActiveImgIdx] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [expandedStop, setExpandedStop] = useState<number | null>(1)

  const [mainTouchStartX, setMainTouchStartX] = useState<number | null>(null)
  const [mainTouchStartY, setMainTouchStartY] = useState<number | null>(null)
  const [dialogTouchStartX, setDialogTouchStartX] = useState<number | null>(null)

  const handleMainTouchStart = (e: React.TouchEvent) => {
    setMainTouchStartX(e.targetTouches[0].clientX)
    setMainTouchStartY(e.targetTouches[0].clientY)
  }

  const handleMainTouchEnd = (e: React.TouchEvent) => {
    if (mainTouchStartX === null || mainTouchStartY === null) return
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const diffX = Math.abs(mainTouchStartX - touchEndX)
    const diffY = Math.abs(mainTouchStartY - touchEndY)

    // Open lightbox on tap or drag/swipe
    if (diffX > 10 || diffY > 10 || (diffX <= 10 && diffY <= 10)) {
      setLightboxIdx(activeImgIdx)
      setIsLightboxOpen(true)
    }
    setMainTouchStartX(null)
    setMainTouchStartY(null)
  }

  const nextLightboxImage = () => {
    if (!cruise.images || cruise.images.length === 0) return
    setLightboxIdx((prev) => (prev + 1) % cruise.images.length)
  }

  const prevLightboxImage = () => {
    if (!cruise.images || cruise.images.length === 0) return
    setLightboxIdx((prev) => (prev - 1 + cruise.images.length) % cruise.images.length)
  }

  const handleDialogTouchStart = (e: React.TouchEvent) => {
    setDialogTouchStartX(e.targetTouches[0].clientX)
  }

  const handleDialogTouchEnd = (e: React.TouchEvent) => {
    if (dialogTouchStartX === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = dialogTouchStartX - touchEndX
    if (diff > 50) {
      nextLightboxImage()
    } else if (diff < -50) {
      prevLightboxImage()
    }
    setDialogTouchStartX(null)
  }

  const handleBooking = (cabinId: string) => {
    navigate(`/cruceros/${cruise.slug}/reserva?cabinId=${cabinId}`)
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Cruise Banner Carousel */}
      <div className="relative h-64 overflow-hidden sm:h-96 group bg-neutral-900 shadow-inner">
        {cruise.images && cruise.images.length > 0 ? (
          <>
            <img
              src={cruise.images[activeImgIdx]}
              alt={`${cruise.name} - Imagen ${activeImgIdx + 1}`}
              className="h-full w-full object-cover opacity-90 hover:opacity-100 transition-all duration-300 cursor-pointer"
              onClick={() => {
                setLightboxIdx(activeImgIdx)
                setIsLightboxOpen(true)
              }}
              onTouchStart={handleMainTouchStart}
              onTouchEnd={handleMainTouchEnd}
            />
            {cruise.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveImgIdx((prev) => (prev - 1 + cruise.images.length) % cruise.images.length)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/65 p-2 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs shadow-md z-10"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveImgIdx((prev) => (prev + 1) % cruise.images.length)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/65 p-2 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs shadow-md z-10"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="size-6" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-5 flex gap-1.5 z-10">
                  {cruise.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveImgIdx(idx)
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === activeImgIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/85'
                      }`}
                      aria-label={`Ir a imagen ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <img
            src="/images/cruceros.png"
            alt={cruise.name}
            className="h-full w-full object-cover"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

        {/* Back Button */}
        <div className="absolute left-5 right-5 top-5 z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/cruceros')}
            className="text-white/90 hover:bg-white/10 hover:text-white backdrop-blur-xs bg-black/25 shadow-xs border border-white/5"
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver a cruceros
          </Button>
        </div>

        {/* Floating Rating Badge */}
        {cruise.rating > 0 && (
          <div className="absolute bottom-4 left-5 right-5 flex justify-end pointer-events-none z-10">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex items-center justify-center rounded-lg px-2.5 py-1 text-sm font-bold shadow-sm bg-emerald-500 text-white">
                {cruise.rating.toFixed(1)}
              </div>
              <span className="text-sm font-semibold text-white drop-shadow-md">
                {cruise.rating >= 9 ? 'Excepcional' : cruise.rating >= 8 ? 'Excelente' : 'Muy bueno'} ({cruise.reviewCount} opiniones)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="mx-auto max-w-5xl px-5 pt-8 sm:px-6">
        {/* Title and metadata block */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-amber-500/10 text-amber-800 border-amber-200/30 text-xs font-semibold hover:bg-amber-500/20 shadow-none">
                  <Ship className="mr-1 size-3 text-amber-600" />
                  {cruise.operator}
                </Badge>
                {cruise.featured && (
                  <Badge className="bg-amber-500 text-white border-transparent text-xs font-semibold hover:bg-amber-600">
                    Recomendado
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl tracking-tight">
                {cruise.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Anchor className="size-4 text-amber-500" />
                  Barco: <span className="font-semibold text-neutral-800">{cruise.shipName}</span>
                </span>
                <span className="hidden sm:inline text-neutral-300">|</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 text-amber-500" />
                  {cruise.durationDays} días / {cruise.durationDays - 1} noches
                </span>
                {cruise.rating > 0 && (
                  <>
                    <span className="hidden sm:inline text-neutral-300">|</span>
                    <span className="flex items-center gap-1.5">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-neutral-800">{cruise.rating}</span> ({cruise.reviewCount} opiniones)
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Destination tags */}
            {cruise.destinations && cruise.destinations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 md:justify-end">
                {cruise.destinations.map((dest, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="rounded-full border-transparent bg-neutral-100 text-xs text-neutral-600 hover:bg-neutral-200"
                  >
                    {dest}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnails Gallery */}
        {cruise.images && cruise.images.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-thin">
            {cruise.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIdx(idx)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  activeImgIdx === idx ? 'border-amber-500 scale-103 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
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
                <div className="relative border-l-2 border-amber-100 ml-4 pl-6 space-y-6">
                  {cruise.itinerary.map((stop) => {
                    const day = stop.day
                    const title = stop.title || stop.stop || `Día ${day}`
                    const description = stop.description || (stop.stop !== title ? stop.stop : '') || ''
                    const isExpanded = expandedStop === day
                    
                    return (
                      <div key={day} className="relative">
                        {/* Dot Indicator */}
                        <div className={`absolute -left-[35px] top-1.5 size-4.5 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                          isExpanded ? 'border-amber-500 ring-4 ring-amber-50' : 'border-amber-200'
                        }`}>
                          <div className={`size-1.5 rounded-full ${isExpanded ? 'bg-amber-500' : 'bg-amber-300'}`} />
                        </div>

                        {/* Stop card */}
                        <div
                          onClick={() => setExpandedStop(isExpanded ? null : day)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                            isExpanded ? 'border-amber-200 shadow-xs' : 'border-neutral-200/60 hover:bg-neutral-100/50'
                          }`}
                        >
                          <div className="flex justify-between items-center gap-2">
                            <div>
                              <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold py-0 rounded">
                                DÍA {day}
                              </Badge>
                              <h3 className="font-bold text-sm text-neutral-900 mt-1">{title}</h3>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {stop.activity && (
                                <Badge variant="outline" className="text-[10px] py-0 border-amber-200 text-amber-700 bg-amber-50">
                                  {stop.activity}
                                </Badge>
                              )}
                              <ChevronDown className={`size-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                          {isExpanded && description && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3"
                            >
                              {description}
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
                    <Card key={cabin.id} className="overflow-hidden border-neutral-200/60 shadow-xs bg-white group hover:border-amber-300 transition-all duration-300">
                      <div className="flex flex-col md:flex-row">
                        {/* Cabin Image */}
                        <div className="w-full md:w-48 aspect-[16/10] md:aspect-auto bg-neutral-100 shrink-0 relative overflow-hidden">
                          {cabin.cabinImage ? (
                            <img src={cabin.cabinImage} alt={cabin.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-400">
                              <Ship className="size-10 opacity-40" />
                            </div>
                          )}
                        </div>

                        {/* Cabin Details */}
                        <div className="flex-1 p-5 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-base text-neutral-900">{cabin.name}</h3>
                              <Badge className="bg-amber-50 text-amber-700 border-amber-100 flex items-center gap-1 shadow-none hover:bg-amber-100/50" variant="outline">
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
                              <span className="text-lg font-extrabold text-amber-600">{formatCOP(cabin.basePrice)}</span>
                              {cabin.originalPrice && cabin.originalPrice > cabin.basePrice ? (
                                <span className="block text-xs line-through text-neutral-400 font-medium">{formatCOP(cabin.originalPrice)}</span>
                              ) : null}
                            </div>
                            <Button
                              onClick={() => handleBooking(cabin.id)}
                              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs w-full sm:w-auto cursor-pointer"
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
              <div className="bg-brand-section text-white p-5">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/20 text-[10px] uppercase font-bold mb-2 hover:bg-amber-500/30">
                  Tarifas Todo Incluido
                </Badge>
                <p className="text-xs text-neutral-300/85">Precios desde</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-white">{formatCOP(cruise.priceFrom)}</span>
                  <span className="text-xs text-neutral-300/85">/persona</span>
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <Calendar className="size-4.5 text-amber-500 shrink-0" />
                    <span>Fechas de salida disponibles: consulte disponibilidad</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <Ship className="size-4.5 text-amber-500 shrink-0" />
                    <span>Barco: <span className="font-semibold text-neutral-800">{cruise.shipName}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <Anchor className="size-4.5 text-amber-500 shrink-0" />
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
                    className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md cursor-pointer"
                  >
                    Cotizar Camarotes
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Lightbox Gallery Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto admin-dialog rounded-2xl p-6 bg-white">
          <DialogHeader className="mb-4">
            <DialogTitle>Galería de fotos - {cruise.name}</DialogTitle>
            <DialogDescription>
              {cruise.images?.length || 0} imágenes disponibles para este crucero. Usa las flechas o desliza la imagen para navegar.
            </DialogDescription>
          </DialogHeader>

          {/* Carousel Active Image Display */}
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-900 group shadow-md select-none">
            {cruise.images && cruise.images.length > 0 ? (
              <img
                src={cruise.images[lightboxIdx]}
                alt={`Imagen ${lightboxIdx + 1}`}
                className="h-full w-full object-cover transition-opacity duration-300"
                onTouchStart={handleDialogTouchStart}
                onTouchEnd={handleDialogTouchEnd}
              />
            ) : (
              <img
                src="/images/cruceros.png"
                alt="Placeholder"
                className="h-full w-full object-cover"
              />
            )}

            {/* Navigation arrows inside lightbox */}
            {cruise.images && cruise.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevLightboxImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/75 p-2.5 text-white transition-all cursor-pointer backdrop-blur-xs shadow-md z-20"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextLightboxImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/75 p-2.5 text-white transition-all cursor-pointer backdrop-blur-xs shadow-md z-20"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="size-6" />
                </button>

                {/* Slide counter indicator */}
                <div className="absolute top-4 right-4 z-20 rounded-md bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs shadow-xs border border-white/10">
                  {lightboxIdx + 1} / {cruise.images.length}
                </div>
              </>
            )}
          </div>

          {/* Grid / Thumbnails Strip below */}
          {cruise.images && cruise.images.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Todas las fotos</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {cruise.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`relative overflow-hidden rounded-lg aspect-video border bg-neutral-50 cursor-pointer transition-all duration-200 ${
                      idx === lightboxIdx
                        ? 'border-amber-500 ring-2 ring-amber-500/30 opacity-100 scale-95'
                        : 'border-neutral-200 hover:border-amber-400 hover:scale-98 opacity-75 hover:opacity-100'
                    }`}
                    onClick={() => setLightboxIdx(idx)}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

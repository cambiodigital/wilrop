'use client'
import { formatCurrency } from '@/lib/currency'


import {
  ArrowLeft,
  Bed,
  Check,
  MapPin,
  Star,
  Users,
  Wifi,
  Waves,
  UtensilsCrossed,
  Car,
  Dumbbell,
  Sparkles,
  Thermometer,
  Coffee,
  Wine,
  Clock,
  Plane,
  Eye,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { hotelAmenities, type Hotel, type HotelRoom } from '@/data/hotels'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

// Normalize a string for fuzzy comparison: lowercase, strip accents, trim
function normalizeStr(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Look up an amenity by id first, then fall back to a normalized name match.
 * This handles cases where the admin entered Spanish names (e.g. 'piscina')
 * instead of English IDs (e.g. 'pool').
 */
function findAmenity(value: string) {
  // 1. Exact ID match
  let match = hotelAmenities.find((a) => a.id === value)
  if (match) return match

  // 2. Normalized name match (case + accent insensitive)
  const normalizedValue = normalizeStr(value)
  match = hotelAmenities.find((a) => normalizeStr(a.name) === normalizedValue)
  if (match) return match

  // 3. Substring match (e.g. 'piscina' -> 'Piscina')
  match = hotelAmenities.find((a) => normalizeStr(a.name).includes(normalizedValue))
  if (match) return match

  return null
}

/**
 * Normalize amenities from the hotel data — handles both JSON arrays
 * and plain comma-separated strings that may come from legacy data.
 */
function normalizeAmenities(raw: string[] | string | undefined | null): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  // Plain string: try JSON parse, fall back to comma split
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // not JSON — split by comma
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  Waves,
  UtensilsCrossed,
  Car,
  Dumbbell,
  Sparkles,
  Thermometer,
  Coffee,
  Wine,
  Clock,
  Plane,
  Eye,
}

interface HotelDetailContentProps {
  hotel: Hotel
  nights: number
  totalGuests: number
  checkIn: string
  checkOut: string
  onBack?: () => void
  onSelectRoom: (room: HotelRoom) => void
}

export default function HotelDetailContent({
  hotel,
  nights,
  totalGuests,
  checkIn,
  checkOut,
  onBack,
  onSelectRoom,
}: HotelDetailContentProps) {
  const [activeImgIdx, setActiveImgIdx] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  const [mainTouchStartX, setMainTouchStartX] = useState<number | null>(null)
  const [mainTouchStartY, setMainTouchStartY] = useState<number | null>(null)

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
    setLightboxIdx((prev) => (prev + 1) % hotel.images.length)
  }

  const prevLightboxImage = () => {
    setLightboxIdx((prev) => (prev - 1 + hotel.images.length) % hotel.images.length)
  }

  const [dialogTouchStartX, setDialogTouchStartX] = useState<number | null>(null)

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

  const ratingColor =
    hotel.rating >= 9
      ? 'bg-emerald-500 text-white'
      : hotel.rating >= 8
        ? 'bg-emerald-500 text-white'
        : 'bg-amber-500 text-white'

  const ratingLabel =
    hotel.rating >= 9
      ? 'Excepcional'
      : hotel.rating >= 8
        ? 'Excelente'
        : hotel.rating >= 7
          ? 'Muy bueno'
          : 'Bueno'

  return (
    <div className="min-h-screen bg-white pt-0">
      {/* Hotel Banner Carousel */}
      <div className="relative h-64 overflow-hidden sm:h-96 group bg-neutral-900 shadow-inner">
        {hotel.images && hotel.images.length > 0 ? (
          <>
            <img
              src={hotel.images[activeImgIdx]}
              alt={`${hotel.name} - Imagen ${activeImgIdx + 1}`}
              className="h-full w-full object-cover opacity-90 hover:opacity-100 transition-all duration-300 cursor-pointer"
              onClick={() => {
                setLightboxIdx(activeImgIdx)
                setIsLightboxOpen(true)
              }}
              onTouchStart={handleMainTouchStart}
              onTouchEnd={handleMainTouchEnd}
            />
            {hotel.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveImgIdx((prev) => (prev - 1 + hotel.images.length) % hotel.images.length)
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
                    setActiveImgIdx((prev) => (prev + 1) % hotel.images.length)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/65 p-2 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs shadow-md z-10"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="size-6" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-5 flex gap-1.5 z-10">
                  {hotel.images.map((_, idx) => (
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
            src="/placeholder-hotel.png"
            alt={hotel.name}
            className="h-full w-full object-cover"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

        {/* Back Button */}
        <div className="absolute left-5 right-5 top-5 z-10">
          {onBack ? (
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white/90 hover:bg-white/10 hover:text-white backdrop-blur-xs bg-black/25 shadow-xs border border-white/5"
            >
              <ArrowLeft className="mr-2 size-4" />
              Volver a hoteles
            </Button>
          ) : null}
        </div>

        {/* Floating Rating Badge */}
        <div className="absolute bottom-4 left-5 right-5 flex justify-end pointer-events-none z-10">
          <div className="mb-1 flex items-center gap-2">
            <div className={`flex items-center justify-center rounded-lg px-2.5 py-1 text-sm font-bold shadow-sm ${ratingColor}`}>
              {hotel.rating.toFixed(1)}
            </div>
            <span className="text-sm font-semibold text-white drop-shadow-md">
              {ratingLabel} ({hotel.reviewCount} reseñas)
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl p-5 sm:p-6">
        <div className="space-y-6 rounded-2xl bg-white">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{hotel.name}</h1>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: hotel.stars }).map((_, index) => (
                      <Star key={index} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm text-neutral-500">·</span>
                  <div className="flex items-center gap-1 text-sm text-neutral-500">
                    <MapPin className="size-3.5 text-amber-500" />
                    {hotel.cityName}
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 flex-wrap justify-end gap-1.5">
                {hotel.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full border-transparent bg-neutral-100 text-xs text-neutral-600"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
              <MapPin className="size-3" />
              {hotel.address}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-neutral-900">Sobre el hotel</h2>
            <p className="text-sm leading-relaxed text-neutral-600">{hotel.description}</p>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Servicios y comodidades</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {normalizeAmenities(hotel.amenities).map((amenityId) => {
                const amenity = findAmenity(amenityId)
                if (!amenity) return null

                const Icon = iconMap[amenity.icon]

                return (
                  <div
                    key={amenityId}
                    className="flex items-center gap-2.5 rounded-lg bg-neutral-50 px-3 py-2.5"
                  >
                    {Icon ? (
                      <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <Icon className="size-3.5" />
                      </div>
                    ) : null}
                    <span className="text-sm text-neutral-700">{amenity.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900">Habitaciones disponibles</h2>
              {checkIn && checkOut ? (
                <span className="text-xs text-neutral-500">
                  {checkIn} → {checkOut} ({nights} noche{nights !== 1 ? 's' : ''})
                </span>
              ) : null}
            </div>

            <div className="space-y-3">
              {hotel.rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  totalGuests={totalGuests}
                  nights={nights}
                  onSelectRoom={onSelectRoom}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto admin-dialog rounded-2xl p-6 bg-white">
          <DialogHeader className="mb-4">
            <DialogTitle>Galería de fotos - {hotel.name}</DialogTitle>
            <DialogDescription>
              {hotel.images.length} imágenes disponibles para este hotel. Usa las flechas o desliza la imagen para navegar.
            </DialogDescription>
          </DialogHeader>

          {/* Carousel Active Image Display */}
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-900 group shadow-md select-none">
            <img
              src={hotel.images[lightboxIdx]}
              alt={`Imagen ${lightboxIdx + 1}`}
              className="h-full w-full object-cover transition-opacity duration-300"
              onTouchStart={handleDialogTouchStart}
              onTouchEnd={handleDialogTouchEnd}
            />

            {/* Navigation arrows inside lightbox */}
            {hotel.images.length > 1 && (
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
                  {lightboxIdx + 1} / {hotel.images.length}
                </div>
              </>
            )}
          </div>

          {/* Grid / Thumbnails Strip below */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Todas las fotos</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {hotel.images.map((img, idx) => (
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
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface RoomCardProps {
  room: HotelRoom
  totalGuests: number
  nights: number
  onSelectRoom: (room: HotelRoom) => void
}

function RoomCard({ room, totalGuests, nights, onSelectRoom }: RoomCardProps) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0)
  const [isRoomLightboxOpen, setIsRoomLightboxOpen] = useState(false)

  const images = room.roomImages && Array.isArray(room.roomImages) && room.roomImages.length > 0
    ? room.roomImages
    : room.roomImage
      ? [room.roomImage]
      : []

  const discount = room.originalPrice
    ? Math.round(((room.originalPrice - room.price) / room.originalPrice) * 100)
    : 0
  const roomCanHostSelection = totalGuests <= room.maxGuests

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImgIdx((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4 transition-all hover:border-amber-300 hover:shadow-md bg-white">
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Room Images Carousel */}
        {images.length > 0 ? (
          <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-lg md:h-32 md:w-48 bg-neutral-100 group shadow-sm border border-neutral-100">
            <img
              src={images[currentImgIdx]}
              alt={`${room.name} - Imagen ${currentImgIdx + 1}`}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
              onClick={() => setIsRoomLightboxOpen(true)}
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-100 md:opacity-0 md:transition-opacity md:hover:bg-black/60 md:group-hover:opacity-100 cursor-pointer z-10"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-100 md:opacity-0 md:transition-opacity md:hover:bg-black/60 md:group-hover:opacity-100 cursor-pointer z-10"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="size-4" />
                </button>
                <div className="absolute bottom-2 right-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {currentImgIdx + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex h-48 w-full shrink-0 flex-col items-center justify-center rounded-lg bg-neutral-50 text-neutral-400 md:h-32 md:w-48 border border-neutral-100">
            <ImageIcon className="size-8 stroke-1" />
            <span className="mt-1 text-[11px]">Sin fotos</span>
          </div>
        )}

        {/* Room Details & Pricing */}
        <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-start sm:gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-neutral-900 text-base">{room.name}</h3>
              {discount > 0 ? (
                <Badge className="rounded-full border-transparent bg-red-100 text-xs text-red-700">
                  -{discount}%
                </Badge>
              ) : null}
            </div>

            <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {room.maxGuests} huésped{room.maxGuests !== 1 ? 'es' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Bed className="size-3.5" />
                {room.beds}
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {room.includes.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700"
                >
                  <Check className="size-3" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 sm:mt-0 sm:flex-col sm:items-end sm:gap-1 sm:text-right">
            {room.originalPrice ? (
              <span className="text-xs text-neutral-400 line-through">
                {formatCurrency(room.originalPrice)}
              </span>
            ) : null}
            <div>
              <span className="text-xl font-bold text-amber-600">{formatCurrency(room.price)}</span>
              <span className="text-xs text-neutral-400"> / noche</span>
            </div>
            {nights > 1 ? (
              <p className="text-[11px] text-neutral-500">Total: {formatCurrency(room.price * nights)}</p>
            ) : null}

            <div className="mt-1">
              {room.available <= 3 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600">
                  <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
                  Quedan {room.available} hab.
                </span>
              ) : (
                <span className="text-[11px] text-neutral-400">{room.available} disponibles</span>
              )}
            </div>

            <Button
              className="mt-1.5 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-600 shadow-xs cursor-pointer"
              onClick={() => onSelectRoom(room)}
              disabled={!roomCanHostSelection}
            >
              {!roomCanHostSelection ? 'No disponible para esta ocupación' : 'Reservar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Room Lightbox Dialog */}
      <Dialog open={isRoomLightboxOpen} onOpenChange={setIsRoomLightboxOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto admin-dialog rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Imágenes de {room.name}</DialogTitle>
            <DialogDescription>
              {images.length} fotos disponibles para esta habitación.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 aspect-video group cursor-pointer shadow-xs hover:border-amber-400 hover:shadow-md transition-all duration-300"
              >
                <img
                  src={img}
                  alt={`Foto ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                  Foto {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
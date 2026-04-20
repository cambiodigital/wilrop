'use client'

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
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCOP, hotelAmenities, type Hotel, type HotelRoom } from '@/data/hotels'

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
    <div className="min-h-screen bg-white pt-16">
      <div className="relative h-56 overflow-hidden sm:h-72">
        <img src={hotel.images[0]} alt={hotel.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute left-5 right-5 top-5">
          {onBack ? (
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white/85 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="mr-2 size-4" />
              Volver a hoteles
            </Button>
          ) : null}
        </div>
        <div className="absolute bottom-4 left-5 right-5">
          <div className="mb-1 flex items-center gap-2">
            <div className={`flex items-center justify-center rounded-lg px-2.5 py-1 text-sm font-bold ${ratingColor}`}>
              {hotel.rating.toFixed(1)}
            </div>
            <span className="text-sm font-medium text-white">
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
              {hotel.amenities.map((amenityId) => {
                const amenity = hotelAmenities.find((item) => item.id === amenityId)
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
              {hotel.rooms.map((room) => {
                const discount = room.originalPrice
                  ? Math.round(((room.originalPrice - room.price) / room.originalPrice) * 100)
                  : 0
                const roomCanHostSelection = totalGuests <= room.maxGuests

                return (
                  <div
                    key={room.id}
                    className="rounded-xl border border-neutral-200 p-4 transition-all hover:border-amber-300 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-neutral-900">{room.name}</h3>
                          {discount > 0 ? (
                            <Badge className="rounded-full border-transparent bg-red-100 text-xs text-red-700">
                              -{discount}%
                            </Badge>
                          ) : null}
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Users className="size-3.5" />
                            {room.maxGuests} huésped{room.maxGuests !== 1 ? 'es' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed className="size-3.5" />
                            {room.beds}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {room.includes.map((item) => (
                            <span
                              key={item}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                            >
                              <Check className="size-3" />
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-3 sm:mt-0 sm:flex-col sm:items-end sm:gap-1 sm:text-right">
                        {room.originalPrice ? (
                          <span className="text-sm text-neutral-400 line-through">
                            {formatCOP(room.originalPrice)}
                          </span>
                        ) : null}
                        <div>
                          <span className="text-xl font-bold text-amber-600">{formatCOP(room.price)}</span>
                          <span className="text-xs text-neutral-400"> / noche</span>
                        </div>
                        {nights > 1 ? (
                          <p className="text-xs text-neutral-500">Total: {formatCOP(room.price * nights)}</p>
                        ) : null}

                        <div className="mt-1">
                          {room.available <= 3 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                              <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
                              Quedan {room.available} hab.
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400">{room.available} disponibles</span>
                          )}
                        </div>

                        <Button
                          className="mt-1 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-amber-600"
                          onClick={() => onSelectRoom(room)}
                          disabled={!roomCanHostSelection}
                        >
                          {!roomCanHostSelection ? 'No disponible para esta ocupación' : 'Reservar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
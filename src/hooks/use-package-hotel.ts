'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { calculateHotelPrice, calculateNights, applyResellerMarkup } from '@/lib/package-pricing'

// ─── Types ──────────────────────────────────────────────────

export interface HotelRoom {
  id: string
  name: string
  maxGuests: number
  beds: string
  price: number
  originalPrice: number
  includes: string[]
}

export interface HotelData {
  id: string
  name: string
  cityId: string
  cityName: string
  stars: number
  address: string
  description: string
  images: string[]
  amenities: string[]
  rating: number
  priceFrom: number
  rooms: HotelRoom[]
}

export interface SelectedHotel {
  hotel: HotelData
  room: HotelRoom
  checkIn: string
  checkOut: string
  rooms: number
  nights: number
  totalPrice: number
  displayPrice: number
}

// ─── Hook ──────────────────────────────────────────────────

interface UsePackageHotelOptions {
  resellerId?: string | null
  resellerCommission?: number
}

export function usePackageHotel(options: UsePackageHotelOptions = {}) {
  const { resellerId, resellerCommission = 0 } = options

  const [hotels, setHotels] = useState<HotelData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [cityId, setCityId] = useState('')
  const [hotelId, setHotelId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [roomCount, setRoomCount] = useState(1)

  // Selected result
  const [selected, setSelected] = useState<SelectedHotel | null>(null)

  // Fetch hotels
  const fetchHotels = useCallback(async (city?: string) => {
    setLoading(true)
    setError(null)
    try {
      let url = '/api/public/hotels'
      const params = new URLSearchParams()
      if (city) params.set('cityId', city)
      if (resellerId) params.set('resellerId', resellerId)
      const qs = params.toString()
      if (qs) url += `?${qs}`

      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudieron cargar los hoteles`)
      }
      const json = await res.json()
      if (json.success) {
        setHotels(json.data)
        if (json.data.length === 0) {
          setError('No hay hoteles disponibles para esta selección')
        }
      } else {
        throw new Error(json.error || 'Error al cargar hoteles')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de conexión al cargar hoteles'
      setError(message)
      setHotels([])
    } finally {
      setLoading(false)
    }
  }, [resellerId])

  // Refetch on city change
  useEffect(() => {
    fetchHotels(cityId)
  }, [cityId, fetchHotels])

  // Derived
  const filteredHotels = useMemo(() => {
    if (!cityId) return hotels
    return hotels.filter((h) => h.cityId === cityId)
  }, [cityId, hotels])

  const selectedHotel = useMemo(
    () => hotels.find((h) => h.id === hotelId) || null,
    [hotelId, hotels],
  )

  const selectedRoom = useMemo(() => {
    if (!selectedHotel || !roomId) return null
    return selectedHotel.rooms.find((r) => r.id === roomId) || null
  }, [selectedHotel, roomId])

  const nights = useMemo(() => calculateNights(checkIn, checkOut), [checkIn, checkOut])

  // Confirm selection
  const confirmSelection = useCallback((): SelectedHotel | null => {
    if (!selectedHotel || !selectedRoom || !checkIn || !checkOut) return null

    const baseTotal = calculateHotelPrice({
      roomPrice: selectedRoom.price,
      nights,
      rooms: roomCount,
    })

    const displayPrice = applyResellerMarkup({
      basePrice: baseTotal,
      commissionPercent: resellerCommission,
    })

    const result: SelectedHotel = {
      hotel: selectedHotel,
      room: selectedRoom,
      checkIn,
      checkOut,
      rooms: roomCount,
      nights,
      totalPrice: baseTotal,
      displayPrice,
    }

    setSelected(result)
    return result
  }, [selectedHotel, selectedRoom, checkIn, checkOut, nights, roomCount, resellerCommission])

  const clearSelection = useCallback(() => {
    setSelected(null)
    setHotelId('')
    setRoomId('')
    setCheckIn('')
    setCheckOut('')
    setRoomCount(1)
  }, [])

  // Reset room when hotel changes
  useEffect(() => {
    setRoomId('')
  }, [hotelId])

  return {
    // Data
    hotels,
    filteredHotels,
    loading,
    error,
    selectedHotel,
    selectedRoom,
    selected,
    nights,
    // Form state
    cityId,
    setCityId,
    hotelId,
    setHotelId,
    roomId,
    setRoomId,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    roomCount,
    setRoomCount,
    // Actions
    confirmSelection,
    clearSelection,
    refetch: fetchHotels,
  }
}

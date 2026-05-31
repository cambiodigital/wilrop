'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { calculateTransportPrice, applyResellerMarkup } from '@/lib/package-pricing'

// ─── Types ──────────────────────────────────────────────────

export interface TransportService {
  id: string
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
  provider: { name: string; vehicleType: string; capacity: number }
}

export interface SelectedTransport {
  service: TransportService
  date: string
  adults: number
  children: number
  totalPrice: number
  displayPrice: number
}

// ─── Hook ──────────────────────────────────────────────────

interface UsePackageTransportOptions {
  resellerId?: string | null
  resellerCommission?: number
}

export function usePackageTransport(options: UsePackageTransportOptions = {}) {
  const { resellerId, resellerCommission = 0 } = options

  const [services, setServices] = useState<TransportService[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [cityId, setCityId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)

  // Selected result
  const [selected, setSelected] = useState<SelectedTransport | null>(null)

  // Fetch transport services
  const fetchServices = useCallback(async (city?: string) => {
    setLoading(true)
    setError(null)
    try {
      let url = '/api/public/transport'
      const params = new URLSearchParams()
      if (city) params.set('cityId', city)
      if (resellerId) params.set('resellerId', resellerId)
      const qs = params.toString()
      if (qs) url += `?${qs}`

      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudieron cargar los servicios de transporte`)
      }
      const json = await res.json()
      if (json.success) {
        setServices(json.data)
        if (json.data.length === 0) {
          setError('No hay servicios de transporte disponibles para esta selección')
        }
      } else {
        throw new Error(json.error || 'Error al cargar transportes')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de conexión al cargar transportes'
      setError(message)
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [resellerId])

  // Refetch on city change
  useEffect(() => {
    fetchServices(cityId)
  }, [cityId, fetchServices])

  // Derived
  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [serviceId, services],
  )

  // Confirm selection (called when user clicks "Next")
  const confirmSelection = useCallback((): SelectedTransport | null => {
    if (!selectedService || !date) return null

    const baseTotal = calculateTransportPrice({
      basePrice: selectedService.basePrice,
      pricePerExtra: selectedService.pricePerExtra,
      adults,
      children,
    })

    const displayPrice = applyResellerMarkup({
      basePrice: baseTotal,
      commissionPercent: resellerCommission,
    })

    const result: SelectedTransport = {
      service: selectedService,
      date,
      adults,
      children,
      totalPrice: baseTotal,
      displayPrice,
    }

    setSelected(result)
    return result
  }, [selectedService, date, adults, children, resellerCommission])

  const clearSelection = useCallback(() => {
    setSelected(null)
    setServiceId('')
    setDate('')
    setAdults(1)
    setChildren(0)
  }, [])

  return {
    // Data
    services,
    loading,
    error,
    selectedService,
    selected,
    // Form state
    cityId,
    setCityId,
    serviceId,
    setServiceId,
    date,
    setDate,
    adults,
    setAdults,
    children,
    setChildren,
    // Actions
    confirmSelection,
    clearSelection,
    refetch: fetchServices,
  }
}

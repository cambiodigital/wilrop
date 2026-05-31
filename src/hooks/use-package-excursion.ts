'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { calculateExcursionPrice, applyResellerMarkup } from '@/lib/package-pricing'

// ─── Types ──────────────────────────────────────────────────

export interface ExcursionData {
  id: string
  name: string
  destinationId: string
  cityName: string
  destinationName: string
  duration: string
  difficulty: string
  groupSize: string
  basePrice: number
  childPrice: number
  includes: string[]
  category: string
  rating: number
  shortDesc: string
  images: string[]
}

export interface SelectedExcursion {
  excursion: ExcursionData
  date: string
  adults: number
  children: number
  totalPrice: number
  displayPrice: number
}

// ─── Hook ──────────────────────────────────────────────────

interface UsePackageExcursionOptions {
  resellerId?: string | null
  resellerCommission?: number
  /** Filter excursions by this city context (from hotel or transport selection) */
  cityContext?: string
}

export function usePackageExcursion(options: UsePackageExcursionOptions = {}) {
  const { resellerId, resellerCommission = 0, cityContext } = options

  const [excursions, setExcursions] = useState<ExcursionData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)

  // Selected result
  const [selected, setSelected] = useState<SelectedExcursion | null>(null)

  // Fetch excursions
  const fetchExcursions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let url = '/api/public/excursions'
      const params = new URLSearchParams()
      if (resellerId) params.set('resellerId', resellerId)
      const qs = params.toString()
      if (qs) url += `?${qs}`

      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudieron cargar las excursiones`)
      }
      const json = await res.json()
      if (json.success) {
        setExcursions(json.data)
        if (json.data.length === 0) {
          setError('No hay excursiones disponibles')
        }
      } else {
        throw new Error(json.error || 'Error al cargar excursiones')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de conexión al cargar excursiones'
      setError(message)
      setExcursions([])
    } finally {
      setLoading(false)
    }
  }, [resellerId])

  useEffect(() => {
    fetchExcursions()
  }, [fetchExcursions])

  // Derived
  const filteredExcursions = useMemo(() => {
    if (!cityContext) return excursions
    return excursions.filter(
      (e) =>
        e.destinationId === cityContext ||
        e.cityName.toLowerCase() === cityContext.toLowerCase(),
    )
  }, [excursions, cityContext])

  const selectedExcursion = useMemo(
    () => excursions.find((e) => e.id === serviceId) || null,
    [serviceId, excursions],
  )

  // Confirm selection
  const confirmSelection = useCallback((): SelectedExcursion | null => {
    if (!selectedExcursion || !date) return null

    const baseTotal = calculateExcursionPrice({
      basePrice: selectedExcursion.basePrice,
      childPrice: selectedExcursion.childPrice,
      adults,
      children,
    })

    const displayPrice = applyResellerMarkup({
      basePrice: baseTotal,
      commissionPercent: resellerCommission,
    })

    const result: SelectedExcursion = {
      excursion: selectedExcursion,
      date,
      adults,
      children,
      totalPrice: baseTotal,
      displayPrice,
    }

    setSelected(result)
    return result
  }, [selectedExcursion, date, adults, children, resellerCommission])

  const clearSelection = useCallback(() => {
    setSelected(null)
    setServiceId('')
    setDate('')
    setAdults(1)
    setChildren(0)
  }, [])

  return {
    // Data
    excursions,
    filteredExcursions,
    loading,
    error,
    selectedExcursion,
    selected,
    // Form state
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
    refetch: fetchExcursions,
  }
}

'use client'

import { useState, useEffect, useCallback } from 'react'

export interface City {
  id: string
  name: string
}

export function useCities() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCities = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/public/destinations')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((d: any) => ({
          id: d.slug || d.id,
          name: d.name,
        }))
        setCities(mapped)
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCities()
  }, [fetchCities])

  return { cities, loading, refetch: fetchCities }
}

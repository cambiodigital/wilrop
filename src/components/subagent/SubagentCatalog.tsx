'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ListFilter, Search, Package } from 'lucide-react'
import { toast } from 'sonner'

interface CatalogItem {
  id: string
  sourceType: string
  sourceId: string
  customPrice: number | null
  customName: string | null
  customDescription: string | null
  active: boolean
  featured: boolean
}

const sourceTypeLabels: Record<string, string> = {
  hotel: 'Hotel',
  excursion: 'Excursión',
  transport: 'Transporte',
  cruise: 'Crucero',
  package: 'Paquete',
  destination: 'Destino',
}

export default function SubagentCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchCatalog = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/subagent/catalog')
      const json = await res.json()
      if (json.success) setItems(json.data)
    } catch {
      toast.error('No se pudo cargar el catálogo')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  const filtered = items.filter((item) => {
    if (!search) return true
    const name = item.customName || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">Mi Catálogo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Productos seleccionados disponibles para revender
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar en mi catálogo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">
            {search
              ? 'No se encontraron productos con esos filtros.'
              : 'Tu catálogo está vacío. Contacta al administrador para agregar productos.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground truncate">
                      {item.customName || `Producto #${item.sourceId.slice(0, 8)}`}
                    </h3>
                    {item.customDescription && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {item.customDescription}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {sourceTypeLabels[item.sourceType] || item.sourceType}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  {item.customPrice != null ? (
                    <span className="text-sm font-semibold text-card-foreground">
                      ${item.customPrice.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Precio estándar</span>
                  )}
                  <div className="flex gap-1.5">
                    {item.featured && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[10px]">
                        Destacado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bed,
  Bus,
  MapPin,
  Mountain,
  Package,
  Globe,
  Search,
  Plus,
  Loader2,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const sourceTypeTabs = [
  { value: 'all', label: 'Todos', icon: Package },
  { value: 'hotel', label: 'Hoteles', icon: Bed },
  { value: 'excursion', label: 'Excursiones', icon: Mountain },
  { value: 'package', label: 'Paquetes', icon: Package },
  { value: 'transport', label: 'Transporte', icon: Bus },
  { value: 'destination', label: 'Destinos', icon: Globe },
]

interface AvailableProduct {
  sourceType: string
  sourceId: string
  name: string
  location: string
  price: number
  image: string
  description: string
  metadata: Record<string, unknown>
  alreadyInCatalog: boolean
}

interface ResellerAddToCatalogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  canCustomizePrices: boolean
  maxCatalogItems: number
  currentCatalogCount: number
  onAdd: (product: AvailableProduct, customPrice?: number | null) => Promise<void>
}

export function ResellerAddToCatalogDialog({
  open,
  onOpenChange,
  canCustomizePrices,
  maxCatalogItems,
  currentCatalogCount,
  onAdd,
}: ResellerAddToCatalogDialogProps) {
  const [products, setProducts] = useState<AvailableProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [customPrices, setCustomPrices] = useState<Record<string, string>>({})
  const [addingId, setAddingId] = useState<string | null>(null)

  const remainingSlots = maxCatalogItems === Infinity ? Infinity : maxCatalogItems - currentCatalogCount
  const canAddMore = remainingSlots > 0

  useEffect(() => {
    if (open && products.length === 0) {
      fetchAvailableProducts()
    }
  }, [open])

  const fetchAvailableProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reseller/catalog/available')
      const json = await res.json()
      if (json.success) {
        setProducts(json.data)
      }
    } catch {
      toast.error('No se pudieron cargar los productos disponibles')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    let filtered = products

    if (activeTab !== 'all') {
      filtered = filtered.filter((p) => p.sourceType === activeTab)
    }

    const searchLower = search.toLowerCase()
    if (searchLower) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.location.toLowerCase().includes(searchLower),
      )
    }

    return filtered
  }, [products, activeTab, search])

  const groupedByType = useMemo(() => {
    const grouped: Record<string, AvailableProduct[]> = {}
    filteredProducts.forEach((p) => {
      if (!grouped[p.sourceType]) grouped[p.sourceType] = []
      grouped[p.sourceType].push(p)
    })
    return grouped
  }, [filteredProducts])

  const handleAdd = async (product: AvailableProduct) => {
    if (!canAddMore) {
      toast.error('Has alcanzado el límite de productos en tu catálogo')
      return
    }

    setAddingId(product.sourceId)
    try {
      const customPrice = canCustomizePrices && customPrices[product.sourceId]
        ? parseInt(customPrices[product.sourceId], 10) || null
        : null

      await onAdd(product, customPrice)
      toast.success(`${product.name} agregado a tu catálogo`)
      setProducts((prev) =>
        prev.map((p) =>
          p.sourceId === product.sourceId ? { ...p, alreadyInCatalog: true } : p,
        ),
      )
      setCustomPrices((prev) => {
        const next = { ...prev }
        delete next[product.sourceId]
        return next
      })
    } catch {
      toast.error(`No se pudo agregar ${product.name}`)
    } finally {
      setAddingId(null)
    }
  }

  const getSourceIcon = (sourceType: string) => {
    const iconMap: Record<string, typeof Bed> = {
      hotel: Bed,
      excursion: Mountain,
      package: Package,
      transport: Bus,
      destination: Globe,
    }
    return iconMap[sourceType] || Package
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Agregar productos al catálogo</DialogTitle>
          <DialogDescription>
            {canAddMore
              ? `${remainingSlots === Infinity ? 'Espacios ilimitados' : `${remainingSlots} espacios`} disponibles de ${maxCatalogItems === Infinity ? '∞' : maxCatalogItems}`
              : 'Has alcanzado el límite de tu catálogo'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="pl-10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex-wrap h-auto">
              {sourceTypeTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs">
                    <Icon className="size-3.5" />
                    {tab.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {sourceTypeTabs.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value}>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredProducts
                        .filter((p) => tab.value === 'all' || p.sourceType === tab.value)
                        .map((product) => {
                          const Icon = getSourceIcon(product.sourceType)
                          const isAdding = addingId === product.sourceId
                          return (
                            <Card key={`${product.sourceType}-${product.sourceId}`} className="overflow-hidden">
                              <div className="relative h-28 overflow-hidden bg-gray-100">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                    <Icon className="size-8 text-primary/50" />
                                  </div>
                                )}
                                {product.alreadyInCatalog && (
                                  <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center">
                                    <Badge className="bg-white text-emerald-700 hover:bg-white">
                                      <Check className="size-3 mr-1" />
                                      En catálogo
                                    </Badge>
                                  </div>
                                )}
                              </div>

                              <CardContent className="p-3 space-y-2">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                                  {product.location && (
                                    <p className="flex items-center gap-1 text-xs text-gray-500">
                                      <MapPin className="size-3" />
                                      {product.location}
                                    </p>
                                  )}
                                </div>

                                <p className="text-sm font-semibold text-gray-900">{formatCOP(product.price)}</p>

                                {canCustomizePrices && !product.alreadyInCatalog && (
                                  <Input
                                    type="number"
                                    placeholder="Precio personalizado (opcional)"
                                    value={customPrices[product.sourceId] || ''}
                                    onChange={(e) =>
                                      setCustomPrices((prev) => ({ ...prev, [product.sourceId]: e.target.value }))
                                    }
                                    className="h-8 text-xs"
                                    min={0}
                                  />
                                )}

                                <Button
                                  size="sm"
                                  className="w-full text-xs"
                                  disabled={product.alreadyInCatalog || !canAddMore || isAdding}
                                  onClick={() => handleAdd(product)}
                                >
                                  {isAdding ? (
                                    <Loader2 className="size-3 animate-spin mr-1" />
                                  ) : product.alreadyInCatalog ? (
                                    <Check className="size-3 mr-1" />
                                  ) : (
                                    <Plus className="size-3 mr-1" />
                                  )}
                                  {product.alreadyInCatalog ? 'Agregado' : 'Agregar'}
                                </Button>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>

                    {filteredProducts.filter((p) => tab.value === 'all' || p.sourceType === tab.value).length === 0 && (
                      <div className="text-center py-10 text-gray-400">
                        No hay productos disponibles en esta categoría.
                      </div>
                    )}
                  </TabsContent>
                ))}
              </>
            )}
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

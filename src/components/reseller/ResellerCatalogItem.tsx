'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Bed,
  Bus,
  MapPin,
  Mountain,
  Package,
  Globe,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Loader2,
} from 'lucide-react'

export interface CatalogItem {
  id: string
  sourceType: string
  sourceId: string
  customPrice: number | null
  customName: string
  customDescription: string
  active: boolean
  featured: boolean
  sortOrder: number
  sourceData: Record<string, unknown>
}

interface ResellerCatalogItemProps {
  item: CatalogItem
  onToggleActive: (id: string) => void
  onToggleFeatured: (id: string) => void
  onDelete: (id: string) => void
  onEditPrice: (item: CatalogItem) => void
}

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const getSourceTypeInfo = (sourceType: string) => {
  const typeMap: Record<string, { icon: typeof Bed; label: string; color: string }> = {
    hotel: { icon: Bed, label: 'Hotel', color: 'bg-blue-100 text-blue-700' },
    excursion: { icon: Mountain, label: 'Excursión', color: 'bg-emerald-100 text-emerald-700' },
    package: { icon: Package, label: 'Paquete', color: 'bg-purple-100 text-purple-700' },
    transport: { icon: Bus, label: 'Transporte', color: 'bg-amber-100 text-amber-700' },
    destination: { icon: Globe, label: 'Destino', color: 'bg-cyan-100 text-cyan-700' },
    room: { icon: Bed, label: 'Habitación', color: 'bg-indigo-100 text-indigo-700' },
  }
  return typeMap[sourceType] || { icon: Package, label: sourceType, color: 'bg-gray-100 text-gray-600' }
}

const getSourceImage = (sourceType: string, sourceData: Record<string, unknown>): string => {
  if (sourceType === 'hotel' || sourceType === 'excursion') {
    const images = sourceData.images as string[] | undefined
    return images?.[0] || ''
  }
  return (sourceData.image as string) || ''
}

const getSourceName = (sourceType: string, sourceData: Record<string, unknown>): string => {
  return (sourceData.name as string) || (sourceData.title as string) || 'Sin nombre'
}

const getSourceLocation = (sourceType: string, sourceData: Record<string, unknown>): string => {
  if (sourceType === 'transport') {
    return `${sourceData.origin || ''} → ${sourceData.destination || ''}`
  }
  return (sourceData.cityName as string) || (sourceData.region as string) || (sourceData.location as string) || ''
}

const getSourceBasePrice = (sourceType: string, sourceData: Record<string, unknown>): number => {
  if (sourceType === 'package') {
    return (sourceData.price as number) || 0
  }
  return (sourceData.priceFrom as number) || (sourceData.basePrice as number) || 0
}

export function ResellerCatalogItem({
  item,
  onToggleActive,
  onToggleFeatured,
  onDelete,
  onEditPrice,
}: ResellerCatalogItemProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const sourceTypeInfo = getSourceTypeInfo(item.sourceType)
  const Icon = sourceTypeInfo.icon
  const image = getSourceImage(item.sourceType, item.sourceData)
  const name = item.customName || getSourceName(item.sourceType, item.sourceData)
  const location = getSourceLocation(item.sourceType, item.sourceData)
  const basePrice = getSourceBasePrice(item.sourceType, item.sourceData)
  const displayPrice = item.customPrice ?? basePrice

  const handleAction = async (action: string, fn: () => Promise<void>) => {
    setLoading(action)
    try {
      await fn()
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className={`overflow-hidden transition-all ${!item.active ? 'opacity-60' : ''} ${item.featured ? 'ring-2 ring-amber-200' : ''}`}>
      <div className="relative h-40 overflow-hidden bg-gray-100">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10">
            <Icon className="size-12 text-primary/50" />
          </div>
        )}

        <div className="absolute top-2 left-2 flex gap-1">
          <Badge className={`${sourceTypeInfo.color} hover:${sourceTypeInfo.color}`}>
            {sourceTypeInfo.label}
          </Badge>
          {item.featured && (
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
              <Star className="size-3 fill-current mr-1" />
              Destacado
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <Badge className={item.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-100'}>
            {item.active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          {location && (
            <p className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <MapPin className="size-3" />
              {location}
            </p>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-lg font-bold text-gray-900">{formatCOP(displayPrice)}</p>
          {item.customPrice !== null && item.customPrice !== basePrice && (
            <p className="text-xs text-gray-400 line-through">{formatCOP(basePrice)}</p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onEditPrice(item)}
          >
            <Edit2 className="size-3 mr-1" />
            Editar
          </Button>

          <Button
            variant="outline"
            size="sm"
            className={item.featured ? 'text-amber-600' : 'text-gray-400'}
            disabled={loading === 'featured'}
            onClick={() => handleAction('featured', () => onToggleFeatured(item.id))}
          >
            {loading === 'featured' ? (
              <Loader2 className="size-3 animate-spin" />
            ) : item.featured ? (
              <Star className="size-3 fill-current" />
            ) : (
              <StarOff className="size-3" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className={item.active ? 'text-emerald-600' : 'text-gray-400'}
            disabled={loading === 'active'}
            onClick={() => handleAction('active', () => onToggleActive(item.id))}
          >
            {loading === 'active' ? (
              <Loader2 className="size-3 animate-spin" />
            ) : item.active ? (
              <Eye className="size-3" />
            ) : (
              <EyeOff className="size-3" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600"
            disabled={loading === 'delete'}
            onClick={() => handleAction('delete', () => onDelete(item.id))}
          >
            {loading === 'delete' ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function CatalogItemSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-40 bg-gray-200 animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
          <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
          <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
          <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
        </div>
      </CardContent>
    </Card>
  )
}

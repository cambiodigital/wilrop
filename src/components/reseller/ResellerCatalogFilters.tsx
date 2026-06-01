'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, Star, X } from 'lucide-react'

const sourceTypes = [
  { value: 'all', label: 'Todos' },
  { value: 'hotel', label: 'Hoteles' },
  { value: 'excursion', label: 'Excursiones' },
  { value: 'package', label: 'Paquetes' },
  { value: 'transport', label: 'Transporte' },
  { value: 'cruise', label: 'Cruceros' },
  { value: 'destination', label: 'Destinos' },
]

export interface CatalogFilters {
  search: string
  sourceType: string
  active: boolean | undefined
  featured: boolean | undefined
}

interface ResellerCatalogFiltersProps {
  filters: CatalogFilters
  onFiltersChange: (filters: CatalogFilters) => void
  totalItems: number
}

export function ResellerCatalogFilters({ filters, onFiltersChange, totalItems }: ResellerCatalogFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = filters.active !== undefined || filters.featured !== undefined

  const clearAllFilters = () => {
    onFiltersChange({
      search: filters.search,
      sourceType: filters.sourceType,
      active: undefined,
      featured: undefined,
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Buscar en tu catálogo..."
            className="pl-10"
          />
        </div>

        <Select
          value={filters.sourceType}
          onValueChange={(value) => onFiltersChange({ ...filters, sourceType: value })}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo de producto" />
          </SelectTrigger>
          <SelectContent>
            {sourceTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="size-4" />
          Filtros
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Estado:</label>
            <Select
              value={filters.active === undefined ? 'all' : filters.active ? 'true' : 'false'}
              onValueChange={(value) => {
                onFiltersChange({
                  ...filters,
                  active: value === 'all' ? undefined : value === 'true',
                })
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Destacados:</label>
            <Select
              value={filters.featured === undefined ? 'all' : filters.featured ? 'true' : 'false'}
              onValueChange={(value) => {
                onFiltersChange({
                  ...filters,
                  featured: value === 'all' ? undefined : value === 'true',
                })
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Destacados</SelectItem>
                <SelectItem value="false">No destacados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="gap-1 text-gray-500"
            >
              <X className="size-3" />
              Limpiar
            </Button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu catálogo
        </p>
        {filters.featured && (
          <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100">
            <Star className="size-3 fill-current" />
            Destacados
          </Badge>
        )}
      </div>
    </div>
  )
}

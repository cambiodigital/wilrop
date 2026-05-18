'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

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

interface ResellerPriceEditorProps {
  item: CatalogItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (itemId: string, data: { customPrice: number | null; customName: string; customDescription: string }) => Promise<void>
  canCustomizePrices: boolean
}

export function ResellerPriceEditor({ item, open, onOpenChange, onSave, canCustomizePrices }: ResellerPriceEditorProps) {
  const [customPrice, setCustomPrice] = useState<string>('')
  const [customName, setCustomName] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const basePrice = item?.sourceData?.priceFrom as number | undefined ?? item?.sourceData?.basePrice as number | undefined ?? item?.sourceData?.price as number | undefined ?? 0

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && item) {
      setCustomPrice(item.customPrice !== null ? item.customPrice.toString() : '')
      setCustomName(item.customName || '')
      setCustomDescription(item.customDescription || '')
    }
    onOpenChange(newOpen)
  }

  const handleSave = async () => {
    if (!item) return

    const priceValue = customPrice.trim() ? parseInt(customPrice, 10) : null

    if (priceValue !== null && (isNaN(priceValue) || priceValue < 0)) {
      toast.error('El precio debe ser un número positivo')
      return
    }

    setLoading(true)
    try {
      await onSave(item.id, {
        customPrice: priceValue,
        customName: customName.trim(),
        customDescription: customDescription.trim(),
      })
      toast.success('Cambios guardados correctamente')
      onOpenChange(false)
    } catch {
      toast.error('No se pudieron guardar los cambios')
    } finally {
      setLoading(false)
    }
  }

  if (!item) return null

  const displayPrice = item.customPrice ?? basePrice

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar producto del catálogo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">
              {item.customName || (item.sourceData.name as string) || (item.sourceData.title as string) || 'Producto'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Precio base: {formatCOP(basePrice)}
              {item.customPrice !== null && item.customPrice !== basePrice && (
                <span className="ml-2 text-amber-600 font-medium">
                  → Tu precio: {formatCOP(item.customPrice)}
                </span>
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customName">Nombre personalizado</Label>
            <Input
              id="customName"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Deja vacío para usar el nombre original"
              maxLength={200}
            />
            <p className="text-xs text-gray-400">
              {customName.length}/200 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customDescription">Descripción personalizada</Label>
            <textarea
              id="customDescription"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Deja vacío para usar la descripción original"
              maxLength={1000}
              className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-400">
              {customDescription.length}/1000 caracteres
            </p>
          </div>

          {canCustomizePrices ? (
            <div className="space-y-2">
              <Label htmlFor="customPrice">Precio personalizado</Label>
              <Input
                id="customPrice"
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder={`Deja vacío para usar ${formatCOP(basePrice)}`}
                min={0}
              />
              <p className="text-xs text-gray-400">
                Dejar vacío para usar el precio base del producto
              </p>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                Tu nivel actual no permite personalizar precios. Contacta al administrador para actualizar tu nivel.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch id="featured" checked={item.featured} disabled />
            <Label htmlFor="featured" className="text-sm text-gray-500">
              Producto destacado (editable desde la vista principal)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

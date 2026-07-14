'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Palette, Store, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SubagentWhiteLabel() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(false)
  const [storeName, setStoreName] = useState('')

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/subagent/whitelabel')
        const json = await res.json()
        if (json.success) {
          setWhiteLabelEnabled(json.data.whiteLabelEnabled)
          setStoreName(json.data.storeName || '')
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  const handleSave = async () => {
    if (!storeName.trim()) {
      toast.error('El nombre de la tienda es obligatorio')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/subagent/whitelabel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName: storeName.trim() }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Configuración actualizada correctamente')
      } else {
        toast.error(json.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (!whiteLabelEnabled) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="py-16 text-center">
            <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-card-foreground mb-2">
              Marca Blanca no habilitada
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              La funcionalidad de marca blanca no está habilitada para tu cuenta.
              Contacta al administrador para activarla.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
          <Palette className="w-6 h-6" />
          Marca Blanca
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configura la apariencia de tu tienda virtual
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configuración de Tienda</CardTitle>
              <CardDescription>Personaliza el nombre de tu tienda virtual</CardDescription>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Activo</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="storeName">Nombre de la Tienda</Label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Mi Agencia de Viajes"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Este nombre se mostrará a tus clientes en la tienda virtual
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

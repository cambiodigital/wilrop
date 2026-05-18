'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Building, Mail, MapPin, User, Camera, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { ResellerProfileData } from '@/lib/reseller/profile'

const levelLabels: Record<string, string> = {
  starter: 'Starter',
  standard: 'Standard',
  free_light: 'Free Light',
}

const statusConfig: Record<string, { className: string; label: string }> = {
  pending: { className: 'bg-amber-100 text-amber-700 hover:bg-amber-100', label: 'Pendiente' },
  under_review: { className: 'bg-blue-100 text-blue-700 hover:bg-blue-100', label: 'En Revisión' },
  approved: { className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100', label: 'Aprobado' },
  rejected: { className: 'bg-red-100 text-red-700 hover:bg-red-100', label: 'Rechazado' },
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface ProfileFormState {
  contactName: string
  companyName: string
  country: string
  phone: string
  website: string
  taxId: string
  address: string
  logoUrl: string
}

export default function ResellerProfileForm({
  initialData,
  onUpdate,
}: {
  initialData?: ResellerProfileData | null
  onUpdate?: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProfileFormState>({
    contactName: initialData?.contactName ?? '',
    companyName: initialData?.companyName ?? '',
    country: initialData?.country ?? '',
    phone: initialData?.phone ?? '',
    website: initialData?.website ?? '',
    taxId: initialData?.taxId ?? '',
    address: initialData?.address ?? '',
    logoUrl: initialData?.logoUrl ?? '',
  })

  const updateField = (field: keyof ProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.contactName.trim()) {
      toast.error('El nombre de contacto es obligatorio')
      return
    }
    if (!form.companyName.trim()) {
      toast.error('El nombre de empresa es obligatorio')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/reseller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const json = await res.json()
      if (json.success) {
        toast.success('Perfil actualizado correctamente')
        onUpdate?.()
      } else {
        toast.error(json.error || 'Error al actualizar el perfil')
      }
    } catch {
      toast.error('Error al actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo no debe superar los 5MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (json.success && json.url) {
        const updateRes = await fetch('/api/reseller/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, logoUrl: json.url }),
        })

        const updateJson = await updateRes.json()
        if (updateJson.success) {
          toast.success('Logo actualizado correctamente')
          setForm((prev) => ({ ...prev, logoUrl: json.url }))
          onUpdate?.()
        }
      } else {
        toast.error(json.error || 'Error al subir el logo')
      }
    } catch {
      toast.error('Error al subir el logo')
    } finally {
      e.target.value = ''
    }
  }

  const handleReset = () => {
    if (initialData) {
      setForm({
        contactName: initialData.contactName,
        companyName: initialData.companyName,
        country: initialData.country,
        phone: initialData.phone,
        website: initialData.website,
        taxId: initialData.taxId,
        address: initialData.address,
        logoUrl: initialData.logoUrl ?? '',
      })
    }
  }

  const status = initialData ? statusConfig[initialData.approvalStatus] : null

  return (
    <div className="space-y-6">
      {/* Info Card */}
      {initialData && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-primary/20">
                  <AvatarImage src={initialData.logoUrl || undefined} alt={initialData.companyName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                    {initialData.companyName ? getInitials(initialData.companyName) : 'RE'}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="logo-upload"
                  className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {initialData.companyName || 'Sin empresa'}
                </h2>
                <p className="text-sm text-gray-600">{initialData.contactName || 'Sin contacto'}</p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  {initialData.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {initialData.email}
                    </span>
                  )}
                  {initialData.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {initialData.country}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    Nivel: {levelLabels[initialData.sellerLevel] || initialData.sellerLevel}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Información del Perfil</CardTitle>
              <CardDescription>Actualiza los datos de tu cuenta de revendedor</CardDescription>
            </div>
            {initialData && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">Código: {initialData.code}</Badge>
                {status && <Badge className={status.className}>{status.label}</Badge>}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactName" className="label-required">
                Nombre de contacto
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contactName"
                  value={form.contactName}
                  onChange={(e) => updateField('contactName', e.target.value)}
                  placeholder="Juan Pérez"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="label-required">
                Nombre de empresa
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="Mi Agencia de Viajes S.A."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                value={initialData?.email ?? ''}
                disabled
                className="pl-10 bg-gray-50 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="country">País</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="México"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="website">Sitio web</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://miagencia.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxId">NIT / RUT / ID Fiscal</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="taxId"
                  value={form.taxId}
                  onChange={(e) => updateField('taxId', e.target.value)}
                  placeholder="12345678-9"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Dirección</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="address"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Calle 123, Ciudad, País"
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleReset}>
              Cancelar
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, Mail, MapPin, User, Phone, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { SubagentProfileData } from '@/lib/subagent/profile'
import { SubagentInfoCard } from './SubagentInfoCard'

interface FormState {
  contactName: string
  agencyName: string
  country: string
  phone: string
}

export default function SubagentProfileForm({ initialData }: { initialData?: SubagentProfileData | null }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({
    contactName: initialData?.contactName ?? '',
    agencyName: initialData?.agencyName ?? '',
    country: initialData?.country ?? '',
    phone: initialData?.phone ?? '',
  })

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.contactName.trim() || !form.agencyName.trim()) {
      toast.error('Nombre de contacto y agencia son obligatorios')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/subagent/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Perfil actualizado correctamente')
      } else {
        toast.error(json.error || 'Error al actualizar el perfil')
      }
    } catch {
      toast.error('Error al actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {initialData && <SubagentInfoCard profile={initialData} />}

      <Card>
        <CardHeader>
          <CardTitle>Información del Perfil</CardTitle>
          <CardDescription>Actualiza los datos de tu cuenta de subagente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactName">Nombre de contacto</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="contactName" value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} placeholder="Juan Pérez" className="pl-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agencyName">Nombre de agencia</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="agencyName" value={form.agencyName} onChange={(e) => updateField('agencyName', e.target.value)} placeholder="Mi Agencia" className="pl-10" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" value={initialData?.email ?? ''} disabled className="pl-10 bg-muted cursor-not-allowed" />
            </div>
            <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="country">País</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="country" value={form.country} onChange={(e) => updateField('country', e.target.value)} placeholder="Colombia" className="pl-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+57 300 123 4567" className="pl-10" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => initialData && setForm({ contactName: initialData.contactName, agencyName: initialData.agencyName, country: initialData.country, phone: initialData.phone })}>
              Cancelar
            </Button>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

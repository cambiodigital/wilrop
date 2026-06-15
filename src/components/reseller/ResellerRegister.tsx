'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Mail, Lock, User, Phone, Globe, ArrowLeft, FileText, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { MIN_PASSWORD_LENGTH } from '@/lib/constants'

export default function ResellerRegister() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    contactName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    phone: '',
    website: '',
    taxId: '',
    address: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.contactName.trim()) {
      toast.error('El nombre de contacto es obligatorio')
      return
    }
    if (!form.companyName.trim()) {
      toast.error('El nombre de empresa es obligatorio')
      return
    }
    if (!form.email.trim()) {
      toast.error('El email es obligatorio')
      return
    }
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reseller/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: form.contactName,
          companyName: form.companyName,
          email: form.email,
          password: form.password,
          country: form.country,
          phone: form.phone,
          website: form.website,
          taxId: form.taxId,
          address: form.address,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Error en el registro')
        return
      }

      toast.success(data.message, { duration: 8000 })
      setTimeout(() => router.push('/reseller/login'), 3000)
    } catch {
      toast.error('No se pudo completar el registro')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 mb-2"
            onClick={() => router.push('/reseller/login')}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al login
          </Button>
          <CardTitle className="text-2xl">Ser revendedor WILROP</CardTitle>
          <CardDescription>
            Regístrate para acceder al portal B2B y gestionar tus ventas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="label-required">Nombre de contacto</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.contactName}
                    onChange={(e) => updateField('contactName', e.target.value)}
                    placeholder="Juan Pérez"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="label-required">Nombre de empresa</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder="Mi Agencia de Viajes S.A."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="label-required">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="agencia@ejemplo.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="label-required">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="label-required">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    placeholder="Repite la contraseña"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>País</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="México"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
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
                <Label>Sitio web</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://miagencia.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>NIT / RUT / ID Fiscal</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.taxId}
                    onChange={(e) => updateField('taxId', e.target.value)}
                    placeholder="12345678-9"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Dirección</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Calle 123, Ciudad, País"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3 text-sm text-blue-800 dark:text-blue-300">
              <strong>Nota:</strong> Tu cuenta quedará pendiente de aprobación. El administrador revisará tu solicitud y habilitará el acceso.
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold h-11 shadow-lg shadow-amber-500/25 transition-all duration-200" disabled={loading}>
              {loading ? 'Registrando...' : 'Solicitar registro'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function SubagentPasswordChange() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.currentPassword) { toast.error('Ingresa tu contraseña actual'); return }
    if (form.newPassword.length < 8) { toast.error('La nueva contraseña debe tener al menos 8 caracteres'); return }
    if (form.newPassword !== form.confirmPassword) { toast.error('Las contraseñas no coinciden'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/subagent/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Contraseña actualizada correctamente')
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(json.error || 'Error al cambiar la contraseña')
      }
    } catch {
      toast.error('Error al cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar Contraseña</CardTitle>
        <CardDescription>Actualiza tu contraseña de acceso al panel</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Contraseña actual</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="currentPassword" type="password" value={form.currentPassword} onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))} placeholder="Ingresa tu contraseña actual" className="pl-10" />
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="newPassword" type="password" value={form.newPassword} onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="Mínimo 8 caracteres" className="pl-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="Repite la nueva contraseña" className="pl-10" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

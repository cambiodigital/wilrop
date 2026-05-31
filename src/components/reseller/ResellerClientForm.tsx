'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  passport: string;
  notes: string;
}

interface ResellerClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClient?: ClientFormData & { id: string } | null;
  onSuccess: () => void;
}

const emptyForm: ClientFormData = {
  name: '',
  email: '',
  phone: '',
  country: '',
  passport: '',
  notes: '',
};

export default function ResellerClientForm({
  open,
  onOpenChange,
  editingClient,
  onSuccess,
}: ResellerClientFormProps) {
  const [form, setForm] = useState<ClientFormData>(editingClient || emptyForm);
  const [loading, setLoading] = useState(false);

  const isEditing = !!editingClient;

  const updateField = (field: keyof ClientFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Nombre y email son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const url = isEditing ? `/api/reseller/clients/${editingClient!.id}` : '/api/reseller/clients';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Error al guardar el cliente');
        return;
      }

      toast.success(isEditing ? 'Cliente actualizado' : 'Cliente creado exitosamente');
      setForm(emptyForm);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setForm(emptyForm);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md admin-dialog">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica la información del cliente' : 'Completa la información del nuevo cliente'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name" className="label-required">
              Nombre Completo
            </Label>
            <Input
              id="client-name"
              placeholder="Nombre y apellidos"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-email" className="label-required">
              Correo Electrónico
            </Label>
            <Input
              id="client-email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-phone">Teléfono</Label>
            <Input
              id="client-phone"
              placeholder="+57 300 000 0000"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-country">País</Label>
            <Input
              id="client-country"
              placeholder="País de residencia"
              value={form.country}
              onChange={(e) => updateField('country', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-passport">Pasaporte</Label>
            <Input
              id="client-passport"
              placeholder="Número de pasaporte (opcional)"
              value={form.passport}
              onChange={(e) => updateField('passport', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-notes">Notas</Label>
            <Input
              id="client-notes"
              placeholder="Notas adicionales (opcional)"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            onClick={handleSubmit}
            disabled={loading || !form.name.trim() || !form.email.trim()}
          >
            {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Agregar Cliente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

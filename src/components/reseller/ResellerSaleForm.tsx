'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

interface SaleFormData {
  clientName: string;
  clientEmail: string;
  clientId: string;
  totalAmount: string;
  notes: string;
}

interface ResellerSaleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const emptyForm: SaleFormData = {
  clientName: '',
  clientEmail: '',
  clientId: '',
  totalAmount: '',
  notes: '',
};

export default function ResellerSaleForm({
  open,
  onOpenChange,
  onSuccess,
}: ResellerSaleFormProps) {
  const [form, setForm] = useState<SaleFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await fetch('/api/reseller/clients');
      const result = await response.json();
      if (result.success) {
        setClients(result.data);
      }
    } catch {
      console.error('Error cargando clientes');
    } finally {
      setLoadingClients(false);
    }
  };

  const updateField = (field: keyof SaleFormData, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'clientId' && value) {
        const selected = clients.find((c) => c.id === value);
        if (selected) {
          updated.clientName = selected.name;
          updated.clientEmail = selected.email;
        }
      }

      return updated;
    });
  };

  const calculateCommission = () => {
    const amount = parseFloat(form.totalAmount);
    if (isNaN(amount) || amount <= 0) return 0;
    return Math.round(amount * 0.15);
  };

  const handleSubmit = async () => {
    if (!form.clientName.trim() || !form.totalAmount || parseFloat(form.totalAmount) <= 0) {
      toast.error('Cliente y monto son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reseller/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          totalAmount: parseFloat(form.totalAmount),
          notes: form.notes,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Error al registrar la venta');
        return;
      }

      toast.success('Venta registrada exitosamente');
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

  const commission = calculateCommission();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Venta</DialogTitle>
          <DialogDescription>
            Completa la información de la venta realizada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sale-client-select">
              Cliente Existente <span className="text-gray-400">(opcional)</span>
            </Label>
            <Select value={form.clientId} onValueChange={(v) => updateField('clientId', v)}>
              <SelectTrigger id="sale-client-select">
                <SelectValue placeholder="Seleccionar cliente registrado" />
              </SelectTrigger>
              <SelectContent>
                {loadingClients ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Cargando...
                  </div>
                ) : clients.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400">No hay clientes registrados</div>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale-client-name" className="label-required">
              Nombre del Cliente
            </Label>
            <Input
              id="sale-client-name"
              placeholder="Nombre y apellidos"
              value={form.clientName}
              onChange={(e) => updateField('clientName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale-client-email">Correo Electrónico</Label>
            <Input
              id="sale-client-email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.clientEmail}
              onChange={(e) => updateField('clientEmail', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale-amount" className="label-required">
              Monto Total
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="sale-amount"
                type="number"
                placeholder="0"
                className="pl-10"
                value={form.totalAmount}
                onChange={(e) => updateField('totalAmount', e.target.value)}
              />
            </div>
            {commission > 0 && (
              <p className="text-xs text-emerald-600 font-medium">
                Comisión estimada: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(commission)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale-notes">Notas</Label>
            <Textarea
              id="sale-notes"
              placeholder="Notas adicionales sobre la venta (opcional)"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={2}
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
            disabled={loading || !form.clientName.trim() || !form.totalAmount}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              'Registrar Venta'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

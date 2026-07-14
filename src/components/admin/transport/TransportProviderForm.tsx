'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Phone, Mail, Users } from 'lucide-react';
import { FieldHelper, FieldTooltip } from '@/components/ui/form-helpers';
import { type TransportProvider, vehicleTypeLabels } from './types';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: TransportProvider | null;
  form: { name: string; legalName: string; nit: string; phone: string; email: string; vehicleType: string; capacity: number; active: boolean };
  onFormChange: (update: Partial<Props['form']>) => void;
  onSave: () => void;
  saving: boolean;
}

export function TransportProviderForm({
  open, onOpenChange, editing, form, onFormChange, onSave, saving,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto admin-dialog">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Modifica los datos del proveedor de transporte' : 'Registra un nuevo proveedor de transporte'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *<FieldTooltip label="Nombre de la empresa de transporte" /></Label>
              <Input value={form.name} onChange={(e) => onFormChange({ name: e.target.value })} placeholder="Transportes del Caribe" />
              <FieldHelper>Razon social o nombre comercial del proveedor</FieldHelper>
            </div>
            <div className="space-y-2">
              <Label>Razon Social<FieldTooltip label="Nombre legal registrado de la empresa" /></Label>
              <Input value={form.legalName} onChange={(e) => onFormChange({ legalName: e.target.value })} placeholder="Transportes del Caribe S.A.S." />
              <FieldHelper>Opcional. Para facturacion y registros</FieldHelper>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>NIT<FieldTooltip label="Numero de Identificacion Tributaria" /></Label>
              <Input value={form.nit} onChange={(e) => onFormChange({ nit: e.target.value })} placeholder="900123456-7" />
              <FieldHelper>Identificador fiscal de la empresa en Colombia</FieldHelper>
            </div>
            <div className="space-y-2">
              <Label>Telefono<FieldTooltip label="Numero de contacto del proveedor" /></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={form.phone} onChange={(e) => onFormChange({ phone: e.target.value })} placeholder="+57 300 1234567" className="pl-10" />
              </div>
              <FieldHelper>Formato: +57 300 000 0000</FieldHelper>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email<FieldTooltip label="Correo electronico de contacto" /></Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" value={form.email} onChange={(e) => onFormChange({ email: e.target.value })} placeholder="info@transportes.com" className="pl-10" />
            </div>
            <FieldHelper>Para notificaciones y coordinacion</FieldHelper>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Vehiculo<FieldTooltip label="Categoria del vehiculo principal" /></Label>
              <Select value={form.vehicleType} onValueChange={(v) => onFormChange({ vehicleType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(vehicleTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldHelper>Define el tipo de flota disponible</FieldHelper>
            </div>
            <div className="space-y-2">
              <Label>Capacidad<FieldTooltip label="Numero maximo de pasajeros por vehiculo" /></Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="number" min="1" value={form.capacity} onChange={(e) => onFormChange({ capacity: Number(e.target.value) })} className="pl-10" />
              </div>
              <FieldHelper>Usado para calcular disponibilidad en reservas</FieldHelper>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch checked={form.active} onCheckedChange={(v) => onFormChange({ active: v })} />
            <Label>Proveedor activo<FieldTooltip label="Si esta desactivado, el proveedor no aparece" /></Label>
          </div>

          <div className="dialog-footer">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={onSave} disabled={saving} size="default">
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

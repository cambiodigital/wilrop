'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FieldHelper, FieldTooltip } from '@/components/ui/form-helpers';
import { TagInput } from './TagInput';
import { ServiceDestinationFields } from './ServiceDestinationFields';
import { type TransportService, type TransportProvider, vehicleTypeLabels, routeTypeLabels } from './types';
import type { TransportDestinationOption, TransportDestinationSelectorState } from '@/lib/admin/transport-destination-ui';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: TransportService | null;
  form: {
    providerId: string; name: string; routeType: string;
    origin: string; destination: string; cityId: string; cityName: string;
    originDestinationId: string; destinationDestinationId: string;
    durationMins: number; basePrice: number; pricePerExtra: number;
    includes: string[]; notes: string; active: boolean; resellerId: string;
  };
  onFormChange: (update: Partial<Props['form']>) => void;
  onSave: () => void;
  saving: boolean;
  providers: TransportProvider[];
  resellers: any[];
  destinationOptions: TransportDestinationOption[];
  destinationsLoading: boolean;
  destinationsError: string | null;
  onRetryDestinations: () => void;
  selectedOrigin?: TransportDestinationOption;
  selectedDestination?: TransportDestinationOption;
  originSelectorState: TransportDestinationSelectorState;
  destinationSelectorState: TransportDestinationSelectorState;
}

export function TransportServiceForm({
  open, onOpenChange, editing, form, onFormChange, onSave, saving,
  providers, resellers, destinationOptions, destinationsLoading, destinationsError,
  onRetryDestinations, selectedOrigin, selectedDestination,
  originSelectorState, destinationSelectorState,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto admin-dialog">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Modifica los datos del servicio de transporte' : 'Registra un nuevo servicio de transporte'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Proveedor *<FieldTooltip label="Empresa que opera este servicio de transporte" /></Label>
            <Select value={form.providerId} onValueChange={(v) => onFormChange({ providerId: v })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
              <SelectContent>
                {providers.filter((p) => p.active).map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({vehicleTypeLabels[p.vehicleType]})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldHelper>Debe existir como proveedor registrado</FieldHelper>
          </div>

          <div className="space-y-2">
            <Label>Nombre del Servicio<FieldTooltip label="Nombre descriptivo de la ruta o servicio" /></Label>
            <Input value={form.name} onChange={(e) => onFormChange({ name: e.target.value })} placeholder="Traslado Aeropuerto CTG - Centro" />
            <FieldHelper>Ej: Traslado Aeropuerto - Hotel Charleston</FieldHelper>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Ruta<FieldTooltip label="Direccion y tipo de traslado" /></Label>
              <Select value={form.routeType} onValueChange={(v) => onFormChange({ routeType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(routeTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldHelper>Define como se muestra en los resultados de busqueda</FieldHelper>
            </div>
            <div className="space-y-2">
              <Label>Duracion (min)<FieldTooltip label="Tiempo estimado del trayecto en minutos" /></Label>
              <Input type="number" min="1" value={form.durationMins} onChange={(e) => onFormChange({ durationMins: Number(e.target.value) })} />
              <FieldHelper>Visible en la pagina de detalle del servicio</FieldHelper>
            </div>
          </div>

          <ServiceDestinationFields form={form} onFormChange={onFormChange} destinationOptions={destinationOptions} destinationsLoading={destinationsLoading} destinationsError={destinationsError} onRetryDestinations={onRetryDestinations} selectedOrigin={selectedOrigin} selectedDestination={selectedDestination} originSelectorState={originSelectorState} destinationSelectorState={destinationSelectorState} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Precio Base (COP)<FieldTooltip label="Precio base del servicio en COP" /></Label>
              <Input type="number" min="0" value={form.basePrice} onChange={(e) => onFormChange({ basePrice: Number(e.target.value) })} placeholder="85000" />
            </div>
            <div className="space-y-2">
              <Label>Precio por Pasajero Extra (COP)<FieldTooltip label="Costo adicional por cada pasajero extra" /></Label>
              <Input type="number" min="0" value={form.pricePerExtra} onChange={(e) => onFormChange({ pricePerExtra: Number(e.target.value) })} placeholder="15000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Incluye<FieldTooltip label="Servicios incluidos en el traslado" /></Label>
            <TagInput tags={form.includes} onChange={(includes) => onFormChange({ includes })} placeholder="Ej: Seguro, Equipaje, Agua..." />
            <FieldHelper>Ej: Seguro, Aire acondicionado, WiFi, Agua</FieldHelper>
          </div>

          <div className="space-y-2">
            <Label>Notas<FieldTooltip label="Informacion adicional para el cliente o administrador" /></Label>
            <Textarea value={form.notes} onChange={(e) => onFormChange({ notes: e.target.value })} placeholder="Notas adicionales del servicio..." rows={3} />
            <FieldHelper>Ej: Punto de encuentro, instrucciones especiales</FieldHelper>
          </div>

          <div className="space-y-1.5 pt-2">
            <Label htmlFor="transport-reseller">Asignar a Revendedor<FieldTooltip label="Asigna este servicio a un revendedor o dejalo global" /></Label>
            <select id="transport-reseller" value={form.resellerId ?? ''} onChange={(e) => onFormChange({ resellerId: e.target.value || '' })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
              <option value="">Ninguno / Global (Administrador)</option>
              {resellers.map((r) => <option key={r.id} value={r.id}>{r.companyName || r.contactName || r.email}</option>)}
            </select>
            <FieldHelper>Servicios asignados solo los ve ese revendedor</FieldHelper>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch checked={form.active} onCheckedChange={(v) => onFormChange({ active: v })} />
            <Label>Servicio activo<FieldTooltip label="Si esta desactivado, el servicio no aparece en el portal" /></Label>
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

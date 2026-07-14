'use client';

import { formatCurrency } from '@/lib/currency';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Anchor, AlertTriangle } from 'lucide-react';
import { FieldHelper, FieldTooltip } from '@/components/ui/form-helpers';
import type { Cabin, CruiseFormData } from './types';

interface CruiseCabinsTabProps {
  formData: CruiseFormData;
  newCabin: Cabin;
  cabinIncludesInput: string;
  onNewCabinChange: (cabin: Cabin) => void;
  onCabinIncludesInputChange: (value: string) => void;
  onAddCabin: () => void;
  onRemoveCabin: (index: number) => void;
  onUpdateCabinField: (index: number, field: keyof Cabin, value: any) => void;
}

export function CruiseCabinsTab({
  formData, newCabin, cabinIncludesInput,
  onNewCabinChange, onCabinIncludesInputChange, onAddCabin, onRemoveCabin, onUpdateCabinField,
}: CruiseCabinsTabProps) {
  return (
    <div className="space-y-4 pt-4 overflow-y-auto flex-1 min-h-0">
      <div className="border border-border/80 rounded-xl p-4 bg-card shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-sky-700 flex items-center gap-1.5 border-b border-border pb-2">
          <Anchor className="w-4 h-4" />Registrar Categoría de Camarote
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Nombre de Categoria *<FieldTooltip label="Nombre de la categoria de camarote" /></Label>
            <Input value={newCabin.name} onChange={(e) => onNewCabinChange({ ...newCabin, name: e.target.value })} placeholder="Ej. Cabina Interior, Suite con Balcon" />
            <FieldHelper>Ej: Interior, Vista al Mar, Balcon, Suite</FieldHelper>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Camas / Distribucion<FieldTooltip label="Configuracion de camas del camarote" /></Label>
            <Input value={newCabin.beds} onChange={(e) => onNewCabinChange({ ...newCabin, beds: e.target.value })} placeholder="Ej. 1 Cama King o 2 Twin" />
            <FieldHelper>Ej: 2 camas twin, 1 cama king</FieldHelper>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Capacidad Maxima (personas)<FieldTooltip label="Numero maximo de pasajeros en este camarote" /></Label>
            <Input type="number" min={1} max={10} value={newCabin.capacity} onChange={(e) => onNewCabinChange({ ...newCabin, capacity: parseInt(e.target.value, 10) || 2 })} />
            <FieldHelper>Usado para filtrar disponibilidad</FieldHelper>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Precio Base (COP) *<FieldTooltip label="Precio por persona en COP" /></Label>
            <Input type="number" min={0} value={newCabin.basePrice} onChange={(e) => onNewCabinChange({ ...newCabin, basePrice: parseInt(e.target.value, 10) || 0 })} />
            <FieldHelper>Visible en pagina de detalle del crucero</FieldHelper>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Precio Original / Antes (COP - Opcional)<FieldTooltip label="Precio sin descuento. Si es mayor, se muestra oferta" /></Label>
            <Input type="number" min={0} value={newCabin.originalPrice} onChange={(e) => onNewCabinChange({ ...newCabin, originalPrice: parseInt(e.target.value, 10) || 0 })} />
            <FieldHelper>Opcional. Define descuento</FieldHelper>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">URL Imagen del Camarote<FieldTooltip label="Imagen del camarote. Ingresa una URL" /></Label>
            <Input value={newCabin.cabinImage} onChange={(e) => onNewCabinChange({ ...newCabin, cabinImage: e.target.value })} placeholder="Ej. https://url-de-la-foto.jpg" />
            <FieldHelper>URL de la imagen del camarote</FieldHelper>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Servicios Incluidos en el Camarote (Separados por coma)<FieldTooltip label="Amenidades del camarote. Separa con comas" /></Label>
          <Input value={cabinIncludesInput} onChange={(e) => { onCabinIncludesInputChange(e.target.value); onNewCabinChange({ ...newCabin, includes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }); }} placeholder="Ej. Minibar gratis, Servicio a la habitación 24h, Baño privado" />
          <p className="text-[10px] text-muted-foreground">Escribe los servicios separados por comas para guardarlos como etiquetas individuales.</p>
        </div>
        <Button type="button" onClick={onAddCabin} className="bg-sky-600 text-white hover:bg-sky-700 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />Agregar Camarote a la Lista
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Categorías de Camarotes Cargados ({formData.cabins.length})</h4>
        {formData.cabins.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-xl bg-muted/10 text-muted-foreground text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
            <p className="font-semibold text-xs text-foreground">Sin Camarotes Registrados</p>
            <p className="text-[10px] mt-1">Debes agregar al menos un camarote para que el crucero sea reservable en el portal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.cabins.map((cabin, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-muted/20 relative flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-foreground">{cabin.name}</h5>
                    <Badge className="bg-sky-50 text-sky-700 border-sky-200" variant="outline">Capacidad: {cabin.capacity} personas</Badge>
                    {!cabin.active && <Badge variant="destructive" className="text-[9px] px-1 py-0">Inactivo</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">Distribución: <span className="font-semibold text-foreground">{cabin.beds}</span></p>
                  {cabin.includes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cabin.includes.map((inc, i) => <span key={i} className="text-[10px] bg-sky-50 text-sky-800 border border-sky-100 rounded px-1.5 py-0.5">{inc}</span>)}
                    </div>
                  )}
                  {cabin.cabinImage && <p className="text-[10px] text-sky-600 truncate max-w-md">Imagen: {cabin.cabinImage}</p>}
                </div>
                <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Tarifa por persona</p>
                    <span className="font-bold text-base text-sky-700">{formatCurrency(cabin.basePrice)}</span>
                    {cabin.originalPrice > cabin.basePrice && <span className="block text-[11px] line-through text-muted-foreground">{formatCurrency(cabin.originalPrice)}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 mr-2">
                      <Label className="text-[10px] cursor-pointer" htmlFor={`cab-act-${idx}`}>Activo</Label>
                      <Switch id={`cab-act-${idx}`} checked={cabin.active} onCheckedChange={(val) => onUpdateCabinField(idx, 'active', val)} className="scale-90" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onRemoveCabin(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

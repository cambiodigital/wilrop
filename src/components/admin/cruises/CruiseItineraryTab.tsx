'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Compass } from 'lucide-react';
import { FieldTooltip } from '@/components/ui/form-helpers';
import type { ItineraryStop, CruiseFormData } from './types';

interface CruiseItineraryTabProps {
  formData: CruiseFormData;
  newStop: ItineraryStop;
  onNewStopChange: (stop: ItineraryStop) => void;
  onAddStop: () => void;
  onRemoveStop: (index: number) => void;
}

export function CruiseItineraryTab({ formData, newStop, onNewStopChange, onAddStop, onRemoveStop }: CruiseItineraryTabProps) {
  return (
    <div className="space-y-4 pt-4 overflow-y-auto flex-1 min-h-0">
      <div className="border border-border/80 rounded-xl p-4 bg-card shadow-xs">
        <h3 className="text-sm font-semibold mb-3 text-sky-700 flex items-center gap-1.5">
          <Compass className="w-4 h-4" />Agregar Parada en Itinerario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Dia<FieldTooltip label="Numero de dia del itinerario" /></Label>
            <Input type="number" min={1} value={newStop.day} onChange={(e) => onNewStopChange({ ...newStop, day: parseInt(e.target.value, 10) || 1 })} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">Puerto / Ciudad / Titulo<FieldTooltip label="Nombre del puerto o ciudad de la parada" /></Label>
            <Input value={newStop.title} onChange={(e) => onNewStopChange({ ...newStop, title: e.target.value })} placeholder="Ej. Día 1: Embarque en Cartagena de Indias" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Actividad Principal (Opcional)<FieldTooltip label="Descripcion breve de la actividad del dia" /></Label>
            <Input value={newStop.activity || ''} onChange={(e) => onNewStopChange({ ...newStop, activity: e.target.value })} placeholder="Ej. Navegación, Excursión libre" />
          </div>
        </div>
        <div className="space-y-1 mt-3">
          <Label className="text-xs">Descripcion del Dia<FieldTooltip label="Detalle completo de las actividades del dia" /></Label>
          <Textarea rows={2} value={newStop.description} onChange={(e) => onNewStopChange({ ...newStop, description: e.target.value })} placeholder="Detalles sobre lo que se realiza este día en la parada o a bordo..." />
        </div>
        <Button type="button" onClick={onAddStop} className="mt-3 bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-1.5" />Insertar Día de Itinerario
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Cronograma Registrado ({formData.itinerary.length} días)</h4>
        {formData.itinerary.length === 0 ? (
          <p className="text-xs text-muted-foreground bg-accent p-4 rounded-lg text-center">
            No se han configurado paradas de itinerario aún. Registra al menos una parada.
          </p>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {formData.itinerary.map((stop, idx) => (
              <div key={idx} className="flex gap-3 items-start p-3 rounded-lg border border-border bg-muted/30">
                <Badge className="bg-primary hover:bg-primary text-white shrink-0 mt-0.5">Día {stop.day}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h5 className="font-bold text-sm text-foreground">{stop.title}</h5>
                    {stop.activity && <Badge variant="outline" className="text-[10px] py-0 border-primary/30 text-primary">{stop.activity}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{stop.description}</p>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0" onClick={() => onRemoveStop(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

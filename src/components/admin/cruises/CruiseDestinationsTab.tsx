'use client';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import type { DestinationOption, CruiseFormData } from './types';

interface CruiseDestinationsTabProps {
  formData: CruiseFormData;
  destinations: DestinationOption[];
  onToggleDestination: (destId: string) => void;
}

export function CruiseDestinationsTab({ formData, destinations, onToggleDestination }: CruiseDestinationsTabProps) {
  return (
    <div className="space-y-4 pt-4 overflow-y-auto flex-1 min-h-0">
      <div className="space-y-2">
        <Label className="text-base font-semibold">Asignar Destinos al Crucero</Label>
        <p className="text-xs text-muted-foreground">
          Marca las ciudades o destinos turísticos que visita o donde tiene puerto de escala este crucero.
          Esto permitirá que aparezca en el catálogo filtrado por destinos y en las páginas de detalle correspondientes.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
        {destinations.map((dest) => {
          const isChecked = formData.destinations.includes(dest.id);
          return (
            <div key={dest.id} onClick={() => onToggleDestination(dest.id)} className={cn(
              "flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/40",
              isChecked ? "border-sky-500 bg-sky-50 text-sky-900 shadow-2xs font-semibold" : "border-border bg-card text-card-foreground"
            )}>
              <div className={cn("w-4.5 h-4.5 rounded flex items-center justify-center border", isChecked ? "bg-sky-600 border-sky-600 text-white" : "border-muted-foreground/35 bg-card")}>
                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="text-xs select-none truncate">{dest.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

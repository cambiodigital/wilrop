'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Ship } from 'lucide-react';
import { CruiseInfoTab } from './CruiseInfoTab';
import { CruiseItineraryTab } from './CruiseItineraryTab';
import { CruiseCabinsTab } from './CruiseCabinsTab';
import { CruiseDestinationsTab } from './CruiseDestinationsTab';
import type { Cabin, ItineraryStop, CruiseFormData, DestinationOption } from './types';

interface CruiseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: CruiseFormData;
  onFormChange: (data: CruiseFormData) => void;
  destinations: DestinationOption[];
  resellers: any[];
  newStop: ItineraryStop;
  onNewStopChange: (stop: ItineraryStop) => void;
  newCabin: Cabin;
  onNewCabinChange: (cabin: Cabin) => void;
  cabinIncludesInput: string;
  onCabinIncludesInputChange: (value: string) => void;
  onAddStop: () => void;
  onRemoveStop: (index: number) => void;
  onAddCabin: () => void;
  onRemoveCabin: (index: number) => void;
  onUpdateCabinField: (index: number, field: keyof Cabin, value: any) => void;
  onToggleDestination: (destId: string) => void;
  onSave: (e: React.FormEvent) => void;
}

export function CruiseDialog({
  open, onOpenChange, isEditing, formData, onFormChange, destinations, resellers,
  newStop, onNewStopChange, newCabin, onNewCabinChange, cabinIncludesInput, onCabinIncludesInputChange,
  onAddStop, onRemoveStop, onAddCabin, onRemoveCabin, onUpdateCabinField, onToggleDestination, onSave,
}: CruiseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent topAligned className="max-w-4xl h-[90vh] flex flex-col admin-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Ship className="w-6 h-6 text-primary" />
            {isEditing ? 'Editar Crucero' : 'Nuevo Crucero'}
          </DialogTitle>
          <DialogDescription>Completa los detalles del crucero, paradas de itinerario y camarotes.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-6 flex flex-col flex-1 overflow-hidden">
          <Tabs defaultValue="info" className="w-full flex flex-col flex-1 overflow-hidden">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="info">Info Básica</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerario</TabsTrigger>
              <TabsTrigger value="cabins">Camarotes</TabsTrigger>
              <TabsTrigger value="destinations">Destinos ({formData.destinations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <CruiseInfoTab formData={formData} onFormChange={onFormChange} destinations={destinations} resellers={resellers} />
            </TabsContent>
            <TabsContent value="itinerary">
              <CruiseItineraryTab formData={formData} newStop={newStop} onNewStopChange={onNewStopChange} onAddStop={onAddStop} onRemoveStop={onRemoveStop} />
            </TabsContent>
            <TabsContent value="cabins">
              <CruiseCabinsTab formData={formData} newCabin={newCabin} cabinIncludesInput={cabinIncludesInput} onNewCabinChange={onNewCabinChange} onCabinIncludesInputChange={onCabinIncludesInputChange} onAddCabin={onAddCabin} onRemoveCabin={onRemoveCabin} onUpdateCabinField={onUpdateCabinField} />
            </TabsContent>
            <TabsContent value="destinations">
              <CruiseDestinationsTab formData={formData} destinations={destinations} onToggleDestination={onToggleDestination} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/95 text-white">{isEditing ? 'Guardar Cambios' : 'Crear Crucero'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { PackageBasicInfoFields } from '@/components/admin/packages/PackageBasicInfoFields';
import { PackageDestinationComposition } from '@/components/admin/packages/PackageDestinationComposition';
import { PackagePricingFields } from '@/components/admin/packages/PackagePricingFields';
import { PackageImageUpload } from '@/components/admin/packages/PackageImageUpload';
import { PackageDescriptionFields } from '@/components/admin/packages/PackageDescriptionFields';
import { PackageToggles } from '@/components/admin/packages/PackageToggles';
import type { PackageCompositionSelection, PackageDestinationOption, PackageRelationOption } from '@/lib/admin/package-relation-ui';
import type { TravelPackage } from '@/components/admin/packages/types';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingId: string | null;
  saving: boolean;
  form: Omit<TravelPackage, 'id'>;
  departureDatesStr: string;
  imageError: boolean;
  uploading: boolean;
  dragOver: boolean;
  destinationOptions: PackageDestinationOption[];
  destinationsLoading: boolean;
  destinationsError: string | null;
  resellers: any[];
  composition: PackageCompositionSelection;
  hotelOptions: PackageRelationOption[];
  roomTypeOptions: PackageRelationOption[];
  excursionOptions: PackageRelationOption[];
  transportOptions: PackageRelationOption[];
  selectorLoading: Record<string, boolean>;
  selectorErrors: Record<string, string | null>;
  selectedHotelForRoomTypes: string | undefined;
  selectedDestination: PackageDestinationOption | undefined;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  onUpdate: <K extends string>(key: K, value: any) => void;
  onToggleComposition: (key: keyof Omit<PackageCompositionSelection, 'destinationId'>, id: string) => void;
  onSave: () => void;
  onImageUpload: (file: File) => void;
  onRemoveImage: () => void;
  setImageError: (v: boolean) => void;
  setDragOver: (v: boolean) => void;
  setDepartureDatesStr: (v: string) => void;
  onRetryDestination: () => void;
  onRetryRelation: (key: string) => void;
  onDestinationChange: (id: string) => void;
}

export function PackageFormDialog({
  open, onOpenChange, editingId, saving, form, departureDatesStr,
  imageError, uploading, dragOver, destinationOptions, destinationsLoading, destinationsError,
  resellers, composition, hotelOptions, roomTypeOptions, excursionOptions, transportOptions,
  selectorLoading, selectorErrors, selectedHotelForRoomTypes, selectedDestination, imageInputRef,
  onUpdate, onToggleComposition, onSave, onImageUpload, onRemoveImage,
  setImageError, setDragOver, setDepartureDatesStr, onRetryDestination, onRetryRelation, onDestinationChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto admin-dialog">
        <DialogHeader>
          <DialogTitle>{editingId ? 'Editar Paquete' : 'Nuevo Paquete'}</DialogTitle>
          <DialogDescription>
            {editingId ? 'Modifica los datos del paquete' : 'Completa los datos para crear un nuevo paquete'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <PackageBasicInfoFields
            title={form.title} slug={form.slug} category={form.category}
            duration={form.duration} difficulty={form.difficulty} groupSize={form.groupSize}
            rating={form.rating} onUpdate={onUpdate}
          />

          <PackageDestinationComposition
            destinationId={form.destinationId} destinationName={form.destinationName}
            destinationOptions={destinationOptions} destinationsLoading={destinationsLoading}
            destinationsError={destinationsError} composition={composition}
            hotelOptions={hotelOptions} roomTypeOptions={roomTypeOptions}
            excursionOptions={excursionOptions} transportOptions={transportOptions}
            selectorLoading={selectorLoading} selectorErrors={selectorErrors}
            selectedHotelForRoomTypes={selectedHotelForRoomTypes} selectedDestination={selectedDestination}
            onDestinationChange={onDestinationChange} onToggleComposition={onToggleComposition}
            onRetryDestination={onRetryDestination} onRetryRelation={onRetryRelation}
          />

          <PackageDescriptionFields
            description={form.description} includes={form.includes}
            departureDatesStr={departureDatesStr} onUpdate={onUpdate}
            setDepartureDatesStr={setDepartureDatesStr}
          />

          <PackagePricingFields
            price={form.price} originalPrice={form.originalPrice}
            commission={form.commission} onUpdate={onUpdate}
          />

          <PackageImageUpload
            image={form.image} imageError={imageError} uploading={uploading}
            dragOver={dragOver} imageInputRef={imageInputRef} onUpload={onImageUpload}
            onRemove={onRemoveImage} setImageError={setImageError} setDragOver={setDragOver}
          />

          <PackageToggles
            soldOut={form.soldOut} active={form.active} resellerId={form.resellerId}
            resellers={resellers} onUpdate={onUpdate}
          />

          <div className="dialog-footer">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={onSave} disabled={saving} size="default">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

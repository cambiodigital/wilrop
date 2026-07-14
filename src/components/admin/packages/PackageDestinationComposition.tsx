'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { CompositionOptionGroup } from '@/components/admin/packages/CompositionOptionGroup';
import type {
  PackageCompositionSelection, PackageDestinationOption, PackageRelationOption,
} from '@/lib/admin/package-relation-ui';

interface Props {
  destinationId: string;
  destinationName: string;
  destinationOptions: PackageDestinationOption[];
  destinationsLoading: boolean;
  destinationsError: string | null;
  composition: PackageCompositionSelection;
  hotelOptions: PackageRelationOption[];
  roomTypeOptions: PackageRelationOption[];
  excursionOptions: PackageRelationOption[];
  transportOptions: PackageRelationOption[];
  selectorLoading: Record<string, boolean>;
  selectorErrors: Record<string, string | null>;
  selectedHotelForRoomTypes: string | undefined;
  selectedDestination: PackageDestinationOption | undefined;
  onDestinationChange: (id: string) => void;
  onToggleComposition: (key: keyof Omit<PackageCompositionSelection, 'destinationId'>, id: string) => void;
  onRetryDestination: () => void;
  onRetryRelation: (key: string) => void;
}

export function PackageDestinationComposition({
  destinationId, destinationName, destinationOptions, destinationsLoading, destinationsError,
  composition, hotelOptions, roomTypeOptions, excursionOptions, transportOptions,
  selectorLoading, selectorErrors, selectedHotelForRoomTypes, selectedDestination,
  onDestinationChange, onToggleComposition, onRetryDestination, onRetryRelation,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pkg-destination" className="label-required">Destino relacional</Label>
          <select
            id="pkg-destination" value={destinationId}
            onChange={(e) => onDestinationChange(e.target.value)}
            disabled={destinationsLoading || Boolean(destinationsError)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona un destino</option>
            {destinationOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}{o.isTemplate ? ' · plantilla' : ''}{o.active ? '' : ' · inactivo'}
              </option>
            ))}
          </select>
          {destinationsLoading && <p className="text-xs text-muted-foreground">Cargando destinos...</p>}
          {!destinationsLoading && destinationsError && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <span>{destinationsError}</span>
              <Button type="button" variant="outline" size="sm" onClick={onRetryDestination}>
                <RefreshCw className="w-3 h-3 mr-1" /> Reintentar
              </Button>
            </div>
          )}
          {!destinationsLoading && !destinationsError && destinationOptions.length === 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>No hay destinos compatibles.</span>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href="/admin/destinos"><ExternalLink className="w-3 h-3 mr-1" /> Crear destino</a>
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pkg-dest-name">Nombre Destino (snapshot)</Label>
          <Input id="pkg-dest-name" value={selectedDestination?.label ?? destinationName} readOnly placeholder="Se completa al seleccionar destino" />
          <p className="text-xs text-muted-foreground">El ID real se guarda desde el selector; este nombre queda como etiqueta compatible.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="form-section-title">Composición relacional del paquete</div>
          <p className="text-xs text-muted-foreground">
            Selecciona entidades reales desde APIs de relación. Los campos legacy de descripción, incluye y fechas se conservan como snapshots compatibles.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CompositionOptionGroup label="Hoteles" options={hotelOptions} selectedIds={composition.hotelIds} selectionKey="hotelIds" ctaHref="/admin/hoteles" ctaLabel="Crear hotel" selectorLoading={selectorLoading} selectorErrors={selectorErrors} onToggleComposition={onToggleComposition} onRetryRelation={onRetryRelation} />
          <CompositionOptionGroup label="Tipos de habitación" options={roomTypeOptions} selectedIds={composition.roomTypeIds} selectionKey="roomTypeIds" ctaHref="/admin/habitaciones" ctaLabel="Crear habitación" disabledMessage={selectedHotelForRoomTypes ? undefined : 'Selecciona primero un hotel para cargar sus habitaciones.'} selectorLoading={selectorLoading} selectorErrors={selectorErrors} onToggleComposition={onToggleComposition} onRetryRelation={onRetryRelation} />
          <CompositionOptionGroup label="Excursiones" options={excursionOptions} selectedIds={composition.excursionIds} selectionKey="excursionIds" ctaHref="/admin/excursiones" ctaLabel="Crear excursión" selectorLoading={selectorLoading} selectorErrors={selectorErrors} onToggleComposition={onToggleComposition} onRetryRelation={onRetryRelation} />
          <CompositionOptionGroup label="Servicios de transporte" options={transportOptions} selectedIds={composition.transportServiceIds} selectionKey="transportServiceIds" ctaHref="/admin/transportes/servicios" ctaLabel="Crear transporte" selectorLoading={selectorLoading} selectorErrors={selectorErrors} onToggleComposition={onToggleComposition} onRetryRelation={onRetryRelation} />
        </div>
      </div>
    </>
  );
}

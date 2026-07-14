'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ExternalLink } from 'lucide-react';
import type { TransportDestinationOption, TransportDestinationSelectorState } from '@/lib/admin/transport-destination-ui';
import { findTransportDestinationOption, buildTransportDestinationCompatibilityFields } from '@/lib/admin/transport-destination-ui';

interface Props {
  form: {
    origin: string; destination: string; cityName: string;
    originDestinationId: string; destinationDestinationId: string;
  };
  onFormChange: (update: Record<string, any>) => void;
  destinationOptions: TransportDestinationOption[];
  destinationsLoading: boolean;
  destinationsError: string | null;
  onRetryDestinations: () => void;
  selectedOrigin?: TransportDestinationOption;
  selectedDestination?: TransportDestinationOption;
  originSelectorState: TransportDestinationSelectorState;
  destinationSelectorState: TransportDestinationSelectorState;
}

export function ServiceDestinationFields({
  form, onFormChange, destinationOptions, destinationsLoading, destinationsError,
  onRetryDestinations, selectedOrigin, selectedDestination,
  originSelectorState, destinationSelectorState,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Origen relacional *</Label>
          <Select
            value={form.originDestinationId ?? ''}
            onValueChange={(v) => {
              const option = findTransportDestinationOption(destinationOptions, v);
              onFormChange(buildTransportDestinationCompatibilityFields({ origin: option, destination: selectedDestination }));
            }}
            disabled={destinationsLoading || Boolean(destinationsError)}
          >
            <SelectTrigger><SelectValue placeholder="Seleccionar origen" /></SelectTrigger>
            <SelectContent>
              {originSelectorState.options.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.label}{o.stateLabel ? ` (${o.stateLabel})` : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {originSelectorState.status === 'loading' && <p className="text-xs text-muted-foreground">{originSelectorState.statusLabel}</p>}
          {originSelectorState.status === 'error' && (
            <div className="flex items-center justify-between gap-2 text-xs text-destructive">
              <span>{originSelectorState.statusLabel}</span>
              <Button type="button" variant="ghost" size="sm" onClick={onRetryDestinations}>Reintentar</Button>
            </div>
          )}
          {originSelectorState.status === 'empty' && (
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{originSelectorState.statusLabel}</span>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={originSelectorState.createCta?.href ?? '/admin/destinos'}>
                  <ExternalLink className="w-3 h-3 mr-1" /> {originSelectorState.createCta?.label ?? 'Crear destino'}
                </a>
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label>Destino relacional *</Label>
          <Select
            value={form.destinationDestinationId ?? ''}
            onValueChange={(v) => {
              const option = findTransportDestinationOption(destinationOptions, v);
              onFormChange(buildTransportDestinationCompatibilityFields({ origin: selectedOrigin, destination: option }));
            }}
            disabled={destinationsLoading || Boolean(destinationsError)}
          >
            <SelectTrigger><SelectValue placeholder="Seleccionar destino" /></SelectTrigger>
            <SelectContent>
              {destinationSelectorState.options.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.label}{o.stateLabel ? ` (${o.stateLabel})` : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ruta / ciudad (snapshot)</Label>
          <Input readOnly className="bg-muted"
            value={`${selectedOrigin?.label ?? (form.origin || 'Origen')} → ${selectedDestination?.label ?? (form.destination || 'Destino')}`}
          />
          <p className="text-xs text-muted-foreground">
            El API actual de transporte guarda `origin`, `destination`, `cityId` y `cityName` como snapshots de compatibilidad.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Ciudad principal (snapshot)</Label>
          <Input readOnly className="bg-muted" value={selectedDestination?.label ?? form.cityName} />
        </div>
      </div>

      {destinationSelectorState.status === 'error' && (
        <div className="flex items-center justify-between gap-2 text-xs text-destructive">
          <span>{destinationSelectorState.statusLabel}</span>
          <Button type="button" variant="ghost" size="sm" onClick={onRetryDestinations}>Reintentar</Button>
        </div>
      )}
      {destinationSelectorState.status === 'empty' && (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{destinationSelectorState.statusLabel}</span>
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={destinationSelectorState.createCta?.href ?? '/admin/destinos'}>
              <ExternalLink className="w-3 h-3 mr-1" /> {destinationSelectorState.createCta?.label ?? 'Crear destino'}
            </a>
          </Button>
        </div>
      )}
    </>
  );
}

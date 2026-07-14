"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, RefreshCw } from "lucide-react";
import { FieldHelper, FieldTooltip } from "@/components/ui/form-helpers";
import {
  buildHotelDestinationCompatibilityFields,
  type HotelDestinationOption,
  type HotelDestinationSelectorState,
} from "@/lib/admin/hotel-destination-ui";

interface DestinationSelectorProps {
  destinationId: string | null | undefined;
  cityName: string;
  mode: "admin" | "reseller";
  destinationsLoading: boolean;
  destinationsError: string | null;
  destinationSelectorState: HotelDestinationSelectorState;
  selectedDestination: HotelDestinationOption | undefined;
  destinationOptions: HotelDestinationOption[];
  fetchDestinationOptions: () => void;
  fieldErrors: Record<string, string>;
  validateField: (key: string, value: string) => void;
  clearFieldError: (key: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export function DestinationSelector({
  destinationId, cityName, mode, destinationsLoading, destinationsError,
  destinationSelectorState, selectedDestination, destinationOptions,
  fetchDestinationOptions, fieldErrors, validateField, clearFieldError, setForm,
}: DestinationSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="hotel-destination" className="label-required">
          Destino relacional
          <FieldTooltip label="Ciudad o region donde se ubica el hotel. Define la ubicacion en busquedas y filtros" />
        </Label>
        <select
          id="hotel-destination"
          value={destinationId ?? ""}
          onChange={(e) => {
            const opt = destinationOptions.find((o) => o.id === e.target.value);
            setForm((prev: Record<string, unknown>) => ({
              ...prev, ...buildHotelDestinationCompatibilityFields(opt),
            }));
            clearFieldError("destinationId");
          }}
          onBlur={() => validateField("destinationId", destinationId ?? "")}
          disabled={destinationsLoading || Boolean(destinationsError)}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            fieldErrors.destinationId && "input-error",
          )}
        >
          <option value="">Selecciona un destino</option>
          {destinationSelectorState.options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}{o.stateLabel ? ` · ${o.stateLabel.toLowerCase()}` : ""}
            </option>
          ))}
        </select>
        {fieldErrors.destinationId && (
          <p className="field-error-text text-xs">{fieldErrors.destinationId}</p>
        )}
        <FieldHelper>Selecciona la ciudad o region donde se ubica el hotel.</FieldHelper>
        {destinationSelectorState.status === "loading" && (
          <p className="text-xs text-muted-foreground">{destinationSelectorState.statusLabel}</p>
        )}
        {destinationSelectorState.status === "error" && (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <span>{destinationSelectorState.statusLabel}</span>
            <Button type="button" variant="outline" size="sm" onClick={fetchDestinationOptions}>
              <RefreshCw className="w-3 h-3 mr-1" />Reintentar
            </Button>
          </div>
        )}
        {destinationSelectorState.status === "empty" && mode === "admin" && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{destinationSelectorState.statusLabel}</span>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={destinationSelectorState.createCta?.href ?? "/admin/destinos"}>
                <ExternalLink className="w-3 h-3 mr-1" />
                {destinationSelectorState.createCta?.label ?? "Crear destino"}
              </a>
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hotel-city-name">
          Nombre destino (snapshot)
          <FieldTooltip label="Se completa automaticamente al seleccionar el destino." />
        </Label>
        <Input
          id="hotel-city-name"
          value={selectedDestination?.label ?? cityName}
          readOnly
          placeholder="Se completa al seleccionar destino"
        />
        <FieldHelper>Texto visible de la ubicacion. Se completa automaticamente.</FieldHelper>
      </div>
    </div>
  );
}

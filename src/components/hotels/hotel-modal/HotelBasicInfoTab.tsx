"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldHelper, FieldTooltip } from "@/components/ui/form-helpers";
import { DestinationSelector } from "./DestinationSelector";
import type { HotelDestinationOption, HotelDestinationSelectorState } from "@/lib/admin/hotel-destination-ui";

interface HotelBasicInfoTabProps {
  form: {
    name: string; slug: string; destinationId?: string | null; cityName: string;
    stars: number; rating: number; reviewCount: number; address: string;
    priceFrom: number; description: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateField: (key: any, value: any) => void;
  fieldErrors: Record<string, string>;
  validateField: (key: string, value: string) => void;
  clearFieldError: (key: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setForm: React.Dispatch<React.SetStateAction<any>>;
  destinationsLoading: boolean;
  destinationsError: string | null;
  destinationSelectorState: HotelDestinationSelectorState;
  selectedDestination: HotelDestinationOption | undefined;
  destinationOptions: HotelDestinationOption[];
  fetchDestinationOptions: () => void;
  mode: "admin" | "reseller";
}

export function HotelBasicInfoTab({
  form, updateField, fieldErrors, validateField, clearFieldError, setForm,
  destinationsLoading, destinationsError, destinationSelectorState,
  selectedDestination, destinationOptions, fetchDestinationOptions, mode,
}: HotelBasicInfoTabProps) {
  return (
    <div className="space-y-4 mt-4 overflow-y-auto flex-1 min-h-0">
      <div className="form-section-title">Informacion principal</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="hotel-name" className="label-required">
            Nombre<FieldTooltip label="Nombre comercial del hotel" />
          </Label>
          <Input
            id="hotel-name" value={form.name}
            onChange={(e) => { updateField("name", e.target.value); clearFieldError("name"); }}
            onBlur={() => validateField("name", form.name)}
            placeholder="Hotel Charleston Santa Teresa"
            className={fieldErrors.name ? "input-error" : ""}
          />
          {fieldErrors.name && <p className="field-error-text text-xs">{fieldErrors.name}</p>}
          <FieldHelper>Nombre comercial visible en listados y busquedas.</FieldHelper>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hotel-slug">
            Slug<FieldTooltip label="Identificador unico en la URL" />
          </Label>
          <Input id="hotel-slug" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="Auto-generado" />
          <FieldHelper>Identificador unico para la URL del hotel.</FieldHelper>
        </div>
      </div>
      <DestinationSelector
        destinationId={form.destinationId} cityName={form.cityName} mode={mode}
        destinationsLoading={destinationsLoading} destinationsError={destinationsError}
        destinationSelectorState={destinationSelectorState} selectedDestination={selectedDestination}
        destinationOptions={destinationOptions} fetchDestinationOptions={fetchDestinationOptions}
        fieldErrors={fieldErrors} validateField={validateField} clearFieldError={clearFieldError} setForm={setForm}
      />
      <div className="form-section-title">Datos del hotel</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="hotel-stars">Estrellas (1-5)</Label>
          <Input id="hotel-stars" type="number" min="1" max="5" value={form.stars}
            onChange={(e) => updateField("stars", Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hotel-rating">Rating (0-10)</Label>
          <Input id="hotel-rating" type="number" min="0" max="10" step="0.1" value={form.rating}
            onChange={(e) => updateField("rating", Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hotel-reviews">Reviews</Label>
          <Input id="hotel-reviews" type="number" value={form.reviewCount}
            onChange={(e) => updateField("reviewCount", Number(e.target.value))} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hotel-address">Direccion</Label>
        <Input id="hotel-address" value={form.address} onChange={(e) => updateField("address", e.target.value)}
          placeholder="Calle de la Inquisicion, Centro Historico" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hotel-price">Precio Desde (COP)</Label>
        <Input id="hotel-price" type="number" value={form.priceFrom}
          onChange={(e) => updateField("priceFrom", Number(e.target.value))} placeholder="720000" />
        <FieldHelper>Precio mas bajo disponible en COP.</FieldHelper>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hotel-description">Descripcion</Label>
        <Textarea id="hotel-description" value={form.description}
          onChange={(e) => updateField("description", e.target.value)} placeholder="Descripcion del hotel..." rows={4} />
      </div>
    </div>
  );
}

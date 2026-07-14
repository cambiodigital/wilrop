"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FieldTooltip } from "@/components/ui/form-helpers";
import { AmenityGrid } from "./AmenityGrid";

interface HotelAmenitiesTabProps {
  amenities: string[];
  tags: string[];
  tagsStr: string;
  featured: boolean;
  active: boolean;
  customAmenityInput: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateField: (key: any, value: any) => void;
  onSetTagsStr: (val: string) => void;
  onSetCustomAmenityInput: (val: string) => void;
}

export function HotelAmenitiesTab({
  amenities, tags, tagsStr, featured, active, customAmenityInput,
  onUpdateField, onSetTagsStr, onSetCustomAmenityInput,
}: HotelAmenitiesTabProps) {
  return (
    <div className="space-y-4 mt-4 overflow-y-auto flex-1 min-h-0">
      <div className="flex items-center gap-2">
        <Label>Servicios / Amenidades</Label>
        <FieldTooltip label="Selecciona los servicios que ofrece este hotel." />
      </div>
      <AmenityGrid
        amenities={amenities} customAmenityInput={customAmenityInput}
        onUpdateField={onUpdateField} onSetCustomAmenityInput={onSetCustomAmenityInput}
      />
      <div className="space-y-2">
        <Label htmlFor="hotel-tags">Tags (separados por coma)</Label>
        <Input
          id="hotel-tags" value={tagsStr}
          onChange={(e) => {
            onSetTagsStr(e.target.value);
            onUpdateField("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean));
          }}
          placeholder="Lujo, Popular, Nuevo, Descuento"
        />
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Switch checked={featured} onCheckedChange={(c) => onUpdateField("featured", c)} />
          <Label>Destacado</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={active} onCheckedChange={(c) => onUpdateField("active", c)} />
          <Label>Activo</Label>
        </div>
      </div>
    </div>
  );
}

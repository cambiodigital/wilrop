"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  BedDouble, Car, Clock, Coffee, Dumbbell, Eye,
  Plane, Sparkles, Thermometer, UtensilsCrossed, Waves, Wifi, Wine,
} from "lucide-react";
import { hotelAmenities } from "@/lib/hotel-amenities";
import { normalizeAmenityStr, isAmenitySelected } from "./utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi, Waves, UtensilsCrossed, Car, Dumbbell, Sparkles, Thermometer, Coffee, Wine, Clock, Plane, Eye,
};

interface AmenityGridProps {
  amenities: string[];
  customAmenityInput: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateField: (key: any, value: any) => void;
  onSetCustomAmenityInput: (val: string) => void;
}

export function AmenityGrid({
  amenities, customAmenityInput, onUpdateField, onSetCustomAmenityInput,
}: AmenityGridProps) {
  const customAmenities = amenities.filter(
    (a) => !hotelAmenities.some((ha) => a === ha.id || normalizeAmenityStr(a) === normalizeAmenityStr(ha.name)),
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {hotelAmenities.map((amenity) => {
          const selected = isAmenitySelected(amenities, amenity.id, amenity.name);
          const Icon = iconMap[amenity.icon];
          return (
            <button
              key={amenity.id}
              type="button"
              onClick={() => {
                if (selected) {
                  onUpdateField("amenities", amenities.filter((a) => {
                    const na = normalizeAmenityStr(a);
                    return a !== amenity.id && na !== normalizeAmenityStr(amenity.name);
                  }));
                } else {
                  onUpdateField("amenities", [...amenities, amenity.id]);
                }
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
                selected
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground",
              )}
            >
              {Icon && <Icon className="size-4 flex-shrink-0" />}
              <span className="truncate">{amenity.name}</span>
            </button>
          );
        })}
      </div>
      {customAmenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customAmenities.map((a, i) => (
            <Badge
              key={`${a}-${i}`}
              variant="secondary"
              className="pl-2.5 pr-1 py-1 gap-1 text-xs border border-border bg-accent text-accent-foreground"
            >
              {a}
              <button
                type="button"
                onClick={() => onUpdateField("amenities", amenities.filter((fa) => fa !== a))}
                className="rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={customAmenityInput}
          onChange={(e) => onSetCustomAmenityInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const t = customAmenityInput.trim();
              if (t && !amenities.some((a) => normalizeAmenityStr(a) === normalizeAmenityStr(t))) {
                onUpdateField("amenities", [...amenities, t]);
                onSetCustomAmenityInput("");
              }
            }
          }}
          placeholder="Agregar servicio personalizado..."
          className="flex-1 text-sm h-8"
        />
        <Button
          type="button" variant="outline" size="sm"
          onClick={() => {
            const t = customAmenityInput.trim();
            if (t && !amenities.some((a) => normalizeAmenityStr(a) === normalizeAmenityStr(t))) {
              onUpdateField("amenities", [...amenities, t]);
              onSetCustomAmenityInput("");
            }
          }}
          disabled={!customAmenityInput.trim()}
          className="h-8"
        >
          <Plus className="w-4 h-4 mr-1" />Agregar
        </Button>
      </div>
    </div>
  );
}

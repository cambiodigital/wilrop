"use client";

import { useState } from "react";
import { toast } from "sonner";
import { parseRoomTypeIncludes } from "@/lib/admin/hotel-roomtypes";
import type { RoomTypeRow } from "./types";
import { generateSlug } from "./utils";

interface UseHotelModalSubmitParams {
  form: Record<string, unknown>;
  editingId: string | null;
  hotelApiBase: string;
  destinationsError: string | null;
  pendingRoomTypes: RoomTypeRow[];
  roomTypes: RoomTypeRow[];
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void | Promise<void>;
}

export function useHotelModalSubmit({
  form,
  editingId,
  hotelApiBase,
  destinationsError,
  pendingRoomTypes,
  roomTypes,
  onOpenChange,
  onSaved,
}: UseHotelModalSubmitParams) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!(form.name as string).trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (destinationsError) {
      toast.error("No se puede guardar hasta cargar destinos correctamente");
      return;
    }
    if (!(form.destinationId as string)?.trim() || !(form.cityName as string).trim()) {
      toast.error("Selecciona un destino válido");
      return;
    }
    if (!editingId && pendingRoomTypes.length === 0) {
      toast.error(
        "Debes agregar al menos una habitación antes de guardar el hotel",
      );
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        slug: (form.slug as string) || generateSlug(form.name as string),
      };

      if (!editingId && pendingRoomTypes.length > 0) {
        payload._pendingRoomTypes = pendingRoomTypes.map((rt) => ({
          name: rt.name,
          maxGuests: rt.maxGuests,
          beds: rt.beds,
          basePrice: rt.basePrice,
          originalPrice: rt.originalPrice,
          includes: parseRoomTypeIncludes(rt.includes),
          roomImage: rt.roomImage,
          roomImages: rt.roomImages || [],
          active: rt.active,
        }));
      }
      const res = await fetch(
        editingId ? `${hotelApiBase}/${editingId}` : hotelApiBase,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false)
        throw new Error(json.error || "Error al guardar hotel");
      toast.success(
        editingId
          ? "Hotel actualizado correctamente"
          : "Hotel creado correctamente",
      );
      onOpenChange(false);
      await onSaved?.();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar hotel",
      );
    } finally {
      setSaving(false);
    }
  };

  return { saving, handleSave };
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { FieldHelper, FieldTooltip } from "@/components/ui/form-helpers";
import { TagInput } from "./TagInput";
import { RoomImagesSection } from "./RoomImagesSection";
import type { PanelMode, RoomTypeFormData } from "./types";

interface RoomTypeFormProps {
  roomTypeForm: RoomTypeFormData;
  onRoomTypeFormChange: React.Dispatch<React.SetStateAction<RoomTypeFormData>>;
  editingRoomTypeId: string | null;
  savingRoomType: boolean;
  mode: PanelMode;
  onSave: () => void;
  onCancel: () => void;
}

export function RoomTypeForm({
  roomTypeForm, onRoomTypeFormChange, editingRoomTypeId, savingRoomType, mode, onSave, onCancel,
}: RoomTypeFormProps) {
  const upd = <K extends keyof RoomTypeFormData>(key: K, val: RoomTypeFormData[K]) =>
    onRoomTypeFormChange((p) => ({ ...p, [key]: val }));

  return (
    <Card className="border-primary/30">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm font-semibold">
          {editingRoomTypeId ? "Editar Habitacion" : "Nueva Habitacion"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs label-required">
              Nombre<FieldTooltip label="Nombre visible de la habitacion" />
            </Label>
            <Input value={roomTypeForm.name} onChange={(e) => upd("name", e.target.value)}
              placeholder="Suite Deluxe" className="text-sm h-8" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Camas / Tipo</Label>
            <Input value={roomTypeForm.beds} onChange={(e) => upd("beds", e.target.value)}
              placeholder="1 cama king" className="text-sm h-8" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Max. Huespedes</Label>
            <Input type="number" min="1" max="10" value={roomTypeForm.maxGuests}
              onChange={(e) => upd("maxGuests", Number(e.target.value))} className="text-sm h-8" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs label-required">Precio Base (COP)</Label>
            <Input type="number" min="0" value={roomTypeForm.basePrice}
              onChange={(e) => upd("basePrice", Number(e.target.value))} className="text-sm h-8" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Precio Original (COP)</Label>
            <Input type="number" min="0" value={roomTypeForm.originalPrice || ""}
              onChange={(e) => upd("originalPrice", e.target.value ? Number(e.target.value) : 0)} className="text-sm h-8" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Servicios / Que incluye</Label>
          <TagInput tags={roomTypeForm.includes} onChange={(t) => upd("includes", t)}
            placeholder="Wi-Fi, Aire acondicionado, Desayuno..." />
        </div>
        <RoomImagesSection form={roomTypeForm} onFormChange={onRoomTypeFormChange} mode={mode} />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={roomTypeForm.active} onCheckedChange={(c) => upd("active", c)} />
            <Label className="text-xs">Activo</Label>
          </div>
          <FieldHelper>Desactiva para ocultar temporalmente sin eliminar</FieldHelper>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button type="button" size="sm" onClick={onSave} disabled={savingRoomType || !roomTypeForm.name.trim()}>
            <Save className="w-3.5 h-3.5 mr-1" />
            {savingRoomType ? "Guardando..." : editingRoomTypeId ? "Actualizar" : "Crear"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        </div>
      </CardContent>
    </Card>
  );
}

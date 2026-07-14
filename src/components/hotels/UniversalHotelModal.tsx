"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BedDouble } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { UniversalHotelModalProps, RoomTypeRow } from "./hotel-modal/types";
import { useHotelModalForm } from "./hotel-modal/useHotelModalForm";
import { useHotelModalSubmit } from "./hotel-modal/useHotelModalSubmit";
import { HotelBasicInfoTab } from "./hotel-modal/HotelBasicInfoTab";
import { HotelImagesTab } from "./hotel-modal/HotelImagesTab";
import { HotelAmenitiesTab } from "./hotel-modal/HotelAmenitiesTab";
import { HotelRoomsTab } from "./hotel-modal/HotelRoomsTab";
import { HotelExtraTab } from "./hotel-modal/HotelExtraTab";
import { DeleteRoomTypeDialog } from "./hotel-modal/DeleteRoomTypeDialog";

export type { UniversalHotelRoom, UniversalHotelRecord } from "./hotel-modal/types";

export default function UniversalHotelModal({
  open, onOpenChange, hotel, mode, onSaved,
}: UniversalHotelModalProps) {
  const f = useHotelModalForm(open, hotel, mode);
  const { saving, handleSave } = useHotelModalSubmit({
    form: f.form as unknown as Record<string, unknown>,
    editingId: f.editingId, hotelApiBase: f.hotelApiBase,
    destinationsError: f.destinationsError, pendingRoomTypes: f.pendingRoomTypes,
    roomTypes: f.roomTypes, onOpenChange, onSaved,
  });

  const handleRoomSave = useCallback(() => {
    if (f.isCreateMode) {
      const r = f.editingRoomTypeId ? f.handleUpdatePendingRoomType() : f.handleSavePendingRoomType();
      if (!r.success && r.error) toast.error(r.error);
      else toast.success(f.editingRoomTypeId ? "Habitación actualizada" : "Habitación agregada");
    } else {
      f.saveRoomType(f.editingRoomTypeId ? "PUT" : "POST").then((r) => {
        if (!r.success && r.error) toast.error(r.error);
        else if (r.success) toast.success(f.editingRoomTypeId ? "Habitación actualizada" : "Habitación creada");
      });
    }
  }, [f]);

  const handleRoomDelete = useCallback(async () => {
    try { await f.handleDeleteRoomType(); toast.success("Habitación eliminada"); }
    catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Error al eliminar"); }
  }, [f]);

  const onTableEdit = useCallback((rt: RoomTypeRow) => {
    f.isCreateMode ? f.openEditPendingRoomType(rt) : f.openEditRoomType(rt);
  }, [f]);

  const onTableDelete = useCallback((rt: RoomTypeRow) => {
    f.isCreateMode ? f.handleDeletePendingRoomType(rt.id) : f.setRoomTypeDeleteId(rt.id);
  }, [f]);

  const dialogClass = cn(
    "sm:max-w-4xl max-h-[90vh] flex flex-col",
    mode === "admin" ? "admin-dialog" : "force-light bg-white text-slate-900 border-slate-200",
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent topAligned className={dialogClass}>
          <DialogHeader>
            <DialogTitle>{f.editingId ? "Editar Hotel" : "Nuevo Hotel"}</DialogTitle>
            <DialogDescription>
              {f.editingId ? "Modifica los datos del hotel" : "Completa los datos para registrar un nuevo hotel"}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="pt-2 flex flex-col flex-1 overflow-hidden">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">Info Basica</TabsTrigger>
              <TabsTrigger value="media" className="flex-1">Imagenes</TabsTrigger>
              <TabsTrigger value="amenities" className="flex-1">Servicios</TabsTrigger>
              <TabsTrigger value="rooms" className="flex-1 relative">
                <BedDouble className="w-3.5 h-3.5 mr-1" />
                Habitaciones
                {!f.editingId && f.pendingRoomTypes.length > 0 && (
                  <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {f.pendingRoomTypes.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="extra" className="flex-1">Extra</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <HotelBasicInfoTab
                form={f.form} updateField={f.updateField} fieldErrors={f.fieldErrors}
                validateField={f.validateField} clearFieldError={f.clearFieldError}
                setForm={f.setForm as React.Dispatch<React.SetStateAction<Record<string, unknown>>>}
                destinationsLoading={f.destinationsLoading} destinationsError={f.destinationsError}
                destinationSelectorState={f.destinationSelectorState}
                selectedDestination={f.selectedDestination} destinationOptions={f.destinationOptions}
                fetchDestinationOptions={f.fetchDestinationOptions} mode={mode}
              />
            </TabsContent>
            <TabsContent value="media">
              <HotelImagesTab images={f.form.images} mode={mode} onUpdateImages={(imgs) => f.updateField("images", imgs)} />
            </TabsContent>
            <TabsContent value="amenities">
              <HotelAmenitiesTab
                amenities={f.form.amenities} tags={f.form.tags} tagsStr={f.tagsStr}
                featured={f.form.featured} active={f.form.active} customAmenityInput={f.customAmenityInput}
                onUpdateField={f.updateField} onSetTagsStr={f.setTagsStr} onSetCustomAmenityInput={f.setCustomAmenityInput}
              />
            </TabsContent>
            <TabsContent value="rooms">
              <HotelRoomsTab
                isCreateMode={f.isCreateMode} displayRoomTypes={f.displayRoomTypes}
                roomTypesLoading={f.roomTypesLoading} showRoomTypeForm={f.showRoomTypeForm}
                editingRoomTypeId={f.editingRoomTypeId} savingRoomType={f.savingRoomType}
                roomTypeForm={f.roomTypeForm} mode={mode} onRoomTypeFormChange={f.setRoomTypeForm}
                onShowForm={f.setShowRoomTypeForm} onResetForm={f.resetRoomTypeForm}
                onEdit={onTableEdit} onDelete={onTableDelete} onSave={handleRoomSave}
              />
            </TabsContent>
            <TabsContent value="extra">
              <HotelExtraTab mode={mode} form={f.form} resellers={f.resellers} updateField={f.updateField} />
            </TabsContent>
          </Tabs>
          <div className="dialog-footer">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : f.editingId ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DeleteRoomTypeDialog
        open={!!f.roomTypeDeleteId} mode={mode}
        onClose={() => f.setRoomTypeDeleteId(null)} onConfirm={handleRoomDelete}
      />
    </>
  );
}

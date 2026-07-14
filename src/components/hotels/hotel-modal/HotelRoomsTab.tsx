"use client";

import { BedDouble, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomTypeForm } from "./RoomTypeForm";
import { RoomTypesTable } from "./RoomTypesTable";
import type { PanelMode, RoomTypeFormData, RoomTypeRow } from "./types";

interface HotelRoomsTabProps {
  isCreateMode: boolean;
  displayRoomTypes: RoomTypeRow[];
  roomTypesLoading: boolean;
  showRoomTypeForm: boolean;
  editingRoomTypeId: string | null;
  savingRoomType: boolean;
  roomTypeForm: RoomTypeFormData;
  mode: PanelMode;
  onRoomTypeFormChange: React.Dispatch<React.SetStateAction<RoomTypeFormData>>;
  onShowForm: (show: boolean) => void;
  onResetForm: () => void;
  onEdit: (roomType: RoomTypeRow) => void;
  onDelete: (roomType: RoomTypeRow) => void;
  onSave: () => void;
}

export function HotelRoomsTab({
  isCreateMode,
  displayRoomTypes,
  roomTypesLoading,
  showRoomTypeForm,
  editingRoomTypeId,
  savingRoomType,
  roomTypeForm,
  mode,
  onRoomTypeFormChange,
  onShowForm,
  onResetForm,
  onEdit,
  onDelete,
  onSave,
}: HotelRoomsTabProps) {
  return (
    <div className="space-y-4 mt-4 overflow-y-auto flex-1 min-h-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 text-primary" />
            Habitaciones del hotel
            {isCreateMode && (
              <span className="label-required text-xs font-normal text-muted-foreground ml-0.5">
                (obligatorio)
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {isCreateMode
              ? `${displayRoomTypes.length} habitacion(es) pendientes por crear — mínimo 1 requerida`
              : `${displayRoomTypes.length} habitacion(es) registradas en el sistema`}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onResetForm();
            onShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Nueva habitacion
        </Button>
      </div>
      <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        {isCreateMode
          ? "Agrega al menos una habitacion. Se crearan junto con el hotel al guardar."
          : "Define las habitaciones y sus precios. Los cambios y la disponibilidad se sincronizan automaticamente."}
      </div>
      {!isCreateMode && roomTypesLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          {showRoomTypeForm && (
            <RoomTypeForm
              roomTypeForm={roomTypeForm}
              onRoomTypeFormChange={onRoomTypeFormChange}
              editingRoomTypeId={editingRoomTypeId}
              savingRoomType={savingRoomType}
              mode={mode}
              onSave={onSave}
              onCancel={onResetForm}
            />
          )}
          <RoomTypesTable
            roomTypes={displayRoomTypes}
            isCreateMode={isCreateMode}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          {displayRoomTypes.length === 0 && !editingRoomTypeId && (
            <div className="text-center py-8 text-muted-foreground">
              <BedDouble className="w-8 h-8 mx-auto mb-2 opacity-40" />
              {isCreateMode ? (
                <>
                  <p className="text-sm font-medium text-destructive">
                    Debes agregar al menos una habitacion
                  </p>
                  <p className="text-xs mt-1">
                    El hotel no se puede guardar sin habitaciones. Haz clic en &quot;Nueva habitacion&quot;
                    para agregar la primera.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm">No hay habitaciones registradas para este hotel</p>
                  <p className="text-xs mt-1">
                    Crea una habitacion para configurar precios y disponibilidad
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

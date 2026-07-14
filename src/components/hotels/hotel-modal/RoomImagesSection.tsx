"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GripVertical, ImagePlus, Link2, Plus, Upload, X } from "lucide-react";
import type { PanelMode, RoomTypeFormData } from "./types";
import { useRoomImages } from "./useRoomImages";

interface RoomImagesSectionProps {
  form: RoomTypeFormData;
  onFormChange: React.Dispatch<React.SetStateAction<RoomTypeFormData>>;
  mode: PanelMode;
}

export function RoomImagesSection({ form, onFormChange, mode }: RoomImagesSectionProps) {
  const imgs = useRoomImages(mode, form, onFormChange);

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs font-semibold">Fotos de la habitacion</Label>
          <p className="text-[10px] text-muted-foreground">{imgs.images.length} foto(s) · Arrastra para ordenar</p>
        </div>
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs px-2"
          onClick={() => imgs.inputRef.current?.click()}>
          <Upload className="w-3 h-3 mr-1" />Subir foto
        </Button>
      </div>
      <div
        onDrop={(e) => { e.preventDefault(); imgs.setDragOver(false); if (e.dataTransfer.files.length) imgs.uploadFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); imgs.setDragOver(true); }}
        onDragLeave={() => imgs.setDragOver(false)}
        onClick={() => imgs.inputRef.current?.click()}
        className={cn(
          "border border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors",
          imgs.dragOver ? "border-ring bg-accent" : "border-border hover:border-ring/60 hover:bg-accent/30",
          imgs.uploading && "pointer-events-none opacity-60",
        )}
      >
        {imgs.uploading ? (
          <div className="space-y-1">
            <div className="animate-spin w-4 h-4 border-2 border-ring border-t-transparent rounded-full mx-auto" />
            <p className="text-xs text-muted-foreground">Subiendo...</p>
          </div>
        ) : (
          <div className="space-y-1">
            <ImagePlus className="w-6 h-6 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">
              Arrastra imagenes aqui o <span className="text-primary font-semibold">haz clic</span>
            </p>
          </div>
        )}
      </div>
      <input ref={imgs.inputRef} type="file" accept="image/*" multiple
        onChange={(e) => { if (e.target.files?.length) imgs.uploadFiles(e.target.files); if (imgs.inputRef.current) imgs.inputRef.current.value = ""; }}
        className="hidden" />
      {imgs.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {imgs.images.map((img, idx) => (
            <div key={`${img}-${idx}`} draggable
              onDragStart={(e) => { imgs.setDraggedIdx(idx); e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (imgs.draggedIdx !== null && imgs.draggedIdx !== idx) imgs.reorder(imgs.draggedIdx, idx); }}
              className={cn(
                "relative group rounded-md overflow-hidden border border-border transition-all bg-muted/20 hover:shadow-xs hover:border-ring/40",
                imgs.draggedIdx === idx && "opacity-50 ring-1 ring-ring",
              )}
            >
              <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-20 object-cover" />
              <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-medium rounded-sm px-1 py-0.2 flex items-center gap-0.5 pointer-events-none">
                <GripVertical className="w-2.5 h-2.5" />{idx + 1}
              </div>
              {imgs.coverImage === img && (
                <div className="absolute bottom-1 left-1 bg-amber-500 text-white text-[8px] font-bold rounded-sm px-1 py-0.2">Portada</div>
              )}
              <Button type="button" size="icon" variant="destructive"
                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); imgs.remove(idx); }}>
                <X className="w-2.5 h-2.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Link2 className="w-2.5 h-2.5" />Agregar foto por URL
        </Label>
        <div className="flex gap-1.5">
          <Input value={imgs.urlInput} onChange={(e) => imgs.setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); imgs.addByUrl(); } }}
            placeholder="https://ejemplo.com/room.jpg" className="flex-1 text-xs h-7" />
          <Button type="button" variant="outline" size="sm" onClick={imgs.addByUrl} disabled={!imgs.urlInput.trim()}
            className="shrink-0 h-7 text-xs px-2">
            <Plus className="w-3 h-3 mr-0.5" />Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}

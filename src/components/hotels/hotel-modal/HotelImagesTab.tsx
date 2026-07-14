"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GripVertical, ImagePlus, Link2, Plus, Upload, X } from "lucide-react";
import type { PanelMode } from "./types";
import { useHotelImages } from "./useHotelImages";

interface HotelImagesTabProps {
  images: string[];
  mode: PanelMode;
  onUpdateImages: (images: string[]) => void;
}

export function HotelImagesTab({ images, mode, onUpdateImages }: HotelImagesTabProps) {
  const imgs = useHotelImages(mode, images, onUpdateImages);

  return (
    <div className="space-y-4 mt-4 overflow-y-auto flex-1 min-h-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Galeria de imagenes del hotel</p>
          <p className="text-xs text-muted-foreground">
            {images.length} imagen{images.length !== 1 ? "es" : ""}{images.length > 0 && " · Arrastra para reordenar"}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => imgs.inputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-1.5" />Subir imagen
        </Button>
      </div>
      <div
        onDrop={(e) => { e.preventDefault(); imgs.setDragOver(false); if (e.dataTransfer.files.length) imgs.uploadFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); imgs.setDragOver(true); }}
        onDragLeave={() => imgs.setDragOver(false)}
        onClick={() => imgs.inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          imgs.dragOver ? "border-ring bg-accent" : "border-border hover:border-ring/60 hover:bg-accent/50",
          imgs.uploading && "pointer-events-none opacity-60",
        )}
      >
        {imgs.uploading ? (
          <div className="space-y-2">
            <div className="animate-spin w-8 h-8 border-2 border-ring border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">Subiendo imagen{imgs.pendingUploads > 1 ? "es" : ""}...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <ImagePlus className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Arrastra imagenes aqui o <span className="text-primary font-medium">haz clic para seleccionar</span>
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF · Max. 5 MB · Puedes seleccionar varias</p>
          </div>
        )}
      </div>
      <input ref={imgs.inputRef} type="file" accept="image/*" multiple
        onChange={(e) => { if (e.target.files?.length) imgs.uploadFiles(e.target.files); if (imgs.inputRef.current) imgs.inputRef.current.value = ""; }}
        className="hidden" />
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div key={`${img}-${idx}`} draggable
              onDragStart={(e) => { imgs.setDraggedIdx(idx); e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (imgs.draggedIdx !== null && imgs.draggedIdx !== idx) imgs.reorder(imgs.draggedIdx, idx); }}
              className={cn(
                "relative group rounded-lg overflow-hidden border border-border transition-all hover:shadow-md hover:border-ring/60",
                imgs.draggedIdx === idx && "opacity-50 ring-2 ring-ring",
              )}
            >
              <img src={img} alt={`Imagen ${idx + 1}`} className="w-full h-32 object-cover" />
              <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-xs font-medium rounded-md px-1.5 py-0.5 flex items-center gap-1">
                <GripVertical className="w-3 h-3" />{idx + 1}
              </div>
              <Button type="button" size="icon" variant="destructive"
                className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); imgs.remove(idx); }}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <Separator />
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          <Link2 className="w-3 h-3" />Agregar imagen por URL
        </Label>
        <div className="flex gap-2">
          <Input value={imgs.urlInput} onChange={(e) => imgs.setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); imgs.addByUrl(); } }}
            placeholder="https://ejemplo.com/imagen.jpg" className="flex-1 text-sm" />
          <Button type="button" variant="outline" size="sm" onClick={imgs.addByUrl} disabled={!imgs.urlInput.trim()}>
            <Plus className="w-4 h-4 mr-1" />Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}

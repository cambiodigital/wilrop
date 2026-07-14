'use client';
import { Button } from '@/components/ui/button';
import { Upload, ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldTooltip } from '@/components/ui/form-helpers';
import type { RefObject } from 'react';

interface Props {
  image: string;
  imageError: boolean;
  uploading: boolean;
  dragOver: boolean;
  imageInputRef: RefObject<HTMLInputElement | null>;
  onUpload: (file: File) => void;
  onRemove: () => void;
  setImageError: (v: boolean) => void;
  setDragOver: (v: boolean) => void;
}

export function PackageImageUpload({
  image, imageError, uploading, dragOver, imageInputRef, onUpload, onRemove, setImageError, setDragOver,
}: Props) {
  return (
    <div>
      <div className="form-section-title">
        Imagen
        <FieldTooltip label="Imagen principal del paquete. Visible en cards" />
      </div>
      {image ? (
        <div className="relative group rounded-lg overflow-hidden border border-border">
          {!imageError ? (
            <img src={image} alt="Vista previa" className="w-full h-36 object-cover" onError={() => setImageError(true)} />
          ) : (
            <div className="w-full h-36 bg-muted flex items-center justify-center">
              <ImagePlus className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => { setImageError(false); imageInputRef.current?.click(); }}>
              <Upload className="w-4 h-4 mr-1" /> Cambiar
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={onRemove}>
              <X className="w-4 h-4 mr-1" /> Eliminar
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) onUpload(file); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => imageInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            dragOver ? 'border-ring bg-accent' : 'border-border hover:border-ring/60 hover:bg-accent/50',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin w-6 h-6 border-2 border-ring border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Arrastra una imagen o <span className="text-primary font-medium">haz clic para seleccionar</span>
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF (máx. 5 MB)</p>
            </div>
          )}
        </div>
      )}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); }}
        className="hidden"
      />
    </div>
  );
}

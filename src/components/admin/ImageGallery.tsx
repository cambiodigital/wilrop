"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ImageGalleryProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  label?: string;
  apiEndpoint?: string; // default: /api/admin/upload
  maxImages?: number;
}

/**
 * Componente genérico para galería de imágenes con upload
 * Funciona con múltiples imágenes
 */
export function ImageGallery({
  images,
  onImagesChange,
  label = "Imágenes",
  apiEndpoint = "/api/admin/upload",
  maxImages = 10,
}: ImageGalleryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5 MB");
      return;
    }

    if (images.length >= maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "galleries");

      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al subir imagen");
      }

      const imageUrl = data.url || data.fileUrl;
      onImagesChange([...images, imageUrl]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          {label}
        </label>

        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleUpload(file);
            }
          }}
          disabled={isLoading || images.length >= maxImages}
          className="cursor-pointer"
        />

        <div className="mt-2 text-xs text-muted-foreground">
          {images.length} / {maxImages} imágenes
        </div>

        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        {isLoading && (
          <p className="text-primary text-sm mt-2">Subiendo imagen...</p>
        )}
      </div>

      {/* Galería de imágenes */}
      {images.length > 0 && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((imageUrl, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Image ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-md border border-border"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                  title="Eliminar imagen"
                >
                  ✕
                </button>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-md" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

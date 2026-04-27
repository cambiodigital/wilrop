"use client";

import { useImageUpload } from "@/hooks/use-image-upload";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HotelImageUploadProps {
  onImagesChange?: (images: string[]) => void;
  initialImages?: string[];
}

/**
 * Componente reutilizable para upload de imágenes de hoteles
 */
export function HotelImageUpload({ onImagesChange, initialImages = [] }: HotelImageUploadProps) {
  const [hotelImages, setHotelImages] = useState<string[]>(initialImages);
  const { upload, isLoading, error } = useImageUpload();

  const handleImageUpload = async (file: File) => {
    const url = await upload(file);
    if (url) {
      const newImages = [...hotelImages, url];
      setHotelImages(newImages);
      onImagesChange?.(newImages);
    }
  };

  const removeImage = (imageUrl: string) => {
    const newImages = hotelImages.filter((img) => img !== imageUrl);
    setHotelImages(newImages);
    onImagesChange?.(newImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Fotos del Hotel</label>

        {/* Input para seleccionar archivo */}
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleImageUpload(file);
            }
          }}
          disabled={isLoading}
          className="cursor-pointer"
        />

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {isLoading && <p className="text-blue-600 text-sm mt-2">Subiendo...</p>}
      </div>

      {/* Mostrar imágenes subidas */}
      {hotelImages.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">
            {hotelImages.length} foto{hotelImages.length !== 1 ? "s" : ""} subida
            {hotelImages.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-4 gap-3">
            {hotelImages.map((imageUrl, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Hotel photo ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
                <button
                  onClick={() => removeImage(imageUrl)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                  type="button"
                  title="Eliminar imagen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

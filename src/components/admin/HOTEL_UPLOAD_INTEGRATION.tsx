"use client";

/**
 * HOTEL_UPLOAD_INTEGRATION.tsx
 * 
 * Ejemplo de integración del sistema de upload de imágenes en el admin de hoteles.
 * Este archivo contiene patrones para integrar el componente HotelImageUpload
 * en los formularios de creación y edición de hoteles.
 */

import { useImageUpload } from "@/hooks/use-image-upload";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HotelImageUploadExampleProps {
  onImagesChange?: (images: string[]) => void;
  initialImages?: string[];
}

/**
 * EJEMPLO COMPLETO: Componente de upload con integración
 * 
 * Uso en AdminHotels:
 * ```tsx
 * import { HotelImageUpload } from "@/components/admin/HotelImageUpload";
 * 
 * export function AdminHotels() {
 *   const [images, setImages] = useState<string[]>([]);
 *   
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     // Enviar images junto con otros datos del hotel
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <HotelImageUpload onImagesChange={setImages} />
 *       <button type="submit">Guardar Hotel</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function HotelImageUploadExample({
  onImagesChange,
  initialImages = [],
}: HotelImageUploadExampleProps) {
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
        <label className="block text-sm font-medium mb-2">
          Fotos del Hotel
        </label>

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

/**
 * PATRÓN DE INTEGRACIÓN EN EL ENDPOINT /api/admin/hotels
 * 
 * Cuando recibas las imágenes del cliente, guárdalas así:
 *
 * ```typescript
 * import { NextRequest, NextResponse } from "next/server";
 * import { prisma } from "@/lib/db";
 *
 * export async function POST(request: NextRequest) {
 *   const body = await request.json();
 *
 *   const newHotel = await prisma.hotel.create({
 *     data: {
 *       name: body.name,
 *       description: body.description,
 *       images: JSON.stringify(body.images), // Array de URLs
 *       // otros campos...
 *     },
 *   });
 *
 *   return NextResponse.json(newHotel, { status: 201 });
 * }
 * ```
 *
 * Para recuperar las imágenes:
 *
 * ```typescript
 * const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
 * const images = JSON.parse(hotel.images || "[]"); // Array de URLs
 * ```
 */

/**
 * FLUJO COMPLETO
 *
 * 1. ✅ Usuario selecciona archivo en el admin (HotelImageUpload)
 * 2. ✅ Hook `useImageUpload` envía a POST /api/upload
 * 3. ✅ Endpoint valida y guarda archivo, devuelve URL relativa
 * 4. ✅ URL se muestra en preview en tiempo real
 * 5. ✅ Admin envía formulario con array de URLs
 * 6. ✅ Endpoint admin guarda las URLs como JSON en la BD
 * 7. ✅ Imágenes persistentes en /app/public/uploads (volumen persistente en Coolify)
 *
 * VALIDACIONES:
 * - Solo JPEG, PNG, WebP, GIF (máximo 5MB)
 * - Nombres de archivo sanitizados
 * - Timestamp para evitar colisiones
 * - Manejo de errores completo en cliente y servidor
 */

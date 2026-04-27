"use client";

import { useRef } from "react";
import { useImageUpload } from "@/hooks/use-image-upload";

interface ImageUploadFieldProps {
  onImageUploaded?: (url: string) => void;
  label?: string;
  accept?: string;
}

/**
 * Reusable image upload field component
 *
 * Usage:
 * ```tsx
 * <ImageUploadField
 *   label="Hotel Photo"
 *   onImageUploaded={(url) => {
 *     setHotelData({ ...hotelData, image: url });
 *   }}
 * />
 * ```
 */
export function ImageUploadField({
  onImageUploaded,
  label = "Upload Image",
  accept = "image/*",
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isLoading, error, success, fileUrl } = useImageUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await upload(file);
      if (url && onImageUploaded) {
        onImageUploaded(url);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? "Uploading..." : "Click to upload"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={isLoading}
        className="hidden"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {success && fileUrl && (
        <div className="space-y-2">
          <p className="text-sm text-green-600">✓ Image uploaded successfully</p>
          <img
            src={fileUrl}
            alt="Uploaded preview"
            className="w-full h-32 object-cover rounded-md"
          />
          <p className="text-xs text-gray-500 break-all">{fileUrl}</p>
        </div>
      )}
    </div>
  );
}

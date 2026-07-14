"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { normalizeUploadUrl, reorderImages } from "./utils";
import type { PanelMode, RoomTypeFormData } from "./types";

export function useRoomImages(
  mode: PanelMode,
  form: RoomTypeFormData,
  onFormChange: React.Dispatch<React.SetStateAction<RoomTypeFormData>>,
) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadEndpoint = mode === "admin" ? "/api/admin/upload" : "/api/upload";

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} no es una imagen válida`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} supera el límite de 5 MB`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        if (mode === "admin") formData.append("folder", "rooms");
        const res = await fetch(uploadEndpoint, {
          method: "POST",
          body: formData,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false)
          throw new Error(json.error || "Error al subir la imagen");
        const fileUrl = normalizeUploadUrl(json);
        if (!fileUrl) throw new Error("La respuesta de subida no incluyó URL");
        urls.push(fileUrl);
      }
      if (urls.length > 0) {
        onFormChange((prev) => ({
          ...prev,
          roomImages: [...prev.roomImages, ...urls],
          roomImage: prev.roomImage || urls[0] || "",
        }));
        toast.success(`${urls.length} foto(s) subida(s) correctamente`);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al subir imágenes",
      );
    } finally {
      setUploading(false);
    }
  };

  const addByUrl = () => {
    if (!urlInput.trim()) return;
    onFormChange((prev) => ({
      ...prev,
      roomImages: [...prev.roomImages, urlInput.trim()],
      roomImage: prev.roomImage || urlInput.trim(),
    }));
    setUrlInput("");
  };

  const remove = (idx: number) => {
    onFormChange((prev) => {
      const next = prev.roomImages.filter((_, i) => i !== idx);
      return {
        ...prev,
        roomImages: next,
        roomImage:
          prev.roomImage === prev.roomImages[idx]
            ? next[0] || ""
            : prev.roomImage,
      };
    });
  };

  const reorder = (from: number, to: number) => {
    onFormChange((prev) => {
      const next = reorderImages(prev.roomImages, from, to);
      return { ...prev, roomImages: next, roomImage: next[0] || "" };
    });
    setDraggedIdx(null);
  };

  const reset = () => {
    setUrlInput("");
    setDraggedIdx(null);
  };

  return {
    images: form.roomImages,
    coverImage: form.roomImage,
    uploading,
    dragOver,
    setDragOver,
    draggedIdx,
    setDraggedIdx,
    urlInput,
    setUrlInput,
    inputRef,
    uploadFiles,
    addByUrl,
    remove,
    reorder,
    reset,
  };
}

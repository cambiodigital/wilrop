"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { normalizeUploadUrl, reorderImages } from "./utils";
import type { PanelMode } from "./types";

export function useHotelImages(
  mode: PanelMode,
  images: string[],
  onUpdateImages: (images: string[]) => void,
) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [pendingUploads, setPendingUploads] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadEndpoint = mode === "admin" ? "/api/admin/upload" : "/api/upload";

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    setPendingUploads(Array.from(files).length);
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
        if (mode === "admin") formData.append("folder", "hotels");
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
        onUpdateImages([...images, ...urls]);
        toast.success(`${urls.length} imagen(es) subida(s) correctamente`);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al subir imágenes",
      );
    } finally {
      setUploading(false);
      setPendingUploads(0);
    }
  };

  const addByUrl = () => {
    if (!urlInput.trim()) return;
    onUpdateImages([...images, urlInput.trim()]);
    setUrlInput("");
  };

  const remove = (idx: number) => {
    onUpdateImages(images.filter((_, i) => i !== idx));
  };

  const reorder = (from: number, to: number) => {
    onUpdateImages(reorderImages(images, from, to));
    setDraggedIdx(null);
  };

  const reset = () => {
    setUrlInput("");
    setDraggedIdx(null);
  };

  return {
    images,
    uploading,
    dragOver,
    setDragOver,
    draggedIdx,
    setDraggedIdx,
    urlInput,
    setUrlInput,
    pendingUploads,
    inputRef,
    uploadFiles,
    addByUrl,
    remove,
    reorder,
    reset,
  };
}

"use client";

import { useState, useCallback } from "react";
import { UploadResponse } from "@/lib/upload-utils";

interface UseImageUploadState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  fileUrl: string | null;
  progress: number;
}

/**
 * Hook for handling image uploads
 *
 * Usage:
 * ```tsx
 * const { upload, isLoading, error, fileUrl } = useImageUpload();
 *
 * const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (file) {
 *     const url = await upload(file);
 *     if (url) {
 *       // Use the URL
 *     }
 *   }
 * };
 * ```
 */
export function useImageUpload() {
  const [state, setState] = useState<UseImageUploadState>({
    isLoading: false,
    error: null,
    success: false,
    fileUrl: null,
    progress: 0,
  });

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      // Reset state
      setState({
        isLoading: true,
        error: null,
        success: false,
        fileUrl: null,
        progress: 0,
      });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data: UploadResponse = await response.json();

        if (!response.ok || !data.success) {
          setState({
            isLoading: false,
            error: data.error || data.message || "Upload failed",
            success: false,
            fileUrl: null,
            progress: 0,
          });
          return null;
        }

        setState({
          isLoading: false,
          error: null,
          success: true,
          fileUrl: data.fileUrl || null,
          progress: 100,
        });

        return data.fileUrl || null;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        setState({
          isLoading: false,
          error: errorMessage,
          success: false,
          fileUrl: null,
          progress: 0,
        });

        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      success: false,
      fileUrl: null,
      progress: 0,
    });
  }, []);

  return {
    upload,
    reset,
    isLoading: state.isLoading,
    error: state.error,
    success: state.success,
    fileUrl: state.fileUrl,
    progress: state.progress,
  };
}

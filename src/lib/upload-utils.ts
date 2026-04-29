/**
 * Upload validation types and utilities
 */

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadResponse {
  success: boolean;
  message: string;
  fileUrl?: string;
  filename?: string;
  error?: string;
}

/**
 * Validates file type
 */
export function isValidImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType as any);
}

/**
 * Sanitizes filename for security
 * Removes special characters and ensures it's safe for filesystem
 */
export function sanitizeFilename(filename: string): string {
  // Find last dot index
  const lastDotIndex = filename.lastIndexOf(".");

  let ext = "jpg";
  let nameWithoutExt = filename;

  // If there's a dot and it's not the first character (hidden file without extension)
  if (lastDotIndex > 0) {
    ext = filename.slice(lastDotIndex + 1) || "jpg";
    nameWithoutExt = filename.slice(0, lastDotIndex);
  } else if (lastDotIndex === 0) {
    // If it's a hidden file like .env
    // We treat the whole thing as the name if there are no other dots
    ext = "jpg"; // Default extension
    nameWithoutExt = filename;
  }

  // Remove special characters, keep only alphanumeric, dash, underscore
  let sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") // Remove leading/trailing dashes
    .toLowerCase()
    .slice(0, 100);

  if (!sanitized) {
    sanitized = "file";
  }

  // Add timestamp to avoid collisions
  const timestamp = Date.now();
  return `${sanitized}-${timestamp}.${ext}`;
}

/**
 * Converts Buffer to a safe format for storage
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

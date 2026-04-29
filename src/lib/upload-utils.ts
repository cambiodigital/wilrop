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
  // Remove extension
  const parts = filename.split(".");
  const ext = parts.length > 1 ? parts.pop() : "jpg";
  const nameWithoutExt = parts.length > 0 ? parts.join(".") : filename;

  // Remove special characters, keep only alphanumeric, dash, underscore
  const sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 100);

  // Add timestamp to avoid collisions
  const timestamp = Date.now();

  // If sanitized is empty after removing special chars
  const baseName = sanitized || "file";

  return `${baseName}-${timestamp}.${ext}`;
}

/**
 * Converts Buffer to a safe format for storage
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

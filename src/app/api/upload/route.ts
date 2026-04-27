import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import {
  isValidImageType,
  sanitizeFilename,
  fileToBuffer,
  MAX_FILE_SIZE,
  UploadResponse,
} from "@/lib/upload-utils";

/**
 * POST /api/upload
 * Handles image uploads and saves them to the persistent storage volume
 *
 * Request:
 * - Content-Type: multipart/form-data
 * - Field name: file (the image file)
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   fileUrl?: string,     // e.g., "/uploads/hotel-photos-1234567890.jpg"
 *   filename?: string,
 *   error?: string
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // Validate that file exists
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file provided",
          error: "Missing 'file' field in form data",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type",
          error: `Only JPEG, PNG, WebP, and GIF are allowed. Received: ${file.type}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "File too large",
          error: `Maximum file size is 5MB. Received: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.name);

    // Define upload directory
    // In production, this path is mounted as a persistent volume in Coolify
    const uploadsDir = join(process.cwd(), "public", "uploads");

    // Ensure uploads directory exists
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (mkdirError) {
      console.error("Error creating uploads directory:", mkdirError);
    }

    // Convert file to buffer
    const buffer = await fileToBuffer(file);

    // Write file to disk
    const filePath = join(uploadsDir, sanitizedFilename);
    await writeFile(filePath, buffer);

    // Construct the relative URL for the uploaded file
    const fileUrl = `/uploads/${sanitizedFilename}`;

    console.log(`File uploaded successfully: ${fileUrl}`);

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully",
        fileUrl,
        filename: sanitizedFilename,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/upload
 * Handles CORS preflight requests
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({}, { status: 200 });
}

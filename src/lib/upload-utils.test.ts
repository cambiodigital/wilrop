import { expect, test, describe } from "bun:test";
import { isValidImageType, sanitizeFilename, fileToBuffer } from "./upload-utils";

describe("upload-utils", () => {
  describe("isValidImageType", () => {
    test("returns true for valid image types", () => {
      expect(isValidImageType("image/jpeg")).toBe(true);
      expect(isValidImageType("image/png")).toBe(true);
      expect(isValidImageType("image/webp")).toBe(true);
      expect(isValidImageType("image/gif")).toBe(true);
    });

    test("returns false for invalid image types", () => {
      expect(isValidImageType("application/json")).toBe(false);
      expect(isValidImageType("text/html")).toBe(false);
      expect(isValidImageType("image/svg+xml")).toBe(false);
      expect(isValidImageType("image/bmp")).toBe(false);
    });

    test("returns false for edge cases", () => {
      expect(isValidImageType("")).toBe(false);
      expect(isValidImageType("image")).toBe(false);
      expect(isValidImageType("jpeg")).toBe(false);
      expect(isValidImageType("image/jpeg ")).toBe(false);
      expect(isValidImageType("IMAGE/JPEG")).toBe(false);
    });
  });

  describe("sanitizeFilename", () => {
    test("removes special characters and lowercases", () => {
      const sanitized = sanitizeFilename("My File @#$.jpg");
      expect(sanitized).toMatch(/^my-file-.*\.jpg$/);
    });

    test("handles multiple extensions", () => {
      const sanitized = sanitizeFilename("archive.tar.gz");
      expect(sanitized).toMatch(/^archive-tar-.*\.gz$/);
    });

    test("handles filenames without extensions", () => {
      const sanitized = sanitizeFilename("no-extension-file");
      // The function defaults to "jpg" if there's no dot
      expect(sanitized).toMatch(/^no-extension-file-.*\.jpg$/);
    });

    test("trims very long names", () => {
      const longName = "a".repeat(150) + ".jpg";
      const sanitized = sanitizeFilename(longName);
      expect(sanitized.length).toBeLessThan(150); // should be sliced
    });
  });

  describe("fileToBuffer", () => {
    test("converts File to Buffer", async () => {
      const content = "Hello World";
      const file = new File([content], "test.txt", { type: "text/plain" });
      const buffer = await fileToBuffer(file);
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.toString("utf-8")).toBe(content);
    });
  });
});

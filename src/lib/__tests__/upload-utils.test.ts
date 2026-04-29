import { describe, expect, test, spyOn, afterAll } from "bun:test";
import { sanitizeFilename } from "../upload-utils";

describe("sanitizeFilename", () => {
  const MOCK_TIME = 1600000000000;
  const dateSpy = spyOn(Date, "now").mockReturnValue(MOCK_TIME);

  afterAll(() => {
    dateSpy.mockRestore();
  });

  test("removes special characters and lowercases the name", () => {
    const result = sanitizeFilename("My File @#$%.jpg");
    expect(result).toBe(`my-file-${MOCK_TIME}.jpg`);
  });

  test("handles filenames with multiple dots", () => {
    const result = sanitizeFilename("my.complex.file.name.png");
    expect(result).toBe(`my-complex-file-name-${MOCK_TIME}.png`);
  });

  test("handles files without extensions by defaulting to .jpg", () => {
    const result = sanitizeFilename("filename-without-ext");
    expect(result).toBe(`filename-without-ext-${MOCK_TIME}.jpg`);
  });

  test("removes multiple consecutive dashes", () => {
    const result = sanitizeFilename("file---name.jpg");
    expect(result).toBe(`file-name-${MOCK_TIME}.jpg`);
  });

  test("handles hidden files (starting with dot)", () => {
    const result = sanitizeFilename(".hidden-file");
    expect(result).toBe(`hidden-file-${MOCK_TIME}.jpg`);
  });

  test("handles empty base name fallback", () => {
    const result = sanitizeFilename("@@@.png");
    expect(result).toBe(`file-${MOCK_TIME}.png`);
  });

  test("truncates extremely long filenames", () => {
    const longName = "a".repeat(150) + ".jpg";
    const result = sanitizeFilename(longName);
    const expectedBase = "a".repeat(100);
    expect(result).toBe(`${expectedBase}-${MOCK_TIME}.jpg`);
  });
});

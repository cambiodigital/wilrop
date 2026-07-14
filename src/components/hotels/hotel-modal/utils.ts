export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeAmenityStr(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export function isAmenitySelected(
  amenities: string[],
  amenityId: string,
  amenityName: string,
): boolean {
  const normName = normalizeAmenityStr(amenityName);
  return amenities.some((a) => {
    const na = normalizeAmenityStr(a);
    return a === amenityId || na === normName;
  });
}

export function normalizeUploadUrl(payload: Record<string, unknown>): string {
  if (typeof payload.url === "string" && payload.url) return payload.url;
  if (typeof payload.fileUrl === "string" && payload.fileUrl)
    return payload.fileUrl;
  return "";
}

export function reorderImages(images: string[], from: number, to: number): string[] {
  const next = [...images];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

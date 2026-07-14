"use client";

import { useCallback, useEffect, useState } from "react";
import { parseRoomTypeIncludes } from "@/lib/admin/hotel-roomtypes";
import {
  buildHotelDestinationCompatibilityFields,
  findHotelDestinationOption,
  getHotelDestinationSelectorState,
  normalizeHotelDestinationOptions,
  type HotelDestinationOption,
} from "@/lib/admin/hotel-destination-ui";
import {
  type PanelMode,
  type RoomTypeRow,
  type RoomTypeFormData,
  type UniversalHotelRecord,
  emptyHotelForm,
  emptyRoomTypeForm,
} from "./types";
import { generateSlug } from "./utils";

type Reseller = {
  id: string;
  companyName?: string;
  contactName?: string;
  email?: string;
};

export function useHotelModalForm(
  open: boolean,
  hotel: UniversalHotelRecord | null | undefined,
  mode: PanelMode,
) {
  const [form, setForm] = useState(emptyHotelForm);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [destinationsError, setDestinationsError] = useState<string | null>(null);
  const [destinationOptions, setDestinationOptions] = useState<HotelDestinationOption[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [customAmenityInput, setCustomAmenityInput] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [roomTypes, setRoomTypes] = useState<RoomTypeRow[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(null);
  const [roomTypeDeleteId, setRoomTypeDeleteId] = useState<string | null>(null);
  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false);
  const [savingRoomType, setSavingRoomType] = useState(false);
  const [roomTypeForm, setRoomTypeForm] = useState<RoomTypeFormData>(emptyRoomTypeForm);
  const [pendingRoomTypes, setPendingRoomTypes] = useState<RoomTypeRow[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const editingId = hotel?.id ?? null;
  const isCreateMode = !editingId;
  const hotelApiBase = mode === "admin" ? "/api/admin/hotels" : "/api/reseller/products/hotels";
  const roomsApiBase = mode === "admin" ? "/api/admin/rooms" : "/api/reseller/products/hotel-rooms";

  const validateField = (key: string, value: string) => {
    if (!value.trim()) {
      setFieldErrors((prev) => ({ ...prev, [key]: "Este campo es obligatorio" }));
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const fetchDestinationOptions = useCallback(async () => {
    setDestinationsLoading(true);
    setDestinationsError(null);
    try {
      const endpoint =
        mode === "admin"
          ? "/api/admin/relation-options/destinations?active=all"
          : "/api/public/destinations?limit=200";
      const res = await fetch(endpoint);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false)
        throw new Error(json.error || "Error al cargar destinos");
      if (mode === "admin") {
        setDestinationOptions(normalizeHotelDestinationOptions(json));
      } else {
        const data = Array.isArray(json.data) ? json.data : [];
        setDestinationOptions(
          data
            .filter(
              (item): item is Record<string, unknown> =>
                Boolean(item) && typeof item === "object",
            )
            .map((item) => ({
              id: String(item.id ?? ""),
              slug: typeof item.slug === "string" ? item.slug : undefined,
              label: String(item.name ?? ""),
              subtitle: typeof item.region === "string" ? item.region : undefined,
              active: typeof item.active === "boolean" ? item.active : true,
              isTemplate: typeof item.isTemplate === "boolean" ? item.isTemplate : false,
              sourceType: "public",
            }))
            .filter((item) => item.id && item.label),
        );
      }
    } catch (err: unknown) {
      setDestinationsError(
        err instanceof Error ? err.message : "Error al cargar destinos",
      );
    } finally {
      setDestinationsLoading(false);
    }
  }, [mode]);

  const fetchResellers = useCallback(async () => {
    if (mode !== "admin") return;
    try {
      const res = await fetch("/api/admin/resellers");
      if (!res.ok) throw new Error("Error al cargar revendedores");
      const json = await res.json();
      setResellers(Array.isArray(json.data) ? json.data : []);
    } catch {
      setResellers([]);
    }
  }, [mode]);

  const fetchRoomTypes = useCallback(async () => {
    if (!editingId) {
      setRoomTypes([]);
      return;
    }
    setRoomTypesLoading(true);
    try {
      const res = await fetch(`${roomsApiBase}?hotelId=${editingId}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false)
        throw new Error(json.error || "Error al cargar habitaciones");
      setRoomTypes(Array.isArray(json.data) ? json.data : []);
    } catch {
      setRoomTypes([]);
    } finally {
      setRoomTypesLoading(false);
    }
  }, [editingId, roomsApiBase]);

  useEffect(() => {
    if (!open) return;
    if (hotel) {
      setForm({
        name: hotel.name,
        slug: hotel.slug,
        cityId: hotel.cityId,
        cityName: hotel.cityName,
        destinationId: hotel.destinationId ?? "",
        stars: hotel.stars,
        address: hotel.address,
        description: hotel.description,
        images: hotel.images ?? [],
        amenities: hotel.amenities ?? [],
        rooms: hotel.rooms ?? [],
        rating: hotel.rating ?? 0,
        reviewCount: hotel.reviewCount ?? 0,
        priceFrom: hotel.priceFrom ?? 0,
        tags: hotel.tags ?? [],
        featured: hotel.featured ?? false,
        active: hotel.active ?? true,
        resellerId: hotel.resellerId ?? "",
      });
      setTagsStr((hotel.tags ?? []).join(", "));
    } else {
      setForm(emptyHotelForm);
      setTagsStr("");
      setRoomTypes([]);
    }
    setPendingRoomTypes([]);
    setFieldErrors({});
    setEditingRoomTypeId(null);
    setRoomTypeDeleteId(null);
    setShowRoomTypeForm(false);
    fetchDestinationOptions();
    fetchResellers();
  }, [open, hotel, fetchDestinationOptions, fetchResellers]);

  useEffect(() => {
    if (!open || !editingId) return;
    fetchRoomTypes();
  }, [open, editingId, fetchRoomTypes]);

  const updateField = useCallback(
    <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        if (key === "name") next.slug = generateSlug(value as string);
        return next;
      });
    },
    [],
  );

  const resetRoomTypeForm = () => {
    setEditingRoomTypeId(null);
    setShowRoomTypeForm(false);
    setRoomTypeForm(emptyRoomTypeForm);
  };

  const openEditRoomType = (roomType: RoomTypeRow) => {
    setEditingRoomTypeId(roomType.id);
    setShowRoomTypeForm(true);
    setRoomTypeForm({
      name: roomType.name,
      maxGuests: roomType.maxGuests,
      beds: roomType.beds,
      basePrice: roomType.basePrice,
      originalPrice: roomType.originalPrice,
      includes: parseRoomTypeIncludes(roomType.includes),
      roomImage: roomType.roomImage || "",
      roomImages: roomType.roomImages ?? [],
      active: roomType.active,
    });
  };

  const openEditPendingRoomType = (roomType: RoomTypeRow) => {
    setEditingRoomTypeId(roomType.id);
    setShowRoomTypeForm(true);
    setRoomTypeForm({
      name: roomType.name,
      maxGuests: roomType.maxGuests,
      beds: roomType.beds,
      basePrice: roomType.basePrice,
      originalPrice: roomType.originalPrice,
      includes: parseRoomTypeIncludes(roomType.includes),
      roomImage: roomType.roomImage || "",
      roomImages: roomType.roomImages ?? [],
      active: roomType.active,
    });
  };

  const saveRoomType = async (method: "POST" | "PUT") => {
    if (!roomTypeForm.name.trim()) {
      return { success: false, error: "El nombre de la habitación es obligatorio" };
    }
    if (!editingId && method === "POST") {
      return { success: false, error: "Guarda el hotel primero para gestionar habitaciones" };
    }
    setSavingRoomType(true);
    try {
      const endpoint =
        method === "POST"
          ? `${roomsApiBase}/${editingId}`
          : `${roomsApiBase}/${editingRoomTypeId}`;
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...roomTypeForm,
          includes: roomTypeForm.includes,
          roomImage: roomTypeForm.roomImage || roomTypeForm.roomImages[0] || "",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false)
        throw new Error(json.error || "Error al guardar habitación");
      await fetchRoomTypes();
      resetRoomTypeForm();
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al guardar habitación",
      };
    } finally {
      setSavingRoomType(false);
    }
  };

  const handleSavePendingRoomType = () => {
    if (!roomTypeForm.name.trim()) {
      return { success: false, error: "El nombre de la habitación es obligatorio" };
    }
    const newRoom: RoomTypeRow = {
      id: `temp_${crypto.randomUUID()}`,
      hotelId: "",
      name: roomTypeForm.name,
      maxGuests: roomTypeForm.maxGuests,
      beds: roomTypeForm.beds,
      basePrice: roomTypeForm.basePrice,
      originalPrice: roomTypeForm.originalPrice,
      includes: JSON.stringify(roomTypeForm.includes),
      roomImage: roomTypeForm.roomImage || roomTypeForm.roomImages[0] || "",
      roomImages: roomTypeForm.roomImages,
      active: roomTypeForm.active,
    };
    setPendingRoomTypes((prev) => [...prev, newRoom]);
    resetRoomTypeForm();
    return { success: true };
  };

  const handleUpdatePendingRoomType = () => {
    if (!roomTypeForm.name.trim()) {
      return { success: false, error: "El nombre de la habitación es obligatorio" };
    }
    if (!editingRoomTypeId) return { success: false, error: "No editing ID" };
    setPendingRoomTypes((prev) =>
      prev.map((rt) =>
        rt.id === editingRoomTypeId
          ? {
              ...rt,
              name: roomTypeForm.name,
              maxGuests: roomTypeForm.maxGuests,
              beds: roomTypeForm.beds,
              basePrice: roomTypeForm.basePrice,
              originalPrice: roomTypeForm.originalPrice,
              includes: JSON.stringify(roomTypeForm.includes),
              roomImage: roomTypeForm.roomImage || roomTypeForm.roomImages[0] || "",
              roomImages: roomTypeForm.roomImages,
              active: roomTypeForm.active,
            }
          : rt,
      ),
    );
    resetRoomTypeForm();
    return { success: true };
  };

  const handleDeletePendingRoomType = (id: string) => {
    setPendingRoomTypes((prev) => prev.filter((rt) => rt.id !== id));
    if (editingRoomTypeId === id) resetRoomTypeForm();
  };

  const handleDeleteRoomType = async () => {
    if (!roomTypeDeleteId) return;
    try {
      const res = await fetch(`${roomsApiBase}/${roomTypeDeleteId}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false)
        throw new Error(json.error || "Error al eliminar habitación");
      setRoomTypeDeleteId(null);
      await fetchRoomTypes();
    } catch (err: unknown) {
      throw err;
    }
  };

  const selectedDestination = findHotelDestinationOption(
    destinationOptions,
    form.destinationId ?? "",
  );
  const destinationSelectorState = getHotelDestinationSelectorState({
    options: destinationOptions,
    selectedId: form.destinationId ?? "",
    isLoading: destinationsLoading,
    error: destinationsError,
    createCtaHref: mode === "admin" ? "/admin/destinos" : "/panel-reseller",
    createCtaLabel: mode === "admin" ? "Crear destino" : "Gestionar destinos",
  });

  const displayRoomTypes = isCreateMode ? pendingRoomTypes : roomTypes;

  return {
    form,
    setForm,
    editingId,
    isCreateMode,
    tagsStr,
    setTagsStr,
    customAmenityInput,
    setCustomAmenityInput,
    fieldErrors,
    validateField,
    clearFieldError,
    updateField,
    destinationsLoading,
    destinationsError,
    destinationOptions,
    destinationSelectorState,
    selectedDestination,
    fetchDestinationOptions,
    resellers,
    roomTypes,
    roomTypesLoading,
    displayRoomTypes,
    editingRoomTypeId,
    setEditingRoomTypeId,
    roomTypeDeleteId,
    setRoomTypeDeleteId,
    showRoomTypeForm,
    setShowRoomTypeForm,
    savingRoomType,
    roomTypeForm,
    setRoomTypeForm,
    pendingRoomTypes,
    resetRoomTypeForm,
    openEditRoomType,
    openEditPendingRoomType,
    saveRoomType,
    handleSavePendingRoomType,
    handleUpdatePendingRoomType,
    handleDeletePendingRoomType,
    handleDeleteRoomType,
    fetchRoomTypes,
    hotelApiBase,
  };
}

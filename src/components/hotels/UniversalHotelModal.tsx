"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BedDouble,
  ExternalLink,
  GripVertical,
  ImagePlus,
  Info,
  Link2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  buildHotelDestinationCompatibilityFields,
  findHotelDestinationOption,
  getHotelDestinationSelectorState,
  normalizeHotelDestinationOptions,
  type HotelDestinationOption,
} from "@/lib/admin/hotel-destination-ui";
import {
  parseRoomTypeIncludes,
  syncRoomTypesToHotelRooms,
} from "@/lib/admin/hotel-roomtypes";

type PanelMode = "admin" | "reseller";

export interface UniversalHotelRoom {
  id: string;
  name: string;
  maxGuests: number;
  beds: string;
  price: number;
  originalPrice?: number;
  includes: string[];
  available: number;
  roomImage: string;
  roomImages?: string[];
}

export interface UniversalHotelRecord {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  cityName: string;
  destinationId?: string | null;
  stars: number;
  address: string;
  description: string;
  images: string[];
  amenities: string[];
  rooms: UniversalHotelRoom[];
  rating: number;
  reviewCount: number;
  priceFrom: number;
  tags: string[];
  featured: boolean;
  active: boolean;
  resellerId?: string | null;
}

interface RoomTypeRow {
  id: string;
  hotelId: string;
  name: string;
  maxGuests: number;
  beds: string;
  basePrice: number;
  originalPrice: number;
  includes: string;
  roomImage: string;
  roomImages?: string[];
  active: boolean;
}

interface UniversalHotelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel?: UniversalHotelRecord | null;
  mode: PanelMode;
  onSaved?: () => void | Promise<void>;
}

const emptyHotelForm: Omit<UniversalHotelRecord, "id"> = {
  name: "",
  slug: "",
  cityId: "",
  cityName: "",
  destinationId: "",
  stars: 3,
  address: "",
  description: "",
  images: [],
  amenities: [],
  rooms: [],
  rating: 0,
  reviewCount: 0,
  priceFrom: 0,
  tags: [],
  featured: false,
  active: true,
  resellerId: "",
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeUploadUrl(payload: Record<string, unknown>): string {
  if (typeof payload.url === "string" && payload.url) return payload.url;
  if (typeof payload.fileUrl === "string" && payload.fileUrl)
    return payload.fileUrl;
  return "";
}

function FieldHelper({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground mt-1">{children}</p>
  );
}

function FieldTooltip({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger type="button" className="inline-flex ml-1 text-muted-foreground hover:text-foreground transition-colors">
        <Info className="w-3 h-3" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function TagInput({
  tags,
  onChange,
  placeholder = "Agregar...",
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
            if (e.key === "Backspace" && !inputValue && tags.length > 0) {
              onChange(tags.slice(0, -1));
            }
          }}
          placeholder={placeholder}
          className="flex-1 text-sm h-8"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={!inputValue.trim()}
          className="h-8"
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, idx) => (
            <Badge
              key={`${tag}-${idx}`}
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-1 text-xs border border-border bg-accent text-accent-foreground hover:bg-accent"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((_, i) => i !== idx))}
                className="rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UniversalHotelModal({
  open,
  onOpenChange,
  hotel,
  mode,
  onSaved,
}: UniversalHotelModalProps) {
  const editingId = hotel?.id ?? null;
  const hotelApiBase =
    mode === "admin" ? "/api/admin/hotels" : "/api/reseller/products/hotels";
  const roomsApiBase =
    mode === "admin"
      ? "/api/admin/rooms"
      : "/api/reseller/products/hotel-rooms";
  const uploadEndpoint = mode === "admin" ? "/api/admin/upload" : "/api/upload";
  const [form, setForm] = useState(emptyHotelForm);
  const [saving, setSaving] = useState(false);
  const [destinationOptions, setDestinationOptions] = useState<
    HotelDestinationOption[]
  >([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [destinationsError, setDestinationsError] = useState<string | null>(
    null,
  );
  const [resellers, setResellers] = useState<
    Array<{
      id: string;
      companyName?: string;
      contactName?: string;
      email?: string;
    }>
  >([]);
  const [amenitiesStr, setAmenitiesStr] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [roomTypes, setRoomTypes] = useState<RoomTypeRow[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(
    null,
  );
  const [roomTypeDeleteId, setRoomTypeDeleteId] = useState<string | null>(null);
  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false);
  const [savingRoomType, setSavingRoomType] = useState(false);
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: "",
    maxGuests: 2,
    beds: "1 cama doble",
    basePrice: 0,
    originalPrice: 0,
    includes: [] as string[],
    roomImage: "",
    roomImages: [] as string[],
    active: true,
  });
  const [pendingRoomTypes, setPendingRoomTypes] = useState<RoomTypeRow[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const [imagesUploading, setImagesUploading] = useState(false);
  const [imagesDragOver, setImagesDragOver] = useState(false);
  const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [pendingUploads, setPendingUploads] = useState(0);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const [roomImgUploading, setRoomImgUploading] = useState(false);
  const [roomImgDragOver, setRoomImgDragOver] = useState(false);
  const [draggedRoomImgIdx, setDraggedRoomImgIdx] = useState<number | null>(
    null,
  );
  const [roomImageUrlInput, setRoomImageUrlInput] = useState("");
  const roomImagesInputRef = useRef<HTMLInputElement>(null);

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
      setAmenitiesStr((hotel.amenities ?? []).join(", "));
      setTagsStr((hotel.tags ?? []).join(", "));
    } else {
      setForm(emptyHotelForm);
      setAmenitiesStr("");
      setTagsStr("");
      setRoomTypes([]);
    }
    setPendingRoomTypes([]);
    setFieldErrors({});
    setEditingRoomTypeId(null);
    setRoomTypeDeleteId(null);
    setShowRoomTypeForm(false);
    setImageUrlInput("");
    setRoomImageUrlInput("");
  }, [open, hotel]);

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
              subtitle:
                typeof item.region === "string" ? item.region : undefined,
              active: typeof item.active === "boolean" ? item.active : true,
              isTemplate:
                typeof item.isTemplate === "boolean" ? item.isTemplate : false,
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
    fetchDestinationOptions();
    fetchResellers();
  }, [open, fetchDestinationOptions, fetchResellers]);

  useEffect(() => {
    if (!open || !editingId) return;
    fetchRoomTypes();
  }, [open, editingId, fetchRoomTypes]);

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name") next.slug = generateSlug(value as string);
      return next;
    });
  };

  const uploadFiles = async (
    files: FileList | File[],
    folder: "hotels" | "rooms",
  ) => {
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
      if (mode === "admin") formData.append("folder", folder);
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
    return urls;
  };

  const uploadHotelImages = async (files: FileList | File[]) => {
    setImagesUploading(true);
    setPendingUploads(Array.from(files).length);
    try {
      const newUrls = await uploadFiles(files, "hotels");
      if (newUrls.length > 0) {
        setForm((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
        toast.success(`${newUrls.length} imagen(es) subida(s) correctamente`);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al subir imágenes",
      );
    } finally {
      setImagesUploading(false);
      setPendingUploads(0);
    }
  };

  const uploadRoomImages = async (files: FileList | File[]) => {
    setRoomImgUploading(true);
    try {
      const newUrls = await uploadFiles(files, "rooms");
      if (newUrls.length > 0) {
        setRoomTypeForm((prev) => ({
          ...prev,
          roomImages: [...prev.roomImages, ...newUrls],
          roomImage: prev.roomImage || newUrls[0] || "",
        }));
        toast.success(`${newUrls.length} foto(s) subida(s) correctamente`);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al subir imágenes",
      );
    } finally {
      setRoomImgUploading(false);
    }
  };

  const resetRoomTypeForm = () => {
    setEditingRoomTypeId(null);
    setShowRoomTypeForm(false);
    setRoomTypeForm({
      name: "",
      maxGuests: 2,
      beds: "1 cama doble",
      basePrice: 0,
      originalPrice: 0,
      includes: [],
      roomImage: "",
      roomImages: [],
      active: true,
    });
    setRoomImageUrlInput("");
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
    setRoomImageUrlInput("");
  };

  const saveRoomType = async (method: "POST" | "PUT") => {
    if (!roomTypeForm.name.trim()) {
      toast.error("El nombre de la habitación es obligatorio");
      return;
    }
    if (!editingId && method === "POST") {
      toast.error("Guarda el hotel primero para gestionar habitaciones");
      return;
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
      toast.success(
        method === "POST"
          ? "Habitación creada correctamente"
          : "Habitación actualizada correctamente",
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar habitación",
      );
    } finally {
      setSavingRoomType(false);
    }
  };

  const isCreateMode = !editingId;

  const handleSavePendingRoomType = () => {
    if (!roomTypeForm.name.trim()) {
      toast.error("El nombre de la habitación es obligatorio");
      return;
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
    toast.success("Habitación agregada (se creará junto con el hotel)");
  };

  const handleUpdatePendingRoomType = () => {
    if (!roomTypeForm.name.trim()) {
      toast.error("El nombre de la habitación es obligatorio");
      return;
    }
    if (!editingRoomTypeId) return;
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
              roomImage:
                roomTypeForm.roomImage || roomTypeForm.roomImages[0] || "",
              roomImages: roomTypeForm.roomImages,
              active: roomTypeForm.active,
            }
          : rt,
      ),
    );
    resetRoomTypeForm();
    toast.success("Habitación actualizada correctamente");
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
    setRoomImageUrlInput("");
  };

  const handleDeletePendingRoomType = (id: string) => {
    setPendingRoomTypes((prev) => prev.filter((rt) => rt.id !== id));
    if (editingRoomTypeId === id) {
      resetRoomTypeForm();
    }
    toast.success("Habitación eliminada correctamente");
  };

  const displayRoomTypes = isCreateMode ? pendingRoomTypes : roomTypes;

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
      toast.success("Habitación eliminada correctamente");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al eliminar habitación",
      );
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (destinationsError) {
      toast.error("No se puede guardar hasta cargar destinos correctamente");
      return;
    }
    if (!form.destinationId?.trim() || !form.cityName.trim()) {
      toast.error("Selecciona un destino válido");
      return;
    }
    if (!editingId && pendingRoomTypes.length === 0) {
      toast.error(
        "Debes agregar al menos una habitación antes de guardar el hotel",
      );
      return;
    }
    setSaving(true);
    try {
      const activeRoomTypes = editingId
        ? roomTypes.filter((roomType) => roomType.active)
        : [];

      const payload: any = {
        ...form,
        slug: form.slug || generateSlug(form.name),
        rooms:
          activeRoomTypes.length > 0
            ? syncRoomTypesToHotelRooms(activeRoomTypes)
            : form.rooms,
      };

      if (!editingId && pendingRoomTypes.length > 0) {
        payload._pendingRoomTypes = pendingRoomTypes.map((rt) => ({
          name: rt.name,
          maxGuests: rt.maxGuests,
          beds: rt.beds,
          basePrice: rt.basePrice,
          originalPrice: rt.originalPrice,
          includes: parseRoomTypeIncludes(rt.includes),
          roomImage: rt.roomImage,
          roomImages: rt.roomImages || [],
          active: rt.active,
        }));
      }
      const res = await fetch(
        editingId ? `${hotelApiBase}/${editingId}` : hotelApiBase,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false)
        throw new Error(json.error || "Error al guardar hotel");
      toast.success(
        editingId
          ? "Hotel actualizado correctamente"
          : "Hotel creado correctamente",
      );
      onOpenChange(false);
      await onSaved?.();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar hotel",
      );
    } finally {
      setSaving(false);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          topAligned
          className={cn(
            "sm:max-w-4xl max-h-[90vh] flex flex-col",
            mode === "admin"
              ? "admin-dialog"
              : "force-light bg-white text-slate-900 border-slate-200",
          )}
        >
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Hotel" : "Nuevo Hotel"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modifica los datos del hotel"
                : "Completa los datos para registrar un nuevo hotel"}
            </DialogDescription>
          </DialogHeader>
          <Tabs
            defaultValue="basic"
            className="pt-2 flex flex-col flex-1 overflow-hidden"
          >
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">
                Info Basica
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1">
                Imagenes
              </TabsTrigger>
              <TabsTrigger value="amenities" className="flex-1">
                Servicios
              </TabsTrigger>
              <TabsTrigger value="rooms" className="flex-1 relative">
                <BedDouble className="w-3.5 h-3.5 mr-1" />
                Habitaciones
                {!editingId && pendingRoomTypes.length > 0 && (
                  <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingRoomTypes.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="extra" className="flex-1">
                Extra
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="basic"
              className="space-y-4 mt-4 overflow-y-auto flex-1 min-h-0"
            >
              <div className="form-section-title">Informacion principal</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-name" className="label-required">
                    Nombre
                    <FieldTooltip label="Nombre comercial del hotel tal como aparecera en el portal y busquedas" />
                  </Label>
                  <Input
                    id="hotel-name"
                    value={form.name}
                    onChange={(e) => {
                      updateField("name", e.target.value);
                      clearFieldError("name");
                    }}
                    onBlur={() => validateField("name", form.name)}
                    placeholder="Hotel Charleston Santa Teresa"
                    className={fieldErrors.name ? "input-error" : ""}
                  />
                  {fieldErrors.name && (
                    <p className="field-error-text text-xs">{fieldErrors.name}</p>
                  )}
                  <FieldHelper>
                    Nombre comercial visible en listados, pagina de detalle y resultados de busqueda.
                  </FieldHelper>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-slug">
                    Slug
                    <FieldTooltip label="Identificador unico en la URL. Se genera automaticamente del nombre pero puedes personalizarlo" />
                  </Label>
                  <Input
                    id="hotel-slug"
                    value={form.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    placeholder="Auto-generado del nombre"
                  />
                  <FieldHelper>
                    Identificador unico para la URL del hotel. Solo letras, numeros y guiones.
                  </FieldHelper>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-destination" className="label-required">
                    Destino relacional
                    <FieldTooltip label="Ciudad o region donde se ubica el hotel. Define la ubicacion en busquedas y filtros" />
                  </Label>
                  <select
                    id="hotel-destination"
                    value={form.destinationId ?? ""}
                    onChange={(e) => {
                      const option = findHotelDestinationOption(
                        destinationOptions,
                        e.target.value,
                      );
                      setForm((prev) => ({
                        ...prev,
                        ...buildHotelDestinationCompatibilityFields(option),
                      }));
                      clearFieldError("destinationId");
                    }}
                    onBlur={() =>
                      validateField("destinationId", form.destinationId ?? "")
                    }
                    disabled={destinationsLoading || Boolean(destinationsError)}
                    className={cn(
                      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                      fieldErrors.destinationId && "input-error",
                    )}
                  >
                    <option value="">Selecciona un destino</option>
                    {destinationSelectorState.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                        {option.stateLabel
                          ? ` · ${option.stateLabel.toLowerCase()}`
                          : ""}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.destinationId && (
                    <p className="field-error-text text-xs">
                      {fieldErrors.destinationId}
                    </p>
                  )}
                  <FieldHelper>
                    Selecciona la ciudad o region donde se ubica el hotel. Define filtros y busquedas.
                  </FieldHelper>
                  {destinationSelectorState.status === "loading" && (
                    <p className="text-xs text-muted-foreground">
                      {destinationSelectorState.statusLabel}
                    </p>
                  )}
                  {destinationSelectorState.status === "error" && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <span>{destinationSelectorState.statusLabel}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fetchDestinationOptions}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reintentar
                      </Button>
                    </div>
                  )}
                  {destinationSelectorState.status === "empty" &&
                    mode === "admin" && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{destinationSelectorState.statusLabel}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={
                              destinationSelectorState.createCta?.href ??
                              "/admin/destinos"
                            }
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {destinationSelectorState.createCta?.label ??
                              "Crear destino"}
                          </a>
                        </Button>
                      </div>
                    )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-city-name">
                    Nombre destino (snapshot)
                    <FieldTooltip label="Se completa automaticamente al seleccionar el destino. Es el texto visible de la ubicacion" />
                  </Label>
                  <Input
                    id="hotel-city-name"
                    value={selectedDestination?.label ?? form.cityName}
                    readOnly
                    placeholder="Se completa al seleccionar destino"
                  />
                  <FieldHelper>
                    Texto visible de la ubicacion. Se completa automaticamente al seleccionar el destino.
                  </FieldHelper>
                </div>
              </div>
              <div className="form-section-title">Datos del hotel</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-stars">
                    Estrellas (1-5)
                    <FieldTooltip label="Categoria oficial del hotel (1-5 estrellas). Afecta el filtro de categorias en el portal" />
                  </Label>
                  <Input
                    id="hotel-stars"
                    type="number"
                    min="1"
                    max="5"
                    value={form.stars}
                    onChange={(e) =>
                      updateField("stars", Number(e.target.value))
                    }
                  />
                  <FieldHelper>
                    Categoria oficial del hotel. Valores entre 1 y 5.
                  </FieldHelper>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-rating">
                    Rating (0-10)
                    <FieldTooltip label="Calificacion promedio de huespedes en escala 0-10. Se muestra como estrellas en el portal" />
                  </Label>
                  <Input
                    id="hotel-rating"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) =>
                      updateField("rating", Number(e.target.value))
                    }
                  />
                  <FieldHelper>
                    Promedio de calificaciones de huespedes (0-10). Se muestra como estrellas.
                  </FieldHelper>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-reviews">
                    Reviews
                    <FieldTooltip label="Cantidad total de resenas de huespedes. Ayuda a generar confianza" />
                  </Label>
                  <Input
                    id="hotel-reviews"
                    type="number"
                    value={form.reviewCount}
                    onChange={(e) =>
                      updateField("reviewCount", Number(e.target.value))
                    }
                  />
                  <FieldHelper>
                    Numero total de resenas. Ayuda a generar confianza en el portal.
                  </FieldHelper>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hotel-address">
                  Direccion
                  <FieldTooltip label="Direccion fisica completa del hotel. Se muestra en la pagina de detalle" />
                </Label>
                <Input
                  id="hotel-address"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Calle de la Inquisicion, Centro Historico"
                />
                <FieldHelper>
                  Direccion fisica del hotel. Visible en la pagina de detalle.
                </FieldHelper>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hotel-price">
                  Precio Desde (COP)
                  <FieldTooltip label="Precio mas bajo disponible en pesos colombianos. Se muestra en tarjetas y listados como 'Desde $X'" />
                </Label>
                <Input
                  id="hotel-price"
                  type="number"
                  value={form.priceFrom}
                  onChange={(e) =>
                    updateField("priceFrom", Number(e.target.value))
                  }
                  placeholder="720000"
                />
                <FieldHelper>
                  Precio mas bajo disponible en COP. Se muestra como &quot;Desde $X&quot; en listados.
                </FieldHelper>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hotel-description">
                  Descripcion
                  <FieldTooltip label="Descripcion detallada del hotel. Aparece en la pagina de detalle. Maximo recomendado: 300 palabras" />
                </Label>
                <Textarea
                  id="hotel-description"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Descripcion del hotel..."
                  rows={4}
                />
                <FieldHelper>
                  Descripcion detallada. Aparece en la pagina de detalle del hotel.
                </FieldHelper>
              </div>
            </TabsContent>

            <TabsContent
              value="media"
              className="space-y-4 mt-4 overflow-y-auto flex-1 min-h-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Galeria de imagenes del hotel
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.images.length} imagen
                    {form.images.length !== 1 ? "es" : ""}
                    {form.images.length > 0 && " · Arrastra para reordenar"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imagesInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-1.5" />
                  Subir imagen
                </Button>
              </div>
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  setImagesDragOver(false);
                  if (e.dataTransfer.files.length > 0)
                    uploadHotelImages(e.dataTransfer.files);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setImagesDragOver(true);
                }}
                onDragLeave={() => setImagesDragOver(false)}
                onClick={() => imagesInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  imagesDragOver
                    ? "border-ring bg-accent"
                    : "border-border hover:border-ring/60 hover:bg-accent/50",
                  imagesUploading && "pointer-events-none opacity-60",
                )}
              >
                {imagesUploading ? (
                  <div className="space-y-2">
                    <div className="animate-spin w-8 h-8 border-2 border-ring border-t-transparent rounded-full mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Subiendo imagen{pendingUploads > 1 ? "es" : ""}...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImagePlus className="w-10 h-10 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Arrastra imagenes aqui o{" "}
                      <span className="text-primary font-medium">
                        haz clic para seleccionar
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WebP, GIF · Max. 5 MB por imagen · Puedes
                      seleccionar varias
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={imagesInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files?.length) uploadHotelImages(e.target.files);
                  if (imagesInputRef.current) imagesInputRef.current.value = "";
                }}
                className="hidden"
              />
              {form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {form.images.map((img, idx) => (
                    <div
                      key={`${img}-${idx}`}
                      draggable
                      onDragStart={(e) => {
                        setDraggedImageIdx(idx);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedImageIdx === null || draggedImageIdx === idx)
                          return;
                        setForm((prev) => {
                          const nextImages = [...prev.images];
                          const [moved] = nextImages.splice(draggedImageIdx, 1);
                          nextImages.splice(idx, 0, moved);
                          return { ...prev, images: nextImages };
                        });
                        setDraggedImageIdx(null);
                      }}
                      className={cn(
                        "relative group rounded-lg overflow-hidden border border-border transition-all hover:shadow-md hover:border-ring/60",
                        draggedImageIdx === idx &&
                          "opacity-50 ring-2 ring-ring",
                      )}
                    >
                      <img
                        src={img}
                        alt={`Imagen ${idx + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-xs font-medium rounded-md px-1.5 py-0.5 flex items-center gap-1">
                        <GripVertical className="w-3 h-3" />
                        {idx + 1}
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm((prev) => ({
                            ...prev,
                            images: prev.images.filter(
                              (_, imageIndex) => imageIndex !== idx,
                            ),
                          }));
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  Agregar imagen por URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!imageUrlInput.trim()) return;
                        setForm((prev) => ({
                          ...prev,
                          images: [...prev.images, imageUrlInput.trim()],
                        }));
                        setImageUrlInput("");
                      }
                    }}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="flex-1 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!imageUrlInput.trim()) return;
                      setForm((prev) => ({
                        ...prev,
                        images: [...prev.images, imageUrlInput.trim()],
                      }));
                      setImageUrlInput("");
                    }}
                    disabled={!imageUrlInput.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="amenities"
              className="space-y-4 mt-4 overflow-y-auto flex-1 min-h-0"
            >
              <div className="space-y-2">
                <Label htmlFor="hotel-amenities">
                  Servicios / Amenidades (separados por coma)
                </Label>
                <Input
                  id="hotel-amenities"
                  value={amenitiesStr}
                  onChange={(e) => {
                    setAmenitiesStr(e.target.value);
                    updateField(
                      "amenities",
                      e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    );
                  }}
                  placeholder="wifi, pool, restaurant, spa, gym, parking"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotel-tags">Tags (separados por coma)</Label>
                <Input
                  id="hotel-tags"
                  value={tagsStr}
                  onChange={(e) => {
                    setTagsStr(e.target.value);
                    updateField(
                      "tags",
                      e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    );
                  }}
                  placeholder="Lujo, Popular, Nuevo, Descuento"
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(checked) =>
                      updateField("featured", checked)
                    }
                  />
                  <Label>Destacado</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.active}
                    onCheckedChange={(checked) =>
                      updateField("active", checked)
                    }
                  />
                  <Label>Activo</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="rooms"
              className="space-y-4 mt-4 overflow-y-auto flex-1 min-h-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-primary" />
                    Habitaciones del hotel
                    {isCreateMode && (
                      <span className="label-required text-xs font-normal text-muted-foreground ml-0.5">
                        (obligatorio)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isCreateMode
                      ? `${displayRoomTypes.length} habitacion(es) pendientes por crear — mínimo 1 requerida`
                      : `${displayRoomTypes.length} habitacion(es) registradas en el sistema`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetRoomTypeForm();
                    setShowRoomTypeForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nueva habitacion
                </Button>
              </div>

              <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {isCreateMode
                  ? "Agrega al menos una habitacion. Se crearan junto con el hotel al guardar."
                  : "Define las habitaciones y sus precios. Los cambios y la disponibilidad se sincronizan automaticamente."}
              </div>

              {!isCreateMode && roomTypesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {showRoomTypeForm && (
                    <Card className="border-primary/30">
                      <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-sm font-semibold">
                          {editingRoomTypeId
                            ? "Editar Habitacion"
                            : "Nueva Habitacion"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-1 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs label-required">
                              Nombre de la habitacion
                            </Label>
                            <Input
                              value={roomTypeForm.name}
                              onChange={(e) =>
                                setRoomTypeForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              placeholder="Suite Deluxe"
                              className="text-sm h-8"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Camas / Tipo</Label>
                            <Input
                              value={roomTypeForm.beds}
                              onChange={(e) =>
                                setRoomTypeForm((prev) => ({
                                  ...prev,
                                  beds: e.target.value,
                                }))
                              }
                              placeholder="1 cama king o 2 camas dobles"
                              className="text-sm h-8"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Max. Huespedes</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={roomTypeForm.maxGuests}
                              onChange={(e) =>
                                setRoomTypeForm((prev) => ({
                                  ...prev,
                                  maxGuests: Number(e.target.value),
                                }))
                              }
                              className="text-sm h-8"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs label-required">
                              Precio Base (COP)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={roomTypeForm.basePrice}
                              onChange={(e) =>
                                setRoomTypeForm((prev) => ({
                                  ...prev,
                                  basePrice: Number(e.target.value),
                                }))
                              }
                              className="text-sm h-8"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              Precio Original (COP)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={roomTypeForm.originalPrice || ""}
                              onChange={(e) =>
                                setRoomTypeForm((prev) => ({
                                  ...prev,
                                  originalPrice: e.target.value
                                    ? Number(e.target.value)
                                    : 0,
                                }))
                              }
                              className="text-sm h-8"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Servicios / Que incluye
                          </Label>
                          <TagInput
                            tags={roomTypeForm.includes}
                            onChange={(tags) =>
                              setRoomTypeForm((prev) => ({
                                ...prev,
                                includes: tags,
                              }))
                            }
                            placeholder="Wi-Fi, Aire acondicionado, Desayuno incluido..."
                          />
                        </div>

                        <div className="space-y-3 pt-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-xs font-semibold">
                                Fotos de la habitacion
                              </Label>
                              <p className="text-[10px] text-muted-foreground">
                                {roomTypeForm.roomImages.length} foto(s)
                                subida(s) · Arrastra para ordenar
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() =>
                                roomImagesInputRef.current?.click()
                              }
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Subir foto
                            </Button>
                          </div>

                          <div
                            onDrop={(e) => {
                              e.preventDefault();
                              setRoomImgDragOver(false);
                              if (e.dataTransfer.files.length > 0)
                                uploadRoomImages(e.dataTransfer.files);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setRoomImgDragOver(true);
                            }}
                            onDragLeave={() => setRoomImgDragOver(false)}
                            onClick={() => roomImagesInputRef.current?.click()}
                            className={cn(
                              "border border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors",
                              roomImgDragOver
                                ? "border-ring bg-accent"
                                : "border-border hover:border-ring/60 hover:bg-accent/30",
                              roomImgUploading &&
                                "pointer-events-none opacity-60",
                            )}
                          >
                            {roomImgUploading ? (
                              <div className="space-y-1">
                                <div className="animate-spin w-4 h-4 border-2 border-ring border-t-transparent rounded-full mx-auto" />
                                <p className="text-xs text-muted-foreground">
                                  Subiendo...
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <ImagePlus className="w-6 h-6 text-muted-foreground mx-auto" />
                                <p className="text-xs text-muted-foreground">
                                  Arrastra imagenes aqui o{" "}
                                  <span className="text-primary font-medium font-semibold">
                                    haz clic
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                          <input
                            ref={roomImagesInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              if (e.target.files?.length)
                                uploadRoomImages(e.target.files);
                              if (roomImagesInputRef.current)
                                roomImagesInputRef.current.value = "";
                            }}
                            className="hidden"
                          />

                          {roomTypeForm.roomImages.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {roomTypeForm.roomImages.map((img, idx) => (
                                <div
                                  key={`${img}-${idx}`}
                                  draggable
                                  onDragStart={(e) => {
                                    setDraggedRoomImgIdx(idx);
                                    e.dataTransfer.effectAllowed = "move";
                                  }}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    if (
                                      draggedRoomImgIdx === null ||
                                      draggedRoomImgIdx === idx
                                    )
                                      return;
                                    setRoomTypeForm((prev) => {
                                      const nextImages = [...prev.roomImages];
                                      const [moved] = nextImages.splice(
                                        draggedRoomImgIdx,
                                        1,
                                      );
                                      nextImages.splice(idx, 0, moved);
                                      return {
                                        ...prev,
                                        roomImages: nextImages,
                                        roomImage: nextImages[0] || "",
                                      };
                                    });
                                    setDraggedRoomImgIdx(null);
                                  }}
                                  className={cn(
                                    "relative group rounded-md overflow-hidden border border-border transition-all bg-muted/20 hover:shadow-xs hover:border-ring/40",
                                    draggedRoomImgIdx === idx &&
                                      "opacity-50 ring-1 ring-ring",
                                  )}
                                >
                                  <img
                                    src={img}
                                    alt={`Foto ${idx + 1}`}
                                    className="w-full h-20 object-cover"
                                  />
                                  <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-medium rounded-sm px-1 py-0.2 flex items-center gap-0.5 pointer-events-none">
                                    <GripVertical className="w-2.5 h-2.5" />
                                    {idx + 1}
                                  </div>
                                  {roomTypeForm.roomImage === img && (
                                    <div className="absolute bottom-1 left-1 bg-amber-500 text-white text-[8px] font-bold rounded-sm px-1 py-0.2">
                                      Portada
                                    </div>
                                  )}
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRoomTypeForm((prev) => {
                                        const nextImages =
                                          prev.roomImages.filter(
                                            (_, imageIndex) =>
                                              imageIndex !== idx,
                                          );
                                        return {
                                          ...prev,
                                          roomImages: nextImages,
                                          roomImage:
                                            prev.roomImage ===
                                            prev.roomImages[idx]
                                              ? nextImages[0] || ""
                                              : prev.roomImage,
                                        };
                                      });
                                    }}
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Link2 className="w-2.5 h-2.5" />
                              Agregar foto por URL
                            </Label>
                            <div className="flex gap-1.5">
                              <Input
                                value={roomImageUrlInput}
                                onChange={(e) =>
                                  setRoomImageUrlInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (!roomImageUrlInput.trim()) return;
                                    setRoomTypeForm((prev) => ({
                                      ...prev,
                                      roomImages: [
                                        ...prev.roomImages,
                                        roomImageUrlInput.trim(),
                                      ],
                                      roomImage:
                                        prev.roomImage ||
                                        roomImageUrlInput.trim(),
                                    }));
                                    setRoomImageUrlInput("");
                                  }
                                }}
                                placeholder="https://ejemplo.com/room.jpg"
                                className="flex-1 text-xs h-7"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (!roomImageUrlInput.trim()) return;
                                  setRoomTypeForm((prev) => ({
                                    ...prev,
                                    roomImages: [
                                      ...prev.roomImages,
                                      roomImageUrlInput.trim(),
                                    ],
                                    roomImage:
                                      prev.roomImage ||
                                      roomImageUrlInput.trim(),
                                  }));
                                  setRoomImageUrlInput("");
                                }}
                                disabled={!roomImageUrlInput.trim()}
                                className="shrink-0 h-7 text-xs px-2"
                              >
                                <Plus className="w-3 h-3 mr-0.5" />
                                Agregar
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={roomTypeForm.active}
                              onCheckedChange={(checked) =>
                                setRoomTypeForm((prev) => ({
                                  ...prev,
                                  active: checked,
                                }))
                              }
                            />
                            <Label className="text-xs">Activo</Label>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              if (isCreateMode) {
                                editingRoomTypeId
                                  ? handleUpdatePendingRoomType()
                                  : handleSavePendingRoomType();
                              } else {
                                saveRoomType(
                                  editingRoomTypeId ? "PUT" : "POST",
                                );
                              }
                            }}
                            disabled={
                              savingRoomType || !roomTypeForm.name.trim()
                            }
                          >
                            <Save className="w-3.5 h-3.5 mr-1" />
                            {savingRoomType
                              ? "Guardando..."
                              : editingRoomTypeId
                                ? "Actualizar"
                                : "Crear"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetRoomTypeForm}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {displayRoomTypes.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Nombre</TableHead>
                          <TableHead className="text-xs">Camas</TableHead>
                          <TableHead className="text-xs">Capacidad</TableHead>
                          <TableHead className="text-xs">Precio Base</TableHead>
                          <TableHead className="text-xs">Estado</TableHead>
                          <TableHead className="text-xs text-right">
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayRoomTypes.map((roomType) => (
                          <TableRow key={roomType.id}>
                            <TableCell className="text-sm font-medium">
                              {roomType.name}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {roomType.beds}
                            </TableCell>
                            <TableCell className="text-xs">
                              {roomType.maxGuests} pax
                            </TableCell>
                            <TableCell className="text-xs font-semibold">
                              {formatCurrency(roomType.basePrice)}
                            </TableCell>
                            <TableCell>
                              {roomType.active ? (
                                <Badge
                                  variant="default"
                                  className="text-xs bg-green-600 hover:bg-green-600"
                                >
                                  Activo
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Inactivo
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                                  onClick={() => {
                                    if (isCreateMode) {
                                      openEditPendingRoomType(roomType);
                                    } else {
                                      openEditRoomType(roomType);
                                    }
                                  }}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    if (isCreateMode) {
                                      handleDeletePendingRoomType(roomType.id);
                                    } else {
                                      setRoomTypeDeleteId(roomType.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {displayRoomTypes.length === 0 && !editingRoomTypeId && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BedDouble className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      {isCreateMode ? (
                        <>
                          <p className="text-sm font-medium text-destructive">
                            Debes agregar al menos una habitacion
                          </p>
                          <p className="text-xs mt-1">
                            El hotel no se puede guardar sin habitaciones. Haz
                            clic en "Nueva habitacion" para agregar la primera.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm">
                            No hay habitaciones registradas para este hotel
                          </p>
                          <p className="text-xs mt-1">
                            Crea una habitacion para configurar precios y
                            disponibilidad
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent
              value="extra"
              className="space-y-4 mt-4 overflow-y-auto flex-1 min-h-0"
            >
              {mode === "admin" && (
                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="hotel-reseller">Asignar a Revendedor</Label>
                  <select
                    id="hotel-reseller"
                    value={form.resellerId ?? ""}
                    onChange={(e) =>
                      updateField("resellerId", e.target.value || "")
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Ninguno / Global (Administrador)</option>
                    {resellers.map((reseller) => (
                      <option key={reseller.id} value={reseller.id}>
                        {reseller.companyName ||
                          reseller.contactName ||
                          reseller.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(checked) =>
                      updateField("featured", checked)
                    }
                  />
                  <Label>Destacado</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.active}
                    onCheckedChange={(checked) =>
                      updateField("active", checked)
                    }
                  />
                  <Label>Activo</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="dialog-footer">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!roomTypeDeleteId}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setRoomTypeDeleteId(null);
        }}
      >
        <AlertDialogContent
          className={
            mode === "admin"
              ? "admin-dialog"
              : "force-light bg-white text-slate-900 border-slate-200"
          }
        >
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar habitacion?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. La habitacion y sus allotments
              asociados seran eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoomType}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

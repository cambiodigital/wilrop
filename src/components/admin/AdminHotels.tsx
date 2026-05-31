'use client';
import { formatCurrency } from '@/lib/currency'


import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
;
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  Building2,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  BedDouble,
  Users,
  DollarSign,
  GripVertical,
  Link2,
  RefreshCw,
  ExternalLink,
  Database,
  ArrowRightLeft,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  buildHotelDestinationCompatibilityFields,
  findHotelDestinationOption,
  getHotelDestinationSelectorState,
  normalizeHotelDestinationOptions,
  type HotelDestinationOption,
} from '@/lib/admin/hotel-destination-ui';
import {
  parseRoomTypeIncludes,
  parseRoomTypeIncludesFromForm,
  formatRoomTypeIncludesForForm,
  syncRoomTypesToHotelRooms,
} from '@/lib/admin/hotel-roomtypes';

// ─── Types ───────────────────────────────────────────────────────

interface HotelRoom {
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

interface Hotel {
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
  rooms: HotelRoom[];
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

// ─── Helpers ─────────────────────────────────────────────────────

// ─── Helpers ─────────────────────────────────────────────────────

const emptyHotel: Omit<Hotel, 'id'> = {
  name: '',
  slug: '',
  cityId: '',
  cityName: '',
  destinationId: '',
  stars: 3,
  address: '',
  description: '',
  images: [],
  amenities: [],
  rooms: [],
  rating: 0,
  reviewCount: 0,
  priceFrom: 0,
  tags: [],
  featured: false,
  active: true,
  resellerId: '',
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateId(): string {
  return `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-3.5 h-3.5',
            i < count ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
          )}
        />
      ))}
    </div>
  );
}



// ─── Image Upload Component ──────────────────────────────────────

function ImageUpload({
  value,
  onChange,
  label = 'Imagen de la habitación',
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imgError, setImgError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5 MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'rooms');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al subir la imagen');
      }

      const data = await res.json();
      setImgError(false);
      onChange(data.url);
      toast.success('Imagen subida correctamente');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-border">
          {!imgError ? (
            <img
              src={value}
              alt="Vista previa"
              className="w-full h-36 object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-36 bg-muted flex items-center justify-center">
              <ImagePlus className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => { setImgError(false); inputRef.current?.click(); }}
            >
              <Upload className="w-4 h-4 mr-1" />
              Cambiar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => { onChange(''); setImgError(false); }}
            >
              <X className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            dragOver
              ? 'border-ring bg-accent'
              : 'border-border hover:border-ring/60 hover:bg-accent/50',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin w-6 h-6 border-2 border-ring border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Arrastra una imagen o{' '}
                <span className="text-primary font-medium">
                  haz clic para seleccionar
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP, GIF (máx. 5 MB)
              </p>
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}



function TagInput({
  tags,
  onChange,
  placeholder = 'Agregar...',
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 text-sm h-8"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={!inputValue.trim()}
          className="shrink-0 h-8"
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-1 text-xs border border-border bg-accent text-accent-foreground hover:bg-accent"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {tags.length === 0 && (
        <p className="text-xs text-muted-foreground">Presiona Enter para agregar</p>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export default function AdminHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyHotel);
  const [destinationOptions, setDestinationOptions] = useState<HotelDestinationOption[]>([]);
  const [resellers, setResellers] = useState<any[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [destinationsError, setDestinationsError] = useState<string | null>(null);

  // ── RoomType (relational) state ──
  const [roomTypes, setRoomTypes] = useState<RoomTypeRow[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(null);
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '',
    maxGuests: 2,
    beds: '1 cama doble',
    basePrice: 0,
    originalPrice: 0,
    includes: [] as string[],
    roomImage: '',
    roomImages: [] as string[],
    active: true,
  });
  const [savingRoomType, setSavingRoomType] = useState(false);
  const [roomTypeDeleteId, setRoomTypeDeleteId] = useState<string | null>(null);
  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false);

  // ── RoomType Image Upload state ──
  const [roomImgUploading, setRoomImgUploading] = useState(false);
  const [roomImgDragOver, setRoomImgDragOver] = useState(false);
  const [draggedRoomImgIdx, setDraggedRoomImgIdx] = useState<number | null>(null);
  const [roomImageUrlInput, setRoomImageUrlInput] = useState('');
  const roomImagesInputRef = useRef<HTMLInputElement>(null);

  // ── Images state ──
  const [imagesUploading, setImagesUploading] = useState(false);
  const [imagesDragOver, setImagesDragOver] = useState(false);
  const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [pendingUploads, setPendingUploads] = useState(0);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const [amenitiesStr, setAmenitiesStr] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hotels');
      if (!res.ok) throw new Error('Error al cargar hoteles');
      const json = await res.json();
      setHotels(json.data || json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const fetchDestinationOptions = useCallback(async () => {
    setDestinationsLoading(true);
    setDestinationsError(null);
    try {
      const res = await fetch('/api/admin/relation-options/destinations?active=all');
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.error || 'Error al cargar destinos');
      }
      setDestinationOptions(normalizeHotelDestinationOptions(json));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar destinos';
      setDestinationsError(msg);
    } finally {
      setDestinationsLoading(false);
    }
  }, []);

  const fetchResellers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/resellers');
      if (!res.ok) throw new Error('Error al cargar revendedores');
      const json = await res.json();
      setResellers(json.data || json);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      fetchDestinationOptions();
      fetchResellers();
    }
  }, [dialogOpen, fetchDestinationOptions, fetchResellers]);

  // ── RoomType relational management ──
  const fetchRoomTypes = useCallback(async (hotelId: string) => {
    if (!hotelId) { setRoomTypes([]); return; }
    setRoomTypesLoading(true);
    try {
      const res = await fetch(`/api/admin/rooms?hotelId=${hotelId}`);
      const json = await res.json().catch(() => ({}));
      if (json.success) setRoomTypes(json.data ?? []);
    } catch {
      setRoomTypes([]);
    } finally {
      setRoomTypesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dialogOpen && editingId) fetchRoomTypes(editingId);
    if (!editingId) setRoomTypes([]);
  }, [dialogOpen, editingId, fetchRoomTypes]);

  const resetRoomTypeForm = () => {
    setEditingRoomTypeId(null);
    setShowRoomTypeForm(false);
    setRoomTypeForm({
      name: '', maxGuests: 2, beds: '1 cama doble', basePrice: 0,
      originalPrice: 0, includes: [] as string[], roomImage: '', roomImages: [], active: true,
    });
    setRoomImageUrlInput('');
  };

  // ── Room Image Upload Handlers ──
  const handleRoomImgUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5 MB');
      return;
    }

    setRoomImgUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'rooms');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al subir la imagen');
      }

      const data = await res.json();
      setRoomTypeForm((prev) => {
        const nextImages = [...prev.roomImages, data.url];
        return {
          ...prev,
          roomImages: nextImages,
          roomImage: prev.roomImage || data.url,
        };
      });
      toast.success('Imagen subida correctamente');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir';
      toast.error(msg);
    } finally {
      setRoomImgUploading(false);
    }
  };

  const handleRoomImgDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    setRoomImgDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleRoomImgUpload(file);
  };

  const handleRoomImgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleRoomImgUpload(file);
  };

  const handleRoomImgDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedRoomImgIdx(idx);
    e.dataTransfer.setData('text/plain', idx.toString());
  };

  const handleRoomImgDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedRoomImgIdx === null) return;
    const newImages = [...roomTypeForm.roomImages];
    const [draggedItem] = newImages.splice(draggedRoomImgIdx, 1);
    newImages.splice(targetIdx, 0, draggedItem);
    setRoomTypeForm((prev) => {
      const nextImages = newImages;
      return {
        ...prev,
        roomImages: nextImages,
        roomImage: nextImages[0] || '',
      };
    });
    setDraggedRoomImgIdx(null);
  };

  const removeRoomImg = (idx: number) => {
    setRoomTypeForm((prev) => {
      const nextImages = prev.roomImages.filter((_, i) => i !== idx);
      return {
        ...prev,
        roomImages: nextImages,
        roomImage: prev.roomImage === prev.roomImages[idx] ? (nextImages[0] || '') : prev.roomImage,
      };
    });
  };

  const addRoomImgByUrl = () => {
    if (!roomImageUrlInput.trim()) return;
    setRoomTypeForm((prev) => {
      const nextImages = [...prev.roomImages, roomImageUrlInput.trim()];
      return {
        ...prev,
        roomImages: nextImages,
        roomImage: prev.roomImage || roomImageUrlInput.trim(),
      };
    });
    setRoomImageUrlInput('');
    toast.success('Imagen agregada por URL');
  };

  const handleCreateRoomType = async () => {
    if (!editingId || !roomTypeForm.name.trim()) {
      toast.error('El nombre del tipo de habitación es obligatorio');
      return;
    }
    setSavingRoomType(true);
    try {
      const res = await fetch(`/api/admin/rooms/${editingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomTypeForm.name.trim(),
          maxGuests: roomTypeForm.maxGuests,
          beds: roomTypeForm.beds,
          basePrice: roomTypeForm.basePrice,
          originalPrice: roomTypeForm.originalPrice,
          includes: roomTypeForm.includes,
          roomImage: roomTypeForm.roomImage,
          roomImages: roomTypeForm.roomImages,
          active: roomTypeForm.active,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Error al crear tipo de habitación');
      }
      toast.success('RoomType creado correctamente');
      resetRoomTypeForm();
      fetchRoomTypes(editingId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setSavingRoomType(false);
    }
  };

  const handleUpdateRoomType = async () => {
    if (!editingRoomTypeId || !roomTypeForm.name.trim()) {
      toast.error('El nombre del tipo de habitación es obligatorio');
      return;
    }
    setSavingRoomType(true);
    try {
      const res = await fetch(`/api/admin/rooms/${editingRoomTypeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomTypeForm.name.trim(),
          maxGuests: roomTypeForm.maxGuests,
          beds: roomTypeForm.beds,
          basePrice: roomTypeForm.basePrice,
          originalPrice: roomTypeForm.originalPrice,
          includes: roomTypeForm.includes,
          roomImage: roomTypeForm.roomImage,
          roomImages: roomTypeForm.roomImages,
          active: roomTypeForm.active,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Error al actualizar');
      }
      toast.success('RoomType actualizado correctamente');
      resetRoomTypeForm();
      if (editingId) fetchRoomTypes(editingId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setSavingRoomType(false);
    }
  };

  const handleDeleteRoomType = async () => {
    if (!roomTypeDeleteId) return;
    try {
      const res = await fetch(`/api/admin/rooms/${roomTypeDeleteId}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Error al eliminar');
      }
      toast.success('RoomType eliminado correctamente');
      setRoomTypeDeleteId(null);
      if (editingId) fetchRoomTypes(editingId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };


  const openEditRoomType = (rt: RoomTypeRow) => {
    setEditingRoomTypeId(rt.id);
    setShowRoomTypeForm(true);
    const initialRoomImages = rt.roomImages && rt.roomImages.length > 0
      ? rt.roomImages
      : rt.roomImage
        ? [rt.roomImage]
        : [];
    setRoomTypeForm({
      name: rt.name,
      maxGuests: rt.maxGuests,
      beds: rt.beds,
      basePrice: rt.basePrice,
      originalPrice: rt.originalPrice,
      includes: parseRoomTypeIncludes(rt.includes),
      roomImage: rt.roomImage,
      roomImages: initialRoomImages,
      active: rt.active,
    });
  };

  const filtered = hotels.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Ensure rooms are always sanitized on open ──
  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ ...emptyHotel, rooms: [] });
    setAmenitiesStr('');
    setTagsStr('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (hotel: Hotel) => {
    setEditingId(hotel.id);
    setForm({
      name: hotel.name,
      slug: hotel.slug,
      cityId: hotel.cityId,
      cityName: hotel.cityName,
      destinationId: hotel.destinationId ?? '',
      stars: hotel.stars,
      address: hotel.address,
      description: hotel.description,
      images: hotel.images,
      amenities: hotel.amenities,
      rooms: hotel.rooms || [],
      rating: hotel.rating,
      reviewCount: hotel.reviewCount,
      priceFrom: hotel.priceFrom,
      tags: hotel.tags,
      featured: hotel.featured,
      active: hotel.active,
      resellerId: hotel.resellerId ?? '',
    });
    setAmenitiesStr(hotel.amenities.join(', '));
    setTagsStr(hotel.tags.join(', '));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (destinationsError) {
      toast.error('No se puede guardar hasta cargar destinos correctamente');
      return;
    }
    if (!form.destinationId?.trim() || !form.cityName.trim()) {
      toast.error('Selecciona un destino válido');
      return;
    }
    setSaving(true);
    try {
      // Auto-sync: derive Hotel.rooms cache from RoomType rows when available
      const activeRoomTypes = roomTypes.filter((rt) => rt.active);
      const roomsPayload =
        activeRoomTypes.length > 0
          ? syncRoomTypesToHotelRooms(activeRoomTypes)
          : [];

      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.name),
        rooms: roomsPayload,
      };
      const isEditing = !!editingId;
      const res = await fetch(
        isEditing ? `/api/admin/hotels/${editingId}` : '/api/admin/hotels',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar');
      }
      toast.success(
        isEditing ? 'Hotel actualizado correctamente' : 'Hotel creado correctamente'
      );
      setDialogOpen(false);
      fetchHotels();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/hotels/${deletingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      toast.success('Hotel eliminado correctamente');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchHotels();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    }
  };

  // ── Image management helpers ──
  const uploadImages = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setImagesUploading(true);
    setPendingUploads(fileArray.length);
    const newUrls: string[] = [];

    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} supera el límite de 5 MB`);
        continue;
      }
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'hotels');
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Error al subir');
        }
        const data = await res.json();
        newUrls.push(data.url);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al subir';
        toast.error(`${file.name}: ${msg}`);
      }
    }

    if (newUrls.length > 0) {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
      toast.success(`${newUrls.length} imagen(es) subida(s) correctamente`);
    }
    setImagesUploading(false);
    setPendingUploads(0);
  };

  const handleImagesDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setImagesDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadImages(e.dataTransfer.files);
    }
  };

  const handleImagesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) uploadImages(files);
    if (imagesInputRef.current) imagesInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleImageDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedImageIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedImageIdx === null || draggedImageIdx === targetIdx) {
      setDraggedImageIdx(null);
      return;
    }
    setForm((prev) => {
      const imgs = [...prev.images];
      const [moved] = imgs.splice(draggedImageIdx, 1);
      imgs.splice(targetIdx, 0, moved);
      return { ...prev, images: imgs };
    });
    setDraggedImageIdx(null);
  };

  const addImageByUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    try {
      new URL(url);
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
      setImageUrlInput('');
      toast.success('Imagen agregada correctamente');
    } catch {
      toast.error('URL inválida. Ingresa una URL completa (https://...)');
    }
  };

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: typeof form[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name') {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
  };

  const selectedDestination = findHotelDestinationOption(destinationOptions, form.destinationId ?? '');
  const destinationSelectorState = getHotelDestinationSelectorState({
    options: destinationOptions,
    selectedId: form.destinationId ?? '',
    isLoading: destinationsLoading,
    error: destinationsError,
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  });



  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Hoteles
          </h1>
          <p className="mt-1">
            Gestiona los hoteles asociados a WILROP Colombia Travel
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="default">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Hotel
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Estrellas</TableHead>
                    <TableHead>Precio Desde</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Destacado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {search
                          ? 'No se encontraron resultados'
                          : 'No hay hoteles registrados'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((hotel) => (
                      <TableRow key={hotel.id}>
                        <TableCell className="font-medium text-sm">
                          {hotel.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {hotel.cityName}
                        </TableCell>
                        <TableCell>
                          <StarRating count={hotel.stars} />
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          {formatCurrency(hotel.priceFrom)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm">{hotel.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {hotel.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {hotel.tags.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{hotel.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {hotel.featured ? (
                            <Badge className="badge-featured text-xs">
                              Destacado
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleOpenEdit(hotel)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setDeletingId(hotel.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent topAligned className="sm:max-w-4xl max-h-[90vh] overflow-y-auto admin-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Hotel' : 'Nuevo Hotel'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifica los datos del hotel'
                : 'Completa los datos para registrar un nuevo hotel'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">
                Info Básica
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1">
                Imágenes
              </TabsTrigger>
              <TabsTrigger value="amenities" className="flex-1">
                Servicios
              </TabsTrigger>
              <TabsTrigger value="rooms" className="flex-1">
                <BedDouble className="w-3.5 h-3.5 mr-1" />
                Habitaciones
              </TabsTrigger>
              <TabsTrigger value="extra" className="flex-1">
                Extra
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="form-section-title">
                Información principal
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-name" className="label-required">Nombre</Label>
                  <Input
                    id="hotel-name"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Hotel Charleston Santa Teresa"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-slug">Slug</Label>
                  <Input
                    id="hotel-slug"
                    value={form.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    placeholder="Auto-generado del nombre"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-destination" className="label-required">Destino relacional</Label>
                  <select
                    id="hotel-destination"
                    value={form.destinationId ?? ''}
                    onChange={(e) => {
                      const option = findHotelDestinationOption(destinationOptions, e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        ...buildHotelDestinationCompatibilityFields(option),
                      }));
                    }}
                    disabled={destinationsLoading || Boolean(destinationsError)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecciona un destino</option>
                    {destinationSelectorState.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}{option.stateLabel ? ` · ${option.stateLabel.toLowerCase()}` : ''}
                      </option>
                    ))}
                  </select>
                  {destinationSelectorState.status === 'loading' && (
                    <p className="text-xs text-muted-foreground">{destinationSelectorState.statusLabel}</p>
                  )}
                  {destinationSelectorState.status === 'error' && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <span>{destinationSelectorState.statusLabel}</span>
                      <Button type="button" variant="outline" size="sm" onClick={fetchDestinationOptions}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Reintentar
                      </Button>
                    </div>
                  )}
                  {destinationSelectorState.status === 'empty' && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{destinationSelectorState.statusLabel}</span>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <a href={destinationSelectorState.createCta?.href ?? '/admin/destinos'}>
                          <ExternalLink className="w-3 h-3 mr-1" /> {destinationSelectorState.createCta?.label ?? 'Crear destino'}
                        </a>
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Guarda `destinationId` real y mantiene `cityId` como compatibilidad del API actual.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-city-name">Nombre destino (snapshot)</Label>
                  <Input
                    id="hotel-city-name"
                    value={selectedDestination?.label ?? form.cityName}
                    readOnly
                    placeholder="Se completa al seleccionar destino"
                  />
                  <p className="text-xs text-muted-foreground">
                    Etiqueta de visualización compatible; ya no es la fuente primaria manual.
                  </p>
                </div>
              </div>

              <div className="form-section-title">
                Datos del hotel
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-stars">Estrellas (1-5)</Label>
                  <Input
                    id="hotel-stars"
                    type="number"
                    min="1"
                    max="5"
                    value={form.stars}
                    onChange={(e) => updateField('stars', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-rating">Rating (0-10)</Label>
                  <Input
                    id="hotel-rating"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => updateField('rating', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-reviews">Reviews</Label>
                  <Input
                    id="hotel-reviews"
                    type="number"
                    value={form.reviewCount}
                    onChange={(e) =>
                      updateField('reviewCount', Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hotel-address">Dirección</Label>
                <Input
                  id="hotel-address"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Calle de la Inquisición, Centro Histórico"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hotel-price">Precio Desde (COP)</Label>
                <Input
                  id="hotel-price"
                  type="number"
                  value={form.priceFrom}
                  onChange={(e) =>
                    updateField('priceFrom', Number(e.target.value))
                  }
                  placeholder="720000"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hotel-description">Descripción</Label>
                <Textarea
                  id="hotel-description"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Descripción del hotel..."
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Galería de imágenes del hotel
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.images.length} imagen{form.images.length !== 1 ? 'es' : ''}
                    {form.images.length > 0 && ' · Arrastra para reordenar'}
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

              {/* Upload drop zone */}
              <div
                onDrop={handleImagesDrop}
                onDragOver={(e) => { e.preventDefault(); setImagesDragOver(true); }}
                onDragLeave={() => setImagesDragOver(false)}
                onClick={() => imagesInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  imagesDragOver
                    ? 'border-ring bg-accent'
                    : 'border-border hover:border-ring/60 hover:bg-accent/50',
                  imagesUploading && 'pointer-events-none opacity-60'
                )}
              >
                {imagesUploading ? (
                  <div className="space-y-2">
                    <div className="animate-spin w-8 h-8 border-2 border-ring border-t-transparent rounded-full mx-auto" />
                    <p className="text-sm text-muted-foreground">Subiendo imagen{pendingUploads > 1 ? 'es' : ''}...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImagePlus className="w-10 h-10 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Arrastra imágenes aquí o{' '}
                      <span className="text-primary font-medium">haz clic para seleccionar</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WebP, GIF · Máx. 5 MB por imagen · Puedes seleccionar varias
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={imagesInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesFileChange}
                className="hidden"
              />

              {/* Image gallery grid */}
              {form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {form.images.map((img, idx) => (
                    <div
                      key={`${img}-${idx}`}
                      draggable
                      onDragStart={(e) => handleImageDragStart(e, idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleImageDrop(e, idx)}
                      className={cn(
                        'relative group rounded-lg overflow-hidden border border-border transition-all',
                        'hover:shadow-md hover:border-ring/60',
                        draggedImageIdx === idx && 'opacity-50 ring-2 ring-ring'
                      )}
                    >
                      <img
                        src={img}
                        alt={`Imagen ${idx + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                          (e.target as HTMLImageElement).alt = 'Imagen no disponible';
                          (e.target as HTMLImageElement).className = 'w-full h-32 bg-muted flex items-center justify-center';
                        }}
                      />
                      {/* Index badge */}
                      <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-xs font-medium rounded-md px-1.5 py-0.5 flex items-center gap-1">
                        <GripVertical className="w-3 h-3" />
                        {idx + 1}
                      </div>
                      {/* Remove button */}
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add by URL */}
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
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageByUrl();
                      }
                    }}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="flex-1 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageByUrl}
                    disabled={!imageUrlInput.trim()}
                    className="shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Amenities Tab */}
            <TabsContent value="amenities" className="space-y-4 mt-4">
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
                      'amenities',
                      e.target.value
                        .split(',')
                        .map((a) => a.trim())
                        .filter(Boolean)
                    );
                  }}
                  placeholder="wifi, pool, restaurant, spa, gym, parking"
                />
                <p className="text-xs text-muted-foreground">
                  IDs de amenidades: wifi, pool, restaurant, parking, gym, spa,
                  ac, breakfast, bar, reception, transfer, sea-view
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotel-tags">Tags (separados por coma)</Label>
                <Input
                  id="hotel-tags"
                  value={tagsStr}
                  onChange={(e) => {
                    setTagsStr(e.target.value);
                    updateField(
                      'tags',
                      e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
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
                      updateField('featured', checked)
                    }
                  />
                  <Label>Destacado</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.active}
                    onCheckedChange={(checked) => updateField('active', checked)}
                  />
                  <Label>Activo</Label>
                </div>
              </div>
            </TabsContent>

            {/* ─── ROOMS TAB (Relational, primary source) ─── */}
            <TabsContent value="rooms" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-primary" />
                    Habitaciones del hotel
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {editingId
                      ? `${roomTypes.length} habitación(es) registradas en el sistema`
                      : 'Guarda el hotel primero para gestionar las habitaciones'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {editingId && (
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
                      Nueva habitación
                    </Button>
                  )}
                </div>
              </div>

              <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                Define las habitaciones y sus precios. Los cambios y la disponibilidad se sincronizan automáticamente.
              </div>

              {!editingId ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BedDouble className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Guarda el hotel primero para gestionar las habitaciones</p>
                </div>
              ) : roomTypesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {/* RoomType form for create/edit */}
                  {showRoomTypeForm && (
                    <Card className="border-primary/30">
                        <CardHeader className="p-3 pb-1">
                          <CardTitle className="text-sm font-semibold">
                            {editingRoomTypeId ? 'Editar Habitación' : 'Nueva Habitación'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-1 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs label-required">Nombre de la habitación</Label>
                              <Input
                                value={roomTypeForm.name}
                                onChange={(e) => setRoomTypeForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="Suite Deluxe"
                                className="text-sm h-8"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Camas / Tipo</Label>
                              <Input
                                value={roomTypeForm.beds}
                                onChange={(e) => setRoomTypeForm((prev) => ({ ...prev, beds: e.target.value }))}
                                placeholder="1 cama king o 2 camas dobles"
                                className="text-sm h-8"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Max. Huéspedes</Label>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={roomTypeForm.maxGuests}
                                onChange={(e) =>
                                  setRoomTypeForm((prev) => ({ ...prev, maxGuests: Number(e.target.value) }))
                                }
                                className="text-sm h-8"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs label-required">Precio Base (COP)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={roomTypeForm.basePrice}
                                onChange={(e) =>
                                  setRoomTypeForm((prev) => ({ ...prev, basePrice: Number(e.target.value) }))
                                }
                                className="text-sm h-8"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Precio Original (COP)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={roomTypeForm.originalPrice || ''}
                                onChange={(e) =>
                                  setRoomTypeForm((prev) => ({
                                    ...prev,
                                    originalPrice: e.target.value ? Number(e.target.value) : 0,
                                  }))
                                }
                                className="text-sm h-8"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Servicios / Qué incluye</Label>
                            <TagInput
                              tags={roomTypeForm.includes}
                              onChange={(tags) => setRoomTypeForm((prev) => ({ ...prev, includes: tags }))}
                              placeholder="Wi-Fi, Aire acondicionado, Desayuno incluido..."
                            />
                          </div>
                          <div className="space-y-3 pt-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-xs font-semibold">Fotos de la habitación</Label>
                                <p className="text-[10px] text-muted-foreground">
                                  {roomTypeForm.roomImages.length} foto(s) subida(s) · Arrastra para ordenar
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2"
                                onClick={() => roomImagesInputRef.current?.click()}
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                Subir foto
                              </Button>
                            </div>

                            {/* Drop Zone */}
                            <div
                              onDrop={handleRoomImgDropZone}
                              onDragOver={(e) => { e.preventDefault(); setRoomImgDragOver(true); }}
                              onDragLeave={() => setRoomImgDragOver(false)}
                              onClick={() => roomImagesInputRef.current?.click()}
                              className={cn(
                                'border border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors',
                                roomImgDragOver
                                  ? 'border-ring bg-accent'
                                  : 'border-border hover:border-ring/60 hover:bg-accent/30',
                                roomImgUploading && 'pointer-events-none opacity-60'
                              )}
                            >
                              {roomImgUploading ? (
                                <div className="space-y-1">
                                  <div className="animate-spin w-4 h-4 border-2 border-ring border-t-transparent rounded-full mx-auto" />
                                  <p className="text-xs text-muted-foreground">Subiendo...</p>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <ImagePlus className="w-6 h-6 text-muted-foreground mx-auto" />
                                  <p className="text-xs text-muted-foreground">
                                    Arrastra imágenes aquí o <span className="text-primary font-medium font-semibold">haz clic</span>
                                  </p>
                                </div>
                              )}
                            </div>
                            <input
                              ref={roomImagesInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleRoomImgFileChange}
                              className="hidden"
                            />

                            {/* Images Grid */}
                            {roomTypeForm.roomImages.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {roomTypeForm.roomImages.map((img, idx) => (
                                  <div
                                    key={`${img}-${idx}`}
                                    draggable
                                    onDragStart={(e) => handleRoomImgDragStart(e, idx)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleRoomImgDrop(e, idx)}
                                    className={cn(
                                      'relative group rounded-md overflow-hidden border border-border transition-all bg-muted/20',
                                      'hover:shadow-xs hover:border-ring/40',
                                      draggedRoomImgIdx === idx && 'opacity-50 ring-1 ring-ring'
                                    )}
                                  >
                                    <img
                                      src={img}
                                      alt={`Foto ${idx + 1}`}
                                      className="w-full h-20 object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '';
                                        (e.target as HTMLImageElement).alt = 'No disponible';
                                        (e.target as HTMLImageElement).className = 'w-full h-20 bg-muted flex items-center justify-center text-[10px]';
                                      }}
                                    />
                                    {/* Grip indicator and index */}
                                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-medium rounded-sm px-1 py-0.2 flex items-center gap-0.5 pointer-events-none">
                                      <GripVertical className="w-2.5 h-2.5" />
                                      {idx + 1}
                                    </div>
                                    {/* Cover photo indicator */}
                                    {roomTypeForm.roomImage === img && (
                                      <div className="absolute bottom-1 left-1 bg-amber-500 text-white text-[8px] font-bold rounded-sm px-1 py-0.2">
                                        Portada
                                      </div>
                                    )}
                                    {/* Remove button */}
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="destructive"
                                      className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeRoomImg(idx);
                                      }}
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add by URL */}
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Link2 className="w-2.5 h-2.5" />
                                Agregar foto por URL
                              </Label>
                              <div className="flex gap-1.5">
                                <Input
                                  value={roomImageUrlInput}
                                  onChange={(e) => setRoomImageUrlInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addRoomImgByUrl();
                                    }
                                  }}
                                  placeholder="https://ejemplo.com/room.jpg"
                                  className="flex-1 text-xs h-7"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={addRoomImgByUrl}
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
                                  setRoomTypeForm((prev) => ({ ...prev, active: checked }))
                                }
                              />
                              <Label className="text-xs">Activo</Label>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              type="button"
                              size="sm"
                              onClick={editingRoomTypeId ? handleUpdateRoomType : handleCreateRoomType}
                              disabled={savingRoomType || !roomTypeForm.name.trim()}
                            >
                              <Save className="w-3.5 h-3.5 mr-1" />
                              {savingRoomType
                                ? 'Guardando...'
                                : editingRoomTypeId
                                  ? 'Actualizar'
                                  : 'Crear'}
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

                  {/* RoomType table */}
                  {roomTypes.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Nombre</TableHead>
                          <TableHead className="text-xs">Camas</TableHead>
                          <TableHead className="text-xs">Capacidad</TableHead>
                          <TableHead className="text-xs">Precio Base</TableHead>
                          <TableHead className="text-xs">Estado</TableHead>
                          <TableHead className="text-xs text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roomTypes.map((rt) => (
                          <TableRow key={rt.id}>
                            <TableCell className="text-sm font-medium">{rt.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{rt.beds}</TableCell>
                            <TableCell className="text-xs">{rt.maxGuests} pax</TableCell>
                            <TableCell className="text-xs font-semibold">{formatCurrency(rt.basePrice)}</TableCell>
                            <TableCell>
                              {rt.active ? (
                                <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-600">
                                  Activo
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                                  onClick={() => openEditRoomType(rt)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => setRoomTypeDeleteId(rt.id)}
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

                  {roomTypes.length === 0 && !editingRoomTypeId && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BedDouble className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No hay habitaciones registradas para este hotel</p>
                      <p className="text-xs mt-1">Crea una habitación para configurar precios y disponibilidad</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Extra Tab */}
            <TabsContent value="extra" className="space-y-4 mt-4">
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="hotel-reseller">Asignar a Revendedor</Label>
                <select
                  id="hotel-reseller"
                  value={form.resellerId ?? ''}
                  onChange={(e) => updateField('resellerId', e.target.value || '')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Ninguno / Global (Administrador)</option>
                  {resellers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.companyName || r.contactName || r.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Si se asigna a un revendedor, solo ese revendedor podrá ver y revender este hotel.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(checked) =>
                      updateField('featured', checked)
                    }
                  />
                  <Label>Destacado</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.active}
                    onCheckedChange={(checked) => updateField('active', checked)}
                  />
                  <Label>Activo</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="dialog-footer">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} size="default">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar hotel?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El hotel será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* RoomType Delete Confirmation */}
      <AlertDialog
        open={!!roomTypeDeleteId}
        onOpenChange={(open) => { if (!open) setRoomTypeDeleteId(null); }}
      >
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar RoomType?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El RoomType y sus allotments
              asociados serán eliminados permanentemente.
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
    </div>
  );
}

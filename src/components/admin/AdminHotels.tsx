'use client';

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
import { formatCOP } from '@/data/packages';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
}

interface Hotel {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  cityName: string;
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
}

// ─── Default Room Template ───────────────────────────────────────

const DEFAULT_ROOM: HotelRoom = {
  id: 'room-default',
  name: 'Habitación Estándar',
  maxGuests: 2,
  beds: '1 cama doble',
  price: 0,
  originalPrice: 0,
  includes: ['Wi-Fi', 'Aire acondicionado'],
  available: 1,
  roomImage: '',
};

function createDefaultRoom(index: number): HotelRoom {
  return {
    ...DEFAULT_ROOM,
    id: `room-new-${Date.now()}-${index}`,
  };
}

function sanitizeRoom(room: Partial<HotelRoom>): HotelRoom {
  return {
    id: room.id || `room-${Date.now()}`,
    name: room.name || 'Habitación Estándar',
    maxGuests: Number(room.maxGuests) || 2,
    beds: room.beds || '1 cama doble',
    price: Number(room.price) || 0,
    originalPrice: Number(room.originalPrice) || 0,
    includes: Array.isArray(room.includes) ? room.includes : ['Wi-Fi'],
    available: Number(room.available) || 1,
    roomImage: room.roomImage || '',
  };
}

// ─── Helpers ─────────────────────────────────────────────────────

const emptyHotel: Omit<Hotel, 'id'> = {
  name: '',
  slug: '',
  cityId: 'medellin',
  cityName: 'Medellin',
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

// ─── Tag Input Component ────────────────────────────────────────

function TagInput({
  tags,
  onChange,
  placeholder = 'Agregar servicio...',
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
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={!inputValue.trim()}
          className="shrink-0"
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
                aria-label={`Eliminar ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {tags.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Presiona Enter para agregar un servicio
        </p>
      )}
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

// ─── Room Editor Card Component ──────────────────────────────────

function RoomEditorCard({
  room,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  room: HotelRoom;
  index: number;
  onUpdate: (updated: HotelRoom) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  const updateField = <K extends keyof HotelRoom>(key: K, value: HotelRoom[K]) => {
    onUpdate({ ...room, [key]: value });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-primary" />
            Habitación {index + 1}
            {room.name !== 'Habitación Estándar' && (
              <span className="text-xs text-muted-foreground font-normal">
                — {room.name}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
            {canRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-4 pt-0 space-y-4">
          {/* Room Image */}
          <ImageUpload
            value={room.roomImage}
            onChange={(url) => updateField('roomImage', url)}
            label="Imagen de la habitación"
          />

          <Separator />

          {/* Room Name & Beds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="label-muted">Nombre de la habitación</Label>
              <Input
                value={room.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Habitación Doble Deluxe"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="label-muted">Camas</Label>
              <Input
                value={room.beds}
                onChange={(e) => updateField('beds', e.target.value)}
                placeholder="1 cama king"
                className="text-sm"
              />
            </div>
          </div>

          {/* Max Guests & Available */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="label-muted flex items-center gap-1">
                <Users className="w-3 h-3" /> Max. Huéspedes
              </Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={room.maxGuests}
                onChange={(e) => updateField('maxGuests', Number(e.target.value))}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="label-muted">Disponibles</Label>
              <Input
                type="number"
                min="0"
                value={room.available}
                onChange={(e) => updateField('available', Number(e.target.value))}
                className="text-sm"
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="label-muted flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Precio (COP)
              </Label>
              <Input
                type="number"
                min="0"
                value={room.price}
                onChange={(e) => updateField('price', Number(e.target.value))}
                placeholder="720000"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="label-muted">Precio Original (COP)</Label>
              <Input
                type="number"
                min="0"
                value={room.originalPrice || ''}
                onChange={(e) =>
                  updateField(
                    'originalPrice',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="850000 (opcional)"
                className="text-sm"
              />
            </div>
          </div>

          <Separator />

          {/* Includes (Tags) */}
          <div className="space-y-1.5">
            <Label className="label-muted">Servicios incluidos</Label>
            <TagInput
              tags={room.includes}
              onChange={(includes) => updateField('includes', includes)}
              placeholder="Ej: Desayuno, Wi-Fi, Minibar..."
            />
          </div>
        </CardContent>
      )}
    </Card>
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

  // ── Images state ──
  const [imagesUploading, setImagesUploading] = useState(false);
  const [imagesDragOver, setImagesDragOver] = useState(false);
  const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [pendingUploads, setPendingUploads] = useState(0);
  const imagesInputRef = useRef<HTMLInputElement>(null);

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

  const filtered = hotels.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Ensure rooms are always sanitized on open ──
  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ ...emptyHotel, rooms: [createDefaultRoom(0)] });
    setDialogOpen(true);
  };

  const handleOpenEdit = (hotel: Hotel) => {
    setEditingId(hotel.id);
    // Sanitize rooms: ensure each room has all required fields
    const safeRooms =
      Array.isArray(hotel.rooms) && hotel.rooms.length > 0
        ? hotel.rooms.map((r) => sanitizeRoom(r))
        : [createDefaultRoom(0)];
    setForm({
      name: hotel.name,
      slug: hotel.slug,
      cityId: hotel.cityId,
      cityName: hotel.cityName,
      stars: hotel.stars,
      address: hotel.address,
      description: hotel.description,
      images: hotel.images,
      amenities: hotel.amenities,
      rooms: safeRooms,
      rating: hotel.rating,
      reviewCount: hotel.reviewCount,
      priceFrom: hotel.priceFrom,
      tags: hotel.tags,
      featured: hotel.featured,
      active: hotel.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!form.cityId.trim() || !form.cityName.trim()) {
      toast.error('La ciudad es obligatoria');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.name),
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

  // ── Room management helpers ──
  const addRoom = () => {
    const newRoom = createDefaultRoom(form.rooms.length);
    setForm((prev) => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
  };

  const updateRoom = (index: number, updated: HotelRoom) => {
    setForm((prev) => {
      const rooms = [...prev.rooms];
      rooms[index] = updated;
      return { ...prev, rooms };
    });
  };

  const removeRoom = (index: number) => {
    setForm((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index),
    }));
  };

  const duplicateRoom = (index: number) => {
    const source = form.rooms[index];
    const copy: HotelRoom = {
      ...sanitizeRoom(source),
      id: generateId(),
      name: `${source.name} (copia)`,
    };
    const rooms = [...form.rooms];
    rooms.splice(index + 1, 0, copy);
    setForm((prev) => ({ ...prev, rooms }));
  };

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
                          {formatCOP(hotel.priceFrom)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto admin-dialog">
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
                  <Label htmlFor="hotel-city-id" className="label-required">City ID</Label>
                  <Input
                    id="hotel-city-id"
                    value={form.cityId}
                    onChange={(e) => updateField('cityId', e.target.value)}
                    placeholder="cartagena"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hotel-city-name" className="label-required">Nombre Ciudad</Label>
                  <Input
                    id="hotel-city-name"
                    value={form.cityName}
                    onChange={(e) => updateField('cityName', e.target.value)}
                    placeholder="Cartagena de Indias"
                  />
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
                  value={form.amenities.join(', ')}
                  onChange={(e) =>
                    updateField(
                      'amenities',
                      e.target.value
                        .split(',')
                        .map((a) => a.trim())
                        .filter(Boolean)
                    )
                  }
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
                  value={form.tags.join(', ')}
                  onChange={(e) =>
                    updateField(
                      'tags',
                      e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
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

            {/* ─── ROOMS TAB (Dynamic Form) ─── */}
            <TabsContent value="rooms" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Habitaciones del hotel
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.rooms.length} habitación
                    {form.rooms.length !== 1 ? 'es' : ''} configurada
                    {form.rooms.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRoom}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Agregar habitación
                </Button>
              </div>

              <div className="space-y-4">
                {form.rooms.map((room, idx) => (
                  <RoomEditorCard
                    key={room.id}
                    room={room}
                    index={idx}
                    onUpdate={(updated) => updateRoom(idx, updated)}
                    onRemove={() => removeRoom(idx)}
                    canRemove={form.rooms.length > 1}
                  />
                ))}
              </div>

              {form.rooms.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BedDouble className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay habitaciones configuradas</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRoom}
                    className="mt-3"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Agregar primera habitación
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Extra Tab */}
            <TabsContent value="extra" className="space-y-4 mt-4">
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
    </div>
  );
}

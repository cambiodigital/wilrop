'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Plus, Search, Pencil, Trash2, Star, Building2 } from 'lucide-react';
import { toast } from 'sonner';

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

const emptyHotel: Omit<Hotel, 'id'> = {
  name: '',
  slug: '',
  cityId: '',
  cityName: '',
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

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

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

  const filtered = hotels.filter(
    (h) => h.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ ...emptyHotel });
    setDialogOpen(true);
  };

  const handleOpenEdit = (hotel: Hotel) => {
    setEditingId(hotel.id);
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
      rooms: hotel.rooms,
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
      toast.success(isEditing ? 'Hotel actualizado correctamente' : 'Hotel creado correctamente');
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
      const res = await fetch(`/api/admin/hotels/${deletingId}`, { method: 'DELETE' });
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

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name') {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-600" />
            Hoteles
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los hoteles asociados a WILROP Colombia Travel
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Hotel
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
      <Card className="border-0 shadow-sm">
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
                      <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                        {search ? 'No se encontraron resultados' : 'No hay hoteles registrados'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((hotel) => (
                      <TableRow key={hotel.id}>
                        <TableCell className="font-medium text-sm">{hotel.name}</TableCell>
                        <TableCell className="text-sm text-gray-500">{hotel.cityName}</TableCell>
                        <TableCell>
                          <StarRating count={hotel.stars} />
                        </TableCell>
                        <TableCell className="text-sm font-semibold">{formatCOP(hotel.priceFrom)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm">{hotel.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {hotel.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {hotel.tags.length > 2 && (
                              <span className="text-xs text-gray-400">+{hotel.tags.length - 2}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {hotel.featured ? (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                              Destacado
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-amber-600"
                              onClick={() => handleOpenEdit(hotel)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-600"
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
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Hotel' : 'Nuevo Hotel'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'Modifica los datos del hotel' : 'Completa los datos para registrar un nuevo hotel'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">Info Básica</TabsTrigger>
              <TabsTrigger value="media" className="flex-1">Imágenes</TabsTrigger>
              <TabsTrigger value="amenities" className="flex-1">Servicios</TabsTrigger>
              <TabsTrigger value="rooms" className="flex-1">Habitaciones</TabsTrigger>
              <TabsTrigger value="extra" className="flex-1">Extra</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hotel-name">Nombre *</Label>
                  <Input
                    id="hotel-name"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Hotel Charleston Santa Teresa"
                  />
                </div>
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="hotel-city-id">City ID</Label>
                  <Input
                    id="hotel-city-id"
                    value={form.cityId}
                    onChange={(e) => updateField('cityId', e.target.value)}
                    placeholder="cartagena"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotel-city-name">Nombre Ciudad</Label>
                  <Input
                    id="hotel-city-name"
                    value={form.cityName}
                    onChange={(e) => updateField('cityName', e.target.value)}
                    placeholder="Cartagena de Indias"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="hotel-reviews">Reviews</Label>
                  <Input
                    id="hotel-reviews"
                    type="number"
                    value={form.reviewCount}
                    onChange={(e) => updateField('reviewCount', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotel-address">Dirección</Label>
                <Input
                  id="hotel-address"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Calle de la Inquisición, Centro Histórico"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotel-price">Precio Desde (COP)</Label>
                <Input
                  id="hotel-price"
                  type="number"
                  value={form.priceFrom}
                  onChange={(e) => updateField('priceFrom', Number(e.target.value))}
                  placeholder="720000"
                />
              </div>

              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="hotel-images">Imágenes (JSON array)</Label>
                <Textarea
                  id="hotel-images"
                  value={JSON.stringify(form.images, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      if (Array.isArray(parsed)) {
                        updateField('images', parsed);
                      }
                    } catch {
                      // Allow raw text editing while user types
                    }
                  }}
                  placeholder='["/images/cartagena.png", "/images/cartagena2.png"]'
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-400">
                  Ingresa un array JSON con las URLs de las imágenes
                </p>
              </div>
            </TabsContent>

            {/* Amenities Tab */}
            <TabsContent value="amenities" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="hotel-amenities">Servicios / Amenidades (separados por coma)</Label>
                <Input
                  id="hotel-amenities"
                  value={form.amenities.join(', ')}
                  onChange={(e) =>
                    updateField(
                      'amenities',
                      e.target.value.split(',').map((a) => a.trim()).filter(Boolean)
                    )
                  }
                  placeholder="wifi, pool, restaurant, spa, gym, parking"
                />
                <p className="text-xs text-gray-400">
                  IDs de amenidades: wifi, pool, restaurant, parking, gym, spa, ac, breakfast, bar, reception, transfer, sea-view
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
                      e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                    )
                  }
                  placeholder="Lujo, Popular, Nuevo, Descuento"
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(checked) => updateField('featured', checked)}
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

            {/* Rooms Tab */}
            <TabsContent value="rooms" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="hotel-rooms">Habitaciones (JSON array)</Label>
                <Textarea
                  id="hotel-rooms"
                  value={JSON.stringify(form.rooms, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      if (Array.isArray(parsed)) {
                        updateField('rooms', parsed);
                      }
                    } catch {
                      // Allow raw text editing while user types
                    }
                  }}
                  rows={10}
                  className="font-mono text-xs"
                />
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
                  <p className="font-semibold mb-1">Formato de cada habitación:</p>
                  <pre className="whitespace-pre-wrap">{`{
  "id": "room-1",
  "name": "Habitación Doble Deluxe",
  "maxGuests": 2,
  "beds": "1 cama king",
  "price": 720000,
  "originalPrice": 850000,
  "includes": ["Desayuno", "Wi-Fi"],
  "available": 5,
  "roomImage": "/images/room.png"
}`}</pre>
                </div>
              </div>
            </TabsContent>

            {/* Extra Tab */}
            <TabsContent value="extra" className="space-y-4 mt-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(checked) => updateField('featured', checked)}
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

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar hotel?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El hotel será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

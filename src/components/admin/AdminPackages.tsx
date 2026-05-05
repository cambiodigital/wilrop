'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Plus, Search, Pencil, Trash2, Star, Package, Upload, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TravelPackage {
  id: string;
  destinationId: string;
  destinationName: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  price: number;
  originalPrice?: number;
  commission: number;
  includes: string[];
  image: string;
  difficulty: string;
  groupSize: string;
  departureDates: string[];
  rating: number;
  soldOut: boolean;
  category: string;
  active: boolean;
}

const emptyPackage: Omit<TravelPackage, 'id'> = {
  destinationId: '',
  destinationName: '',
  title: '',
  slug: '',
  description: '',
  duration: '',
  price: 0,
  originalPrice: undefined,
  commission: 10,
  includes: [],
  image: '',
  difficulty: 'Fácil',
  groupSize: '',
  departureDates: [],
  rating: 0,
  soldOut: false,
  category: 'Cultural',
  active: true,
};

const categories = ['Aventura', 'Relax', 'Cultural', 'Naturaleza', 'Playa'];
const difficulties = ['Fácil', 'Moderado', 'Avanzado'];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminPackages() {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(emptyPackage);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/packages');
      if (!res.ok) throw new Error('Error al cargar paquetes');
      const json = await res.json();
      setPackages(json.data || json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const filtered = packages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.destinationName.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ ...emptyPackage });
    setDialogOpen(true);
  };

  const handleOpenEdit = (pkg: TravelPackage) => {
    setEditingId(pkg.id);
    setForm({
      destinationId: pkg.destinationId,
      destinationName: pkg.destinationName,
      title: pkg.title,
      slug: pkg.slug,
      description: pkg.description,
      duration: pkg.duration,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      commission: pkg.commission,
      includes: pkg.includes,
      image: pkg.image,
      difficulty: pkg.difficulty,
      groupSize: pkg.groupSize,
      departureDates: pkg.departureDates,
      rating: pkg.rating,
      soldOut: pkg.soldOut,
      category: pkg.category,
      active: pkg.active,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
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
      formData.append('folder', 'packages');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al subir la imagen');
      }

      const data = await res.json();
      updateField('image', data.url);
      toast.success('Imagen subida correctamente');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir';
      toast.error(msg);
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.title),
      };
      const isEditing = !!editingId;
      const res = await fetch(
        isEditing ? `/api/admin/packages/${editingId}` : '/api/admin/packages',
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
      toast.success(isEditing ? 'Paquete actualizado correctamente' : 'Paquete creado correctamente');
      setDialogOpen(false);
      fetchPackages();
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
      const res = await fetch(`/api/admin/packages/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      toast.success('Paquete eliminado correctamente');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchPackages();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    }
  };

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title') {
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
            <Package className="w-6 h-6 text-amber-600" />
            Paquetes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los paquetes turísticos disponibles
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Paquete
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por título o destino..."
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
                    <TableHead>Título</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Agotado</TableHead>
                    <TableHead>Comisión</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                        {search ? 'No se encontraron resultados' : 'No hay paquetes registrados'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium text-sm max-w-[200px] truncate">
                          {pkg.title}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{pkg.destinationName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {pkg.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                          {pkg.duration}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">{formatCOP(pkg.price)}</span>
                            {pkg.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatCOP(pkg.originalPrice)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm">{pkg.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pkg.soldOut ? (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                              Agotado
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                              Disponible
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-amber-600">{pkg.commission}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-amber-600"
                              onClick={() => handleOpenEdit(pkg)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-600"
                              onClick={() => {
                                setDeletingId(pkg.id);
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
              {editingId ? 'Editar Paquete' : 'Nuevo Paquete'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'Modifica los datos del paquete' : 'Completa los datos para crear un nuevo paquete'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Básica</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pkg-title">Título *</Label>
                  <Input
                    id="pkg-title"
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Cartagena Romántica"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pkg-slug">Slug</Label>
                  <Input
                    id="pkg-slug"
                    value={form.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    placeholder="Auto-generado del título"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="pkg-dest-id">ID Destino</Label>
                  <Input
                    id="pkg-dest-id"
                    value={form.destinationId}
                    onChange={(e) => updateField('destinationId', e.target.value)}
                    placeholder="cartagena"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pkg-dest-name">Nombre Destino</Label>
                  <Input
                    id="pkg-dest-name"
                    value={form.destinationName}
                    onChange={(e) => updateField('destinationName', e.target.value)}
                    placeholder="Cartagena de Indias"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="pkg-category">Categoría</Label>
                  <select
                    id="pkg-category"
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pkg-duration">Duración</Label>
                  <Input
                    id="pkg-duration"
                    value={form.duration}
                    onChange={(e) => updateField('duration', e.target.value)}
                    placeholder="4 días / 3 noches"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pkg-difficulty">Dificultad</Label>
                  <select
                    id="pkg-difficulty"
                    value={form.difficulty}
                    onChange={(e) => updateField('difficulty', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="pkg-group">Tamaño Grupo</Label>
                  <Input
                    id="pkg-group"
                    value={form.groupSize}
                    onChange={(e) => updateField('groupSize', e.target.value)}
                    placeholder="2 – 8 personas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pkg-rating">Rating</Label>
                  <Input
                    id="pkg-rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => updateField('rating', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Descripción</h3>
              <Textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Descripción detallada del paquete..."
                rows={4}
              />
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Precios y Comisión</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pkg-price">Precio (COP)</Label>
                  <Input
                    id="pkg-price"
                    type="number"
                    value={form.price}
                    onChange={(e) => updateField('price', Number(e.target.value))}
                    placeholder="1250000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pkg-original-price">Precio Original (COP)</Label>
                  <Input
                    id="pkg-original-price"
                    type="number"
                    value={form.originalPrice ?? ''}
                    onChange={(e) =>
                      updateField('originalPrice', e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="1480000 (opcional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pkg-commission">Comisión (%)</Label>
                  <Input
                    id="pkg-commission"
                    type="number"
                    min="0"
                    max="100"
                    value={form.commission}
                    onChange={(e) => updateField('commission', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Imagen</h3>
              {form.image ? (
                <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={form.image}
                    alt="Vista previa"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Cambiar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => updateField('image', '')}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleImageUpload(file);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => imageInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    dragOver
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-300 hover:border-amber-300 hover:bg-gray-50',
                    uploading && 'pointer-events-none opacity-60'
                  )}
                >
                  {uploading ? (
                    <div className="space-y-2">
                      <div className="animate-spin w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full mx-auto" />
                      <p className="text-sm text-gray-500">Subiendo imagen...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImagePlus className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-500">
                        Arrastra una imagen o{' '}
                        <span className="text-amber-600 font-medium">haz clic para seleccionar</span>
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG, WebP, GIF (máx. 5 MB)</p>
                    </div>
                  )}
                </div>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="hidden"
              />
            </div>

            {/* Includes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Qué Incluye</h3>
              <Textarea
                value={form.includes.join('\n')}
                onChange={(e) =>
                  updateField(
                    'includes',
                    e.target.value.split('\n').map((i) => i.trim()).filter(Boolean)
                  )
                }
                placeholder="Alojamiento en hotel boutique 4★&#10;Desayuno buffet diario&#10;Tour privado Ciudad Amurallada"
                rows={5}
              />
              <p className="text-xs text-gray-400 mt-1">Un item por línea</p>
            </div>

            {/* Departure Dates */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Fechas de Salida</h3>
              <Input
                value={form.departureDates.join(', ')}
                onChange={(e) =>
                  updateField(
                    'departureDates',
                    e.target.value.split(',').map((d) => d.trim()).filter(Boolean)
                  )
                }
                placeholder="2025-07-15, 2025-08-10, 2025-09-05"
              />
              <p className="text-xs text-gray-400 mt-1">Fechas separadas por coma (YYYY-MM-DD)</p>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.soldOut}
                  onCheckedChange={(checked) => updateField('soldOut', checked)}
                />
                <Label>Agotado</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.active}
                  onCheckedChange={(checked) => updateField('active', checked)}
                />
                <Label>Activo</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar paquete?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El paquete será eliminado permanentemente.
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

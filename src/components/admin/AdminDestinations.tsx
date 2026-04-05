'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Plus, Search, Pencil, Trash2, Star, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Destination {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  image: string;
  highlights: string[];
  rating: number;
  reviewCount: number;
  priceFrom: number;
  active: boolean;
  order: number;
}

const emptyDestination: Omit<Destination, 'id'> = {
  name: '',
  slug: '',
  region: '',
  description: '',
  image: '',
  highlights: [],
  rating: 0,
  reviewCount: 0,
  priceFrom: 0,
  active: true,
  order: 0,
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyDestination);

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/destinations');
      if (!res.ok) throw new Error('Error al cargar destinos');
      const json = await res.json();
      setDestinations(json.data || json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const filtered = destinations.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ ...emptyDestination });
    setDialogOpen(true);
  };

  const handleOpenEdit = (dest: Destination) => {
    setEditingId(dest.id);
    setForm({
      name: dest.name,
      slug: dest.slug,
      region: dest.region,
      description: dest.description,
      image: dest.image,
      highlights: dest.highlights,
      rating: dest.rating,
      reviewCount: dest.reviewCount,
      priceFrom: dest.priceFrom,
      active: dest.active,
      order: dest.order,
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
        isEditing ? `/api/admin/destinations/${editingId}` : '/api/admin/destinations',
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
      toast.success(isEditing ? 'Destino actualizado correctamente' : 'Destino creado correctamente');
      setDialogOpen(false);
      fetchDestinations();
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
      const res = await fetch(`/api/admin/destinations/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      toast.success('Destino eliminado correctamente');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchDestinations();
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
            <MapPin className="w-6 h-6 text-amber-600" />
            Destinos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los destinos turísticos de Colombia
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Destino
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
                    <TableHead>Región</TableHead>
                    <TableHead>Precio Desde</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        {search ? 'No se encontraron resultados' : 'No hay destinos registrados'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((dest) => (
                      <TableRow key={dest.id}>
                        <TableCell className="font-medium text-sm">{dest.name}</TableCell>
                        <TableCell className="text-sm text-gray-500">{dest.region}</TableCell>
                        <TableCell className="text-sm font-semibold">{formatCOP(dest.priceFrom)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm">{dest.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              dest.active
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-100 text-xs'
                            }
                          >
                            {dest.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-amber-600"
                              onClick={() => handleOpenEdit(dest)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-600"
                              onClick={() => {
                                setDeletingId(dest.id);
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Destino' : 'Nuevo Destino'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'Modifica los datos del destino' : 'Completa los datos para crear un nuevo destino'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dest-name">Nombre *</Label>
                <Input
                  id="dest-name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Ej: Cartagena de Indias"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dest-slug">Slug</Label>
                <Input
                  id="dest-slug"
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="Auto-generado del nombre"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dest-region">Región</Label>
                <Input
                  id="dest-region"
                  value={form.region}
                  onChange={(e) => updateField('region', e.target.value)}
                  placeholder="Ej: Caribe, Andina"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dest-price">Precio Desde (COP)</Label>
                <Input
                  id="dest-price"
                  type="number"
                  value={form.priceFrom}
                  onChange={(e) => updateField('priceFrom', Number(e.target.value))}
                  placeholder="550000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dest-description">Descripción</Label>
              <Textarea
                id="dest-description"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Descripción del destino..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dest-image">URL de Imagen</Label>
              <Input
                id="dest-image"
                value={form.image}
                onChange={(e) => updateField('image', e.target.value)}
                placeholder="/images/cartagena.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dest-highlights">Highlights (separados por coma)</Label>
              <Input
                id="dest-highlights"
                value={form.highlights.join(', ')}
                onChange={(e) =>
                  updateField(
                    'highlights',
                    e.target.value.split(',').map((h) => h.trim()).filter(Boolean)
                  )
                }
                placeholder="Ciudad Amurallada, Playas, Castillo San Felipe"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dest-rating">Rating (1-5)</Label>
                <Input
                  id="dest-rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) => updateField('rating', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dest-reviews">Cantidad Reviews</Label>
                <Input
                  id="dest-reviews"
                  type="number"
                  value={form.reviewCount}
                  onChange={(e) => updateField('reviewCount', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dest-order">Orden</Label>
                <Input
                  id="dest-order"
                  type="number"
                  value={form.order}
                  onChange={(e) => updateField('order', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => updateField('active', checked)}
              />
              <Label>Activo</Label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
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
            <AlertDialogTitle>¿Eliminar destino?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El destino será eliminado permanentemente.
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

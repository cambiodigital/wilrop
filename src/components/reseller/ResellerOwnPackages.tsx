'use client';

import { formatCurrency } from '@/lib/currency';

import { useEffect, useState, useCallback } from 'react';
import {
  Package,
  ImagePlus,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
  MapPin,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface OwnPackage {
  id: string;
  slug: string;
  title: string;
  destinationId: string;
  destinationName: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  category: string;
  active: boolean;
  isTemplate: boolean;
}

interface DestinationOption {
  id: string;
  name: string;
  region: string;
}

const categories = [
  'Cultural',
  'Aventura',
  'Playa',
  'Montaña',
  'Ciudad',
  'Romántico',
  'Familiar',
  'Lujo',
  'Económico',
  'Ecoturismo',
  'Gastronómico',
  'Crucero',
];

const emptyForm = {
  title: '',
  destinationId: '',
  destinationName: '',
  description: '',
  duration: '',
  price: 0,
  image: '',
  category: 'Cultural',
  active: false,
};

export default function ResellerOwnPackages() {
  const [packages, setPackages] = useState<OwnPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [destinationOptions, setDestinationOptions] = useState<DestinationOption[]>([]);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reseller/products/packages');
      const json = await res.json();
      if (json.success) setPackages(json.data);
    } catch {
      toast.error('No se pudieron cargar tus paquetes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch('/api/reseller/catalog?sourceType=destination');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDestinationOptions(json.data.map((item: any) => ({
            id: item.sourceId,
            name: item.sourceData?.name || item.customName || '',
            region: item.sourceData?.region || '',
          })));
        }
      } catch {
        // Optional helper data, form can still be completed manually.
      }
    }

    fetchDestinations();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (pkg: OwnPackage) => {
    setEditingId(pkg.id);
    setForm({
      title: pkg.title,
      destinationId: pkg.destinationId,
      destinationName: pkg.destinationName,
      description: pkg.description,
      duration: pkg.duration,
      price: pkg.price,
      image: pkg.image,
      category: pkg.category,
      active: pkg.active,
    });
    setDialogOpen(true);
  };

  const handleDestinationChange = (destinationId: string) => {
    const selected = destinationOptions.find((d) => d.id === destinationId);
    setForm((f) => ({
      ...f,
      destinationId,
      destinationName: selected?.name || f.destinationName,
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} no es una imagen válida`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} supera los 5 MB`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (!json.success || !json.fileUrl) {
        throw new Error(json.error || 'No se pudo subir la imagen');
      }

      setForm((f) => ({ ...f, image: json.fileUrl }));
      toast.success('Imagen subida');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al subir imagen');
    } finally {
      setUploading(false);
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
        title: form.title.trim(),
        destinationId: form.destinationId,
        destinationName: form.destinationName,
        description: form.description,
        duration: form.duration,
        price: Math.round(Number(form.price) || 0),
        image: form.image,
        category: form.category,
        active: form.active,
      };

      const url = editingId
        ? `/api/reseller/products/packages/${editingId}`
        : '/api/reseller/products/packages';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingId ? 'Paquete actualizado' : 'Paquete creado');
        setDialogOpen(false);
        fetchPackages();
      } else {
        toast.error(json.error || 'No se pudo guardar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (pkg: OwnPackage) => {
    try {
      const res = await fetch(`/api/reseller/products/packages/${pkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !pkg.active }),
      });
      const json = await res.json();
      if (json.success) {
        setPackages((prev) =>
          prev.map((p) => (p.id === pkg.id ? { ...p, active: !p.active } : p)),
        );
        toast.success(pkg.active ? 'Despublicado' : 'Publicado');
      } else {
        toast.error(json.error || 'No se pudo actualizar');
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este paquete? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/reseller/products/packages/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setPackages((prev) => prev.filter((p) => p.id !== id));
        toast.success('Paquete eliminado');
      } else {
        toast.error(json.error || 'No se pudo eliminar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tus paquetes propios</h2>
          <p className="text-sm text-gray-500">
            Crea y gestiona tus propios paquetes de viaje. Al publicarlos, aparecen en tu tienda.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="size-4" />
          Nuevo paquete
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center">
          <Package className="mx-auto size-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            Aún no has creado paquetes propios
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Crea tu primer paquete para ofrecerlo a tus clientes.
          </p>
          <Button onClick={openCreateDialog} className="mt-4 gap-2" size="sm">
            <Plus className="size-3.5" />
            Crear paquete
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden">
              <div className="relative h-32 overflow-hidden bg-primary/5">
                {pkg.image ? (
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="size-8 text-primary/30" />
                  </div>
                )}
                <Badge
                  className={`absolute right-2 top-2 ${
                    pkg.active
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {pkg.active ? 'Publicado' : 'Borrador'}
                </Badge>
              </div>
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{pkg.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {pkg.destinationName && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {pkg.destinationName}
                      </span>
                    )}
                    {pkg.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {pkg.duration}
                      </span>
                    )}
                    {pkg.category && <Badge variant="secondary">{pkg.category}</Badge>}
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(pkg.price)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleToggleActive(pkg)}
                  >
                    {pkg.active ? (
                      <>
                        <EyeOff className="size-3.5" />
                        Despublicar
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5" />
                        Publicar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => openEditDialog(pkg)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:text-red-700"
                    disabled={deletingId === pkg.id}
                    onClick={() => handleDelete(pkg.id)}
                  >
                    {deletingId === pkg.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="force-light sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar paquete' : 'Nuevo paquete'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifica los datos de tu paquete.'
                : 'Completa los datos para crear un paquete propio.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pkg-title">Título *</Label>
                <Input
                  id="pkg-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Aventura en Cartagena 5 días"
                />
              </div>

              {destinationOptions.length > 0 && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="pkg-destination-id">Destino</Label>
                  <Select value={form.destinationId || 'none'} onValueChange={(value) => handleDestinationChange(value === 'none' ? '' : value)}>
                    <SelectTrigger id="pkg-destination-id">
                      <SelectValue placeholder="Selecciona un destino" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin destino</SelectItem>
                      {destinationOptions.map((destination) => (
                        <SelectItem key={destination.id} value={destination.id}>
                          {destination.name}{destination.region ? `, ${destination.region}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="pkg-dest-name">Nombre destino</Label>
                <Input
                  id="pkg-dest-name"
                  value={form.destinationName}
                  onChange={(e) => setForm((f) => ({ ...f, destinationName: e.target.value }))}
                  placeholder="Ej: Cartagena"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pkg-category">Categoría</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger id="pkg-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pkg-duration">Duración</Label>
                <Input
                  id="pkg-duration"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  placeholder="Ej: 5 días / 4 noches"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pkg-price">Precio</Label>
                <Input
                  id="pkg-price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Imagen</Label>
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                {form.image ? (
                  <div className="relative mx-auto max-w-xs">
                    <img
                      src={form.image}
                      alt="Imagen del paquete"
                      className="mx-auto max-h-40 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image: '' }))}
                      className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-red-50 hover:text-red-600"
                      aria-label="Eliminar imagen"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImagePlus className="mx-auto mb-2 size-7 text-slate-400" />
                    <p className="text-sm text-slate-600">Subí una imagen del paquete</p>
                    <p className="mt-1 text-xs text-slate-400">PNG, JPG, WebP o GIF, máximo 5 MB</p>
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      className="mt-3 bg-white"
                      onChange={(event) => {
                        if (event.target.files?.[0]) handleImageUpload(event.target.files[0]);
                        event.currentTarget.value = '';
                      }}
                    />
                    {uploading && (
                      <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                        <Loader2 className="size-3.5 animate-spin" />
                        Subiendo imagen...
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pkg-desc">Descripción</Label>
              <Textarea
                id="pkg-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Descripción del paquete..."
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <Checkbox
                id="pkg-active"
                checked={form.active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, active: checked === true }))
                }
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="pkg-active" className="cursor-pointer text-sm font-medium">
                  Publicar paquete
                </Label>
                <p className="text-xs text-muted-foreground">
                  Si está activo, tus clientes podrán verlo en tu tienda.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingId ? 'Guardar cambios' : 'Crear paquete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

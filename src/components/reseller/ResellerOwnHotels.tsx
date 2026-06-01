'use client';

import { formatCurrency } from '@/lib/currency';

import { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  ImagePlus,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
  MapPin,
  Star,
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
import { toast } from 'sonner';

interface OwnHotel {
  id: string;
  slug: string;
  name: string;
  cityId: string;
  cityName: string;
  stars: number;
  address: string;
  description: string;
  images: string[];
  priceFrom: number;
  active: boolean;
  isTemplate: boolean;
}

const emptyForm = {
  name: '',
  cityId: '',
  cityName: '',
  stars: 3,
  address: '',
  description: '',
  images: [] as string[],
  priceFrom: 0,
  active: false,
};

export default function ResellerOwnHotels() {
  const [hotels, setHotels] = useState<OwnHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reseller/products/hotels');
      const json = await res.json();
      if (json.success) setHotels(json.data);
    } catch {
      toast.error('No se pudieron cargar tus hoteles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (h: OwnHotel) => {
    setEditingId(h.id);
    setForm({
      name: h.name,
      cityId: h.cityId,
      cityName: h.cityName,
      stars: h.stars,
      address: h.address,
      description: h.description,
      images: h.images,
      priceFrom: h.priceFrom,
      active: h.active,
    });
    setDialogOpen(true);
  };

  const handleImagesUpload = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} supera los 5 MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const json = await res.json();
        if (!json.success || !json.fileUrl) {
          throw new Error(json.error || 'No se pudo subir la imagen');
        }
        uploadedUrls.push(json.fileUrl);
      }

      setForm((f) => ({ ...f, images: [...f.images, ...uploadedUrls] }));
      toast.success(`${uploadedUrls.length} imagen(es) subida(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al subir imágenes');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        cityId: form.cityId,
        cityName: form.cityName,
        stars: Math.round(Number(form.stars) || 3),
        address: form.address,
        description: form.description,
        images: form.images,
        priceFrom: Math.round(Number(form.priceFrom) || 0),
        active: form.active,
      };

      const url = editingId
        ? `/api/reseller/products/hotels/${editingId}`
        : '/api/reseller/products/hotels';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingId ? 'Hotel actualizado' : 'Hotel creado');
        setDialogOpen(false);
        fetchHotels();
      } else {
        toast.error(json.error || 'No se pudo guardar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (h: OwnHotel) => {
    try {
      const res = await fetch(`/api/reseller/products/hotels/${h.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !h.active }),
      });
      const json = await res.json();
      if (json.success) {
        setHotels((prev) =>
          prev.map((item) => (item.id === h.id ? { ...item, active: !item.active } : item)),
        );
        toast.success(h.active ? 'Despublicado' : 'Publicado');
      } else {
        toast.error(json.error || 'No se pudo actualizar');
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este hotel? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/reseller/products/hotels/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setHotels((prev) => prev.filter((h) => h.id !== id));
        toast.success('Hotel eliminado');
      } else {
        toast.error(json.error || 'No se pudo eliminar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (count: number, interactive = false, onSelect?: (n: number) => void) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => onSelect?.(n)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
          >
            <Star
              className={`size-5 ${
                n <= count ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
              } ${interactive ? 'hover:scale-110 transition-transform' : ''}`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tus hoteles propios</h2>
          <p className="text-sm text-gray-500">
            Crea y gestiona tus propios hoteles. Al publicarlos, aparecen en tu tienda.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="size-4" />
          Nuevo hotel
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center">
          <Building2 className="mx-auto size-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            Aún no has creado hoteles propios
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Crea tu primer hotel para ofrecerlo a tus clientes.
          </p>
          <Button onClick={openCreateDialog} className="mt-4 gap-2" size="sm">
            <Plus className="size-3.5" />
            Crear hotel
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hotels.map((h) => (
            <Card key={h.id} className="overflow-hidden">
              <div className="relative h-32 overflow-hidden bg-primary/5">
                {h.images[0] ? (
                  <img
                    src={h.images[0]}
                    alt={h.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building2 className="size-8 text-primary/30" />
                  </div>
                )}
                <Badge
                  className={`absolute right-2 top-2 ${
                    h.active
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {h.active ? 'Publicado' : 'Borrador'}
                </Badge>
              </div>
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{h.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {renderStars(h.stars)}
                    {h.cityName && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {h.cityName}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(h.priceFrom)}
                  <span className="ml-1 text-xs font-normal text-gray-500">desde</span>
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleToggleActive(h)}
                  >
                    {h.active ? (
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
                    onClick={() => openEditDialog(h)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:text-red-700"
                    disabled={deletingId === h.id}
                    onClick={() => handleDelete(h.id)}
                  >
                    {deletingId === h.id ? (
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
            <DialogTitle>{editingId ? 'Editar hotel' : 'Nuevo hotel'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifica los datos de tu hotel.'
                : 'Completa los datos para crear un hotel propio.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="htl-name">Nombre *</Label>
                <Input
                  id="htl-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Hotel Playa Dorada"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="htl-city">Ciudad</Label>
                <Input
                  id="htl-city"
                  value={form.cityName}
                  onChange={(e) => setForm((f) => ({ ...f, cityName: e.target.value }))}
                  placeholder="Ej: Cartagena"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Estrellas</Label>
                {renderStars(form.stars, true, (n) =>
                  setForm((f) => ({ ...f, stars: n })),
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="htl-address">Dirección</Label>
                <Input
                  id="htl-address"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Ej: Av. Bocagrande, Cra 1 #5-01"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="htl-price">Precio desde</Label>
                <Input
                  id="htl-price"
                  type="number"
                  min={0}
                  value={form.priceFrom}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priceFrom: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Imágenes ({form.images.length})</Label>
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                <ImagePlus className="mx-auto mb-2 size-7 text-slate-400" />
                <p className="text-sm text-slate-600">Subí imágenes del hotel</p>
                <p className="mt-1 text-xs text-slate-400">PNG, JPG, WebP o GIF, máximo 5 MB cada una</p>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  className="mt-3 bg-white"
                  onChange={(event) => {
                    if (event.target.files) handleImagesUpload(event.target.files);
                    event.currentTarget.value = '';
                  }}
                />
                {uploading && (
                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="size-3.5 animate-spin" />
                    Subiendo imágenes...
                  </div>
                )}
              </div>
              {form.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {form.images.map((image, index) => (
                    <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      <img src={image} alt={`Imagen ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }))}
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-red-50 hover:text-red-600"
                        aria-label="Eliminar imagen"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="htl-desc">Descripción</Label>
              <Textarea
                id="htl-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Descripción del hotel..."
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <Checkbox
                id="htl-active"
                checked={form.active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, active: checked === true }))
                }
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="htl-active" className="cursor-pointer text-sm font-medium">
                  Publicar hotel
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
              {editingId ? 'Guardar cambios' : 'Crear hotel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { formatCurrency } from '@/lib/currency';

import { useEffect, useState, useCallback } from 'react';
import {
  Ship,
  ImagePlus,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
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
import { toast } from 'sonner';

interface OwnCruise {
  id: string;
  slug: string;
  name: string;
  shipName: string;
  operator: string;
  durationDays: number;
  images: string[];
  priceFrom: number;
  description: string;
  includes: string[];
  itinerary: string[];
  tags: string[];
  active: boolean;
  isTemplate: boolean;
}

const emptyForm = {
  name: '',
  shipName: '',
  operator: '',
  durationDays: 3,
  priceFrom: 0,
  description: '',
  includes: '',
  itinerary: '',
  images: [] as string[],
  active: false,
};

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ResellerOwnCruises() {
  const [cruises, setCruises] = useState<OwnCruise[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCruises = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reseller/products/cruises');
      const json = await res.json();
      if (json.success) setCruises(json.data);
    } catch {
      toast.error('No se pudieron cargar tus cruceros');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCruises();
  }, [fetchCruises]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (cruise: OwnCruise) => {
    setEditingId(cruise.id);
    setForm({
      name: cruise.name,
      shipName: cruise.shipName,
      operator: cruise.operator,
      durationDays: cruise.durationDays,
      priceFrom: cruise.priceFrom,
      description: cruise.description,
      includes: cruise.includes.join('\n'),
      itinerary: cruise.itinerary.join('\n'),
      images: cruise.images,
      active: cruise.active,
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
        shipName: form.shipName.trim(),
        operator: form.operator.trim(),
        durationDays: Math.round(Number(form.durationDays) || 3),
        priceFrom: Math.round(Number(form.priceFrom) || 0),
        description: form.description,
        includes: splitLines(form.includes),
        itinerary: splitLines(form.itinerary),
        images: form.images,
        active: form.active,
      };

      const url = editingId
        ? `/api/reseller/products/cruises/${editingId}`
        : '/api/reseller/products/cruises';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingId ? 'Crucero actualizado' : 'Crucero creado');
        setDialogOpen(false);
        fetchCruises();
      } else {
        toast.error(json.error || 'No se pudo guardar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cruise: OwnCruise) => {
    try {
      const res = await fetch(`/api/reseller/products/cruises/${cruise.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !cruise.active }),
      });
      const json = await res.json();
      if (json.success) {
        setCruises((prev) =>
          prev.map((c) => (c.id === cruise.id ? { ...c, active: !c.active } : c)),
        );
        toast.success(cruise.active ? 'Despublicado' : 'Publicado');
      } else {
        toast.error(json.error || 'No se pudo actualizar');
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este crucero? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/reseller/products/cruises/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setCruises((prev) => prev.filter((c) => c.id !== id));
        toast.success('Crucero eliminado');
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
          <h2 className="text-lg font-bold text-gray-900">Tus cruceros propios</h2>
          <p className="text-sm text-gray-500">
            Crea y gestiona tus propios cruceros. Al publicarlos, aparecen en tu tienda.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="size-4" />
          Nuevo crucero
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : cruises.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center">
          <Ship className="mx-auto size-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            Aún no has creado cruceros propios
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Crea tu primer crucero para ofrecerlo a tus clientes.
          </p>
          <Button onClick={openCreateDialog} className="mt-4 gap-2" size="sm">
            <Plus className="size-3.5" />
            Crear crucero
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cruises.map((cruise) => (
            <Card key={cruise.id} className="overflow-hidden">
              <div className="relative h-32 overflow-hidden bg-primary/5">
                {cruise.images[0] ? (
                  <img
                    src={cruise.images[0]}
                    alt={cruise.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Ship className="size-8 text-primary/30" />
                  </div>
                )}
                <Badge
                  className={`absolute right-2 top-2 ${
                    cruise.active
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {cruise.active ? 'Publicado' : 'Borrador'}
                </Badge>
              </div>
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{cruise.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {cruise.shipName && (
                      <span className="flex items-center gap-1">
                        <Ship className="size-3" />
                        {cruise.shipName}
                      </span>
                    )}
                    {cruise.durationDays > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {cruise.durationDays} {cruise.durationDays === 1 ? 'día' : 'días'}
                      </span>
                    )}
                    {cruise.operator && <Badge variant="secondary">{cruise.operator}</Badge>}
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(cruise.priceFrom)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleToggleActive(cruise)}
                  >
                    {cruise.active ? (
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
                    onClick={() => openEditDialog(cruise)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:text-red-700"
                    disabled={deletingId === cruise.id}
                    onClick={() => handleDelete(cruise.id)}
                  >
                    {deletingId === cruise.id ? (
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
            <DialogTitle>{editingId ? 'Editar crucero' : 'Nuevo crucero'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifica los datos de tu crucero.'
                : 'Completa los datos para crear un crucero propio.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cruise-name">Nombre *</Label>
                <Input
                  id="cruise-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Crucero por el Caribe"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cruise-ship">Nombre del barco</Label>
                <Input
                  id="cruise-ship"
                  value={form.shipName}
                  onChange={(e) => setForm((f) => ({ ...f, shipName: e.target.value }))}
                  placeholder="Ej: MS Explorer"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cruise-operator">Operador</Label>
                <Input
                  id="cruise-operator"
                  value={form.operator}
                  onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value }))}
                  placeholder="Ej: Royal Caribbean"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cruise-duration">Duración (días)</Label>
                <Input
                  id="cruise-duration"
                  type="number"
                  min={1}
                  value={form.durationDays}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, durationDays: Number(e.target.value) || 3 }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cruise-price">Precio desde</Label>
                <Input
                  id="cruise-price"
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
                <p className="text-sm text-slate-600">Subí imágenes del crucero</p>
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
              <Label htmlFor="cruise-desc">Descripción</Label>
              <Textarea
                id="cruise-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Descripción del crucero..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cruise-includes">Incluye (uno por línea)</Label>
              <Textarea
                id="cruise-includes"
                value={form.includes}
                onChange={(e) => setForm((f) => ({ ...f, includes: e.target.value }))}
                rows={3}
                placeholder="Pensión completa&#10;Entretenimiento a bordo&#10;Excursiones en puerto"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cruise-itinerary">Itinerario (uno por línea)</Label>
              <Textarea
                id="cruise-itinerary"
                value={form.itinerary}
                onChange={(e) => setForm((f) => ({ ...f, itinerary: e.target.value }))}
                rows={3}
                placeholder="Cartagena&#10;San Andrés&#10;Colón (Panamá)"
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <Checkbox
                id="cruise-active"
                checked={form.active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, active: checked === true }))
                }
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="cruise-active" className="cursor-pointer text-sm font-medium">
                  Publicar crucero
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
              {editingId ? 'Guardar cambios' : 'Crear crucero'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

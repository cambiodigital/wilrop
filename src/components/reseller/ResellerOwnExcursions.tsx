'use client';

import { formatCurrency } from '@/lib/currency';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mountain,
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

interface OwnExcursion {
  id: string;
  slug: string;
  name: string;
  destinationId: string;
  destinationName: string;
  cityName: string;
  description: string;
  shortDesc: string;
  images: string[];
  duration: string;
  difficulty: string;
  groupSize: string;
  basePrice: number;
  childPrice: number;
  includes: string[];
  excludes: string[];
  requirements: string[];
  category: string;
  active: boolean;
  isTemplate: boolean;
}

const emptyForm = {
  name: '',
  destinationId: '',
  destinationName: '',
  cityName: '',
  description: '',
  shortDesc: '',
  duration: '',
  difficulty: 'Fácil',
  groupSize: '',
  basePrice: 0,
  childPrice: 0,
  includes: '',
  excludes: '',
  requirements: '',
  category: '',
  active: false,
};

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ResellerOwnExcursions() {
  const [excursions, setExcursions] = useState<OwnExcursion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExcursions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reseller/products/excursions');
      const json = await res.json();
      if (json.success) setExcursions(json.data);
    } catch {
      toast.error('No se pudieron cargar tus excursiones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExcursions();
  }, [fetchExcursions]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (exc: OwnExcursion) => {
    setEditingId(exc.id);
    setForm({
      name: exc.name,
      destinationId: exc.destinationId,
      destinationName: exc.destinationName,
      cityName: exc.cityName,
      description: exc.description,
      shortDesc: exc.shortDesc,
      duration: exc.duration,
      difficulty: exc.difficulty,
      groupSize: exc.groupSize,
      basePrice: exc.basePrice,
      childPrice: exc.childPrice,
      includes: exc.includes.join('\n'),
      excludes: exc.excludes.join('\n'),
      requirements: exc.requirements.join('\n'),
      category: exc.category,
      active: exc.active,
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
        name: form.name.trim(),
        destinationId: form.destinationId,
        destinationName: form.destinationName,
        cityName: form.cityName,
        description: form.description,
        shortDesc: form.shortDesc,
        duration: form.duration,
        difficulty: form.difficulty,
        groupSize: form.groupSize,
        basePrice: Number(form.basePrice) || 0,
        childPrice: Number(form.childPrice) || 0,
        includes: splitLines(form.includes),
        excludes: splitLines(form.excludes),
        requirements: splitLines(form.requirements),
        category: form.category,
        active: form.active,
      };

      const url = editingId
        ? `/api/reseller/products/excursions/${editingId}`
        : '/api/reseller/products/excursions';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingId ? 'Excursión actualizada' : 'Excursión creada');
        setDialogOpen(false);
        fetchExcursions();
      } else {
        toast.error(json.error || 'No se pudo guardar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (exc: OwnExcursion) => {
    try {
      const res = await fetch(`/api/reseller/products/excursions/${exc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !exc.active }),
      });
      const json = await res.json();
      if (json.success) {
        setExcursions((prev) =>
          prev.map((e) => (e.id === exc.id ? { ...e, active: !e.active } : e)),
        );
        toast.success(exc.active ? 'Despublicada' : 'Publicada');
      } else {
        toast.error(json.error || 'No se pudo actualizar');
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta excursión? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/reseller/products/excursions/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setExcursions((prev) => prev.filter((e) => e.id !== id));
        toast.success('Excursión eliminada');
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
          <h2 className="text-lg font-bold text-gray-900">Tus excursiones propias</h2>
          <p className="text-sm text-gray-500">
            Crea y gestiona tus propias excursiones. Al publicarlas, aparecen en tu tienda y en tu armador de paquetes.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="size-4" />
          Nueva excursión
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : excursions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center">
          <Mountain className="mx-auto size-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            Aún no has creado excursiones propias
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Crea tu primera excursión para ofrecerla a tus clientes.
          </p>
          <Button onClick={openCreateDialog} className="mt-4 gap-2" size="sm">
            <Plus className="size-3.5" />
            Crear excursión
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {excursions.map((exc) => (
            <Card key={exc.id} className="overflow-hidden">
              <div className="relative h-32 overflow-hidden bg-primary/5">
                {exc.images[0] ? (
                  <img
                    src={exc.images[0]}
                    alt={exc.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Mountain className="size-8 text-primary/30" />
                  </div>
                )}
                <Badge
                  className={`absolute right-2 top-2 ${
                    exc.active
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {exc.active ? 'Publicada' : 'Borrador'}
                </Badge>
              </div>
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{exc.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {exc.cityName && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {exc.cityName}
                      </span>
                    )}
                    {exc.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {exc.duration}
                      </span>
                    )}
                    {exc.category && <Badge variant="secondary">{exc.category}</Badge>}
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(exc.basePrice)}
                  {exc.childPrice > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      niño {formatCurrency(exc.childPrice)}
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleToggleActive(exc)}
                  >
                    {exc.active ? (
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
                    onClick={() => openEditDialog(exc)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:text-red-700"
                    disabled={deletingId === exc.id}
                    onClick={() => handleDelete(exc.id)}
                  >
                    {deletingId === exc.id ? (
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar excursión' : 'Nueva excursión'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifica los datos de tu excursión.'
                : 'Completa los datos para crear una excursión propia.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="exc-name">Nombre *</Label>
                <Input
                  id="exc-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Tour Ciudad Perdida"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exc-city">Ciudad</Label>
                <Input
                  id="exc-city"
                  value={form.cityName}
                  onChange={(e) => setForm((f) => ({ ...f, cityName: e.target.value }))}
                  placeholder="Ej: Santa Marta"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exc-dest">Destino</Label>
                <Input
                  id="exc-dest"
                  value={form.destinationName}
                  onChange={(e) => setForm((f) => ({ ...f, destinationName: e.target.value }))}
                  placeholder="Ej: Sierra Nevada"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exc-cat">Categoría</Label>
                <Input
                  id="exc-cat"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Ej: Cultural, Aventura"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exc-diff">Dificultad</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) => setForm((f) => ({ ...f, difficulty: v }))}
                >
                  <SelectTrigger id="exc-diff">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fácil">Fácil</SelectItem>
                    <SelectItem value="Moderada">Moderada</SelectItem>
                    <SelectItem value="Difícil">Difícil</SelectItem>
                    <SelectItem value="Extrema">Extrema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exc-dur">Duración</Label>
                <Input
                  id="exc-dur"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  placeholder="Ej: 8 horas"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exc-group">Grupo</Label>
                <Input
                  id="exc-group"
                  value={form.groupSize}
                  onChange={(e) => setForm((f) => ({ ...f, groupSize: e.target.value }))}
                  placeholder="Ej: Max 15 personas"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exc-price">Precio base</Label>
                <Input
                  id="exc-price"
                  type="number"
                  min={0}
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, basePrice: Number(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exc-child">Precio niño</Label>
                <Input
                  id="exc-child"
                  type="number"
                  min={0}
                  value={form.childPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, childPrice: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exc-desc">Descripción</Label>
              <Textarea
                id="exc-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Descripción de la excursión..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exc-short">Descripción corta</Label>
              <Input
                id="exc-short"
                value={form.shortDesc}
                onChange={(e) => setForm((f) => ({ ...f, shortDesc: e.target.value }))}
                placeholder="Una línea corta para listados"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exc-incl">Incluye (uno por línea)</Label>
              <Textarea
                id="exc-incl"
                value={form.includes}
                onChange={(e) => setForm((f) => ({ ...f, includes: e.target.value }))}
                rows={3}
                placeholder="Transporte&#10;Guía&#10;Almuerzo"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exc-excl">No incluye (uno por línea)</Label>
              <Textarea
                id="exc-excl"
                value={form.excludes}
                onChange={(e) => setForm((f) => ({ ...f, excludes: e.target.value }))}
                rows={2}
                placeholder="Propinas&#10;Bebidas"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exc-req">Requisitos (uno por línea)</Label>
              <Textarea
                id="exc-req"
                value={form.requirements}
                onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                rows={2}
                placeholder="Calzado cómodo&#10;Protector solar"
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <Checkbox
                id="exc-active"
                checked={form.active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, active: checked === true }))
                }
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="exc-active" className="cursor-pointer text-sm font-medium">
                  Publicar excursión
                </Label>
                <p className="text-xs text-muted-foreground">
                  Si está activa, tus clientes podrán verla en tu tienda y usarla en el armador de paquetes.
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
              {editingId ? 'Guardar cambios' : 'Crear excursión'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

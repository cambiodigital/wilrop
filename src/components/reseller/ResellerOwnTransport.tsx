'use client';

import { formatCurrency } from '@/lib/currency';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bus,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
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

interface OwnTransport {
  id: string;
  name: string;
  providerId: string;
  origin: string;
  destination: string;
  cityId: string;
  cityName: string;
  durationMins: number;
  basePrice: number;
  pricePerExtra: number;
  includes: string[];
  notes: string;
  active: boolean;
}

interface ProviderOption {
  id: string;
  name: string;
}

const emptyForm = {
  name: '',
  providerId: '',
  origin: '',
  destination: '',
  cityId: '',
  cityName: '',
  durationMins: 0,
  basePrice: 0,
  pricePerExtra: 0,
  includes: '',
  notes: '',
  active: false,
};

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ResellerOwnTransport() {
  const [transports, setTransports] = useState<OwnTransport[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [providerOptions, setProviderOptions] = useState<ProviderOption[]>([]);

  const fetchTransports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reseller/products/transport');
      const json = await res.json();
      if (json.success) setTransports(json.data);
    } catch {
      toast.error('No se pudieron cargar tus transportes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransports();
  }, [fetchTransports]);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch('/api/reseller/catalog?sourceType=provider');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setProviderOptions(json.data.map((item: any) => ({
            id: item.sourceId,
            name: item.sourceData?.name || item.customName || '',
          })));
        }
      } catch {
        // Optional helper data, form can still be completed manually.
      }
    }

    fetchProviders();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (t: OwnTransport) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      providerId: t.providerId,
      origin: t.origin,
      destination: t.destination,
      cityId: t.cityId,
      cityName: t.cityName,
      durationMins: t.durationMins,
      basePrice: t.basePrice,
      pricePerExtra: t.pricePerExtra,
      includes: t.includes.join('\n'),
      notes: t.notes,
      active: t.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (!form.providerId) {
      toast.error('El proveedor es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        providerId: form.providerId,
        origin: form.origin,
        destination: form.destination,
        cityId: form.cityId,
        cityName: form.cityName,
        durationMins: Math.round(Number(form.durationMins) || 0),
        basePrice: Math.round(Number(form.basePrice) || 0),
        pricePerExtra: Math.round(Number(form.pricePerExtra) || 0),
        includes: splitLines(form.includes),
        notes: form.notes,
        active: form.active,
      };

      const url = editingId
        ? `/api/reseller/products/transport/${editingId}`
        : '/api/reseller/products/transport';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingId ? 'Transporte actualizado' : 'Transporte creado');
        setDialogOpen(false);
        fetchTransports();
      } else {
        toast.error(json.error || 'No se pudo guardar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (t: OwnTransport) => {
    try {
      const res = await fetch(`/api/reseller/products/transport/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !t.active }),
      });
      const json = await res.json();
      if (json.success) {
        setTransports((prev) =>
          prev.map((item) => (item.id === t.id ? { ...item, active: !item.active } : item)),
        );
        toast.success(t.active ? 'Despublicado' : 'Publicado');
      } else {
        toast.error(json.error || 'No se pudo actualizar');
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este transporte? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/reseller/products/transport/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setTransports((prev) => prev.filter((t) => t.id !== id));
        toast.success('Transporte eliminado');
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
          <h2 className="text-lg font-bold text-gray-900">Tus transportes propios</h2>
          <p className="text-sm text-gray-500">
            Crea y gestiona tus propios servicios de transporte. Al publicarlos, aparecen en tu tienda.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="size-4" />
          Nuevo transporte
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : transports.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center">
          <Bus className="mx-auto size-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            Aún no has creado transportes propios
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Crea tu primer servicio de transporte para ofrecerlo a tus clientes.
          </p>
          <Button onClick={openCreateDialog} className="mt-4 gap-2" size="sm">
            <Plus className="size-3.5" />
            Crear transporte
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {transports.map((t) => (
            <Card key={t.id} className="overflow-hidden">
              <div className="relative h-24 bg-primary/5">
                <div className="flex h-full w-full items-center justify-center">
                  <Bus className="size-8 text-primary/30" />
                </div>
                <Badge
                  className={`absolute right-2 top-2 ${
                    t.active
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {t.active ? 'Publicado' : 'Borrador'}
                </Badge>
              </div>
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {t.origin && t.destination && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {t.origin} → {t.destination}
                      </span>
                    )}
                    {t.durationMins > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {t.durationMins} min
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(t.basePrice)}
                  {t.pricePerExtra > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      +{formatCurrency(t.pricePerExtra)} / extra
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleToggleActive(t)}
                  >
                    {t.active ? (
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
                    onClick={() => openEditDialog(t)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:text-red-700"
                    disabled={deletingId === t.id}
                    onClick={() => handleDelete(t.id)}
                  >
                    {deletingId === t.id ? (
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
            <DialogTitle>{editingId ? 'Editar transporte' : 'Nuevo transporte'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifica los datos de tu transporte.'
                : 'Completa los datos para crear un servicio de transporte propio.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="tr-name">Nombre *</Label>
                <Input
                  id="tr-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Transfer Aeropuerto"
                />
              </div>

              {providerOptions.length > 0 && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="tr-provider">Proveedor *</Label>
                  <Select value={form.providerId || undefined} onValueChange={(value) => setForm((f) => ({ ...f, providerId: value }))}>
                    <SelectTrigger id="tr-provider">
                      <SelectValue placeholder="Selecciona un proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {providerOptions.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {providerOptions.length === 0 && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="tr-provider-id">ID Proveedor *</Label>
                  <Input
                    id="tr-provider-id"
                    value={form.providerId}
                    onChange={(e) => setForm((f) => ({ ...f, providerId: e.target.value }))}
                    placeholder="ID del proveedor"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="tr-origin">Origen</Label>
                <Input
                  id="tr-origin"
                  value={form.origin}
                  onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                  placeholder="Ej: Aeropuerto"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tr-dest">Destino</Label>
                <Input
                  id="tr-dest"
                  value={form.destination}
                  onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                  placeholder="Ej: Hotel Cartagena"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tr-city">Ciudad</Label>
                <Input
                  id="tr-city"
                  value={form.cityName}
                  onChange={(e) => setForm((f) => ({ ...f, cityName: e.target.value }))}
                  placeholder="Ej: Cartagena"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tr-duration">Duración (min)</Label>
                <Input
                  id="tr-duration"
                  type="number"
                  min={0}
                  value={form.durationMins}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, durationMins: Number(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tr-price">Precio base</Label>
                <Input
                  id="tr-price"
                  type="number"
                  min={0}
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, basePrice: Number(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tr-extra">Precio por extra</Label>
                <Input
                  id="tr-extra"
                  type="number"
                  min={0}
                  value={form.pricePerExtra}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, pricePerExtra: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tr-incl">Incluye (uno por línea)</Label>
              <Textarea
                id="tr-incl"
                value={form.includes}
                onChange={(e) => setForm((f) => ({ ...f, includes: e.target.value }))}
                rows={3}
                placeholder="Equipaje&#10;Aire acondicionado&#10;Agua"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tr-notes">Notas</Label>
              <Textarea
                id="tr-notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Información adicional sobre el servicio..."
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <Checkbox
                id="tr-active"
                checked={form.active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, active: checked === true }))
                }
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="tr-active" className="cursor-pointer text-sm font-medium">
                  Publicar transporte
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
              {editingId ? 'Guardar cambios' : 'Crear transporte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Plus, Search, Pencil, Trash2, Star, MapPin, Upload, ImagePlus, X, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  getPackageRelationSelectorSmokeState,
  normalizePackageRelationOptions,
  toggleSelectedId,
  type PackageRelationOption,
} from '@/lib/admin/package-relation-ui';

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
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(emptyDestination);

  // Relational options
  const [packageOptions, setPackageOptions] = useState<PackageRelationOption[]>([]);
  const [hotelOptions, setHotelOptions] = useState<PackageRelationOption[]>([]);
  const [excursionOptions, setExcursionOptions] = useState<PackageRelationOption[]>([]);
  const [transportOptions, setTransportOptions] = useState<PackageRelationOption[]>([]);

  // Selected relational IDs for current destination
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([]);
  const [selectedExcursionIds, setSelectedExcursionIds] = useState<string[]>([]);
  const [selectedTransportIds, setSelectedTransportIds] = useState<string[]>([]);

  const [selectorLoading, setSelectorLoading] = useState<Record<string, boolean>>({});
  const [selectorErrors, setSelectorErrors] = useState<Record<string, string | null>>({});

  const fetchDestinationRelations = useCallback(async (destinationId: string) => {
    try {
      const res = await fetch(`/api/admin/destinations/${destinationId}/relations`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) return;
      
      const rels = json.data;
      setSelectedPackageIds((rels.packages || []).map((r: any) => r.packageId));
      setSelectedHotelIds((rels.hotels || []).map((r: any) => r.hotelId));
      setSelectedExcursionIds((rels.excursions || []).map((r: any) => r.excursionId));
      setSelectedTransportIds((rels.transportServices || []).map((r: any) => r.transportServiceId));
    } catch (err) {
      console.error('Error fetching destination relations:', err);
    }
  }, []);

  const fetchRelationOptions = useCallback(async (
    key: 'packages' | 'hotels' | 'excursions' | 'transportServices',
    url: string,
    setter: (options: PackageRelationOption[]) => void,
  ) => {
    setSelectorLoading((prev) => ({ ...prev, [key]: true }));
    setSelectorErrors((prev) => ({ ...prev, [key]: null }));
    try {
      const res = await fetch(url);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.error || 'Error al cargar opciones');
      setter(normalizePackageRelationOptions(json));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar opciones';
      setSelectorErrors((prev) => ({ ...prev, [key]: msg }));
    } finally {
      setSelectorLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  useEffect(() => {
    if (!dialogOpen) return;
    fetchRelationOptions('packages', '/api/admin/relation-options/packages?active=all', setPackageOptions);
    fetchRelationOptions('hotels', '/api/admin/relation-options/hotels?active=all', setHotelOptions);
    fetchRelationOptions('excursions', '/api/admin/relation-options/excursions?active=all', setExcursionOptions);
    fetchRelationOptions('transportServices', '/api/admin/relation-options/transport-services?active=all', setTransportOptions);
  }, [dialogOpen, fetchRelationOptions]);

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
    setSelectedPackageIds([]);
    setSelectedHotelIds([]);
    setSelectedExcursionIds([]);
    setSelectedTransportIds([]);
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
    setSelectedPackageIds([]);
    setSelectedHotelIds([]);
    setSelectedExcursionIds([]);
    setSelectedTransportIds([]);
    setDialogOpen(true);
    fetchDestinationRelations(dest.id);
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
      formData.append('folder', 'destinations');

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
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!form.region.trim()) {
      toast.error('La región es obligatoria');
      return;
    }
    if (!form.description.trim()) {
      toast.error('La descripción es obligatoria');
      return;
    }
    if (!form.image.trim()) {
      toast.error('La imagen es obligatoria');
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

      const saved = await res.json();
      const destId = saved?.data?.id ?? editingId;
      if (!destId) throw new Error('No se pudo resolver el destino guardado');

      const relationRes = await fetch(`/api/admin/destinations/${destId}/relations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageIds: selectedPackageIds,
          hotelIds: selectedHotelIds,
          excursionIds: selectedExcursionIds,
          transportServiceIds: selectedTransportIds,
        }),
      });
      if (!relationRes.ok) {
        const data = await relationRes.json().catch(() => ({}));
        throw new Error(data.error || 'El destino se guardó, pero no se pudieron guardar las relaciones');
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

  const toggleRelation = (key: 'packages' | 'hotels' | 'excursions' | 'transportServices', id: string) => {
    if (key === 'packages') {
      setSelectedPackageIds((prev) => toggleSelectedId(prev, id));
    } else if (key === 'hotels') {
      setSelectedHotelIds((prev) => toggleSelectedId(prev, id));
    } else if (key === 'excursions') {
      setSelectedExcursionIds((prev) => toggleSelectedId(prev, id));
    } else if (key === 'transportServices') {
      setSelectedTransportIds((prev) => toggleSelectedId(prev, id));
    }
  };

  const renderOptionGroup = (
    key: 'packages' | 'hotels' | 'excursions' | 'transportServices',
    label: string,
    options: PackageRelationOption[],
    selectedIds: string[],
    ctaHref: string,
    ctaLabel: string,
  ) => {
    const selectorState = getPackageRelationSelectorSmokeState({
      options,
      selectedIds,
      isLoading: Boolean(selectorLoading[key]),
      error: selectorErrors[key],
      createCtaHref: ctaHref,
      createCtaLabel: ctaLabel,
    });

    const setters = {
      packages: setPackageOptions,
      hotels: setHotelOptions,
      excursions: setExcursionOptions,
      transportServices: setTransportOptions,
    };

    return (
      <div className="rounded-md border border-border p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="font-semibold text-neutral-800">{label}</Label>
          {selectorState.hasRetry && (
            <Button type="button" variant="outline" size="sm" onClick={() => {
              const urls = {
                packages: '/api/admin/relation-options/packages?active=all',
                hotels: '/api/admin/relation-options/hotels?active=all',
                excursions: '/api/admin/relation-options/excursions?active=all',
                transportServices: '/api/admin/relation-options/transport-services?active=all',
              };
              if (urls[key]) fetchRelationOptions(key, urls[key], setters[key]);
            }}>
              <RefreshCw className="w-3 h-3 mr-1" /> Reintentar
            </Button>
          )}
        </div>
        {selectorState.status === 'loading' && <p className="text-xs text-muted-foreground">{selectorState.statusLabel}</p>}
        {selectorState.status === 'error' && <p className="text-xs text-destructive">{selectorState.statusLabel}</p>}
        {selectorState.status === 'empty' && selectorState.createCta && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{selectorState.statusLabel}</span>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={selectorState.createCta.href}><ExternalLink className="w-3 h-3 mr-1" /> {selectorState.createCta.label}</a>
            </Button>
          </div>
        )}
        {selectorState.status === 'ready' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {selectorState.options.map((option) => (
              <label key={option.id} className="flex items-start gap-2 rounded border border-border/60 p-2 text-xs hover:bg-neutral-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  checked={option.selected}
                  onChange={() => toggleRelation(key, option.id)}
                />
                <span>
                  <span className="font-medium text-foreground">{option.label}</span>
                  {option.subtitle && <span className="block text-muted-foreground text-[10px]">{option.subtitle}</span>}
                  {option.stateLabel && <span className="block text-muted-foreground text-[10px]">{option.stateLabel}</span>}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Destinos
          </h1>
          <p className="mt-1">
            Gestiona los destinos turísticos de Colombia
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="default">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Destino
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
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {search ? 'No se encontraron resultados' : 'No hay destinos registrados'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((dest) => (
                      <TableRow key={dest.id}>
                        <TableCell className="font-medium text-sm">{dest.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{dest.region}</TableCell>
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
                                ? 'bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/10 text-xs'
                                : 'bg-muted text-muted-foreground hover:bg-muted text-xs'
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
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleOpenEdit(dest)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto admin-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Destino' : 'Nuevo Destino'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'Modifica los datos del destino' : 'Completa los datos para crear un nuevo destino'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="form-section-title">Información principal</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dest-name" className="label-required">Nombre</Label>
                <Input
                  id="dest-name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Ej: Cartagena de Indias"
                />
              </div>
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <Label htmlFor="dest-region" className="label-required">Región</Label>
                <Input
                  id="dest-region"
                  value={form.region}
                  onChange={(e) => updateField('region', e.target.value)}
                  placeholder="Ej: Caribe, Andina"
                />
              </div>
              <div className="space-y-1.5">
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

            <div className="space-y-1.5">
              <Label htmlFor="dest-description" className="label-required">Descripción</Label>
              <Textarea
                id="dest-description"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Descripción del destino..."
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="label-required">Imagen</Label>
              {form.image ? (
                <div className="relative group rounded-lg overflow-hidden border border-border">
                  <img
                    src={form.image}
                    alt="Vista previa"
                    className="w-full h-36 object-cover"
                    onError={(e) => {
                      const img = e.currentTarget
                      if (img.dataset.fallbackApplied === 'true') return
                      img.dataset.fallbackApplied = 'true'
                      img.src = '/images/hero.png'
                    }}
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
                        <span className="text-primary font-medium">haz clic para seleccionar</span>
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF (máx. 5 MB)</p>
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

            <div className="space-y-1.5">
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
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <Label htmlFor="dest-reviews">Cantidad Reviews</Label>
                <Input
                  id="dest-reviews"
                  type="number"
                  value={form.reviewCount}
                  onChange={(e) => updateField('reviewCount', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dest-order">Orden</Label>
                <Input
                  id="dest-order"
                  type="number"
                  value={form.order}
                  onChange={(e) => updateField('order', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <div className="form-section-title">Composición relacional del destino</div>
                <p className="text-xs text-muted-foreground">
                  Asocia paquetes, hoteles, excursiones y servicios de transporte a este destino.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {renderOptionGroup('packages', 'Paquetes en destino', packageOptions, selectedPackageIds, '/admin/paquetes', 'Crear paquete')}
                {renderOptionGroup('hotels', 'Hoteles en destino', hotelOptions, selectedHotelIds, '/admin/hoteles', 'Crear hotel')}
                {renderOptionGroup('excursions', 'Excursiones en destino', excursionOptions, selectedExcursionIds, '/admin/excursiones', 'Crear excursión')}
                {renderOptionGroup('transportServices', 'Transporte en destino', transportOptions, selectedTransportIds, '/admin/transportes/servicios', 'Crear servicio')}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => updateField('active', checked)}
              />
              <Label>Activo</Label>
            </div>

            <div className="dialog-footer">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} size="default">
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="admin-dialog">
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

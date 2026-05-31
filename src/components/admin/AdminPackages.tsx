'use client';
import { formatCurrency } from '@/lib/currency'


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
;
import { Plus, Search, Pencil, Trash2, Star, Package, Upload, ImagePlus, X, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  buildPackageRelationsPayload,
  findPackageDestinationOption,
  getPackageRelationSelectorSmokeState,
  keepIdsPresentInOptions,
  normalizePackageDestinationOptions,
  normalizePackageRelationOptions,
  selectedIdsFromPackageRelations,
  toggleSelectedId,
  type PackageCompositionSelection,
  type PackageDestinationOption,
  type PackageRelationOption,
} from '@/lib/admin/package-relation-ui';

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
  resellerId?: string | null;
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
  resellerId: '',
};

const categories = ['Aventura', 'Relax', 'Cultural', 'Naturaleza', 'Playa'];
const difficulties = ['Fácil', 'Moderado', 'Avanzado'];
const emptyCompositionSelection: PackageCompositionSelection = {
  destinationId: '',
  hotelIds: [],
  roomTypeIds: [],
  excursionIds: [],
  transportServiceIds: [],
};

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
  const [imageError, setImageError] = useState(false);
  const [destinationOptions, setDestinationOptions] = useState<PackageDestinationOption[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [destinationsError, setDestinationsError] = useState<string | null>(null);
  const [resellers, setResellers] = useState<any[]>([]);
  const [composition, setComposition] = useState<PackageCompositionSelection>(emptyCompositionSelection);
  const [hotelOptions, setHotelOptions] = useState<PackageRelationOption[]>([]);
  const [roomTypeOptions, setRoomTypeOptions] = useState<PackageRelationOption[]>([]);
  const [excursionOptions, setExcursionOptions] = useState<PackageRelationOption[]>([]);
  const [transportOptions, setTransportOptions] = useState<PackageRelationOption[]>([]);
  const [selectorLoading, setSelectorLoading] = useState<Record<string, boolean>>({});
  const [selectorErrors, setSelectorErrors] = useState<Record<string, string | null>>({});
  const [departureDatesStr, setDepartureDatesStr] = useState('');

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

  const fetchDestinationOptions = useCallback(async () => {
    setDestinationsLoading(true);
    setDestinationsError(null);
    try {
      const res = await fetch('/api/admin/relation-options/destinations?active=all');
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.error || 'Error al cargar destinos');
      }
      setDestinationOptions(normalizePackageDestinationOptions(json));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar destinos';
      setDestinationsError(msg);
    } finally {
      setDestinationsLoading(false);
    }
  }, []);

  const fetchRelationOptions = useCallback(async (
    key: 'hotels' | 'roomTypes' | 'excursions' | 'transportServices',
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

  const fetchResellers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/resellers');
      if (!res.ok) throw new Error('Error al cargar revendedores');
      const json = await res.json();
      setResellers(json.data || json);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      fetchDestinationOptions();
      fetchResellers();
    }
  }, [dialogOpen, fetchDestinationOptions, fetchResellers]);

  const selectedHotelForRoomTypes = composition.hotelIds[0];

  useEffect(() => {
    if (!dialogOpen) return;
    const destinationQuery = form.destinationId ? `&destinationId=${encodeURIComponent(form.destinationId)}` : '';
    fetchRelationOptions('hotels', `/api/admin/relation-options/hotels?active=all${destinationQuery}`, setHotelOptions);
    fetchRelationOptions('excursions', `/api/admin/relation-options/excursions?active=all${destinationQuery}`, setExcursionOptions);
    fetchRelationOptions('transportServices', `/api/admin/relation-options/transport-services?active=all${destinationQuery}`, setTransportOptions);
  }, [dialogOpen, form.destinationId, fetchRelationOptions]);

  useEffect(() => {
    if (!dialogOpen) return;
    if (!selectedHotelForRoomTypes) {
      setRoomTypeOptions([]);
      return;
    }
    fetchRelationOptions(
      'roomTypes',
      `/api/admin/relation-options/room-types?active=all&hotelId=${encodeURIComponent(selectedHotelForRoomTypes)}`,
      setRoomTypeOptions,
    );
  }, [dialogOpen, selectedHotelForRoomTypes, fetchRelationOptions]);

  useEffect(() => {
    setComposition((prev) => ({
      ...prev,
      hotelIds: keepIdsPresentInOptions(prev.hotelIds, hotelOptions),
      roomTypeIds: keepIdsPresentInOptions(prev.roomTypeIds, roomTypeOptions),
      excursionIds: keepIdsPresentInOptions(prev.excursionIds, excursionOptions),
      transportServiceIds: keepIdsPresentInOptions(prev.transportServiceIds, transportOptions),
    }));
  }, [hotelOptions, roomTypeOptions, excursionOptions, transportOptions]);

  const fetchPackageDestinationRelation = useCallback(async (packageId: string) => {
    try {
      const res = await fetch(`/api/admin/packages/${packageId}/relations`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) return;
      const destination = json.data?.destinations?.[0]?.destination;
      setComposition((prev) => ({
        ...prev,
        hotelIds: selectedIdsFromPackageRelations(json.data, 'hotels', 'hotel'),
        roomTypeIds: selectedIdsFromPackageRelations(json.data, 'roomTypes', 'roomType'),
        excursionIds: selectedIdsFromPackageRelations(json.data, 'excursions', 'excursion'),
        transportServiceIds: selectedIdsFromPackageRelations(json.data, 'transportServices', 'transportService'),
      }));
      if (destination?.id && destination?.name) {
        setForm((prev) => ({ ...prev, destinationId: destination.id, destinationName: destination.name }));
        setComposition((prev) => ({ ...prev, destinationId: destination.id }));
      }
    } catch {
      // Keep legacy destination snapshots visible if relation loading fails.
    }
  }, []);

  const filtered = packages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.destinationName.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ ...emptyPackage });
    setComposition({ ...emptyCompositionSelection });
    setDepartureDatesStr('');
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
      resellerId: pkg.resellerId ?? '',
    });
    setComposition({ ...emptyCompositionSelection, destinationId: pkg.destinationId });
    setDepartureDatesStr(pkg.departureDates.join(', '));
    setDialogOpen(true);
    fetchPackageDestinationRelation(pkg.id);
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
      setImageError(false);
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
    if (destinationsError) {
      toast.error('No se puede guardar hasta recuperar el selector de destino');
      return;
    }
    if (Object.values(selectorErrors).some(Boolean)) {
      toast.error('No se puede guardar hasta recuperar los selectores de composición');
      return;
    }
    if (!form.destinationId.trim()) {
      toast.error('Selecciona un destino válido');
      return;
    }
    if (!selectedDestination) {
      toast.error('Selecciona un destino de la lista relacional antes de guardar');
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
      const saved = await res.json();
      const packageId = saved?.data?.id ?? editingId;
      if (!packageId) throw new Error('No se pudo resolver el paquete guardado');

      const relationRes = await fetch(`/api/admin/packages/${packageId}/relations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPackageRelationsPayload({ ...composition, destinationId: form.destinationId })),
      });
      if (!relationRes.ok) {
        const data = await relationRes.json().catch(() => ({}));
        throw new Error(data.error || 'El paquete se guardó, pero no se pudo guardar la relación de destino');
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

  const selectedDestination = findPackageDestinationOption(destinationOptions, form.destinationId);

  const toggleComposition = (key: keyof Omit<PackageCompositionSelection, 'destinationId'>, id: string) => {
    setComposition((prev) => ({ ...prev, [key]: toggleSelectedId(prev[key], id) }));
  };

  const renderOptionGroup = (
    key: 'hotels' | 'roomTypes' | 'excursions' | 'transportServices',
    label: string,
    options: PackageRelationOption[],
    selectedIds: string[],
    selectionKey: keyof Omit<PackageCompositionSelection, 'destinationId'>,
    ctaHref: string,
    ctaLabel: string,
    disabledMessage?: string,
  ) => {
    const selectorState = getPackageRelationSelectorSmokeState({
      options,
      selectedIds,
      isLoading: Boolean(selectorLoading[key]),
      error: selectorErrors[key],
      disabledMessage,
      createCtaHref: ctaHref,
      createCtaLabel: ctaLabel,
    });
    return (
      <div className="rounded-md border border-border p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label>{label}</Label>
          {selectorState.hasRetry && (
            <Button type="button" variant="outline" size="sm" onClick={() => {
              const destinationQuery = form.destinationId ? `&destinationId=${encodeURIComponent(form.destinationId)}` : '';
              const urls = {
                hotels: `/api/admin/relation-options/hotels?active=all${destinationQuery}`,
                roomTypes: selectedHotelForRoomTypes ? `/api/admin/relation-options/room-types?active=all&hotelId=${encodeURIComponent(selectedHotelForRoomTypes)}` : '',
                excursions: `/api/admin/relation-options/excursions?active=all${destinationQuery}`,
                transportServices: `/api/admin/relation-options/transport-services?active=all${destinationQuery}`,
              };
              const setters = { hotels: setHotelOptions, roomTypes: setRoomTypeOptions, excursions: setExcursionOptions, transportServices: setTransportOptions };
              if (urls[key]) fetchRelationOptions(key, urls[key], setters[key]);
            }}>
              <RefreshCw className="w-3 h-3 mr-1" /> Reintentar
            </Button>
          )}
        </div>
        {selectorState.status === 'disabled' && <p className="text-xs text-muted-foreground">{selectorState.statusLabel}</p>}
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
              <label key={option.id} className="flex items-start gap-2 rounded border border-border/60 p-2 text-xs">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={option.selected}
                  onChange={() => toggleComposition(selectionKey, option.id)}
                />
                <span>
                  <span className="font-medium text-foreground">{option.label}</span>
                  {option.subtitle && <span className="block text-muted-foreground">{option.subtitle}</span>}
                  {option.stateLabel && <span className="block text-muted-foreground">{option.stateLabel}</span>}
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
            <Package className="w-6 h-6 text-primary" />
            Paquetes
          </h1>
          <p className="mt-1">
            Gestiona los paquetes turísticos disponibles
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="default">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Paquete
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        {search ? 'No se encontraron resultados' : 'No hay paquetes registrados'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium text-sm max-w-[200px] truncate">
                          {pkg.title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{pkg.destinationName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {pkg.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {pkg.duration}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">{formatCurrency(pkg.price)}</span>
                            {pkg.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatCurrency(pkg.originalPrice)}
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
                            <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 text-xs">
                              Agotado
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/10 text-xs">
                              Disponible
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-primary">{pkg.commission}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleOpenEdit(pkg)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto admin-dialog">
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
              <div className="form-section-title">Información Básica</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-title" className="label-required">Título</Label>
                  <Input
                    id="pkg-title"
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Cartagena Romántica"
                  />
                </div>
                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-destination" className="label-required">Destino relacional</Label>
                  <select
                    id="pkg-destination"
                    value={form.destinationId}
                    onChange={(e) => {
                      const option = findPackageDestinationOption(destinationOptions, e.target.value);
                      updateField('destinationId', option?.id ?? '');
                      updateField('destinationName', option?.label ?? '');
                      setComposition((prev) => ({
                        ...prev,
                        destinationId: option?.id ?? '',
                        hotelIds: [],
                        roomTypeIds: [],
                        excursionIds: [],
                        transportServiceIds: [],
                      }));
                    }}
                    disabled={destinationsLoading || Boolean(destinationsError)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecciona un destino</option>
                    {destinationOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}{option.isTemplate ? ' · plantilla' : ''}{option.active ? '' : ' · inactivo'}
                      </option>
                    ))}
                  </select>
                  {destinationsLoading && <p className="text-xs text-muted-foreground">Cargando destinos...</p>}
                  {!destinationsLoading && destinationsError && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <span>{destinationsError}</span>
                      <Button type="button" variant="outline" size="sm" onClick={fetchDestinationOptions}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Reintentar
                      </Button>
                    </div>
                  )}
                  {!destinationsLoading && !destinationsError && destinationOptions.length === 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>No hay destinos compatibles.</span>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <a href="/admin/destinos"><ExternalLink className="w-3 h-3 mr-1" /> Crear destino</a>
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-dest-name">Nombre Destino (snapshot)</Label>
                  <Input
                    id="pkg-dest-name"
                    value={selectedDestination?.label ?? form.destinationName}
                    readOnly
                    placeholder="Se completa al seleccionar destino"
                  />
                  <p className="text-xs text-muted-foreground">El ID real se guarda desde el selector; este nombre queda como etiqueta compatible.</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="form-section-title">Composición relacional del paquete</div>
                  <p className="text-xs text-muted-foreground">
                    Selecciona entidades reales desde APIs de relación. Los campos legacy de descripción, incluye y fechas se conservan como snapshots compatibles.
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {renderOptionGroup('hotels', 'Hoteles', hotelOptions, composition.hotelIds, 'hotelIds', '/admin/hoteles', 'Crear hotel')}
                  {renderOptionGroup(
                    'roomTypes',
                    'Tipos de habitación',
                    roomTypeOptions,
                    composition.roomTypeIds,
                    'roomTypeIds',
                    '/admin/habitaciones',
                    'Crear habitación',
                    selectedHotelForRoomTypes ? undefined : 'Selecciona primero un hotel para cargar sus habitaciones.',
                  )}
                  {renderOptionGroup('excursions', 'Excursiones', excursionOptions, composition.excursionIds, 'excursionIds', '/admin/excursiones', 'Crear excursión')}
                  {renderOptionGroup('transportServices', 'Servicios de transporte', transportOptions, composition.transportServiceIds, 'transportServiceIds', '/admin/transportes/servicios', 'Crear transporte')}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-category">Categoría</Label>
                  <select
                    id="pkg-category"
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-duration">Duración</Label>
                  <Input
                    id="pkg-duration"
                    value={form.duration}
                    onChange={(e) => updateField('duration', e.target.value)}
                    placeholder="4 días / 3 noches"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-difficulty">Dificultad</Label>
                  <select
                    id="pkg-difficulty"
                    value={form.difficulty}
                    onChange={(e) => updateField('difficulty', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-group">Tamaño Grupo</Label>
                  <Input
                    id="pkg-group"
                    value={form.groupSize}
                    onChange={(e) => updateField('groupSize', e.target.value)}
                    placeholder="2 – 8 personas"
                  />
                </div>
                <div className="space-y-1.5">
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
              <div className="form-section-title">Descripción</div>
              <Textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Descripción detallada del paquete..."
                rows={4}
              />
            </div>

            {/* Pricing */}
            <div>
              <div className="form-section-title">Precios y Comisión</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pkg-price">Precio (COP)</Label>
                  <Input
                    id="pkg-price"
                    type="number"
                    value={form.price}
                    onChange={(e) => updateField('price', Number(e.target.value))}
                    placeholder="1250000"
                  />
                </div>
                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
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
              <div className="form-section-title">Imagen</div>
              {form.image ? (
                <div className="relative group rounded-lg overflow-hidden border border-border">
                  {!imageError ? (
                    <img
                      src={form.image}
                      alt="Vista previa"
                      className="w-full h-36 object-cover"
                      onError={() => setImageError(true)}
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
                      onClick={() => { setImageError(false); imageInputRef.current?.click(); }}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Cambiar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => { updateField('image', ''); setImageError(false); }}
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

            {/* Includes */}
            <div>
              <div className="form-section-title">Qué Incluye</div>
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
              <p className="text-xs text-muted-foreground mt-1">Un item por línea</p>
            </div>

            {/* Departure Dates */}
            <div>
              <div className="form-section-title">Fechas de Salida</div>
              <Input
                value={departureDatesStr}
                onChange={(e) => {
                  setDepartureDatesStr(e.target.value);
                  updateField(
                    'departureDates',
                    e.target.value.split(',').map((d) => d.trim()).filter(Boolean)
                  );
                }}
                placeholder="2025-07-15, 2025-08-10, 2025-09-05"
              />
              <p className="text-xs text-muted-foreground mt-1">Fechas separadas por coma (YYYY-MM-DD)</p>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="package-reseller">Asignar a Revendedor</Label>
              <select
                id="package-reseller"
                value={form.resellerId ?? ''}
                onChange={(e) => updateField('resellerId', e.target.value || '')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Ninguno / Global (Administrador)</option>
                {resellers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.companyName || r.contactName || r.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Si se asigna a un revendedor, solo ese revendedor podrá ver y revender este paquete.
              </p>
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
            <AlertDialogTitle>¿Eliminar paquete?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El paquete será eliminado permanentemente.
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

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Compass,
  Star,
  X,
  Upload,
  ImagePlus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  buildExcursionDestinationCompatibilityFields,
  findExcursionDestinationOption,
  getExcursionDestinationSelectorState,
  normalizeExcursionDestinationOptions,
  type ExcursionDestinationOption,
} from '@/lib/admin/excursion-destination-ui';

// ─── Types ───────────────────────────────────────────────────────

interface Excursion {
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
  rating: number;
  featured: boolean;
  active: boolean;
}

// ─── Defaults ────────────────────────────────────────────────────

const emptyExcursion = {
  slug: '',
  name: '',
  destinationId: '',
  destinationName: '',
  cityName: '',
  description: '',
  shortDesc: '',
  images: [] as string[],
  duration: '3 horas',
  difficulty: 'Fácil',
  groupSize: '20 personas',
  basePrice: 0,
  childPrice: 0,
  includes: [] as string[],
  excludes: [] as string[],
  requirements: [] as string[],
  category: 'Cultural',
  rating: 0,
  featured: false,
  active: true,
};

const difficultyOptions = ['Fácil', 'Moderado', 'Difícil'];
const categoryOptions = ['Cultural', 'Aventura', 'Naturaleza', 'Gastronomía'];

// ─── Tag Input ───────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
  placeholder = 'Agregar...',
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={!inputValue.trim()}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-1 text-xs border border-border bg-accent text-accent-foreground hover:bg-accent"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {tags.length === 0 && (
        <p className="text-xs text-muted-foreground">Presiona Enter para agregar</p>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export default function AdminExcursions() {
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(emptyExcursion);
  const [destinationOptions, setDestinationOptions] = useState<ExcursionDestinationOption[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [destinationsError, setDestinationsError] = useState<string | null>(null);

  const fetchExcursions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/excursions');
      if (!res.ok) throw new Error('Error al cargar excursiones');
      const json = await res.json();
      setExcursions(json.data || json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExcursions();
  }, [fetchExcursions]);

  const fetchDestinationOptions = useCallback(async () => {
    setDestinationsLoading(true);
    setDestinationsError(null);
    try {
      const res = await fetch('/api/admin/relation-options/destinations?active=all');
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.error || 'Error al cargar destinos');
      }
      setDestinationOptions(normalizeExcursionDestinationOptions(json));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar destinos';
      setDestinationsError(msg);
    } finally {
      setDestinationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dialogOpen) fetchDestinationOptions();
  }, [dialogOpen, fetchDestinationOptions]);

  const filtered = excursions.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setEditingId(null);
    setForm(emptyExcursion);
    setDialogOpen(true);
  };

  const handleEdit = (exc: Excursion) => {
    setEditingId(exc.id);
    setForm({
      slug: exc.slug,
      name: exc.name,
      destinationId: exc.destinationId,
      destinationName: exc.destinationName,
      cityName: exc.cityName,
      description: exc.description,
      shortDesc: exc.shortDesc,
      images: Array.isArray(exc.images) ? exc.images : [],
      duration: exc.duration,
      difficulty: exc.difficulty,
      groupSize: exc.groupSize,
      basePrice: exc.basePrice,
      childPrice: exc.childPrice,
      includes: Array.isArray(exc.includes) ? exc.includes : [],
      excludes: Array.isArray(exc.excludes) ? exc.excludes : [],
      requirements: Array.isArray(exc.requirements) ? exc.requirements : [],
      category: exc.category,
      rating: exc.rating,
      featured: exc.featured,
      active: exc.active,
    });
    setDialogOpen(true);
  };

  const handleImagesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((f) => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} no es una imagen válida`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} supera los 5 MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'excursions');

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Error al subir imagen');
        }

        const data = await res.json();
        newUrls.push(data.url);
      }
      setImgErrors(new Set());
      updateField('images', [...form.images, ...newUrls]);
      toast.success(`${newUrls.length} imagen(es) subida(s) correctamente`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir';
      toast.error(msg);
    } finally {
      setUploading(false);
      if (imagesInputRef.current) imagesInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (destinationsError) {
      toast.error('No se puede guardar hasta cargar destinos correctamente');
      return;
    }
    if (
      !form.destinationId.trim() ||
      !form.destinationName.trim() ||
      !form.cityName.trim() ||
      !findExcursionDestinationOption(destinationOptions, form.destinationId)
    ) {
      toast.error('Selecciona un destino válido');
      return;
    }
    setSaving(true);
    try {
      const isEditing = !!editingId;
      const res = await fetch(
        isEditing ? `/api/admin/excursions/${editingId}` : '/api/admin/excursions',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar');
      }
      toast.success(
        isEditing ? 'Excursión actualizada' : 'Excursión creada'
      );
      setDialogOpen(false);
      fetchExcursions();
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
      const res = await fetch(`/api/admin/excursions/${deletingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      toast.success('Excursión eliminada correctamente');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchExcursions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    }
  };

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectedDestination = findExcursionDestinationOption(destinationOptions, form.destinationId);
  const destinationSelectorState = getExcursionDestinationSelectorState({
    options: destinationOptions,
    selectedId: form.destinationId,
    isLoading: destinationsLoading,
    error: destinationsError,
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            Excursiones
          </h1>
          <p className="mt-1">
            Gestiona las excursiones y actividades disponibles
          </p>
        </div>
        <Button onClick={handleCreate} size="default">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Excursión
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar excursión..."
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
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Dificultad</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio Adulto</TableHead>
                    <TableHead>Precio Niño</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Destacado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        {search ? 'No se encontraron resultados' : 'No hay excursiones registradas'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((exc) => (
                      <TableRow key={exc.id}>
                        <TableCell className="font-medium text-sm">{exc.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{exc.cityName || '—'}</TableCell>
                        <TableCell className="text-sm">{exc.duration}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              exc.difficulty === 'Fácil'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : exc.difficulty === 'Moderado'
                                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {exc.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{exc.category}</TableCell>
                        <TableCell className="text-sm font-semibold">
                          {formatCurrency(exc.basePrice)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {exc.childPrice > 0 ? formatCurrency(exc.childPrice) : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm">{exc.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {exc.featured ? (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-xs">
                              Destacado
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {exc.active ? (
                            <Badge className="bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/10 text-xs">
                              Activo
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground hover:bg-muted text-xs">
                              Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleEdit(exc)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setDeletingId(exc.id);
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

      {/* ═══ CREATE / EDIT DIALOG ═══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent topAligned className="sm:max-w-3xl max-h-[90vh] overflow-y-auto admin-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Excursión' : 'Nueva Excursión'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifica los datos de la excursión'
                : 'Completa los datos para registrar una nueva excursión'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">Info Básica</TabsTrigger>
              <TabsTrigger value="details" className="flex-1">Detalles</TabsTrigger>
              <TabsTrigger value="includes" className="flex-1">Incluidos</TabsTrigger>
              <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
            </TabsList>

            {/* Info Básica */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Tour Ciudad Amurallada"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    placeholder="Auto-generado del nombre"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="excursion-destination">Destino relacional</Label>
                  <select
                    id="excursion-destination"
                    value={form.destinationId}
                    onChange={(e) => {
                      const option = findExcursionDestinationOption(destinationOptions, e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        ...buildExcursionDestinationCompatibilityFields(option),
                      }));
                    }}
                    disabled={destinationsLoading || Boolean(destinationsError)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecciona un destino</option>
                    {destinationSelectorState.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}{option.stateLabel ? ` · ${option.stateLabel.toLowerCase()}` : ''}
                      </option>
                    ))}
                  </select>
                  {destinationSelectorState.status === 'loading' && (
                    <p className="text-xs text-muted-foreground">{destinationSelectorState.statusLabel}</p>
                  )}
                  {destinationSelectorState.status === 'error' && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <span>{destinationSelectorState.statusLabel}</span>
                      <Button type="button" variant="outline" size="sm" onClick={fetchDestinationOptions}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Reintentar
                      </Button>
                    </div>
                  )}
                  {destinationSelectorState.status === 'empty' && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{destinationSelectorState.statusLabel}</span>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <a href={destinationSelectorState.createCta?.href ?? '/admin/destinos'}>
                          <ExternalLink className="w-3 h-3 mr-1" /> {destinationSelectorState.createCta?.label ?? 'Crear destino'}
                        </a>
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    El API actual de excursiones guarda `destinationId`, `destinationName` y `cityName` como campos de compatibilidad.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excursion-destination-name">Nombre destino / ciudad (snapshot)</Label>
                  <Input
                    id="excursion-destination-name"
                    value={selectedDestination?.label ?? (form.destinationName || form.cityName)}
                    readOnly
                    placeholder="Se completa al seleccionar destino"
                  />
                  <p className="text-xs text-muted-foreground">
                    Etiqueta de visualización; ya no es la fuente primaria manual.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Duración</Label>
                  <Input
                    value={form.duration}
                    onChange={(e) => updateField('duration', e.target.value)}
                    placeholder="3 horas"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dificultad</Label>
                  <Select
                    value={form.difficulty}
                    onValueChange={(v) => updateField('difficulty', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grupo Máximo</Label>
                  <Input
                    value={form.groupSize}
                    onChange={(e) => updateField('groupSize', e.target.value)}
                    placeholder="20 personas"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Precio Adulto (COP)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.basePrice}
                    onChange={(e) => updateField('basePrice', Number(e.target.value))}
                    placeholder="150000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio Niño (COP)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.childPrice}
                    onChange={(e) => updateField('childPrice', Number(e.target.value))}
                    placeholder="75000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating (0-10)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => updateField('rating', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => updateField('category', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.featured}
                      onCheckedChange={(v) => updateField('featured', v)}
                    />
                    <Label>Destacado</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.active}
                      onCheckedChange={(v) => updateField('active', v)}
                    />
                    <Label>Activo</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Detalles */}
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Descripción Corta</Label>
                <Textarea
                  value={form.shortDesc}
                  onChange={(e) => updateField('shortDesc', e.target.value)}
                  placeholder="Breve resumen de la excursión (1-2 líneas)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Descripción Completa</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Descripción detallada de la excursión, itinerario, puntos de interés..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Requisitos</Label>
                <TagInput
                  tags={form.requirements}
                  onChange={(v) => updateField('requirements', v)}
                  placeholder="Ej: Ropa cómoda, Protector solar..."
                />
              </div>
            </TabsContent>

            {/* Incluidos */}
            <TabsContent value="includes" className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-green-700">✓ Qué incluye</Label>
                <TagInput
                  tags={form.includes}
                  onChange={(v) => updateField('includes', v)}
                  placeholder="Ej: Guía bilingüe, Entradas, Snack..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-destructive">✗ Qué no incluye</Label>
                <TagInput
                  tags={form.excludes}
                  onChange={(v) => updateField('excludes', v)}
                  placeholder="Ej: Almuerzo, Propinas, Compras personales..."
                />
              </div>
            </TabsContent>

            {/* Media */}
            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Imágenes ({form.images.length})</Label>
                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleImagesUpload(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => imagesInputRef.current?.click()}
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
                      <p className="text-sm text-muted-foreground">Subiendo imagen(es)...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Arrastra imágenes o{' '}
                        <span className="text-primary font-medium">haz clic para seleccionar</span>
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF (máx. 5 MB cada una)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={imagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) handleImagesUpload(e.target.files);
                  }}
                  className="hidden"
                />
              </div>
              {form.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Vista previa ({form.images.length} imágenes)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                        {!imgErrors.has(idx) ? (
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => setImgErrors((prev) => new Set(prev).add(idx))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImagePlus className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setImgErrors((prev) => {
                              const next = new Set(prev);
                              next.delete(idx);
                              return next;
                            });
                            updateField(
                              'images',
                              form.images.filter((_, i) => i !== idx)
                            );
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/90"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="dialog-footer">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} size="default">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Excursión'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE DIALOG ═══ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar excursión?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La excursión será eliminada permanentemente.
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

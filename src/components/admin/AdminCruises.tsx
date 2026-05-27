'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { ImageGallery } from '@/components/admin/ImageGallery';
import { formatCOP } from '@/data/packages';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Ship,
  Star,
  X,
  RefreshCw,
  Eye,
  Settings,
  Anchor,
  Compass,
  AlertTriangle,
  Check,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────

interface Cabin {
  id?: string;
  name: string;
  capacity: number;
  beds: string;
  basePrice: number;
  originalPrice: number;
  includes: string[];
  cabinImage: string;
  active: boolean;
}

interface ItineraryStop {
  day: number;
  title: string;
  description: string;
  activity?: string;
}

interface Cruise {
  id: string;
  slug: string;
  name: string;
  description: string;
  shipName: string;
  operator: string;
  durationDays: number;
  images: string[];
  includes: string[];
  itinerary: ItineraryStop[];
  rating: number;
  reviewCount: number;
  priceFrom: number;
  tags: string[];
  featured: boolean;
  active: boolean;
  primaryDestinationId: string | null;
  cabins: Cabin[];
  destinations: string[]; // array of destinationIds
}

interface DestinationOption {
  id: string;
  name: string;
}

// ─── Defaults ────────────────────────────────────────────────────

const emptyCabin: Cabin = {
  name: '',
  capacity: 2,
  beds: '2 camas individuales',
  basePrice: 0,
  originalPrice: 0,
  includes: [],
  cabinImage: '',
  active: true,
};

const emptyCruise = {
  slug: '',
  name: '',
  description: '',
  shipName: '',
  operator: '',
  durationDays: 3,
  images: [] as string[],
  includes: [] as string[],
  itinerary: [] as ItineraryStop[],
  rating: 4.5,
  reviewCount: 10,
  priceFrom: 0,
  tags: [] as string[],
  featured: false,
  active: true,
  primaryDestinationId: null as string | null,
  cabins: [] as Cabin[],
  destinations: [] as string[],
};

// ─── Tag Input Helper ────────────────────────────────────────────

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
              className="pl-2 pr-1 py-1 gap-1 text-xs border border-border bg-accent text-accent-foreground"
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
    </div>
  );
}

export default function AdminCruises() {
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('all');

  // Form states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<typeof emptyCruise>(emptyCruise);

  // Sub-editors
  const [newStop, setNewStop] = useState<ItineraryStop>({ day: 1, title: '', description: '' });
  const [newCabin, setNewCabin] = useState<Cabin>(emptyCabin);
  
  // Cabin tag input helper state
  const [cabinIncludesInput, setCabinIncludesInput] = useState('');

  // Delete states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load Cruises & Destinations
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cruisesRes, destsRes] = await Promise.all([
        fetch('/api/admin/cruises'),
        fetch('/api/admin/destinations'),
      ]);

      const cruisesData = await cruisesRes.json();
      const destsData = await destsRes.json();

      if (cruisesData.success) {
        setCruises(cruisesData.data);
      } else {
        toast.error('Error al cargar cruceros');
      }

      if (destsData.success) {
        setDestinations(destsData.data);
      }
    } catch (error) {
      console.error('Error loading admin cruises data:', error);
      toast.error('Error de conexión al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      ...emptyCruise,
      cabins: [],
      images: [],
      includes: [],
      tags: [],
      itinerary: [],
      destinations: [],
    });
    setNewStop({ day: 1, title: '', description: '' });
    setNewCabin(emptyCabin);
    setDialogOpen(true);
  };

  const handleOpenEdit = async (cruise: Cruise) => {
    setIsEditing(true);
    setEditingId(cruise.id);
    setFormData({
      slug: cruise.slug,
      name: cruise.name,
      description: cruise.description || '',
      shipName: cruise.shipName || '',
      operator: cruise.operator || '',
      durationDays: cruise.durationDays || 3,
      images: cruise.images || [],
      includes: cruise.includes || [],
      itinerary: cruise.itinerary || [],
      rating: cruise.rating || 4.5,
      reviewCount: cruise.reviewCount || 10,
      priceFrom: cruise.priceFrom || 0,
      tags: cruise.tags || [],
      featured: cruise.featured || false,
      active: cruise.active !== false,
      primaryDestinationId: cruise.primaryDestinationId || '',
      cabins: cruise.cabins || [],
      destinations: cruise.destinations || [],
    });
    setNewStop({ day: (cruise.itinerary?.length || 0) + 1, title: '', description: '' });
    setNewCabin(emptyCabin);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('El nombre del crucero es requerido');
      return;
    }

    try {
      // Auto-calculate base price from lowest cabin price
      let basePrice = formData.priceFrom;
      if (formData.cabins.length > 0) {
        const activeCabins = formData.cabins.filter(c => c.active);
        const cabToEvaluate = activeCabins.length > 0 ? activeCabins : formData.cabins;
        basePrice = Math.min(...cabToEvaluate.map(c => c.basePrice));
      }

      const payload = {
        ...formData,
        priceFrom: basePrice,
      };

      const url = isEditing ? `/api/admin/cruises/${editingId}` : '/api/admin/cruises';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (resData.success) {
        toast.success(isEditing ? 'Crucero actualizado con éxito' : 'Crucero creado con éxito');
        setDialogOpen(false);
        fetchData();
      } else {
        toast.error(resData.error || 'Error al guardar crucero');
      }
    } catch (error) {
      console.error('Error saving cruise:', error);
      toast.error('Error al guardar crucero');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/admin/cruises/${deletingId}`, {
        method: 'DELETE',
      });

      const resData = await res.json();

      if (resData.success) {
        toast.success('Crucero eliminado con éxito');
        setDeleteOpen(false);
        setDeletingId(null);
        fetchData();
      } else {
        toast.error(resData.error || 'Error al eliminar crucero');
      }
    } catch (error) {
      console.error('Error deleting cruise:', error);
      toast.error('Error de red al eliminar crucero');
    }
  };

  // Itinerary Stops Handlers
  const addStop = () => {
    if (!newStop.title || !newStop.description) {
      toast.error('Ingrese el título y la descripción de la parada');
      return;
    }
    const updatedItinerary = [...formData.itinerary, newStop].sort((a, b) => a.day - b.day);
    setFormData({
      ...formData,
      itinerary: updatedItinerary,
    });
    setNewStop({ day: updatedItinerary.length + 1, title: '', description: '' });
  };

  const removeStop = (index: number) => {
    setFormData({
      ...formData,
      itinerary: formData.itinerary.filter((_, i) => i !== index),
    });
  };

  // Cabins Handlers
  const addCabin = () => {
    if (!newCabin.name || newCabin.basePrice <= 0) {
      toast.error('Nombre de camarote y precio base son obligatorios');
      return;
    }

    setFormData({
      ...formData,
      cabins: [...formData.cabins, newCabin],
    });
    setNewCabin(emptyCabin);
    setCabinIncludesInput('');
  };

  const removeCabin = (index: number) => {
    setFormData({
      ...formData,
      cabins: formData.cabins.filter((_, i) => i !== index),
    });
  };

  const updateCabinField = (index: number, field: keyof Cabin, value: any) => {
    const updatedCabins = [...formData.cabins];
    updatedCabins[index] = {
      ...updatedCabins[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      cabins: updatedCabins,
    });
  };

  // Destinations Handlers
  const handleToggleDestination = (destId: string) => {
    const current = formData.destinations;
    const updated = current.includes(destId)
      ? current.filter(id => id !== destId)
      : [...current, destId];
    
    setFormData({
      ...formData,
      destinations: updated,
    });
  };

  // Filters
  const filteredCruises = cruises.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.shipName.toLowerCase().includes(search.toLowerCase()) ||
      c.operator.toLowerCase().includes(search.toLowerCase());

    const matchesDest =
      destinationFilter === 'all' ||
      c.destinations.includes(destinationFilter) ||
      c.primaryDestinationId === destinationFilter;

    return matchesSearch && matchesDest;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <Anchor className="w-8 h-8 text-sky-600" />
            Gestión de Cruceros
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Administra los cruceros, camarotes, itinerarios y asigna destinos en el portal.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/95 text-white gap-2 shadow-md">
          <Plus className="w-5 h-5" />
          Crear Crucero
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="shadow-xs border-border/40 bg-card/60 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, barco u operador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={destinationFilter} onOpenChange={() => {}} onValueChange={setDestinationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los destinos</SelectItem>
                {destinations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" onClick={fetchData} title="Refrescar datos">
            <RefreshCw className="w-4.5 h-4.5" />
          </Button>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="shadow-sm border-border/40 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : filteredCruises.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Ship className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-lg">No se encontraron cruceros</h3>
            <p className="text-sm mt-1">Crea un crucero o ajusta tus filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crucero</TableHead>
                  <TableHead>Operador / Barco</TableHead>
                  <TableHead className="text-center">Duración</TableHead>
                  <TableHead>Destino Primario</TableHead>
                  <TableHead className="text-right">Tarifa Base</TableHead>
                  <TableHead className="text-center">Destacado</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCruises.map((c) => {
                  const primaryDest = destinations.find(d => d.id === c.primaryDestinationId);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-3">
                          {c.images && c.images.length > 0 ? (
                            <img
                              src={c.images[0]}
                              alt={c.name}
                              className="w-10 h-10 object-cover rounded-md border border-border"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-md border border-border">
                              <Ship className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p>{c.name}</p>
                            <span className="text-[10px] text-muted-foreground font-normal block max-w-xs truncate">
                              /{c.slug}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{c.operator}</p>
                        <span className="text-xs text-muted-foreground">{c.shipName}</span>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {c.durationDays} días
                      </TableCell>
                      <TableCell>
                        {primaryDest ? (
                          <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                            {primaryDest.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-sky-700">
                        {formatCOP(c.priceFrom)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={c.featured ? 'default' : 'secondary'}
                          className={cn("text-[10px]", c.featured && "bg-amber-500 text-white hover:bg-amber-600")}
                        >
                          {c.featured ? 'Sí' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={c.active ? 'outline' : 'destructive'}
                          className={cn("text-[10px]", c.active && "border-green-200 bg-green-50 text-green-700")}
                        >
                          {c.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => window.open(`/cruceros/${c.slug}`, '_blank')}
                            title="Ver en Portal"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => handleOpenEdit(c)}
                            title="Editar crucero"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              setDeletingId(c.id);
                              setDeleteOpen(true);
                            }}
                            title="Eliminar crucero"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Ship className="w-6 h-6 text-primary" />
              {isEditing ? 'Editar Crucero' : 'Nuevo Crucero'}
            </DialogTitle>
            <DialogDescription>
              Completa los detalles del crucero, paradas de itinerario y camarotes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="info">Info Básica</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerario</TabsTrigger>
                <TabsTrigger value="cabins">Camarotes</TabsTrigger>
                <TabsTrigger value="destinations">Destinos ({formData.destinations.length})</TabsTrigger>
              </TabsList>

              {/* TAB 1: Información Básica */}
              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Crucero *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej. Caribe de Ensueño Premium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL corta)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="Autogenerado si se deja vacío"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="operator">Operador / Naviera</Label>
                    <Input
                      id="operator"
                      value={formData.operator}
                      onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                      placeholder="Ej. Royal Caribbean, Pullmantur"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipName">Nombre del Barco</Label>
                    <Input
                      id="shipName"
                      value={formData.shipName}
                      onChange={(e) => setFormData({ ...formData, shipName: e.target.value })}
                      placeholder="Ej. Monarch, Oasis of the Seas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="durationDays">Duración en Días</Label>
                    <Input
                      id="durationDays"
                      type="number"
                      min={1}
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value, 10) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Calificación (Rating)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step={0.1}
                      min={0}
                      max={5}
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewCount">Número de Reseñas</Label>
                    <Input
                      id="reviewCount"
                      type="number"
                      min={0}
                      value={formData.reviewCount}
                      onChange={(e) => setFormData({ ...formData, reviewCount: parseInt(e.target.value, 10) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryDestinationId">Destino Principal de Salida</Label>
                    <Select
                      value={formData.primaryDestinationId || 'none'}
                      onValueChange={(val) => setFormData({ ...formData, primaryDestinationId: val === 'none' ? null : val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un destino de origen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguno</SelectItem>
                        {destinations.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción del crucero</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe los puntos más atractivos de este viaje en crucero..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>¿Qué Incluye el Crucero? (Servicios generales)</Label>
                    <TagInput
                      tags={formData.includes}
                      onChange={(tags) => setFormData({ ...formData, includes: tags })}
                      placeholder="Ej. Pensión Completa, Shows en vivo, Propinas, Wifi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Etiquetas / Categorías del crucero</Label>
                    <TagInput
                      tags={formData.tags}
                      onChange={(tags) => setFormData({ ...formData, tags: tags })}
                      placeholder="Ej. Familias, Romántico, Todo Incluido, Lujo"
                    />
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4 bg-muted/40">
                  <ImageGallery
                    images={formData.images}
                    onImagesChange={(images) => setFormData({ ...formData, images })}
                    label="Galería de Fotos del Crucero (barco, itinerarios, vistas)"
                    maxImages={6}
                  />
                </div>

                <div className="flex gap-6 border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                    <Label htmlFor="active">Crucero Activo (Visible en portal)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured">Destacar Crucero (Aparece en home)</Label>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: Itinerario */}
              <TabsContent value="itinerary" className="space-y-4 pt-4">
                <div className="border border-border/80 rounded-xl p-4 bg-card shadow-xs">
                  <h3 className="text-sm font-semibold mb-3 text-sky-700 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    Agregar Parada en Itinerario
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">Día</Label>
                      <Input
                        type="number"
                        min={1}
                        value={newStop.day}
                        onChange={(e) => setNewStop({ ...newStop, day: parseInt(e.target.value, 10) || 1 })}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Puerto / Ciudad / Título</Label>
                      <Input
                        value={newStop.title}
                        onChange={(e) => setNewStop({ ...newStop, title: e.target.value })}
                        placeholder="Ej. Día 1: Embarque en Cartagena de Indias"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Actividad Principal (Opcional)</Label>
                      <Input
                        value={newStop.activity || ''}
                        onChange={(e) => setNewStop({ ...newStop, activity: e.target.value })}
                        placeholder="Ej. Navegación, Excursión libre"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 mt-3">
                    <Label className="text-xs">Descripción del Día</Label>
                    <Textarea
                      rows={2}
                      value={newStop.description}
                      onChange={(e) => setNewStop({ ...newStop, description: e.target.value })}
                      placeholder="Detalles sobre lo que se realiza este día en la parada o a bordo..."
                    />
                  </div>
                  <Button type="button" onClick={addStop} className="mt-3 bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Insertar Día de Itinerario
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Cronograma Registrado ({formData.itinerary.length} días)</h4>
                  {formData.itinerary.length === 0 ? (
                    <p className="text-xs text-muted-foreground bg-accent p-4 rounded-lg text-center">
                      No se han configurado paradas de itinerario aún. Registra al menos una parada.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {formData.itinerary.map((stop, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-3 rounded-lg border border-border bg-muted/30">
                          <Badge className="bg-primary hover:bg-primary text-white shrink-0 mt-0.5">
                            Día {stop.day}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="font-bold text-sm text-foreground">{stop.title}</h5>
                              {stop.activity && (
                                <Badge variant="outline" className="text-[10px] py-0 border-primary/30 text-primary">
                                  {stop.activity}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{stop.description}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => removeStop(idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 3: Camarotes */}
              <TabsContent value="cabins" className="space-y-4 pt-4">
                <div className="border border-border/80 rounded-xl p-4 bg-card shadow-xs space-y-4">
                  <h3 className="text-sm font-semibold text-sky-700 flex items-center gap-1.5 border-b border-border pb-2">
                    <Anchor className="w-4 h-4" />
                    Registrar Categoría de Camarote
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nombre de Categoría *</Label>
                      <Input
                        value={newCabin.name}
                        onChange={(e) => setNewCabin({ ...newCabin, name: e.target.value })}
                        placeholder="Ej. Cabina Interior, Suite con Balcón"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Camas / Distribución</Label>
                      <Input
                        value={newCabin.beds}
                        onChange={(e) => setNewCabin({ ...newCabin, beds: e.target.value })}
                        placeholder="Ej. 1 Cama King o 2 Twin"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Capacidad Máxima (personas)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={newCabin.capacity}
                        onChange={(e) => setNewCabin({ ...newCabin, capacity: parseInt(e.target.value, 10) || 2 })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Precio Base (COP) *</Label>
                      <Input
                        type="number"
                        min={0}
                        value={newCabin.basePrice}
                        onChange={(e) => setNewCabin({ ...newCabin, basePrice: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Precio Original / Antes (COP - Opcional)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={newCabin.originalPrice}
                        onChange={(e) => setNewCabin({ ...newCabin, originalPrice: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">URL Imagen del Camarote</Label>
                      <Input
                        value={newCabin.cabinImage}
                        onChange={(e) => setNewCabin({ ...newCabin, cabinImage: e.target.value })}
                        placeholder="Ej. https://url-de-la-foto.jpg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Servicios Incluidos en el Camarote (Separados por coma)</Label>
                    <Input
                      value={cabinIncludesInput}
                      onChange={(e) => {
                        setCabinIncludesInput(e.target.value);
                        setNewCabin({
                          ...newCabin,
                          includes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        });
                      }}
                      placeholder="Ej. Minibar gratis, Servicio a la habitación 24h, Baño privado"
                    />
                    <p className="text-[10px] text-muted-foreground">Escribe los servicios separados por comas para guardarlos como etiquetas individuales.</p>
                  </div>

                  <Button type="button" onClick={addCabin} className="bg-sky-600 text-white hover:bg-sky-700 w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Agregar Camarote a la Lista
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Categorías de Camarotes Cargados ({formData.cabins.length})</h4>
                  {formData.cabins.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-xl bg-muted/10 text-muted-foreground text-center">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                      <p className="font-semibold text-xs text-foreground">Sin Camarotes Registrados</p>
                      <p className="text-[10px] mt-1">Debes agregar al menos un camarote para que el crucero sea reservable en el portal.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.cabins.map((cabin, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-border bg-muted/20 relative flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-foreground">{cabin.name}</h5>
                              <Badge className="bg-sky-50 text-sky-700 border-sky-200" variant="outline">
                                Capacidad: {cabin.capacity} personas
                              </Badge>
                              {!cabin.active && <Badge variant="destructive" className="text-[9px] px-1 py-0">Inactivo</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">Distribución: <span className="font-semibold text-foreground">{cabin.beds}</span></p>
                            
                            {cabin.includes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {cabin.includes.map((inc, i) => (
                                  <span key={i} className="text-[10px] bg-sky-50 text-sky-800 border border-sky-100 rounded px-1.5 py-0.5">
                                    {inc}
                                  </span>
                                ))}
                              </div>
                            )}

                            {cabin.cabinImage && (
                              <p className="text-[10px] text-sky-600 truncate max-w-md">Imagen: {cabin.cabinImage}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-0 pt-3 md:pt-0">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Tarifa por persona</p>
                              <span className="font-bold text-base text-sky-700">{formatCOP(cabin.basePrice)}</span>
                              {cabin.originalPrice > cabin.basePrice && (
                                <span className="block text-[11px] line-through text-muted-foreground">{formatCOP(cabin.originalPrice)}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 mr-2">
                                <Label className="text-[10px] cursor-pointer" htmlFor={`cab-act-${idx}`}>Activo</Label>
                                <Switch
                                  id={`cab-act-${idx}`}
                                  checked={cabin.active}
                                  onCheckedChange={(val) => updateCabinField(idx, 'active', val)}
                                  className="scale-90"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => removeCabin(idx)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 4: Destinos Relacionados */}
              <TabsContent value="destinations" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Asignar Destinos al Crucero</Label>
                  <p className="text-xs text-muted-foreground">
                    Marca las ciudades o destinos turísticos que visita o donde tiene puerto de escala este crucero.
                    Esto permitirá que aparezca en el catálogo filtrado por destinos y en las páginas de detalle correspondientes.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {destinations.map((dest) => {
                    const isChecked = formData.destinations.includes(dest.id);
                    return (
                      <div
                        key={dest.id}
                        onClick={() => handleToggleDestination(dest.id)}
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/40",
                          isChecked
                            ? "border-sky-500 bg-sky-50 text-sky-900 shadow-2xs font-semibold"
                            : "border-border bg-card text-card-foreground"
                        )}
                      >
                        <div className={cn(
                          "w-4.5 h-4.5 rounded flex items-center justify-center border",
                          isChecked ? "bg-sky-600 border-sky-600 text-white" : "border-muted-foreground/35 bg-card"
                        )}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs select-none truncate">{dest.name}</span>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>

            {/* Form Action Buttons */}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-white">
                {isEditing ? 'Guardar Cambios' : 'Crear Crucero'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-6 h-6" />
              ¿Estás completamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará de forma permanente el crucero de la base de datos junto con todas sus categorías de camarotes asociadas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/95 text-white">
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

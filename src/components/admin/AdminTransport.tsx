'use client';
import { formatCurrency } from '@/lib/currency'


import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Car,
  Route,
  Phone,
  Mail,
  Building,
  Users,
  X,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  buildTransportDestinationCompatibilityFields,
  findTransportDestinationOption,
  findTransportDestinationOptionByLabel,
  getTransportDestinationSelectorState,
  normalizeTransportDestinationOptions,
  type TransportDestinationOption,
} from '@/lib/admin/transport-destination-ui';

// ─── Types ───────────────────────────────────────────────────────

interface TransportProvider {
  id: string;
  name: string;
  legalName: string;
  nit: string;
  phone: string;
  email: string;
  vehicleType: string;
  capacity: number;
  active: boolean;
  _count?: { services: number };
}

interface TransportService {
  id: string;
  providerId: string;
  name: string;
  routeType: string;
  origin: string;
  destination: string;
  cityId: string;
  cityName: string;
  originDestinationId?: string | null;
  destinationDestinationId?: string | null;
  durationMins: number;
  basePrice: number;
  pricePerExtra: number;
  includes: string[];
  notes: string;
  active: boolean;
  resellerId?: string | null;
  provider?: { id: string; name: string; vehicleType: string; capacity: number };
}

// ─── Mappings ────────────────────────────────────────────────────

const vehicleTypeLabels: Record<string, string> = {
  auto: 'Auto',
  van: 'Van',
  bus: 'Buseta',
  suv: 'SUV',
};

const routeTypeLabels: Record<string, string> = {
  'aeropuerto-hotel': 'Aeropuerto → Hotel',
  'hotel-aeropuerto': 'Hotel → Aeropuerto',
  'punto-a-punto': 'Punto a Punto',
  'ciudad-a-ciudad': 'Ciudad a Ciudad',
};

// ─── Default Forms ───────────────────────────────────────────────

const emptyProvider = {
  name: '',
  legalName: '',
  nit: '',
  phone: '',
  email: '',
  vehicleType: 'auto',
  capacity: 4,
  active: true,
};

const emptyService = {
  providerId: '',
  name: '',
  routeType: 'aeropuerto-hotel',
  origin: '',
  destination: '',
  cityId: '',
  cityName: '',
  originDestinationId: '',
  destinationDestinationId: '',
  durationMins: 60,
  basePrice: 0,
  pricePerExtra: 0,
  includes: [] as string[],
  notes: '',
  active: true,
  resellerId: '',
};

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
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

interface AdminTransportProps {
  defaultTab?: 'providers' | 'services';
}

export default function AdminTransport({ defaultTab = 'providers' }: AdminTransportProps) {
  // ── Providers state ──
  const [providers, setProviders] = useState<TransportProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providerSearch, setProviderSearch] = useState('');
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [providerDeleteOpen, setProviderDeleteOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<TransportProvider | null>(null);
  const [deletingProviderId, setDeletingProviderId] = useState<string | null>(null);
  const [providerSaving, setProviderSaving] = useState(false);
  const [providerForm, setProviderForm] = useState(emptyProvider);

  // ── Services state ──
  const [services, setServices] = useState<TransportService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [serviceDeleteOpen, setServiceDeleteOpen] = useState(false);
  const [editingService, setEditingService] = useState<TransportService | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [serviceSaving, setServiceSaving] = useState(false);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [destinationOptions, setDestinationOptions] = useState<TransportDestinationOption[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [destinationsError, setDestinationsError] = useState<string | null>(null);
  const [resellers, setResellers] = useState<any[]>([]);

  // ── Fetch ──
  const fetchProviders = useCallback(async () => {
    setProvidersLoading(true);
    try {
      const res = await fetch('/api/admin/transport-providers');
      if (!res.ok) throw new Error('Error al cargar proveedores');
      const json = await res.json();
      setProviders(json.data || json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setProvidersLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const res = await fetch('/api/admin/transport-services');
      if (!res.ok) throw new Error('Error al cargar servicios');
      const json = await res.json();
      setServices(json.data || json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const fetchDestinationOptions = useCallback(async () => {
    setDestinationsLoading(true);
    setDestinationsError(null);
    try {
      const res = await fetch('/api/admin/relation-options/destinations?active=all');
      if (!res.ok) throw new Error('Error al cargar destinos');
      const json = await res.json();
      setDestinationOptions(normalizeTransportDestinationOptions(json));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar destinos';
      setDestinationsError(msg);
      toast.error(msg);
    } finally {
      setDestinationsLoading(false);
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
    fetchProviders();
    fetchServices();
    fetchDestinationOptions();
    fetchResellers();
  }, [fetchProviders, fetchServices, fetchDestinationOptions, fetchResellers]);

  // ── Provider CRUD ──
  const handleProviderCreate = () => {
    setEditingProvider(null);
    setProviderForm(emptyProvider);
    setProviderDialogOpen(true);
  };

  const handleProviderEdit = (p: TransportProvider) => {
    setEditingProvider(p);
    setProviderForm({
      name: p.name,
      legalName: p.legalName,
      nit: p.nit,
      phone: p.phone,
      email: p.email,
      vehicleType: p.vehicleType,
      capacity: p.capacity,
      active: p.active,
    });
    setProviderDialogOpen(true);
  };

  const handleProviderSave = async () => {
    if (!providerForm.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    setProviderSaving(true);
    try {
      const isEditing = !!editingProvider;
      const res = await fetch(
        isEditing
          ? `/api/admin/transport-providers/${editingProvider.id}`
          : '/api/admin/transport-providers',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(providerForm),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar');
      }
      toast.success(
        isEditing
          ? 'Proveedor actualizado correctamente'
          : 'Proveedor creado correctamente'
      );
      setProviderDialogOpen(false);
      fetchProviders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setProviderSaving(false);
    }
  };

  const handleProviderDelete = async () => {
    if (!deletingProviderId) return;
    try {
      const res = await fetch(`/api/admin/transport-providers/${deletingProviderId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      toast.success('Proveedor eliminado correctamente');
      setProviderDeleteOpen(false);
      setDeletingProviderId(null);
      fetchProviders();
      fetchServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    }
  };

  // ── Service CRUD ──
  const handleServiceCreate = () => {
    setEditingService(null);
    setServiceForm({ ...emptyService, providerId: providers[0]?.id || '' });
    if (destinationOptions.length === 0 && !destinationsLoading) fetchDestinationOptions();
    setServiceDialogOpen(true);
  };

  const handleServiceEdit = (s: TransportService) => {
    const originOption = s.originDestinationId
      ? findTransportDestinationOption(destinationOptions, s.originDestinationId)
      : findTransportDestinationOptionByLabel(destinationOptions, s.origin);
    const destinationOption = s.destinationDestinationId
      ? findTransportDestinationOption(destinationOptions, s.destinationDestinationId)
      : findTransportDestinationOptionByLabel(destinationOptions, s.destination || s.cityName);
    setEditingService(s);
    setServiceForm({
      providerId: s.providerId,
      name: s.name,
      routeType: s.routeType,
      origin: originOption?.label ?? s.origin,
      destination: destinationOption?.label ?? s.destination,
      cityId: destinationOption?.id ?? s.cityId,
      cityName: destinationOption?.label ?? s.cityName,
      originDestinationId: originOption?.id ?? s.originDestinationId ?? '',
      destinationDestinationId: destinationOption?.id ?? s.destinationDestinationId ?? '',
      durationMins: s.durationMins,
      basePrice: s.basePrice,
      pricePerExtra: s.pricePerExtra,
      includes: Array.isArray(s.includes) ? s.includes : [],
      notes: s.notes,
      active: s.active,
      resellerId: s.resellerId ?? '',
    });
    setServiceDialogOpen(true);
  };

  const handleServiceSave = async () => {
    if (!serviceForm.providerId) {
      toast.error('Selecciona un proveedor');
      return;
    }
    if (destinationsError) {
      toast.error('Recarga los destinos antes de guardar');
      return;
    }
    if (
      !serviceForm.originDestinationId?.trim() ||
      !serviceForm.destinationDestinationId?.trim() ||
      !findTransportDestinationOption(destinationOptions, serviceForm.originDestinationId) ||
      !findTransportDestinationOption(destinationOptions, serviceForm.destinationDestinationId)
    ) {
      toast.error('Selecciona origen y destino relacionales válidos');
      return;
    }
    setServiceSaving(true);
    try {
      const isEditing = !!editingService;
      const servicePayload = {
        providerId: serviceForm.providerId,
        name: serviceForm.name,
        routeType: serviceForm.routeType,
        origin: serviceForm.origin,
        destination: serviceForm.destination,
        cityId: serviceForm.cityId,
        cityName: serviceForm.cityName,
        durationMins: serviceForm.durationMins,
        basePrice: serviceForm.basePrice,
        pricePerExtra: serviceForm.pricePerExtra,
        includes: serviceForm.includes,
        notes: serviceForm.notes,
        active: serviceForm.active,
      };
      const res = await fetch(
        isEditing
          ? `/api/admin/transport-services/${editingService.id}`
          : '/api/admin/transport-services',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(servicePayload),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar');
      }
      toast.success(
        isEditing
          ? 'Servicio actualizado correctamente'
          : 'Servicio creado correctamente'
      );
      setServiceDialogOpen(false);
      fetchServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setServiceSaving(false);
    }
  };

  const handleServiceDelete = async () => {
    if (!deletingServiceId) return;
    try {
      const res = await fetch(`/api/admin/transport-services/${deletingServiceId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      toast.success('Servicio eliminado correctamente');
      setServiceDeleteOpen(false);
      setDeletingServiceId(null);
      fetchServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    }
  };

  // ── Filtered lists ──
  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(providerSearch.toLowerCase())
  );
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );
  const selectedOrigin = findTransportDestinationOption(destinationOptions, serviceForm.originDestinationId ?? '');
  const selectedDestination = findTransportDestinationOption(destinationOptions, serviceForm.destinationDestinationId ?? '');
  const originSelectorState = getTransportDestinationSelectorState({
    options: destinationOptions,
    selectedId: serviceForm.originDestinationId ?? '',
    isLoading: destinationsLoading,
    error: destinationsError,
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  });
  const destinationSelectorState = getTransportDestinationSelectorState({
    options: destinationOptions,
    selectedId: serviceForm.destinationDestinationId ?? '',
    isLoading: destinationsLoading,
    error: destinationsError,
    createCtaHref: '/admin/destinos',
    createCtaLabel: 'Crear destino',
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="flex items-center gap-2">
          <Car className="w-6 h-6 text-primary" />
          Transporte
        </h1>
        <p className="mt-1">
          Gestiona proveedores y servicios de transporte
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="providers" className="gap-2">
            <Building className="w-4 h-4" />
            Proveedores ({providers.length})
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <Route className="w-4 h-4" />
            Servicios ({services.length})
          </TabsTrigger>
        </TabsList>

        {/* ═══ PROVIDERS TAB ═══ */}
        <TabsContent value="providers" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar proveedor..."
                    value={providerSearch}
                    onChange={(e) => setProviderSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleProviderCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                {providersLoading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Razón Social</TableHead>
                        <TableHead>Tipo Vehículo</TableHead>
                        <TableHead>Capacidad</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Servicios</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProviders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {providerSearch ? 'No se encontraron resultados' : 'No hay proveedores registrados'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProviders.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium text-sm">{p.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{p.legalName || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {vehicleTypeLabels[p.vehicleType] || p.vehicleType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{p.capacity}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{p.phone || '—'}</TableCell>
                            <TableCell className="text-sm">{p._count?.services || 0}</TableCell>
                            <TableCell>
                              {p.active ? (
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
                                  onClick={() => handleProviderEdit(p)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    setDeletingProviderId(p.id);
                                    setProviderDeleteOpen(true);
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
        </TabsContent>

        {/* ═══ SERVICES TAB ═══ */}
        <TabsContent value="services" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar servicio..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
            <Button
              onClick={handleServiceCreate}
              disabled={providers.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Servicio
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                {servicesLoading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Ruta</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Ciudad</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Precio Base</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                            {serviceSearch
                              ? 'No se encontraron resultados'
                              : providers.length === 0
                                ? 'Primero crea un proveedor'
                                : 'No hay servicios registrados'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredServices.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium text-sm">{s.name || '—'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {s.provider?.name || '—'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {routeTypeLabels[s.routeType] || s.routeType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{s.origin || '—'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{s.destination || '—'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{s.cityName || '—'}</TableCell>
                            <TableCell className="text-sm">{s.durationMins} min</TableCell>
                            <TableCell className="text-sm font-semibold">
                              {formatCurrency(s.basePrice)}
                            </TableCell>
                            <TableCell>
                              {s.active ? (
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
                                  onClick={() => handleServiceEdit(s)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    setDeletingServiceId(s.id);
                                    setServiceDeleteOpen(true);
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
        </TabsContent>
      </Tabs>

      {/* ═══ PROVIDER DIALOG ═══ */}
      <Dialog open={providerDialogOpen} onOpenChange={setProviderDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto admin-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </DialogTitle>
            <DialogDescription>
              {editingProvider
                ? 'Modifica los datos del proveedor de transporte'
                : 'Registra un nuevo proveedor de transporte'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={providerForm.name}
                  onChange={(e) => setProviderForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Transportes del Caribe"
                />
              </div>
              <div className="space-y-2">
                <Label>Razón Social</Label>
                <Input
                  value={providerForm.legalName}
                  onChange={(e) => setProviderForm((p) => ({ ...p, legalName: e.target.value }))}
                  placeholder="Transportes del Caribe S.A.S."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>NIT</Label>
                <Input
                  value={providerForm.nit}
                  onChange={(e) => setProviderForm((p) => ({ ...p, nit: e.target.value }))}
                  placeholder="900123456-7"
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={providerForm.phone}
                    onChange={(e) => setProviderForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+57 300 1234567"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={providerForm.email}
                  onChange={(e) => setProviderForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="info@transportes.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Vehículo</Label>
                <Select
                  value={providerForm.vehicleType}
                  onValueChange={(v) => setProviderForm((p) => ({ ...p, vehicleType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(vehicleTypeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacidad</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    value={providerForm.capacity}
                    onChange={(e) => setProviderForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={providerForm.active}
                onCheckedChange={(v) => setProviderForm((p) => ({ ...p, active: v }))}
              />
              <Label>Proveedor activo</Label>
            </div>

            <div className="dialog-footer">
              <Button
                variant="outline"
                onClick={() => setProviderDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleProviderSave} disabled={providerSaving} size="default">
                {providerSaving ? 'Guardando...' : editingProvider ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ SERVICE DIALOG ═══ */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto admin-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Modifica los datos del servicio de transporte'
                : 'Registra un nuevo servicio de transporte'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Proveedor *</Label>
              <Select
                value={serviceForm.providerId}
                onValueChange={(v) => setServiceForm((s) => ({ ...s, providerId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {providers
                    .filter((p) => p.active)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({vehicleTypeLabels[p.vehicleType]})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nombre del Servicio</Label>
              <Input
                value={serviceForm.name}
                onChange={(e) => setServiceForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="Traslado Aeropuerto CTG - Centro"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Ruta</Label>
                <Select
                  value={serviceForm.routeType}
                  onValueChange={(v) => setServiceForm((s) => ({ ...s, routeType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(routeTypeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duración (min)</Label>
                <Input
                  type="number"
                  min="1"
                  value={serviceForm.durationMins}
                  onChange={(e) =>
                    setServiceForm((s) => ({ ...s, durationMins: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Origen relacional *</Label>
                <Select
                  value={serviceForm.originDestinationId ?? ''}
                  onValueChange={(v) => {
                    const option = findTransportDestinationOption(destinationOptions, v);
                    setServiceForm((s) => ({
                      ...s,
                      ...buildTransportDestinationCompatibilityFields({ origin: option, destination: selectedDestination }),
                    }));
                  }}
                  disabled={destinationsLoading || Boolean(destinationsError)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar origen" />
                  </SelectTrigger>
                  <SelectContent>
                    {originSelectorState.options.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}{option.stateLabel ? ` (${option.stateLabel})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {originSelectorState.status === 'loading' && (
                  <p className="text-xs text-muted-foreground">{originSelectorState.statusLabel}</p>
                )}
                {originSelectorState.status === 'error' && (
                  <div className="flex items-center justify-between gap-2 text-xs text-destructive">
                    <span>{originSelectorState.statusLabel}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={fetchDestinationOptions}>Reintentar</Button>
                  </div>
                )}
                {originSelectorState.status === 'empty' && (
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{originSelectorState.statusLabel}</span>
                    <Button type="button" variant="outline" size="sm" asChild>
                      <a href={originSelectorState.createCta?.href ?? '/admin/destinos'}>
                        <ExternalLink className="w-3 h-3 mr-1" /> {originSelectorState.createCta?.label ?? 'Crear destino'}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Destino relacional *</Label>
                <Select
                  value={serviceForm.destinationDestinationId ?? ''}
                  onValueChange={(v) => {
                    const option = findTransportDestinationOption(destinationOptions, v);
                    setServiceForm((s) => ({
                      ...s,
                      ...buildTransportDestinationCompatibilityFields({ origin: selectedOrigin, destination: option }),
                    }));
                  }}
                  disabled={destinationsLoading || Boolean(destinationsError)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationSelectorState.options.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}{option.stateLabel ? ` (${option.stateLabel})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ruta / ciudad (snapshot)</Label>
                <Input
                  value={`${selectedOrigin?.label ?? (serviceForm.origin || 'Origen')} → ${selectedDestination?.label ?? (serviceForm.destination || 'Destino')}`}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El API actual de transporte guarda `origin`, `destination`, `cityId` y `cityName` como snapshots de compatibilidad.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Ciudad principal (snapshot)</Label>
                <Input
                  value={selectedDestination?.label ?? serviceForm.cityName}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
            {destinationSelectorState.status === 'error' && (
              <div className="flex items-center justify-between gap-2 text-xs text-destructive">
                <span>{destinationSelectorState.statusLabel}</span>
                <Button type="button" variant="ghost" size="sm" onClick={fetchDestinationOptions}>Reintentar</Button>
              </div>
            )}
            {destinationSelectorState.status === 'empty' && (
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{destinationSelectorState.statusLabel}</span>
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={destinationSelectorState.createCta?.href ?? '/admin/destinos'}>
                    <ExternalLink className="w-3 h-3 mr-1" /> {destinationSelectorState.createCta?.label ?? 'Crear destino'}
                  </a>
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio Base (COP)</Label>
                <Input
                  type="number"
                  min="0"
                  value={serviceForm.basePrice}
                  onChange={(e) =>
                    setServiceForm((s) => ({ ...s, basePrice: Number(e.target.value) }))
                  }
                  placeholder="85000"
                />
              </div>
              <div className="space-y-2">
                <Label>Precio por Pasajero Extra (COP)</Label>
                <Input
                  type="number"
                  min="0"
                  value={serviceForm.pricePerExtra}
                  onChange={(e) =>
                    setServiceForm((s) => ({ ...s, pricePerExtra: Number(e.target.value) }))
                  }
                  placeholder="15000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Incluye</Label>
              <TagInput
                tags={serviceForm.includes}
                onChange={(includes) => setServiceForm((s) => ({ ...s, includes }))}
                placeholder="Ej: Seguro, Equipaje, Agua..."
              />
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={serviceForm.notes}
                onChange={(e) => setServiceForm((s) => ({ ...s, notes: e.target.value }))}
                placeholder="Notas adicionales del servicio..."
                rows={3}
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="transport-reseller">Asignar a Revendedor</Label>
              <select
                id="transport-reseller"
                value={serviceForm.resellerId ?? ''}
                onChange={(e) => setServiceForm((s) => ({ ...s, resellerId: e.target.value || '' }))}
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
                Si se asigna a un revendedor, solo ese revendedor podrá ver y revender este servicio de transporte.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={serviceForm.active}
                onCheckedChange={(v) => setServiceForm((s) => ({ ...s, active: v }))}
              />
              <Label>Servicio activo</Label>
            </div>

            <div className="dialog-footer">
              <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleServiceSave} disabled={serviceSaving} size="default">
                {serviceSaving ? 'Guardando...' : editingService ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE PROVIDER DIALOG ═══ */}
      <AlertDialog open={providerDeleteOpen} onOpenChange={setProviderDeleteOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. También se eliminarán todos los servicios
              asociados a este proveedor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProviderDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══ DELETE SERVICE DIALOG ═══ */}
      <AlertDialog open={serviceDeleteOpen} onOpenChange={setServiceDeleteOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El servicio será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleServiceDelete}
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

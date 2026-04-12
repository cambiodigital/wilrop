'use client';

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
import { formatCOP } from '@/data/packages';
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
} from 'lucide-react';
import { toast } from 'sonner';

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
  durationMins: number;
  basePrice: number;
  pricePerExtra: number;
  includes: string[];
  notes: string;
  active: boolean;
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
  durationMins: 60,
  basePrice: 0,
  pricePerExtra: 0,
  includes: [] as string[],
  notes: '',
  active: true,
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
              className="pl-2 pr-1 py-1 gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="ml-0.5 rounded-full hover:bg-amber-200 p-0.5 transition-colors"
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

export default function AdminTransport() {
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

  useEffect(() => {
    fetchProviders();
    fetchServices();
  }, [fetchProviders, fetchServices]);

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
    setServiceDialogOpen(true);
  };

  const handleServiceEdit = (s: TransportService) => {
    setEditingService(s);
    setServiceForm({
      providerId: s.providerId,
      name: s.name,
      routeType: s.routeType,
      origin: s.origin,
      destination: s.destination,
      cityId: s.cityId,
      cityName: s.cityName,
      durationMins: s.durationMins,
      basePrice: s.basePrice,
      pricePerExtra: s.pricePerExtra,
      includes: Array.isArray(s.includes) ? s.includes : [],
      notes: s.notes,
      active: s.active,
    });
    setServiceDialogOpen(true);
  };

  const handleServiceSave = async () => {
    if (!serviceForm.providerId) {
      toast.error('Selecciona un proveedor');
      return;
    }
    setServiceSaving(true);
    try {
      const isEditing = !!editingService;
      const res = await fetch(
        isEditing
          ? `/api/admin/transport-services/${editingService.id}`
          : '/api/admin/transport-services',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceForm),
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Car className="w-6 h-6 text-amber-600" />
          Transporte
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona proveedores y servicios de transporte
        </p>
      </div>

      <Tabs defaultValue="providers">
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
            <Card className="border-0 shadow-sm flex-1">
              <CardContent className="p-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar proveedor..."
                    value={providerSearch}
                    onChange={(e) => setProviderSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
            <Button
              onClick={handleProviderCreate}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </div>

          <Card className="border-0 shadow-sm">
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
                          <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                            {providerSearch ? 'No se encontraron resultados' : 'No hay proveedores registrados'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProviders.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium text-sm">{p.name}</TableCell>
                            <TableCell className="text-sm text-gray-500">{p.legalName || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {vehicleTypeLabels[p.vehicleType] || p.vehicleType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{p.capacity}</TableCell>
                            <TableCell className="text-sm text-gray-500">{p.phone || '—'}</TableCell>
                            <TableCell className="text-sm">{p._count?.services || 0}</TableCell>
                            <TableCell>
                              {p.active ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                                  Activo
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 text-xs">
                                  Inactivo
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-amber-600"
                                  onClick={() => handleProviderEdit(p)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-red-600"
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
            <Card className="border-0 shadow-sm flex-1">
              <CardContent className="p-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
              disabled={providers.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Servicio
            </Button>
          </div>

          <Card className="border-0 shadow-sm">
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
                          <TableCell colSpan={10} className="text-center py-8 text-gray-400">
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
                            <TableCell className="text-sm text-gray-500">
                              {s.provider?.name || '—'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {routeTypeLabels[s.routeType] || s.routeType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">{s.origin || '—'}</TableCell>
                            <TableCell className="text-sm text-gray-500">{s.destination || '—'}</TableCell>
                            <TableCell className="text-sm text-gray-500">{s.cityName || '—'}</TableCell>
                            <TableCell className="text-sm">{s.durationMins} min</TableCell>
                            <TableCell className="text-sm font-semibold">
                              {formatCOP(s.basePrice)}
                            </TableCell>
                            <TableCell>
                              {s.active ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                                  Activo
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 text-xs">
                                  Inactivo
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-amber-600"
                                  onClick={() => handleServiceEdit(s)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-red-600"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setProviderDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleProviderSave}
                disabled={providerSaving}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {providerSaving ? 'Guardando...' : editingProvider ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ SERVICE DIALOG ═══ */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <Label>Origen</Label>
                <Input
                  value={serviceForm.origin}
                  onChange={(e) => setServiceForm((s) => ({ ...s, origin: e.target.value }))}
                  placeholder="Aeropuerto Rafael Núñez"
                />
              </div>
              <div className="space-y-2">
                <Label>Destino</Label>
                <Input
                  value={serviceForm.destination}
                  onChange={(e) => setServiceForm((s) => ({ ...s, destination: e.target.value }))}
                  placeholder="Hotel Charleston"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  value={serviceForm.cityName}
                  onChange={(e) => setServiceForm((s) => ({ ...s, cityName: e.target.value }))}
                  placeholder="Cartagena"
                />
              </div>
              <div className="space-y-2">
                <Label>City ID</Label>
                <Input
                  value={serviceForm.cityId}
                  onChange={(e) => setServiceForm((s) => ({ ...s, cityId: e.target.value }))}
                  placeholder="cartagena"
                />
              </div>
            </div>

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

            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={serviceForm.active}
                onCheckedChange={(v) => setServiceForm((s) => ({ ...s, active: v }))}
              />
              <Label>Servicio activo</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleServiceSave}
                disabled={serviceSaving}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {serviceSaving ? 'Guardando...' : editingService ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE PROVIDER DIALOG ═══ */}
      <AlertDialog open={providerDeleteOpen} onOpenChange={setProviderDeleteOpen}>
        <AlertDialogContent>
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
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══ DELETE SERVICE DIALOG ═══ */}
      <AlertDialog open={serviceDeleteOpen} onOpenChange={setServiceDeleteOpen}>
        <AlertDialogContent>
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
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

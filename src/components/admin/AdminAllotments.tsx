'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Trash2,
  Warehouse,
  CalendarDays,
  BedDouble,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────

interface Hotel {
  id: string;
  name: string;
  cityName: string;
}

interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  maxGuests: number;
  basePrice: number;
  hotel?: Hotel;
}

interface Allotment {
  id: string;
  hotelId: string;
  roomTypeId: string;
  dateFrom: string;
  dateTo: string;
  totalRooms: number;
  bookedRooms: number;
  releaseDays: number;
  netPrice: number;
  status: string;
  hotel?: { id: string; name: string; cityName: string };
  roomType?: { id: string; name: string; maxGuests: number; basePrice: number };
}

// ─── Helpers ─────────────────────────────────────────────────────

function getAvailable(totalRooms: number, bookedRooms: number): number {
  return Math.max(0, totalRooms - bookedRooms);
}

function getAvailabilityColor(available: number, total: number): string {
  if (total === 0) return 'text-muted-foreground';
  const ratio = available / total;
  if (ratio === 0) return 'text-red-600 bg-red-50';
  if (ratio <= 0.2) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
}

function getAvailabilityBadge(available: number, total: number) {
  if (total === 0) return <span className="text-xs text-muted-foreground">—</span>;
  if (available === 0)
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs font-semibold">
        Agotado
      </Badge>
    );
  if (available <= 3)
    return (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs font-semibold">
        {available} disp.
      </Badge>
    );
  return (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs font-semibold">
      {available} disp.
    </Badge>
  );
}

const statusLabels: Record<string, string> = {
  active: 'Activo',
  paused: 'Pausado',
  expired: 'Expirado',
};

const emptyAllotment = {
  hotelId: '',
  roomTypeId: '',
  dateFrom: '',
  dateTo: '',
  totalRooms: 10,
  bookedRooms: 0,
  releaseDays: 3,
  netPrice: 0,
  status: 'active',
};

// ─── Main Component ──────────────────────────────────────────────

export default function AdminAllotments() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [allotments, setAllotments] = useState<Allotment[]>([]);
  const [loading, setLoading] = useState(true);
  const [allotmentsLoading, setAllotmentsLoading] = useState(false);

  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [search, setSearch] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyAllotment);

  // ── Fetch hotels ──
  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hotels');
      if (!res.ok) throw new Error('Error al cargar hoteles');
      const json = await res.json();
      const hotelList = (json.data || json) as Hotel[];
      setHotels(hotelList);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch rooms for selected hotel ──
  const fetchRooms = useCallback(async (hotelId: string) => {
    if (!hotelId) {
      setRooms([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/rooms?hotelId=${hotelId}`);
      if (!res.ok) throw new Error('Error al cargar habitaciones');
      const json = await res.json();
      setRooms(json.data || json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    }
  }, []);

  // ── Fetch allotments for selected hotel ──
  const fetchAllotments = useCallback(async (hotelId: string) => {
    if (!hotelId) {
      setAllotments([]);
      return;
    }
    setAllotmentsLoading(true);
    try {
      const res = await fetch(`/api/admin/allotments?hotelId=${hotelId}`);
      if (!res.ok) throw new Error('Error al cargar cupos');
      const json = await res.json();
      setAllotments(json.data || json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setAllotmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleHotelChange = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    setAllotments([]);
    setRooms([]);
    if (hotelId) {
      fetchRooms(hotelId);
      fetchAllotments(hotelId);
    }
  };

  // ── CRUD ──
  const handleCreate = () => {
    if (!selectedHotelId) {
      toast.error('Selecciona un hotel primero');
      return;
    }
    setForm({ ...emptyAllotment, hotelId: selectedHotelId });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.hotelId || !form.roomTypeId) {
      toast.error('Selecciona hotel y tipo de habitación');
      return;
    }
    if (!form.dateFrom || !form.dateTo) {
      toast.error('Ingresa las fechas');
      return;
    }
    if (form.dateFrom > form.dateTo) {
      toast.error('La fecha inicial debe ser anterior a la final');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/allotments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al crear cupo');
      }
      toast.success('Cupo creado correctamente');
      setDialogOpen(false);
      fetchAllotments(form.hotelId);
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
      const res = await fetch(`/api/admin/allotments/${deletingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      toast.success('Cupo eliminado correctamente');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      if (selectedHotelId) fetchAllotments(selectedHotelId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    }
  };

  // ── Filtered ──
  const filteredAllotments = allotments.filter((a) => {
    const nameMatch =
      a.roomType?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.hotel?.name?.toLowerCase().includes(search.toLowerCase());
    return nameMatch;
  });

  // ── Summary stats ──
  const totalCupos = allotments.reduce((sum, a) => sum + a.totalRooms, 0);
  const totalBooked = allotments.reduce((sum, a) => sum + a.bookedRooms, 0);
  const totalAvailable = allotments.reduce(
    (sum, a) => sum + getAvailable(a.totalRooms, a.bookedRooms),
    0
  );
  const activeAllotments = allotments.filter((a) => a.status === 'active').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-primary" />
            Cupos (Allotments)
          </h1>
          <p className="mt-1">
            Gestiona la disponibilidad de habitaciones por hotel
          </p>
        </div>
        <Button
          onClick={handleCreate}
          disabled={!selectedHotelId}
          size="default"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cupo
        </Button>
      </div>

      {/* Hotel Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-foreground">Hotel</Label>
              <Select value={selectedHotelId} onValueChange={handleHotelChange}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Selecciona un hotel..." />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name} — {h.cityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedHotelId && (
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tipo de habitación..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedHotelId && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <BedDouble className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Habitaciones</p>
                    <p className="text-lg font-bold text-foreground">{rooms.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Cupos</p>
                    <p className="text-lg font-bold text-foreground">{totalCupos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <Warehouse className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Disponibles</p>
                    <p className="text-lg font-bold text-green-600">{totalAvailable}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Activos</p>
                    <p className="text-lg font-bold text-foreground">{activeAllotments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Allotments Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                {allotmentsLoading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo Habitación</TableHead>
                        <TableHead>Fecha Desde</TableHead>
                        <TableHead>Fecha Hasta</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Reservados</TableHead>
                        <TableHead className="text-center">Disponibles</TableHead>
                        <TableHead>Precio Neto</TableHead>
                        <TableHead>Release</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAllotments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                            {search
                              ? 'No se encontraron resultados'
                              : rooms.length === 0
                                ? 'Este hotel no tiene tipos de habitación registrados'
                                : 'No hay cupos para este hotel'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAllotments.map((a) => {
                          const available = getAvailable(a.totalRooms, a.bookedRooms);
                          return (
                            <TableRow key={a.id}>
                              <TableCell className="font-medium text-sm">
                                {a.roomType?.name || '—'}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{a.dateFrom}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{a.dateTo}</TableCell>
                              <TableCell className="text-sm text-center">{a.totalRooms}</TableCell>
                              <TableCell className="text-sm text-center">
                                <span className="font-semibold text-foreground">{a.bookedRooms}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                {getAvailabilityBadge(available, a.totalRooms)}
                              </TableCell>
                              <TableCell className="text-sm font-semibold">
                                {formatCOP(a.netPrice)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {a.releaseDays} días
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    'text-xs',
                                    a.status === 'active'
                                      ? 'bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/10'
                                      : a.status === 'paused'
                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                                        : 'bg-muted text-muted-foreground hover:bg-muted'
                                  )}
                                >
                                  {statusLabels[a.status] || a.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    setDeletingId(a.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedHotelId && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Warehouse className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Selecciona un hotel para ver sus cupos</p>
            <p className="text-sm text-muted-foreground mt-1">
              Administra la disponibilidad de habitaciones por rangos de fechas
            </p>
          </CardContent>
        </Card>
      )}

      {/* ═══ CREATE DIALOG ═══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Cupo</DialogTitle>
            <DialogDescription>
              Asigna habitaciones disponibles para un rango de fechas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Hotel</Label>
              <Select value={form.hotelId} onValueChange={(v) => setForm((f) => ({ ...f, hotelId: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="label-required">Tipo de Habitación</Label>
              <Select value={form.roomTypeId} onValueChange={(v) => setForm((f) => ({ ...f, roomTypeId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de habitación" />
                </SelectTrigger>
                <SelectContent>
                  {rooms
                    .filter((r) => r.hotelId === form.hotelId)
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} — {formatCOP(r.basePrice)}/noche
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="label-required">Fecha Desde</Label>
                <Input
                  type="date"
                  value={form.dateFrom}
                  onChange={(e) => setForm((f) => ({ ...f, dateFrom: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="label-required">Fecha Hasta</Label>
                <Input
                  type="date"
                  value={form.dateTo}
                  onChange={(e) => setForm((f) => ({ ...f, dateTo: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="label-required">Total Habitaciones</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.totalRooms}
                  onChange={(e) => setForm((f) => ({ ...f, totalRooms: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Release (días)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.releaseDays}
                  onChange={(e) => setForm((f) => ({ ...f, releaseDays: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">Días antes del check-in para liberar</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Precio Neto (COP/noche)</Label>
              <Input
                type="number"
                min="0"
                value={form.netPrice}
                onChange={(e) => setForm((f) => ({ ...f, netPrice: Number(e.target.value) }))}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">Precio negociado con el hotel</p>
            </div>

            <div className="dialog-footer">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} size="default">
                {saving ? 'Creando...' : 'Crear Cupo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE DIALOG ═══ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cupo será eliminado permanentemente.
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
import { formatCOP } from '@/data/packages';
import {
  Search,
  Eye,
  CalendarCheck,
  User,
  Mail,
  Phone,
  Globe,
  Users,
  Clock,
  CreditCard,
  Building2,
  Car,
  Compass,
  BedDouble,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────

interface BookingItem {
  id: string;
  bookingId: string;
  itemType: string;
  serviceId: string;
  serviceName: string;
  roomTypeId: string;
  roomName: string;
  dateFrom: string;
  dateTo: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addons: any[];
  status: string;
}

interface Booking {
  id: string;
  code: string;
  subagentId: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string;
  adults: number;
  children: number;
  childrenAges: number[];
  notes: string;
  status: string;
  totalPrice: number;
  netPrice: number;
  commissionAmt: number;
  checkIn: string;
  checkOut: string;
  bookedBy: string;
  createdAt: string;
  items: BookingItem[];
  subagent?: {
    id: string;
    code: string;
    agencyName: string;
    contactName: string;
    email: string;
    commission: number;
  };
}

// ─── Status config ───────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-700 hover:bg-green-100' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700 hover:bg-red-100' },
  completed: { label: 'Completada', color: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;
  return <Badge className={cn('text-xs font-medium', config.color)}>{config.label}</Badge>;
}

function ItemTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'hotel':
      return <Building2 className="w-4 h-4 text-blue-500" />;
    case 'transport':
      return <Car className="w-4 h-4 text-green-500" />;
    case 'excursion':
      return <Compass className="w-4 h-4 text-purple-500" />;
    default:
      return <BedDouble className="w-4 h-4 text-muted-foreground" />;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// ─── Main Component ──────────────────────────────────────────────

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookings');
      if (!res.ok) throw new Error('Error al cargar reservas');
      const json = await res.json();
      setBookings(json.data || json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.guestName.toLowerCase().includes(search.toLowerCase()) ||
      b.guestEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedBooking) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al actualizar estado');
      }
      toast.success(`Estado actualizado a ${statusConfig[newStatus]?.label || newStatus}`);
      setSelectedBooking({ ...selectedBooking, status: newStatus });
      fetchBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Summary stats ──
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const b2bCount = bookings.filter((b) => b.bookedBy === 'b2b').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-primary" />
          Reservas
        </h1>
        <p className="mt-1">
          Vista de todas las reservas recibidas (B2C y B2B)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Reservas</p>
                <p className="text-lg font-bold text-card-foreground">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendientes</p>
                <p className="text-lg font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ingresos Totales</p>
                <p className="text-lg font-bold text-green-600">{formatCOP(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">B2B</p>
                <p className="text-lg font-bold text-blue-600">{b2bCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    <TableHead>Código</TableHead>
                    <TableHead>Huésped</TableHead>
                    <TableHead>Pax</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Subagente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        {search || statusFilter !== 'all'
                          ? 'No se encontraron resultados'
                          : 'No hay reservas registradas'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono font-semibold text-sm text-primary">
                          {b.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{b.guestName}</p>
                            <p className="text-xs text-muted-foreground">{b.guestEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="font-medium">{b.adults}</span>
                          {b.children > 0 && (
                            <span className="text-muted-foreground"> + {b.children}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={b.status} />
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          {formatCOP(b.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs',
                              b.bookedBy === 'b2b'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-muted text-muted-foreground border border-border'
                            )}
                          >
                            {b.bookedBy === 'b2b' ? 'B2B' : 'B2C'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {b.subagent?.agencyName || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(b.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleViewDetail(b)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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

      {/* ═══ DETAIL DIALOG ═══ */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="font-mono text-primary">{selectedBooking.code}</span>
                  <StatusBadge status={selectedBooking.status} />
                </DialogTitle>
                <DialogDescription>Detalle completo de la reserva</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status Update */}
                <Card className="border border-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold text-card-foreground">
                      Cambiar Estado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Select
                      value={selectedBooking.status}
                      onValueChange={handleStatusChange}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger className="max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Guest Info */}
                <Card className="border border-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                      <User className="w-4 h-4" /> Información del Huésped
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Nombre</p>
                        <p className="text-sm font-medium">{selectedBooking.guestName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Email
                        </p>
                        <p className="text-sm">{selectedBooking.guestEmail}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Teléfono
                        </p>
                        <p className="text-sm">{selectedBooking.guestPhone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Globe className="w-3 h-3" /> País
                        </p>
                        <p className="text-sm">{selectedBooking.guestCountry || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" /> Pax
                        </p>
                        <p className="text-sm">
                          {selectedBooking.adults} adultos
                          {selectedBooking.children > 0 &&
                            ` + ${selectedBooking.children} niños`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tipo</p>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs',
                            selectedBooking.bookedBy === 'b2b'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-muted text-muted-foreground border border-border'
                          )}
                        >
                          {selectedBooking.bookedBy === 'b2b' ? 'B2B' : 'B2C'}
                        </Badge>
                      </div>
                    </div>
                    {selectedBooking.notes && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground">Notas</p>
                        <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                      </div>
                    )}
                    {selectedBooking.subagent && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-blue-600 font-medium">Subagente</p>
                        <p className="text-sm">{selectedBooking.subagent.agencyName}</p>
                        <p className="text-xs text-muted-foreground">
                          Contacto: {selectedBooking.subagent.contactName} ({selectedBooking.subagent.email})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Comisión: {selectedBooking.subagent.commission}%
                          {selectedBooking.commissionAmt > 0 &&
                            ` — ${formatCOP(selectedBooking.commissionAmt)}`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card className="border border-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Precios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-card-foreground">
                          {formatCOP(selectedBooking.totalPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Costo Neto</p>
                        <p className="text-sm font-medium">{formatCOP(selectedBooking.netPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Margen</p>
                        <p className="text-sm font-medium text-green-600">
                          {formatCOP(selectedBooking.totalPrice - selectedBooking.netPrice)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Check-in/out */}
                {(selectedBooking.checkIn || selectedBooking.checkOut) && (
                  <Card className="border border-border">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Check-in</p>
                          <p className="text-sm font-medium">{formatDate(selectedBooking.checkIn)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Check-out</p>
                          <p className="text-sm font-medium">{formatDate(selectedBooking.checkOut)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Booking Items */}
                {selectedBooking.items && selectedBooking.items.length > 0 && (
                  <Card className="border border-border">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-semibold text-card-foreground">
                        Servicios ({selectedBooking.items.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-3">
                        {selectedBooking.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border"
                          >
                            <ItemTypeIcon type={item.itemType} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{item.serviceName || item.itemType}</p>
                                {item.roomName && (
                                  <Badge variant="secondary" className="text-xs">
                                    <BedDouble className="w-3 h-3 mr-1" />
                                    {item.roomName}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {item.dateFrom && formatDate(item.dateFrom)}
                                  {item.dateTo && item.dateTo !== item.dateFrom && ` → ${formatDate(item.dateTo)}`}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Cant: {item.quantity}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Unit: {formatCOP(item.unitPrice)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{formatCOP(item.totalPrice)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Created At */}
                <div className="text-xs text-muted-foreground text-right">
                  Creada: {formatDateTime(selectedBooking.createdAt)}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

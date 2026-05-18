'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Mail,
  Phone,
  Globe,
  Building,
  Palette,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { getResellerLevelLabel, normalizeResellerLevel, type ResellerLevel } from '@/lib/reseller-access';

// ─── Types ───────────────────────────────────────────────────────

interface Reseller {
  id: string;
  code: string;
  email: string;
  companyName: string;
  contactName: string;
  country: string;
  phone: string;
  website: string;
  taxId: string;
  address: string;
  logoUrl: string;
  commission: number;
  sellerLevel: string;
  whiteLabelEnabled: boolean;
  active: boolean;
  approvalStatus: string;
  rejectionReason: string;
  registrationDate?: string;
  approvedAt?: string;
  _count?: { catalogs: number; clients: number; sales: number };
}

// ─── Default Form ───────────────────────────────────────────────

const emptyReseller = {
  code: '',
  email: '',
  password: '',
  companyName: '',
  contactName: '',
  country: '',
  phone: '',
  website: '',
  taxId: '',
  address: '',
  commission: 10,
  sellerLevel: 'standard',
  whiteLabelEnabled: false,
  active: true,
};

// ─── Main Component ──────────────────────────────────────────────

export default function AdminResellers() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [pendingResellers, setPendingResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyReseller);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchResellers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resellers');
      if (!res.ok) throw new Error('Error al cargar revendedores');
      const json = await res.json();
      const allResellers = json.data || json;
      setResellers(allResellers);
      setPendingResellers(
        allResellers.filter((r: Reseller) => r.approvalStatus === 'pending'),
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResellers();
  }, [fetchResellers]);

  const filtered = resellers.filter(
    (r) =>
      r.approvalStatus !== 'pending' &&
      (r.companyName.toLowerCase().includes(search.toLowerCase()) ||
      r.contactName.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())),
  );

  const handleCreate = () => {
    setEditingId(null);
    setForm(emptyReseller);
    setDialogOpen(true);
  };

  const handleEdit = (r: Reseller) => {
    setEditingId(r.id);
    setForm({
      code: r.code,
      email: r.email,
      password: '',
      companyName: r.companyName,
      contactName: r.contactName,
      country: r.country,
      phone: r.phone,
      website: r.website,
      taxId: r.taxId,
      address: r.address,
      commission: r.commission,
      sellerLevel: normalizeResellerLevel(r.sellerLevel),
      whiteLabelEnabled: r.whiteLabelEnabled,
      active: r.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast.error('El código es obligatorio');
      return;
    }
    if (!form.companyName.trim()) {
      toast.error('El nombre de empresa es obligatorio');
      return;
    }
    if (!form.contactName.trim()) {
      toast.error('El nombre de contacto es obligatorio');
      return;
    }
    if (!form.email.trim()) {
      toast.error('El email es obligatorio');
      return;
    }
    if (!editingId && !form.password.trim()) {
      toast.error('La contraseña es obligatoria para nuevos revendedores');
      return;
    }

    setSaving(true);
    try {
      const isEditing = !!editingId;
      const payload: Record<string, unknown> = { ...form };

      if (isEditing && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(
        isEditing ? `/api/admin/resellers/${editingId}` : '/api/admin/resellers',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar');
      }
      toast.success(
        isEditing
          ? 'Revendedor actualizado correctamente'
          : 'Revendedor creado correctamente',
      );
      setDialogOpen(false);
      fetchResellers();
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
      const res = await fetch(`/api/admin/resellers/${deletingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      toast.success('Revendedor eliminado correctamente');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchResellers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    }
  };

  const handleApproval = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    setApprovingId(id);
    try {
      const res = await fetch(`/api/admin/resellers/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al procesar la solicitud');
      }
      const result = await res.json();
      toast.success(result.message);
      fetchResellers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) {
      toast.error('El motivo de rechazo es obligatorio');
      return;
    }
    setApprovingId(rejectingId);
    try {
      const res = await fetch(`/api/admin/resellers/${rejectingId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al rechazar');
      }
      const result = await res.json();
      toast.success(result.message);
      setRejectDialogOpen(false);
      setRejectingId(null);
      setRejectReason('');
      fetchResellers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setApprovingId(null);
    }
  };

  const activeCount = resellers.filter((r) => r.active).length;
  const totalSales = resellers.reduce((sum, r) => sum + (r._count?.sales || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Revendedores
          </h1>
          <p className="mt-1">
            Gestiona las cuentas de revendedores y solicitudes de registro
          </p>
        </div>
        <Button onClick={handleCreate} size="default">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Revendedor
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revendedores</p>
                <p className="text-lg font-bold text-card-foreground">{resellers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Building className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Activos</p>
                <p className="text-lg font-bold text-green-600">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ventas Totales</p>
                <p className="text-lg font-bold text-blue-600">{totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingResellers.length > 0 && (
        <Card className="border-amber-300 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold">Solicitudes Pendientes ({pendingResellers.length})</h2>
            </div>
            <div className="space-y-3">
              {pendingResellers.map((r) => (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{r.companyName}</span>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                        Pendiente
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.contactName} · {r.email}
                      {r.country && ` · ${r.country}`}
                      {r.phone && ` · ${r.phone}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Registrado: {r.registrationDate ? new Date(r.registrationDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </p>
                    {r.taxId && (
                      <p className="text-xs text-muted-foreground">NIT/RUT: {r.taxId}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                      onClick={() => {
                        setRejectingId(r.id);
                        setRejectReason('');
                        setRejectDialogOpen(true);
                      }}
                      disabled={approvingId === r.id}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rechazar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleApproval(r.id, 'approve')}
                      disabled={approvingId === r.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprobar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por empresa, contacto, código o email..."
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
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Comisión</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Catálogo</TableHead>
                    <TableHead>Clientes</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        {search
                          ? 'No se encontraron resultados'
                          : 'No hay revendedores registrados'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono font-semibold text-sm text-primary">
                          {r.code}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {r.companyName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {r.contactName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {r.country || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {r.email}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-xs font-semibold">
                            {r.commission}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                            {getResellerLevelLabel(normalizeResellerLevel(r.sellerLevel))}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-center">
                          {r._count?.catalogs || 0}
                        </TableCell>
                        <TableCell className="text-sm text-center">
                          {r._count?.clients || 0}
                        </TableCell>
                        <TableCell>
                          {r.approvalStatus === 'rejected' ? (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                              Rechazado
                            </Badge>
                          ) : r.active ? (
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
                              onClick={() => handleEdit(r)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setDeletingId(r.id);
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto admin-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Revendedor' : 'Nuevo Revendedor'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifica los datos del revendedor'
                : 'Registra un nuevo revendedor para el canal B2B'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="label-required">Código</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                    RES-
                  </span>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="0001"
                    className="pl-12"
                    disabled={!!editingId}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="label-required">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="empresa@ejemplo.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {!editingId && (
              <div className="space-y-1.5">
                <Label className="label-required">Contraseña</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Contraseña de acceso"
                />
              </div>
            )}
            {editingId && (
              <div className="space-y-1.5">
                <Label>Nueva Contraseña (dejar vacío para no cambiar)</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="label-required">Nombre de Empresa</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.companyName}
                    onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                    placeholder="Travel Express S.A."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="label-required">Nombre de Contacto</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.contactName}
                    onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                    placeholder="Juan Pérez"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>País</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    placeholder="México"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+52 55 1234 5678"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Sitio web</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    placeholder="https://miagencia.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>NIT / RUT / ID Fiscal</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.taxId}
                    onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))}
                    placeholder="12345678-9"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Dirección</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Calle 123, Ciudad, País"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Comisión (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.commission}
                onChange={(e) => setForm((f) => ({ ...f, commission: Number(e.target.value) }))}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                Porcentaje de comisión sobre las ventas del revendedor
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nivel de revendedor</Label>
                <Select
                  value={form.sellerLevel}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, sellerLevel: normalizeResellerLevel(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {(['starter', 'standard', 'free_light'] as ResellerLevel[]).map((level) => (
                      <SelectItem key={level} value={level}>
                        {getResellerLevelLabel(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Palette className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <Label>Marca blanca</Label>
                  <p className="text-xs text-muted-foreground">Free Light la incluye; este switch la habilita manualmente.</p>
                </div>
                <Switch
                  checked={form.whiteLabelEnabled}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, whiteLabelEnabled: v }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
              <Label>Revendedor activo</Label>
            </div>

            <div className="dialog-footer">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} size="default">
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Revendedor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE DIALOG ═══ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar revendedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El revendedor será eliminado permanentemente
              junto con su catálogo, clientes y ventas.
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

      {/* ═══ REJECT DIALOG ═══ */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="admin-dialog">
          <DialogHeader>
            <DialogTitle>Rechazar solicitud</DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo. Esta información será visible para el revendedor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="label-required">Motivo de rechazo</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: Documentación incompleta, empresa no verificada..."
                rows={4}
              />
            </div>
            <div className="dialog-footer">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim() || approvingId !== null}
              >
                {approvingId === rejectingId ? 'Procesando...' : 'Rechazar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

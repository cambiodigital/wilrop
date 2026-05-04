'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { getResellerLevelLabel, normalizeResellerLevel, type ResellerLevel } from '@/lib/reseller-access';

// ─── Types ───────────────────────────────────────────────────────

interface Subagent {
  id: string;
  code: string;
  email: string;
  agencyName: string;
  contactName: string;
  country: string;
  phone: string;
  commission: number;
  sellerLevel: string;
  whiteLabelEnabled: boolean;
  active: boolean;
  _count?: { bookings: number };
}

// ─── Default Form ───────────────────────────────────────────────

const emptySubagent = {
  code: '',
  email: '',
  password: '',
  agencyName: '',
  contactName: '',
  country: '',
  phone: '',
  commission: 15,
  sellerLevel: 'standard',
  whiteLabelEnabled: false,
  active: true,
};

// ─── Main Component ──────────────────────────────────────────────

export default function AdminSubagents() {
  const [subagents, setSubagents] = useState<Subagent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptySubagent);

  const fetchSubagents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subagents');
      if (!res.ok) throw new Error('Error al cargar subagentes');
      const json = await res.json();
      setSubagents(json.data || json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubagents();
  }, [fetchSubagents]);

  const filtered = subagents.filter(
    (s) =>
      s.agencyName.toLowerCase().includes(search.toLowerCase()) ||
      s.contactName.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setEditingId(null);
    setForm(emptySubagent);
    setDialogOpen(true);
  };

  const handleEdit = (sub: Subagent) => {
    setEditingId(sub.id);
    setForm({
      code: sub.code,
      email: sub.email,
      password: '', // Leave empty on edit - don't send if not changed
      agencyName: sub.agencyName,
      contactName: sub.contactName,
      country: sub.country,
      phone: sub.phone,
      commission: sub.commission,
      sellerLevel: normalizeResellerLevel(sub.sellerLevel),
      whiteLabelEnabled: sub.whiteLabelEnabled,
      active: sub.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast.error('El código es obligatorio');
      return;
    }
    if (!form.agencyName.trim()) {
      toast.error('El nombre de la agencia es obligatorio');
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
      toast.error('La contraseña es obligatoria para nuevos subagentes');
      return;
    }

    setSaving(true);
    try {
      const isEditing = !!editingId;
      const payload: Record<string, unknown> = { ...form };

      // If editing and password is empty, remove it from payload
      if (isEditing && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(
        isEditing ? `/api/admin/subagents/${editingId}` : '/api/admin/subagents',
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
      toast.success(
        isEditing
          ? 'Subagente actualizado correctamente'
          : 'Subagente creado correctamente'
      );
      setDialogOpen(false);
      fetchSubagents();
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
      const res = await fetch(`/api/admin/subagents/${deletingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      toast.success('Subagente eliminado correctamente');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchSubagents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    }
  };

  // ── Summary ──
  const activeCount = subagents.filter((s) => s.active).length;
  const totalBookings = subagents.reduce((sum, s) => sum + (s._count?.bookings || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-600" />
            Subagentes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona las agencias subagentes (canal B2B)
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Subagente
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Subagentes</p>
                <p className="text-lg font-bold text-gray-900">{subagents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Building className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Activos</p>
                <p className="text-lg font-bold text-green-600">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Reservas B2B</p>
                <p className="text-lg font-bold text-blue-600">{totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por agencia, contacto o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
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
                    <TableHead>Agencia</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Comisión</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Marca Blanca</TableHead>
                    <TableHead>Reservas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-gray-400">
                        {search
                          ? 'No se encontraron resultados'
                          : 'No hay subagentes registrados'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-mono font-semibold text-sm text-amber-700">
                          {sub.code}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {sub.agencyName}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {sub.contactName}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {sub.country || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {sub.email}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {sub.phone || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs font-semibold">
                            {sub.commission}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                            {getResellerLevelLabel(normalizeResellerLevel(sub.sellerLevel))}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sub.whiteLabelEnabled || normalizeResellerLevel(sub.sellerLevel) === 'free_light' ? (
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">
                              Habilitada
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 text-xs">
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-center">
                          {sub._count?.bookings || 0}
                        </TableCell>
                        <TableCell>
                          {sub.active ? (
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
                              onClick={() => handleEdit(sub)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-600"
                              onClick={() => {
                                setDeletingId(sub.id);
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Subagente' : 'Nuevo Subagente'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifica los datos del subagente'
                : 'Registra un nuevo subagente para el canal B2B'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">
                    WIL-
                  </span>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="AG001"
                    className="pl-12"
                    disabled={!!editingId}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="agencia@ejemplo.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {!editingId && (
              <div className="space-y-2">
                <Label>Contraseña *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Contraseña de acceso"
                />
              </div>
            )}
            {editingId && (
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label>Nombre de Agencia *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={form.agencyName}
                    onChange={(e) => setForm((f) => ({ ...f, agencyName: e.target.value }))}
                    placeholder="Travel Express Inc."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nombre de Contacto *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              <div className="space-y-2">
                <Label>País</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    placeholder="México"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+52 55 1234 5678"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Comisión (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.commission}
                onChange={(e) => setForm((f) => ({ ...f, commission: Number(e.target.value) }))}
                placeholder="15"
              />
              <p className="text-xs text-gray-400">
                Porcentaje de comisión sobre las ventas del subagente
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
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

              <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                <Palette className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <Label>Marca blanca</Label>
                  <p className="text-xs text-gray-400">Free Light la incluye; este switch la habilita manualmente.</p>
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
              <Label>Subagente activo</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Subagente'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE DIALOG ═══ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar subagente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El subagente será eliminado permanentemente
              junto con su historial de comisiones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

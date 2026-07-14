import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { type TransportProvider, emptyProvider } from './types';

export function useTransportProviders() {
  const [providers, setProviders] = useState<TransportProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<TransportProvider | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyProvider);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transport-providers');
      if (!res.ok) throw new Error('Error al cargar proveedores');
      const json = await res.json();
      setProviders(json.data || json);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const handleCreate = () => {
    setEditing(null);
    setForm(emptyProvider);
    setDialogOpen(true);
  };

  const handleEdit = (p: TransportProvider) => {
    setEditing(p);
    setForm({
      name: p.name, legalName: p.legalName, nit: p.nit,
      phone: p.phone, email: p.email, vehicleType: p.vehicleType,
      capacity: p.capacity, active: p.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      const isEditing = !!editing;
      const res = await fetch(
        isEditing ? `/api/admin/transport-providers/${editing.id}` : '/api/admin/transport-providers',
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
      toast.success(isEditing ? 'Proveedor actualizado' : 'Proveedor creado');
      setDialogOpen(false);
      fetchProviders();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (onServicesRefresh?: () => void) => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/transport-providers/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      toast.success('Proveedor eliminado');
      setDeleteOpen(false);
      setDeletingId(null);
      fetchProviders();
      onServicesRefresh?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  const filtered = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return {
    providers, loading, search, setSearch,
    dialogOpen, setDialogOpen, deleteOpen, setDeleteOpen,
    editing, deletingId, setDeletingId, saving, form, setForm,
    filtered, fetchProviders,
    handleCreate, handleEdit, handleSave, handleDelete,
  };
}

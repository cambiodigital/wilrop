'use client';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { TravelPackage } from '@/components/admin/packages/types';

export function usePackages() {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const filtered = packages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.destinationName.toLowerCase().includes(search.toLowerCase())
  );

  return {
    packages,
    loading,
    search,
    setSearch,
    filtered,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deletingId,
    setDeletingId,
    fetchPackages,
    handleDelete,
  };
}

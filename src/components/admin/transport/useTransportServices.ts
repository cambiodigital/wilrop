import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  type TransportService, type TransportProvider, emptyService,
} from './types';
import {
  findTransportDestinationOption, findTransportDestinationOptionByLabel,
  getTransportDestinationSelectorState, normalizeTransportDestinationOptions,
  type TransportDestinationOption,
} from '@/lib/admin/transport-destination-ui';

export function useTransportServices() {
  const [services, setServices] = useState<TransportService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<TransportService | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyService);
  const [destinationOptions, setDestinationOptions] = useState<TransportDestinationOption[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [destinationsError, setDestinationsError] = useState<string | null>(null);
  const [resellers, setResellers] = useState<any[]>([]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transport-services');
      if (!res.ok) throw new Error('Error al cargar servicios');
      const json = await res.json();
      setServices(json.data || json);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
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
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchDestinationOptions();
    fetchResellers();
  }, [fetchServices, fetchDestinationOptions, fetchResellers]);

  const handleCreate = (providers: TransportProvider[]) => {
    setEditing(null);
    setForm({ ...emptyService, providerId: providers[0]?.id || '' });
    if (destinationOptions.length === 0 && !destinationsLoading) fetchDestinationOptions();
    setDialogOpen(true);
  };

  const handleEdit = (s: TransportService) => {
    const originOpt = s.originDestinationId
      ? findTransportDestinationOption(destinationOptions, s.originDestinationId)
      : findTransportDestinationOptionByLabel(destinationOptions, s.origin);
    const destOpt = s.destinationDestinationId
      ? findTransportDestinationOption(destinationOptions, s.destinationDestinationId)
      : findTransportDestinationOptionByLabel(destinationOptions, s.destination || s.cityName);
    setEditing(s);
    setForm({
      providerId: s.providerId, name: s.name, routeType: s.routeType,
      origin: originOpt?.label ?? s.origin, destination: destOpt?.label ?? s.destination,
      cityId: destOpt?.id ?? s.cityId, cityName: destOpt?.label ?? s.cityName,
      originDestinationId: originOpt?.id ?? s.originDestinationId ?? '',
      destinationDestinationId: destOpt?.id ?? s.destinationDestinationId ?? '',
      durationMins: s.durationMins, basePrice: s.basePrice, pricePerExtra: s.pricePerExtra,
      includes: Array.isArray(s.includes) ? s.includes : [],
      notes: s.notes, active: s.active, resellerId: s.resellerId ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.providerId) { toast.error('Selecciona un proveedor'); return; }
    if (destinationsError) { toast.error('Recarga los destinos antes de guardar'); return; }
    if (
      !form.originDestinationId?.trim() || !form.destinationDestinationId?.trim() ||
      !findTransportDestinationOption(destinationOptions, form.originDestinationId) ||
      !findTransportDestinationOption(destinationOptions, form.destinationDestinationId)
    ) {
      toast.error('Selecciona origen y destino relacionales válidos');
      return;
    }
    setSaving(true);
    try {
      const isEditing = !!editing;
      const payload = {
        providerId: form.providerId, name: form.name, routeType: form.routeType,
        origin: form.origin, destination: form.destination,
        cityId: form.cityId, cityName: form.cityName,
        durationMins: form.durationMins, basePrice: form.basePrice,
        pricePerExtra: form.pricePerExtra, includes: form.includes,
        notes: form.notes, active: form.active,
      };
      const res = await fetch(
        isEditing ? `/api/admin/transport-services/${editing.id}` : '/api/admin/transport-services',
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
      toast.success(isEditing ? 'Servicio actualizado' : 'Servicio creado');
      setDialogOpen(false);
      fetchServices();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/transport-services/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al eliminar');
      }
      toast.success('Servicio eliminado');
      setDeleteOpen(false);
      setDeletingId(null);
      fetchServices();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOrigin = findTransportDestinationOption(destinationOptions, form.originDestinationId ?? '');
  const selectedDestination = findTransportDestinationOption(destinationOptions, form.destinationDestinationId ?? '');
  const originSelectorState = getTransportDestinationSelectorState({
    options: destinationOptions, selectedId: form.originDestinationId ?? '',
    isLoading: destinationsLoading, error: destinationsError,
    createCtaHref: '/admin/destinos', createCtaLabel: 'Crear destino',
  });
  const destinationSelectorState = getTransportDestinationSelectorState({
    options: destinationOptions, selectedId: form.destinationDestinationId ?? '',
    isLoading: destinationsLoading, error: destinationsError,
    createCtaHref: '/admin/destinos', createCtaLabel: 'Crear destino',
  });

  return {
    services, loading, search, setSearch,
    dialogOpen, setDialogOpen, deleteOpen, setDeleteOpen,
    editing, deletingId, setDeletingId, saving, form, setForm,
    destinationOptions, destinationsLoading, destinationsError,
    resellers, filtered, fetchServices, fetchDestinationOptions,
    handleCreate, handleEdit, handleSave, handleDelete,
    selectedOrigin, selectedDestination,
    originSelectorState, destinationSelectorState,
  };
}

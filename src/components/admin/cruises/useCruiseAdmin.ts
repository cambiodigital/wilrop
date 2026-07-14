import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { type Cabin, type ItineraryStop, type Cruise, type DestinationOption, type CruiseFormData, emptyCabin, emptyCruise } from './types';

function cruiseToForm(cruise: Cruise): CruiseFormData {
  return {
    slug: cruise.slug, name: cruise.name, description: cruise.description || '',
    shipName: cruise.shipName || '', operator: cruise.operator || '',
    durationDays: cruise.durationDays || 3, images: cruise.images || [],
    includes: cruise.includes || [], itinerary: cruise.itinerary || [],
    rating: cruise.rating || 4.5, reviewCount: cruise.reviewCount || 10,
    priceFrom: cruise.priceFrom || 0, tags: cruise.tags || [],
    featured: cruise.featured || false, active: cruise.active !== false,
    primaryDestinationId: cruise.primaryDestinationId || '',
    cabins: cruise.cabins || [], destinations: cruise.destinations || [],
    resellerId: cruise.resellerId ?? '',
  };
}

export function useCruiseAdmin() {
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [resellers, setResellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CruiseFormData>(emptyCruise);
  const [newStop, setNewStop] = useState<ItineraryStop>({ day: 1, title: '', description: '' });
  const [newCabin, setNewCabin] = useState<Cabin>(emptyCabin);
  const [cabinIncludesInput, setCabinIncludesInput] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cruisesRes, destsRes] = await Promise.all([fetch('/api/admin/cruises'), fetch('/api/admin/destinations')]);
      const [cData, dData] = await Promise.all([cruisesRes.json(), destsRes.json()]);
      if (cData.success) setCruises(cData.data); else toast.error('Error al cargar cruceros');
      if (dData.success) setDestinations(dData.data);
      const rRes = await fetch('/api/admin/resellers');
      if (rRes.ok) { const rJson = await rRes.json(); setResellers(rJson.data || rJson); }
    } catch (e) { console.error('Error loading admin cruises data:', e); toast.error('Error de conexión al cargar datos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenCreate = () => {
    setIsEditing(false); setEditingId(null);
    setFormData({ ...emptyCruise, cabins: [], images: [], includes: [], tags: [], itinerary: [], destinations: [] });
    setNewStop({ day: 1, title: '', description: '' }); setNewCabin(emptyCabin); setDialogOpen(true);
  };

  const handleOpenEdit = (cruise: Cruise) => {
    setIsEditing(true); setEditingId(cruise.id); setFormData(cruiseToForm(cruise));
    setNewStop({ day: (cruise.itinerary?.length || 0) + 1, title: '', description: '' });
    setNewCabin(emptyCabin); setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) { toast.error('El nombre del crucero es requerido'); return; }
    try {
      let basePrice = formData.priceFrom;
      if (formData.cabins.length > 0) {
        const active = formData.cabins.filter(c => c.active);
        const pool = active.length > 0 ? active : formData.cabins;
        basePrice = Math.min(...pool.map(c => c.basePrice));
      }
      const url = isEditing ? `/api/admin/cruises/${editingId}` : '/api/admin/cruises';
      const res = await fetch(url, { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, priceFrom: basePrice }) });
      const data = await res.json();
      if (data.success) { toast.success(isEditing ? 'Crucero actualizado con éxito' : 'Crucero creado con éxito'); setDialogOpen(false); fetchData(); }
      else toast.error(data.error || 'Error al guardar crucero');
    } catch (e) { console.error('Error saving cruise:', e); toast.error('Error al guardar crucero'); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/cruises/${deletingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Crucero eliminado con éxito'); setDeleteOpen(false); setDeletingId(null); fetchData(); }
      else toast.error(data.error || 'Error al eliminar crucero');
    } catch (e) { console.error('Error deleting cruise:', e); toast.error('Error de red al eliminar crucero'); }
  };

  const addStop = () => {
    if (!newStop.title || !newStop.description) { toast.error('Ingrese el título y la descripción de la parada'); return; }
    const updated = [...formData.itinerary, newStop].sort((a, b) => a.day - b.day);
    setFormData({ ...formData, itinerary: updated });
    setNewStop({ day: updated.length + 1, title: '', description: '' });
  };

  const removeStop = (i: number) => setFormData({ ...formData, itinerary: formData.itinerary.filter((_, idx) => idx !== i) });

  const addCabin = () => {
    if (!newCabin.name || newCabin.basePrice <= 0) { toast.error('Nombre de camarote y precio base son obligatorios'); return; }
    setFormData({ ...formData, cabins: [...formData.cabins, newCabin] });
    setNewCabin(emptyCabin); setCabinIncludesInput('');
  };

  const removeCabin = (i: number) => setFormData({ ...formData, cabins: formData.cabins.filter((_, idx) => idx !== i) });

  const updateCabinField = (i: number, field: keyof Cabin, value: any) => {
    const updated = [...formData.cabins]; updated[i] = { ...updated[i], [field]: value };
    setFormData({ ...formData, cabins: updated });
  };

  const handleToggleDestination = (destId: string) => {
    const cur = formData.destinations;
    setFormData({ ...formData, destinations: cur.includes(destId) ? cur.filter(id => id !== destId) : [...cur, destId] });
  };

  const filteredCruises = cruises.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.shipName.toLowerCase().includes(q) || c.operator.toLowerCase().includes(q);
    const matchDest = destinationFilter === 'all' || c.destinations.includes(destinationFilter) || c.primaryDestinationId === destinationFilter;
    return matchSearch && matchDest;
  });

  return {
    cruises, destinations, resellers, loading,
    search, setSearch, destinationFilter, setDestinationFilter,
    dialogOpen, setDialogOpen, isEditing, editingId,
    formData, setFormData, newStop, setNewStop, newCabin, setNewCabin,
    cabinIncludesInput, setCabinIncludesInput,
    deleteOpen, setDeleteOpen, deletingId, setDeletingId,
    filteredCruises, fetchData, handleOpenCreate, handleOpenEdit, handleSave, handleDelete,
    addStop, removeStop, addCabin, removeCabin, updateCabinField, handleToggleDestination,
  };
}

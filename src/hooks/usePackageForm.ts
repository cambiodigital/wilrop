'use client';
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { TravelPackage } from '@/components/admin/packages/types';
import { emptyPackage } from '@/components/admin/packages/types';
import { usePackageRelations } from '@/hooks/usePackageRelations';
import {
  buildPackageRelationsPayload,
  findPackageDestinationOption,
  toggleSelectedId,
  type PackageCompositionSelection,
} from '@/lib/admin/package-relation-ui';

const emptyComposition: PackageCompositionSelection = {
  destinationId: '', hotelIds: [], roomTypeIds: [], excursionIds: [], transportServiceIds: [],
};

function generateSlug(title: string): string {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function usePackageForm(fetchPackages: () => void) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(emptyPackage);
  const [departureDatesStr, setDepartureDatesStr] = useState('');
  const [composition, setComposition] = useState<PackageCompositionSelection>(emptyComposition);
  const [resellers, setResellers] = useState<any[]>([]);

  const relations = usePackageRelations(dialogOpen, form.destinationId, composition, setComposition, setForm, setResellers);

  const selectedDestination = findPackageDestinationOption(relations.destinationOptions, form.destinationId);

  const updateField = (key: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title') next.slug = generateSlug(value as string);
      return next;
    });
  };

  const toggleComposition = (key: keyof Omit<PackageCompositionSelection, 'destinationId'>, id: string) => {
    setComposition((prev) => ({ ...prev, [key]: toggleSelectedId(prev[key], id) }));
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ ...emptyPackage });
    setComposition({ ...emptyComposition });
    setDepartureDatesStr('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (pkg: TravelPackage) => {
    setEditingId(pkg.id);
    setForm({
      destinationId: pkg.destinationId, destinationName: pkg.destinationName,
      title: pkg.title, slug: pkg.slug, description: pkg.description,
      duration: pkg.duration, price: pkg.price, originalPrice: pkg.originalPrice,
      commission: pkg.commission, includes: pkg.includes, image: pkg.image,
      difficulty: pkg.difficulty, groupSize: pkg.groupSize,
      departureDates: pkg.departureDates, rating: pkg.rating,
      soldOut: pkg.soldOut, category: pkg.category, active: pkg.active,
      resellerId: pkg.resellerId ?? '',
    });
    setComposition({ ...emptyComposition, destinationId: pkg.destinationId });
    setDepartureDatesStr(pkg.departureDates.join(', '));
    setDialogOpen(true);
    relations.fetchPackageDestinationRelation(pkg.id);
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Solo se permiten archivos de imagen'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('La imagen no debe superar los 5 MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'packages');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al subir la imagen'); }
      const data = await res.json();
      setImageError(false);
      updateField('image', data.url);
      toast.success('Imagen subida correctamente');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al subir');
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    if (relations.destinationsError) { toast.error('No se puede guardar hasta recuperar el selector de destino'); return; }
    if (Object.values(relations.selectorErrors).some(Boolean)) { toast.error('No se puede guardar hasta recuperar los selectores de composición'); return; }
    if (!form.destinationId.trim()) { toast.error('Selecciona un destino válido'); return; }
    if (!selectedDestination) { toast.error('Selecciona un destino de la lista relacional antes de guardar'); return; }
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug || generateSlug(form.title) };
      const isEditing = !!editingId;
      const res = await fetch(isEditing ? `/api/admin/packages/${editingId}` : '/api/admin/packages', { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al guardar'); }
      const saved = await res.json();
      const packageId = saved?.data?.id ?? editingId;
      if (!packageId) throw new Error('No se pudo resolver el paquete guardado');
      const rr = await fetch(`/api/admin/packages/${packageId}/relations`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPackageRelationsPayload({ ...composition, destinationId: form.destinationId })) });
      if (!rr.ok) { const d = await rr.json().catch(() => ({})); throw new Error(d.error || 'El paquete se guardó, pero no se pudo guardar la relación de destino'); }
      toast.success(isEditing ? 'Paquete actualizado correctamente' : 'Paquete creado correctamente');
      setDialogOpen(false);
      fetchPackages();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return {
    dialogOpen, setDialogOpen, editingId, saving, uploading, dragOver, setDragOver,
    imageError, setImageError, imageInputRef, form, departureDatesStr, setDepartureDatesStr,
    composition, resellers, selectedDestination, selectedHotelForRoomTypes: relations.selectedHotelForRoomTypes,
    destinationOptions: relations.destinationOptions,
    destinationsLoading: relations.destinationsLoading,
    destinationsError: relations.destinationsError,
    hotelOptions: relations.hotelOptions,
    roomTypeOptions: relations.roomTypeOptions,
    excursionOptions: relations.excursionOptions,
    transportOptions: relations.transportOptions,
    selectorLoading: relations.selectorLoading,
    selectorErrors: relations.selectorErrors,
    updateField, toggleComposition, handleOpenCreate, handleOpenEdit,
    handleImageUpload, handleSave,
    fetchDestinationOptions: relations.fetchDestinationOptions,
    fetchRelationOptions: relations.fetchRelationOptions,
  };
}

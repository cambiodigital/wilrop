'use client';
import { useEffect, useCallback } from 'react';
import { usePackages } from '@/hooks/usePackages';
import { usePackageForm } from '@/hooks/usePackageForm';
import { PackageListHeader } from '@/components/admin/packages/PackageListHeader';
import { PackageSearchBar } from '@/components/admin/packages/PackageSearchBar';
import { PackageTable } from '@/components/admin/packages/PackageTable';
import { PackageFormDialog } from '@/components/admin/packages/PackageFormDialog';
import { DeletePackageDialog } from '@/components/admin/packages/DeletePackageDialog';
import {
  findPackageDestinationOption,
  toggleSelectedId,
  type PackageCompositionSelection,
} from '@/lib/admin/package-relation-ui';

export default function AdminPackages() {
  const list = usePackages();
  const form = usePackageForm(list.fetchPackages);

  useEffect(() => { list.fetchPackages(); }, [list.fetchPackages]);

  const handleDestinationChange = useCallback((id: string) => {
    const option = findPackageDestinationOption(form.destinationOptions, id);
    form.updateField('destinationId', option?.id ?? '');
    form.updateField('destinationName', option?.label ?? '');
  }, [form]);

  const handleRetryRelation = useCallback((key: string) => {
    const destinationQuery = form.form.destinationId ? `&destinationId=${encodeURIComponent(form.form.destinationId)}` : '';
    const urls: Record<string, string> = {
      hotels: `/api/admin/relation-options/hotels?active=all${destinationQuery}`,
      excursions: `/api/admin/relation-options/excursions?active=all${destinationQuery}`,
      transportServices: `/api/admin/relation-options/transport-services?active=all${destinationQuery}`,
    };
    const keyToOptions: Record<string, 'hotelOptions' | 'roomTypeOptions' | 'excursionOptions' | 'transportOptions'> = {
      hotels: 'hotelOptions', roomTypes: 'roomTypeOptions', excursions: 'excursionOptions', transportServices: 'transportOptions',
    };
    if (form.selectedHotelForRoomTypes) {
      urls.roomTypes = `/api/admin/relation-options/room-types?active=all&hotelId=${encodeURIComponent(form.selectedHotelForRoomTypes)}`;
    }
    const url = urls[key];
    const optionsKey = keyToOptions[key];
    if (url && optionsKey) form.fetchRelationOptions(key as any, url, optionsKey);
  }, [form]);

  const handleRemoveImage = useCallback(() => {
    form.updateField('image', '');
    form.setImageError(false);
  }, [form]);

  return (
    <div className="p-6 space-y-6">
      <PackageListHeader onCreate={form.handleOpenCreate} />
      <PackageSearchBar value={list.search} onChange={list.setSearch} />
      <PackageTable
        loading={list.loading}
        filtered={list.filtered}
        search={list.search}
        onEdit={form.handleOpenEdit}
        onDelete={(id) => { list.setDeletingId(id); list.setDeleteDialogOpen(true); }}
      />
      <PackageFormDialog
        open={form.dialogOpen}
        onOpenChange={form.setDialogOpen}
        editingId={form.editingId}
        saving={form.saving}
        form={form.form}
        departureDatesStr={form.departureDatesStr}
        imageError={form.imageError}
        uploading={form.uploading}
        dragOver={form.dragOver}
        destinationOptions={form.destinationOptions}
        destinationsLoading={form.destinationsLoading}
        destinationsError={form.destinationsError}
        resellers={form.resellers}
        composition={form.composition}
        hotelOptions={form.hotelOptions}
        roomTypeOptions={form.roomTypeOptions}
        excursionOptions={form.excursionOptions}
        transportOptions={form.transportOptions}
        selectorLoading={form.selectorLoading}
        selectorErrors={form.selectorErrors}
        selectedHotelForRoomTypes={form.selectedHotelForRoomTypes}
        selectedDestination={form.selectedDestination}
        imageInputRef={form.imageInputRef}
        onUpdate={form.updateField}
        onToggleComposition={form.toggleComposition}
        onSave={form.handleSave}
        onImageUpload={form.handleImageUpload}
        onRemoveImage={handleRemoveImage}
        setImageError={form.setImageError}
        setDragOver={form.setDragOver}
        setDepartureDatesStr={form.setDepartureDatesStr}
        onRetryDestination={form.fetchDestinationOptions}
        onRetryRelation={handleRetryRelation}
        onDestinationChange={handleDestinationChange}
      />
      <DeletePackageDialog
        open={list.deleteDialogOpen}
        onOpenChange={list.setDeleteDialogOpen}
        onConfirm={list.handleDelete}
      />
    </div>
  );
}

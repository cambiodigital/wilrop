'use client';

import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Anchor, AlertTriangle, Ship } from 'lucide-react';
import { useCruiseAdmin } from './cruises/useCruiseAdmin';
import { CruiseFilters } from './cruises/CruiseFilters';
import { CruiseTable } from './cruises/CruiseTable';
import { CruiseDialog } from './cruises/CruiseDialog';

export default function AdminCruises() {
  const h = useCruiseAdmin();

  return (
    <div className="p-6 space-y-6">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2"><Anchor className="w-6 h-6 text-primary" />Cruceros</h1>
          <p className="text-muted-foreground text-sm mt-1">Administra los cruceros, camarotes, itinerarios y asigna destinos en el portal.</p>
        </div>
        <Button onClick={h.handleOpenCreate} className="bg-primary hover:bg-primary/95 text-white gap-2 shadow-md">
          <Plus className="w-5 h-5" />Crear Crucero
        </Button>
      </div>

      <CruiseFilters search={h.search} onSearchChange={h.setSearch} destinationFilter={h.destinationFilter} onDestinationFilterChange={h.setDestinationFilter} destinations={h.destinations} onRefresh={h.fetchData} />

      <CruiseTable loading={h.loading} filteredCruises={h.filteredCruises} destinations={h.destinations} onEdit={h.handleOpenEdit} onDeleteRequest={(id) => { h.setDeletingId(id); h.setDeleteOpen(true); }} />

      <CruiseDialog open={h.dialogOpen} onOpenChange={h.setDialogOpen} isEditing={h.isEditing} formData={h.formData} onFormChange={h.setFormData} destinations={h.destinations} resellers={h.resellers} newStop={h.newStop} onNewStopChange={h.setNewStop} newCabin={h.newCabin} onNewCabinChange={h.setNewCabin} cabinIncludesInput={h.cabinIncludesInput} onCabinIncludesInputChange={h.setCabinIncludesInput} onAddStop={h.addStop} onRemoveStop={h.removeStop} onAddCabin={h.addCabin} onRemoveCabin={h.removeCabin} onUpdateCabinField={h.updateCabinField} onToggleDestination={h.handleToggleDestination} onSave={h.handleSave} />

      <AlertDialog open={h.deleteOpen} onOpenChange={h.setDeleteOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-6 h-6" />¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará de forma permanente el crucero de la base de datos junto con todas sus categorías de camarotes asociadas. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => h.setDeleteOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={h.handleDelete} className="bg-destructive hover:bg-destructive/95 text-white">Eliminar Permanentemente</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

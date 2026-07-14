'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Building, Route } from 'lucide-react';
import { useTransportProviders } from './transport/useTransportProviders';
import { useTransportServices } from './transport/useTransportServices';
import { TransportProvidersTable } from './transport/TransportProvidersTable';
import { TransportServicesTable } from './transport/TransportServicesTable';
import { TransportProviderForm } from './transport/TransportProviderForm';
import { TransportServiceForm } from './transport/TransportServiceForm';
import { DeleteConfirmDialog } from './transport/DeleteConfirmDialog';

interface AdminTransportProps {
  defaultTab?: 'providers' | 'services';
}

export default function AdminTransport({ defaultTab = 'providers' }: AdminTransportProps) {
  const providers = useTransportProviders();
  const services = useTransportServices();

  return (
    <div className="p-6 space-y-6">
      <div className="page-header">
        <h1 className="flex items-center gap-2">
          <Car className="w-6 h-6 text-primary" /> Transporte
        </h1>
        <p className="mt-1">Gestiona proveedores y servicios de transporte</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="providers" className="gap-2">
            <Building className="w-4 h-4" /> Proveedores ({providers.providers.length})
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <Route className="w-4 h-4" /> Servicios ({services.services.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <TransportProvidersTable
            providers={providers.providers}
            filtered={providers.filtered}
            loading={providers.loading}
            search={providers.search}
            onSearchChange={providers.setSearch}
            onCreate={providers.handleCreate}
            onEdit={providers.handleEdit}
            onDelete={(id) => { providers.setDeletingId(id); providers.setDeleteOpen(true); }}
          />
        </TabsContent>

        <TabsContent value="services">
          <TransportServicesTable
            services={services.services}
            filtered={services.filtered}
            providers={providers.providers}
            loading={services.loading}
            search={services.search}
            onSearchChange={services.setSearch}
            onCreate={() => services.handleCreate(providers.providers)}
            onEdit={services.handleEdit}
            onDelete={(id) => { services.setDeletingId(id); services.setDeleteOpen(true); }}
          />
        </TabsContent>
      </Tabs>

      <TransportProviderForm
        open={providers.dialogOpen}
        onOpenChange={providers.setDialogOpen}
        editing={providers.editing}
        form={providers.form}
        onFormChange={(u) => providers.setForm((p) => ({ ...p, ...u }))}
        onSave={providers.handleSave}
        saving={providers.saving}
      />

      <TransportServiceForm
        open={services.dialogOpen}
        onOpenChange={services.setDialogOpen}
        editing={services.editing}
        form={services.form}
        onFormChange={(u) => services.setForm((s) => ({ ...s, ...u }))}
        onSave={services.handleSave}
        saving={services.saving}
        providers={providers.providers}
        resellers={services.resellers}
        destinationOptions={services.destinationOptions}
        destinationsLoading={services.destinationsLoading}
        destinationsError={services.destinationsError}
        onRetryDestinations={services.fetchDestinationOptions}
        selectedOrigin={services.selectedOrigin}
        selectedDestination={services.selectedDestination}
        originSelectorState={services.originSelectorState}
        destinationSelectorState={services.destinationSelectorState}
      />

      <DeleteConfirmDialog
        open={providers.deleteOpen}
        onOpenChange={providers.setDeleteOpen}
        title="¿Eliminar proveedor?"
        description="Esta acción no se puede deshacer. También se eliminarán todos los servicios asociados a este proveedor."
        onConfirm={() => providers.handleDelete(services.fetchServices)}
      />

      <DeleteConfirmDialog
        open={services.deleteOpen}
        onOpenChange={services.setDeleteOpen}
        title="¿Eliminar servicio?"
        description="Esta acción no se puede deshacer. El servicio será eliminado permanentemente."
        onConfirm={services.handleDelete}
      />
    </div>
  );
}

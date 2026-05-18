'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ResellerClientList from './ResellerClientList';
import ResellerClientForm from './ResellerClientForm';
import ResellerClientDetail from './ResellerClientDetail';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  passport: string;
  notes: string;
  totalPurchases: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export default function ResellerClients() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<(ClientData & { id: string }) | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reseller/clients');
      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Error al cargar clientes');
        return;
      }

      setClients(result.data);
    } catch {
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSelectClient = (client: ClientData) => {
    setSelectedClient(client);
  };

  const handleEditClient = (client: ClientData) => {
    setEditingClient(client);
    setSelectedClient(null);
    setEditDialogOpen(true);
  };

  const handleDeleteClient = () => {
    fetchClients();
    setSelectedClient(null);
  };

  const handleFormSuccess = () => {
    fetchClients();
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setEditingClient(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {clients.length} clientes registrados
          </p>
        </div>
      </div>

      <ResellerClientList
        clients={clients}
        onSelectClient={handleSelectClient}
        onAddClient={() => setAddDialogOpen(true)}
      />

      <ResellerClientForm
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleFormSuccess}
      />

      <ResellerClientForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editingClient={editingClient}
        onSuccess={handleFormSuccess}
      />

      <ResellerClientDetail
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
      />
    </motion.div>
  );
}

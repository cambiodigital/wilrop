'use client';
import { formatDateTime } from '@/lib/date'

import { formatCurrency } from '@/lib/currency'


import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Calendar, IdCard, FileText, Trash2 } from 'lucide-react';
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

interface ResellerClientDetailProps {
  client: ClientData | null;
  onClose: () => void;
  onEdit: (client: ClientData) => void;
  onDelete?: (clientId: string) => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter((_, i) => i === 0 || i === 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getStatusFromActivity = (client: ClientData): string => {
  const daysSinceUpdate = (Date.now() - new Date(client.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (client.totalPurchases === 0) return 'Nuevo';
  if (daysSinceUpdate > 90) return 'Inactivo';
  return 'Activo';
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Activo: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    Inactivo: 'bg-gray-100 text-gray-500 hover:bg-gray-100',
    Nuevo: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  };
  return styles[status] || '';
};

export default function ResellerClientDetail({
  client,
  onClose,
  onEdit,
  onDelete,
}: ResellerClientDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!client) return null;

  const status = getStatusFromActivity(client);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/reseller/clients/${client.id}`, { method: 'DELETE' });
      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Error al eliminar el cliente');
        return;
      }

      toast.success('Cliente eliminado');
      setConfirmDelete(false);
      onClose();
      onDelete?.(client.id);
    } catch {
      toast.error('Error de conexión. Intenta nuevamente.');
    }
  };

  return (
    <Dialog open={!!client || confirmDelete} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg admin-dialog">
        <DialogHeader>
          <DialogTitle>Detalle del Cliente</DialogTitle>
          <DialogDescription>Información completa del cliente</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
            <Avatar className="w-14 h-14 border-2 border-amber-200">
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-lg">
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
              <Badge className={`text-[10px] px-2 py-0.5 mt-1 ${getStatusBadge(status)}`}>
                {status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400">Email</p>
                <p className="text-sm text-gray-700">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400">Teléfono</p>
                <p className="text-sm text-gray-700">{client.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400">País</p>
                <p className="text-sm text-gray-700">{client.country || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400">Pasaporte</p>
                <p className="text-sm text-gray-700">{client.passport || '—'}</p>
              </div>
            </div>
          </div>

          {client.notes && (
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-[10px] text-gray-400">Notas</p>
                <p className="text-sm text-gray-700">{client.notes}</p>
              </div>
            </div>
          )}

          <div className="border-t pt-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Compras</p>
                <p className="text-lg font-bold text-gray-900">{client.totalPurchases}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Gastado</p>
                <p className="text-lg font-bold text-amber-600">{formatCurrency(client.totalSpent)}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Creado</p>
                <p className="text-sm text-gray-700">{formatDateTime(client.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Actualizado</p>
                <p className="text-sm text-gray-700">{formatDateTime(client.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant="outline"
            onClick={() => onEdit(client)}
          >
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm admin-dialog">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a <strong>{client.name}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

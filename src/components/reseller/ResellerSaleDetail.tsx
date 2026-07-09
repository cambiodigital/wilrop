'use client';
import { formatDateTime } from '@/lib/date'

import { formatCurrency } from '@/lib/currency'


import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Calendar, DollarSign, TrendingUp, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SaleData {
  id: string;
  clientName: string;
  clientEmail: string;
  totalAmount: number;
  commissionAmt: number;
  netAmount: number;
  status: string;
  saleDate: string;
  notes: string;
  bookingCode?: string;
  bookingServiceName?: string;
  items?: Array<{
    id: string;
    itemType: string;
    serviceName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    addons?: Array<{ type: string; price: number }>;
  }>;
}

interface ResellerSaleDetailProps {
  sale: SaleData | null;
  onClose: () => void;
  onDelete?: (saleId: string) => void;
  onStatusChange?: () => void;
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

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const statusBadgeStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  confirmed: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  completed: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
};

const validTransitions: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export default function ResellerSaleDetail({
  sale,
  onClose,
  onDelete,
  onStatusChange,
}: ResellerSaleDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  if (!sale) return null;

  const allowedNextStatuses = validTransitions[sale.status] || [];

  const handleStatusChange = async (newStatus: string) => {
    setChangingStatus(true);
    try {
      const response = await fetch(`/api/reseller/sales/${sale.id}?action=status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Error al cambiar el estado');
        return;
      }

      toast.success(`Estado cambiado a "${statusLabels[newStatus]}"`);
      onStatusChange?.();
    } catch {
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/reseller/sales/${sale.id}`, { method: 'DELETE' });
      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Error al eliminar la venta');
        return;
      }

      toast.success('Venta eliminada');
      setConfirmDelete(false);
      onClose();
      onDelete?.(sale.id);
    } catch {
      toast.error('Error de conexión. Intenta nuevamente.');
    }
  };

  return (
    <Dialog open={!!sale || confirmDelete} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg admin-dialog">
        <DialogHeader>
          <DialogTitle>Detalle de Venta</DialogTitle>
          <DialogDescription>Información completa de la transacción</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
            <Avatar className="w-14 h-14 border-2 border-amber-200">
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-lg">
                {getInitials(sale.clientName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{sale.clientName}</h3>
              <Badge className={`text-[10px] px-2 py-0.5 mt-1 ${statusBadgeStyles[sale.status]}`}>
                {statusLabels[sale.status]}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400">Email</p>
                <p className="text-sm text-gray-700">{sale.clientEmail || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400">Fecha</p>
                <p className="text-sm text-gray-700">{formatDateTime(sale.saleDate)}</p>
              </div>
            </div>
          </div>

          {sale.notes && (
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-[10px] text-gray-400">Notas</p>
                <p className="text-sm text-gray-700">{sale.notes}</p>
              </div>
            </div>
          )}

          <div className="border-t pt-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Venta</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(sale.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tu Comisión</p>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(sale.commissionAmt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Neto Operador</p>
                <p className="text-lg font-bold text-gray-700">{formatCurrency(sale.netAmount)}</p>
              </div>
            </div>
          </div>

          {sale.items && sale.items.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Servicios ({sale.items.length})</p>
              <div className="space-y-2">
                {sale.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.serviceName || item.itemType}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                        <span className="text-xs text-gray-500">Unit: {formatCurrency(item.unitPrice)}</span>
                        <span className="text-xs text-gray-500">Cant: {item.quantity}</span>
                        <span className="text-xs text-gray-500">Total: {formatCurrency(item.totalPrice)}</span>
                      </div>
                      {item.addons && item.addons.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.addons.map((addon, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] py-0 px-1.5">
                              {addon.type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sale.bookingCode && (
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500">Booking</p>
              <p className="text-sm font-mono text-amber-600">{sale.bookingCode}</p>
              {sale.bookingServiceName && (
                <p className="text-xs text-gray-500 mt-1">{sale.bookingServiceName}</p>
              )}
            </div>
          )}

          {allowedNextStatuses.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2">Cambiar Estado</p>
              <div className="flex gap-2">
                {allowedNextStatuses.map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(status)}
                    disabled={changingStatus}
                    className={
                      status === 'confirmed'
                        ? 'border-blue-200 text-blue-700 hover:bg-blue-50'
                        : status === 'completed'
                          ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          : 'border-red-200 text-red-700 hover:bg-red-50'
                    }
                  >
                    {changingStatus ? (
                      <span className="flex items-center gap-1">
                        Cambiando...
                      </span>
                    ) : (
                      statusLabels[status]
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {(sale.status === 'pending' || sale.status === 'cancelled') && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm admin-dialog">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta venta de{' '}
              <strong>{sale.clientName}</strong>? Esta acción no se puede deshacer.
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PendingProductsTable, type PendingItem } from './PendingProductsTable';

const TYPE_LABELS: Record<string, string> = {
  package: 'Paquete', hotel: 'Hotel', excursion: 'Excursión',
  cruise: 'Crucero', transport: 'Transporte', destination: 'Destino',
};

function getProductName(item: PendingItem): string {
  return String(item.product.title ?? item.product.name ?? 'Sin nombre');
}

export default function AdminProductReview() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [confirmAction, setConfirmAction] = useState<{
    item: PendingItem; action: 'approve' | 'reject';
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products/pending');
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch {
      toast.error('Error al cargar productos pendientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleReview = async () => {
    if (!confirmAction) return;
    setProcessing(true);
    const { item, action } = confirmAction;
    try {
      const res = await fetch(`/api/admin/products/${item.type}/${item.product.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setItems((prev) => prev.filter((i) => i.product.id !== item.product.id));
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error('Error al procesar la revisión');
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  const filtered = typeFilter === 'all' ? items : items.filter((i) => i.type === typeFilter);

  const countsByType = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">Revisión de Productos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Productos creados por revendedores que esperan aprobación.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos ({items.length})</SelectItem>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label} ({countsByType[key] || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchPending} disabled={loading}>
          Refrescar
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay productos pendientes de revisión.</p>
        </Card>
      ) : (
        <Card>
          <PendingProductsTable
            items={filtered}
            onApprove={(item) => setConfirmAction({ item, action: 'approve' })}
            onReject={(item) => setConfirmAction({ item, action: 'reject' })}
          />
        </Card>
      )}

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => { if (!open && !processing) setConfirmAction(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === 'approve' ? 'Aprobar producto' : 'Rechazar producto'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === 'approve'
                ? `El producto "${confirmAction ? getProductName(confirmAction.item) : ''}" será visible públicamente.`
                : `El producto "${confirmAction ? getProductName(confirmAction.item) : ''}" será rechazado y no se publicará.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={processing}
              onClick={handleReview}
              className={confirmAction?.action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {processing ? 'Procesando...' : confirmAction?.action === 'approve' ? 'Aprobar' : 'Rechazar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

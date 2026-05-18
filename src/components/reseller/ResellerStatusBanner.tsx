'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<string, { label: string; className: string; message: string }> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    message: 'Tu cuenta está siendo revisada por el administrador.',
  },
  under_review: {
    label: 'En Revisión',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    message: 'Tu solicitud está siendo evaluada. Pronto recibirás una respuesta.',
  },
  approved: {
    label: 'Aprobado',
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    message: 'Tu cuenta está activa y lista para vender.',
  },
  rejected: {
    label: 'Rechazado',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
    message: 'Tu solicitud fue rechazada. Contacta al administrador.',
  },
};

export function ResellerStatusBanner({ approvalStatus, rejectionReason }: { approvalStatus: string; rejectionReason?: string | null }) {
  const config = statusConfig[approvalStatus] ?? statusConfig.pending;

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Badge className={config.className}>{config.label}</Badge>
        <p className="text-sm text-gray-600 flex-1">{config.message}</p>
        {rejectionReason && approvalStatus === 'rejected' && (
          <p className="text-xs text-red-500 mt-1 sm:mt-0">Motivo: {rejectionReason}</p>
        )}
      </CardContent>
    </Card>
  );
}

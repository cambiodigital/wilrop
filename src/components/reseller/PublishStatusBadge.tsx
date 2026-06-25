import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  status?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending_review: {
    label: 'Pendiente',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    icon: <AlertTriangle className="size-3" />,
  },
  approved: {
    label: 'Aprobado',
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    icon: <CheckCircle2 className="size-3" />,
  },
  rejected: {
    label: 'Rechazado',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
    icon: <XCircle className="size-3" />,
  },
};

export function PublishStatusBadge({ status }: Props) {
  const config = status ? STATUS_CONFIG[status] : null;
  if (!config) return null;

  return (
    <Badge className={`gap-1 ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

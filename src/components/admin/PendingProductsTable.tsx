import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

type ProductType = 'package' | 'hotel' | 'excursion' | 'cruise' | 'transport' | 'destination';

const TYPE_LABELS: Record<ProductType, string> = {
  package: 'Paquete', hotel: 'Hotel', excursion: 'Excursión',
  cruise: 'Crucero', transport: 'Transporte', destination: 'Destino',
};

const TYPE_BADGE_VARIANTS: Record<ProductType, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  package: 'default', hotel: 'secondary', excursion: 'outline',
  cruise: 'default', transport: 'secondary', destination: 'outline',
};

function getProductName(item: PendingItem): string {
  return String(item.product.title ?? item.product.name ?? 'Sin nombre');
}

function getAdminLink(type: ProductType): string {
  const map: Record<string, string> = {
    package: 'paquetes', hotel: 'hoteles', excursion: 'excursiones',
    cruise: 'cruceros', transport: 'transportes', destination: 'destinos',
  };
  return `/admin/${map[type]}`;
}

export interface PendingItem {
  type: ProductType;
  product: Record<string, unknown>;
  reseller: { id: string; companyName: string; contactName: string; email: string } | null;
}

interface Props {
  items: PendingItem[];
  onApprove: (item: PendingItem) => void;
  onReject: (item: PendingItem) => void;
}

export function PendingProductsTable({ items, onApprove, onReject }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead>Revendedor</TableHead>
          <TableHead className="w-28">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={`${item.type}-${item.product.id}`}>
            <TableCell>
              <Badge variant={TYPE_BADGE_VARIANTS[item.type]}>
                {TYPE_LABELS[item.type]}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">{getProductName(item)}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {item.reseller ? (
                <div>
                  <p className="text-card-foreground">{item.reseller.companyName}</p>
                  <p className="text-xs">{item.reseller.email}</p>
                </div>
              ) : '—'}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon"
                  className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                  onClick={() => onApprove(item)} title="Aprobar">
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => onReject(item)} title="Rechazar">
                  <XCircle className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                  <a href={getAdminLink(item.type)} target="_blank" rel="noopener noreferrer" title="Ver en panel">
                    <Eye className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

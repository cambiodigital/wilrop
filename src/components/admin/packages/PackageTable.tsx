'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import type { TravelPackage } from '@/components/admin/packages/types';

interface Props {
  loading: boolean;
  filtered: TravelPackage[];
  search: string;
  onEdit: (pkg: TravelPackage) => void;
  onDelete: (id: string) => void;
}

export function PackageTable({ loading, filtered, search, onEdit, onDelete }: Props) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Agotado</TableHead>
                  <TableHead>Comisión</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {search ? 'No se encontraron resultados' : 'No hay paquetes registrados'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium text-sm max-w-[200px] truncate">
                        {pkg.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{pkg.destinationName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{pkg.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {pkg.duration}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{formatCurrency(pkg.price)}</span>
                          {pkg.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(pkg.originalPrice)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm">{pkg.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pkg.soldOut ? (
                          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 text-xs">Agotado</Badge>
                        ) : (
                          <Badge className="bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/10 text-xs">Disponible</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-primary">{pkg.commission}%</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(pkg)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(pkg.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

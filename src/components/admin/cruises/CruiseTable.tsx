'use client';

import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ship, Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { Cruise, DestinationOption } from './types';

interface CruiseTableProps {
  loading: boolean;
  filteredCruises: Cruise[];
  destinations: DestinationOption[];
  onEdit: (cruise: Cruise) => void;
  onDeleteRequest: (id: string) => void;
}

export function CruiseTable({ loading, filteredCruises, destinations, onEdit, onDeleteRequest }: CruiseTableProps) {
  if (loading) {
    return (
      <Card className="shadow-sm border-border/40 overflow-hidden">
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  if (filteredCruises.length === 0) {
    return (
      <Card className="shadow-sm border-border/40 overflow-hidden">
        <div className="p-12 text-center text-muted-foreground">
          <Ship className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="font-semibold text-lg">No se encontraron cruceros</h3>
          <p className="text-sm mt-1">Crea un crucero o ajusta tus filtros de búsqueda.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-border/40 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Crucero</TableHead>
              <TableHead>Operador / Barco</TableHead>
              <TableHead className="text-center">Duración</TableHead>
              <TableHead>Destino Primario</TableHead>
              <TableHead className="text-right">Tarifa Base</TableHead>
              <TableHead className="text-center">Destacado</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCruises.map((c) => {
              const primaryDest = destinations.find(d => d.id === c.primaryDestinationId);
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-3">
                      {c.images?.length > 0 ? (
                        <img src={c.images[0]} alt={c.name} className="w-10 h-10 object-cover rounded-md border border-border" />
                      ) : (
                        <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-md border border-border">
                          <Ship className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p>{c.name}</p>
                        <span className="text-[10px] text-muted-foreground font-normal block max-w-xs truncate">/{c.slug}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{c.operator}</p>
                    <span className="text-xs text-muted-foreground">{c.shipName}</span>
                  </TableCell>
                  <TableCell className="text-center font-medium">{c.durationDays} días</TableCell>
                  <TableCell>
                    {primaryDest ? (
                      <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">{primaryDest.name}</Badge>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-right font-bold text-sky-700">{formatCurrency(c.priceFrom)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={c.featured ? 'default' : 'secondary'} className={cn("text-[10px]", c.featured && "bg-amber-500 text-white hover:bg-amber-600")}>
                      {c.featured ? 'Sí' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={c.active ? 'outline' : 'destructive'} className={cn("text-[10px]", c.active && "border-green-200 bg-green-50 text-green-700")}>
                      {c.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => window.open(`/cruceros/${c.slug}`, '_blank')} title="Ver en Portal">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => onEdit(c)} title="Editar crucero">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDeleteRequest(c.id)} title="Eliminar crucero">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

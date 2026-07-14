'use client';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { type TransportService, type TransportProvider, routeTypeLabels } from './types';

interface Props {
  services: TransportService[];
  filtered: TransportService[];
  providers: TransportProvider[];
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onCreate: () => void;
  onEdit: (s: TransportService) => void;
  onDelete: (id: string) => void;
}

export function TransportServicesTable({
  filtered, providers, loading, search, onSearchChange, onCreate, onEdit, onDelete,
}: Props) {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar servicio..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" />
            </div>
          </CardContent>
        </Card>
        <Button onClick={onCreate} disabled={providers.length === 0}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Servicio
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Precio Base</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        {search ? 'No se encontraron resultados' : providers.length === 0 ? 'Primero crea un proveedor' : 'No hay servicios registrados'}
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-sm">{s.name || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.provider?.name || '—'}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{routeTypeLabels[s.routeType] || s.routeType}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.origin || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.destination || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.cityName || '—'}</TableCell>
                      <TableCell className="text-sm">{s.durationMins} min</TableCell>
                      <TableCell className="text-sm font-semibold">{formatCurrency(s.basePrice)}</TableCell>
                      <TableCell>
                        {s.active
                          ? <Badge className="bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/10 text-xs">Activo</Badge>
                          : <Badge className="bg-muted text-muted-foreground hover:bg-muted text-xs">Inactivo</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(s)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(s.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

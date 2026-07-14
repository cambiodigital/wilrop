'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw } from 'lucide-react';
import type { DestinationOption } from './types';

interface CruiseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  destinationFilter: string;
  onDestinationFilterChange: (value: string) => void;
  destinations: DestinationOption[];
  onRefresh: () => void;
}

export function CruiseFilters({
  search, onSearchChange, destinationFilter, onDestinationFilterChange, destinations, onRefresh,
}: CruiseFiltersProps) {
  return (
    <Card className="shadow-xs border-border/40 bg-card/60 backdrop-blur-md">
      <CardContent className="p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, barco u operador..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={destinationFilter} onOpenChange={() => {}} onValueChange={onDestinationFilterChange}>
            <SelectTrigger><SelectValue placeholder="Filtrar por Destino" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los destinos</SelectItem>
              {destinations.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" onClick={onRefresh} title="Refrescar datos">
          <RefreshCw className="w-4.5 h-4.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

'use client';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';

interface Props {
  onCreate: () => void;
}

export function PackageListHeader({ onCreate }: Props) {
  return (
    <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          Paquetes
        </h1>
        <p className="mt-1">
          Gestiona los paquetes turísticos disponibles
        </p>
      </div>
      <Button onClick={onCreate} size="default">
        <Plus className="w-4 h-4 mr-2" />
        Nuevo Paquete
      </Button>
    </div>
  );
}

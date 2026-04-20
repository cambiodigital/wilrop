import Link from 'next/link';
import { ArrowLeft, Route } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminDetailRoutePlaceholderProps {
  entityLabel: string;
  id: string;
  backHref: string;
}

export default function AdminDetailRoutePlaceholder({
  entityLabel,
  id,
  backHref,
}: AdminDetailRoutePlaceholderProps) {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <Button asChild variant="outline" size="sm">
          <Link href={backHref}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a {entityLabel}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Detalle de {entityLabel}</CardTitle>
          <CardDescription>
            Ruta dinámica habilitada para completar la migración de URLs del panel admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <Route className="w-4 h-4" />
            <span className="text-sm font-medium">ID detectado: {id}</span>
          </div>
          <p className="text-sm text-gray-600">
            Esta URL ya es navegable y puede enlazarse desde tablas/listados para edición o detalle por entidad.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

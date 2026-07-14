'use client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FieldHelper, FieldTooltip } from '@/components/ui/form-helpers';

interface Props {
  description: string;
  includes: string[];
  departureDatesStr: string;
  onUpdate: <K extends string>(key: K, value: any) => void;
  setDepartureDatesStr: (v: string) => void;
}

export function PackageDescriptionFields({
  description, includes, departureDatesStr, onUpdate, setDepartureDatesStr,
}: Props) {
  return (
    <>
      <div>
        <div className="form-section-title">
          Descripcion
          <FieldTooltip label="Descripcion detallada del paquete" />
        </div>
        <Textarea value={description} onChange={(e) => onUpdate('description', e.target.value)} placeholder="Descripcion detallada del paquete..." rows={4} />
        <FieldHelper>Incluye itinerario dia por dia, recomendaciones</FieldHelper>
      </div>

      <div>
        <div className="form-section-title">
          Que Incluye
          <FieldTooltip label="Servicios y elementos incluidos. Uno por linea" />
        </div>
        <Textarea
          value={includes.join('\n')}
          onChange={(e) => onUpdate('includes', e.target.value.split('\n').map((i: string) => i.trim()).filter(Boolean))}
          placeholder={"Alojamiento en hotel boutique 4★\nDesayuno buffet diario\nTour privado Ciudad Amurallada"}
          rows={5}
        />
        <FieldHelper>Ej: Alojamiento, Desayuno, Traslados, Seguro</FieldHelper>
        <p className="text-xs text-muted-foreground mt-1">Un item por linea</p>
      </div>

      <div>
        <div className="form-section-title">
          Fechas de Salida
          <FieldTooltip label="Fechas disponibles. Separa con comas" />
        </div>
        <Input
          value={departureDatesStr}
          onChange={(e) => {
            setDepartureDatesStr(e.target.value);
            onUpdate('departureDates', e.target.value.split(',').map((d: string) => d.trim()).filter(Boolean));
          }}
          placeholder="2025-07-15, 2025-08-10, 2025-09-05"
        />
        <FieldHelper>Ej: 15 Julio, 1 Agosto, 15 Agosto</FieldHelper>
        <p className="text-xs text-muted-foreground mt-1">Fechas separadas por coma (YYYY-MM-DD)</p>
      </div>
    </>
  );
}

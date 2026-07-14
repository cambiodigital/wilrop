'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldHelper, FieldTooltip } from '@/components/ui/form-helpers';

interface Props {
  price: number;
  originalPrice?: number;
  commission: number;
  onUpdate: <K extends string>(key: K, value: any) => void;
}

export function PackagePricingFields({ price, originalPrice, commission, onUpdate }: Props) {
  return (
    <div>
      <div className="form-section-title">Precios y Comision</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pkg-price">
            Precio (COP)
            <FieldTooltip label="Precio de venta actual del paquete en COP" />
          </Label>
          <Input id="pkg-price" type="number" value={price} onChange={(e) => onUpdate('price', Number(e.target.value))} placeholder="1250000" />
          <FieldHelper>Visible en listados y pagina de detalle</FieldHelper>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pkg-original-price">
            Precio Original (COP)
            <FieldTooltip label="Precio sin descuento. Si es mayor, se muestra oferta" />
          </Label>
          <Input id="pkg-original-price" type="number" value={originalPrice ?? ''} onChange={(e) => onUpdate('originalPrice', e.target.value ? Number(e.target.value) : undefined)} placeholder="1480000 (opcional)" />
          <FieldHelper>Opcional. Define si aplica descuento</FieldHelper>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pkg-commission">
            Comision (%)
            <FieldTooltip label="Porcentaje de comision para revendedores" />
          </Label>
          <Input id="pkg-commission" type="number" min="0" max="100" value={commission} onChange={(e) => onUpdate('commission', Number(e.target.value))} />
          <FieldHelper>Define la ganancia del revendedor al vender este paquete</FieldHelper>
        </div>
      </div>
    </div>
  );
}

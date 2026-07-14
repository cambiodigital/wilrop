'use client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FieldHelper, FieldTooltip } from '@/components/ui/form-helpers';

interface Props {
  soldOut: boolean;
  active: boolean;
  resellerId: string | null | undefined;
  resellers: any[];
  onUpdate: <K extends string>(key: K, value: any) => void;
}

export function PackageToggles({ soldOut, active, resellerId, resellers, onUpdate }: Props) {
  return (
    <>
      <div className="space-y-1.5 pt-2">
        <Label htmlFor="package-reseller">
          Asignar a Revendedor
          <FieldTooltip label="Asigna a un revendedor o dejalo global" />
        </Label>
        <select
          id="package-reseller"
          value={resellerId ?? ''}
          onChange={(e) => onUpdate('resellerId', e.target.value || '')}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Ninguno / Global (Administrador)</option>
          {resellers.map((r) => (
            <option key={r.id} value={r.id}>{r.companyName || r.contactName || r.email}</option>
          ))}
        </select>
        <FieldHelper>Paquetes asignados solo los ve ese revendedor</FieldHelper>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Switch checked={soldOut} onCheckedChange={(checked) => onUpdate('soldOut', checked)} />
          <Label>
            Agotado
            <FieldTooltip label="Marca como agotado para ocultar disponibilidad" />
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={active} onCheckedChange={(checked) => onUpdate('active', checked)} />
          <Label>
            Activo
            <FieldTooltip label="Si esta desactivado, no aparece en el portal" />
          </Label>
        </div>
        <FieldHelper>Desactiva para ocultar temporalmente</FieldHelper>
      </div>
    </>
  );
}

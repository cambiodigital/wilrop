'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageGallery } from '@/components/admin/ImageGallery';
import { FieldHelper, FieldTooltip } from '@/components/ui/form-helpers';
import { TagInput } from './TagInput';
import type { CruiseFormData, DestinationOption } from './types';

interface CruiseInfoTabProps {
  formData: CruiseFormData;
  onFormChange: (data: CruiseFormData) => void;
  destinations: DestinationOption[];
  resellers: any[];
}

export function CruiseInfoTab({ formData, onFormChange, destinations, resellers }: CruiseInfoTabProps) {
  const set = (patch: Partial<CruiseFormData>) => onFormChange({ ...formData, ...patch });

  return (
    <div className="space-y-4 pt-4 overflow-y-auto flex-1 min-h-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Crucero *<FieldTooltip label="Nombre del crucero. Visible en el portal" /></Label>
          <Input id="name" value={formData.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ej. Caribe de Ensueño Premium" required />
          <FieldHelper>Ej: Caribe Sonado - 7 Noches</FieldHelper>
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL corta)<FieldTooltip label="Identificador unico en la URL. Auto-generado" /></Label>
          <Input id="slug" value={formData.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="Autogenerado si se deja vacio" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="operator">Operador / Naviera<FieldTooltip label="Empresa que opera el crucero" /></Label>
          <Input id="operator" value={formData.operator} onChange={(e) => set({ operator: e.target.value })} placeholder="Ej. Royal Caribbean, Pullmantur" />
          <FieldHelper>Ej: Royal Caribbean, Carnival, MSC</FieldHelper>
        </div>
        <div className="space-y-2">
          <Label htmlFor="shipName">Nombre del Barco<FieldTooltip label="Nombre del barco o embarcacion" /></Label>
          <Input id="shipName" value={formData.shipName} onChange={(e) => set({ shipName: e.target.value })} placeholder="Ej. Monarch, Oasis of the Seas" />
          <FieldHelper>Ej: Wonder of the Seas, Carnival Celebration</FieldHelper>
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationDays">Duracion en Dias<FieldTooltip label="Duracion total del crucero en dias" /></Label>
          <Input id="durationDays" type="number" min={1} value={formData.durationDays} onChange={(e) => set({ durationDays: parseInt(e.target.value, 10) })} />
          <FieldHelper>Numero de dias de navegacion</FieldHelper>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Calificacion (Rating)<FieldTooltip label="Calificacion del crucero. Visible en portal" /></Label>
          <Input id="rating" type="number" step={0.1} min={0} max={5} value={formData.rating} onChange={(e) => set({ rating: parseFloat(e.target.value) })} />
          <FieldHelper>Valor entre 0 y 10</FieldHelper>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reviewCount">Numero de Resenas<FieldTooltip label="Cantidad de resenas de pasajeros" /></Label>
          <Input id="reviewCount" type="number" min={0} value={formData.reviewCount} onChange={(e) => set({ reviewCount: parseInt(e.target.value, 10) })} />
          <FieldHelper>Numero acumulado de resenas</FieldHelper>
        </div>
        <div className="space-y-2">
          <Label htmlFor="primaryDestinationId">Destino Principal de Salida<FieldTooltip label="Puerto o ciudad de embarque" /></Label>
          <Select value={formData.primaryDestinationId || 'none'} onValueChange={(val) => set({ primaryDestinationId: val === 'none' ? null : val })}>
            <SelectTrigger><SelectValue placeholder="Seleccione un destino de origen" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguno</SelectItem>
              {destinations.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripcion del crucero<FieldTooltip label="Descripcion detallada del crucero" /></Label>
        <Textarea id="description" rows={4} value={formData.description} onChange={(e) => set({ description: e.target.value })} placeholder="Describe los puntos mas atractivos de este viaje en crucero..." />
        <FieldHelper>Incluye ruta, atracciones, vida a bordo</FieldHelper>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Que Incluye el Crucero? (Servicios generales)<FieldTooltip label="Servicios incluidos en el precio" /></Label>
          <TagInput tags={formData.includes} onChange={(tags) => set({ includes: tags })} placeholder="Ej. Pension Completa, Shows en vivo, Propinas, Wifi" />
          <FieldHelper>Ej: Comidas, Entretenimiento, Impuestos portuarios</FieldHelper>
        </div>
        <div className="space-y-2">
          <Label>Etiquetas / Categorias del crucero<FieldTooltip label="Tags para filtros y busquedas" /></Label>
          <TagInput tags={formData.tags} onChange={(tags) => set({ tags })} placeholder="Ej. Familias, Romantico, Todo Incluido, Lujo" />
          <FieldHelper>Ej: Familiar, Lujo, Aventura, Todo Incluido</FieldHelper>
        </div>
      </div>

      <div className="border border-border rounded-lg p-4 bg-muted/40">
        <ImageGallery images={formData.images} onImagesChange={(images) => set({ images })} label="Galeria de Fotos del Crucero (barco, itinerarios, vistas)" maxImages={6} />
        <FieldHelper>PNG, JPG, WebP. Max 5MB. Arrastra para reordenar</FieldHelper>
      </div>

      <div className="space-y-1.5 pt-2">
        <Label htmlFor="cruise-reseller">Asignar a Revendedor<FieldTooltip label="Asigna este crucero a un revendedor o dejalo global" /></Label>
        <select id="cruise-reseller" value={formData.resellerId ?? ''} onChange={(e) => set({ resellerId: e.target.value || '' })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
          <option value="">Ninguno / Global (Administrador)</option>
          {resellers.map((r) => <option key={r.id} value={r.id}>{r.companyName || r.contactName || r.email}</option>)}
        </select>
        <FieldHelper>Cruceros asignados solo los ve ese revendedor</FieldHelper>
      </div>

      <div className="flex gap-6 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Switch id="active" checked={formData.active} onCheckedChange={(checked) => set({ active: checked })} />
          <Label htmlFor="active">Crucero Activo (Visible en portal)<FieldTooltip label="Si esta desactivado, no aparece en el portal" /></Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="featured" checked={formData.featured} onCheckedChange={(checked) => set({ featured: checked })} />
          <Label htmlFor="featured">Destacar Crucero (Aparece en home)<FieldTooltip label="Los cruceros destacados aparecen primero en el portal" /></Label>
        </div>
      </div>
    </div>
  );
}

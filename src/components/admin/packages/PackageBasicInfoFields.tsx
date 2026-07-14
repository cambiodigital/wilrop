'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldHelper, FieldTooltip } from '@/components/ui/form-helpers';
import { categories, difficulties } from '@/components/admin/packages/types';

interface Props {
  title: string;
  slug: string;
  category: string;
  duration: string;
  difficulty: string;
  groupSize: string;
  rating: number;
  onUpdate: <K extends string>(key: K, value: any) => void;
}

export function PackageBasicInfoFields({
  title, slug, category, duration, difficulty, groupSize, rating, onUpdate,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pkg-title" className="label-required">
            Titulo
            <FieldTooltip label="Nombre del paquete turistico. Visible en el portal" />
          </Label>
          <Input id="pkg-title" value={title} onChange={(e) => onUpdate('title', e.target.value)} placeholder="Cartagena Romantica" />
          <FieldHelper>Ej: Cartagena Todo Incluido 5 Dias</FieldHelper>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pkg-slug">
            Slug
            <FieldTooltip label="Identificador unico en la URL. Auto-generado" />
          </Label>
          <Input id="pkg-slug" value={slug} onChange={(e) => onUpdate('slug', e.target.value)} placeholder="Auto-generado del titulo" />
          <FieldHelper>Solo letras, numeros y guiones</FieldHelper>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
        <div className="space-y-1.5">
          <Label htmlFor="pkg-category">
            Categoria
            <FieldTooltip label="Tipo de paquete. Define filtros en busquedas" />
          </Label>
          <select id="pkg-category" value={category} onChange={(e) => onUpdate('category', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pkg-duration">
            Duracion
            <FieldTooltip label="Duracion del paquete" />
          </Label>
          <Input id="pkg-duration" value={duration} onChange={(e) => onUpdate('duration', e.target.value)} placeholder="4 dias / 3 noches" />
          <FieldHelper>Formato libre: '5 dias / 4 noches', '3 dias'</FieldHelper>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pkg-difficulty">
            Dificultad
            <FieldTooltip label="Nivel de actividad fisica requerida" />
          </Label>
          <select id="pkg-difficulty" value={difficulty} onChange={(e) => onUpdate('difficulty', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <FieldHelper>Facil, Moderado, Avanzado</FieldHelper>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="space-y-1.5">
          <Label htmlFor="pkg-group">
            Tamano Grupo
            <FieldTooltip label="Cantidad de personas por grupo" />
          </Label>
          <Input id="pkg-group" value={groupSize} onChange={(e) => onUpdate('groupSize', e.target.value)} placeholder="2 – 8 personas" />
          <FieldHelper>Grupo pequeno, mediano o grande</FieldHelper>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pkg-rating">
            Rating
            <FieldTooltip label="Calificacion del paquete. Visible en portal" />
          </Label>
          <Input id="pkg-rating" type="number" min="0" max="5" step="0.1" value={rating} onChange={(e) => onUpdate('rating', Number(e.target.value))} />
          <FieldHelper>Valor entre 0 y 10</FieldHelper>
        </div>
      </div>
    </>
  );
}

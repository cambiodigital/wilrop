'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Megaphone,
  Save,
  Eye,
  EyeOff,
  Clock,
  ImageIcon,
  Type,
  MousePointerClick,
  LayoutGrid,
} from 'lucide-react';
import { toast } from 'sonner';

interface ModalConfig {
  id: string;
  active: boolean;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  ctaType: string;
  timerEnabled: boolean;
  timerLabel: string;
  timerEnd: string | null;
  position: string;
  delayMs: number;
}

const emptyConfig: ModalConfig = {
  id: '',
  active: false,
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  ctaText: 'Ver Oferta',
  ctaLink: '',
  ctaType: 'navigate',
  timerEnabled: false,
  timerLabel: 'Oferta termina en',
  timerEnd: null,
  position: 'center',
  delayMs: 3000,
};

export default function AdminMarketingModal() {
  const [config, setConfig] = useState<ModalConfig>(emptyConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketing-modal');
      if (!res.ok) throw new Error('Error al cargar configuración');
      const json = await res.json();
      setConfig(json.data || emptyConfig);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/marketing-modal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Error al guardar');
      const json = await res.json();
      setConfig(json.data || config);
      toast.success('Modal de marketing actualizado correctamente');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof ModalConfig>(key: K, value: ModalConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-600" />
            Modal de Marketing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configura el popup promocional que se muestra a los visitantes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            {config.active ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                <Eye className="w-3 h-3 mr-1" />
                Activo
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100">
                <EyeOff className="w-3 h-3 mr-1" />
                Inactivo
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Ocultar Vista Previa' : 'Vista Previa'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activation */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-base">Visibilidad</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Modal activo</Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    El popup se mostrará a los visitantes del portal
                  </p>
                </div>
                <Switch
                  checked={config.active}
                  onCheckedChange={(checked) => updateField('active', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-base">Contenido</CardTitle>
              </div>
              <CardDescription>
                Textos e imagen que se mostrarán en el popup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mm-title">Título</Label>
                  <Input
                    id="mm-title"
                    value={config.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="¡Oferta Especial de Verano!"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mm-subtitle">Subtítulo</Label>
                  <Input
                    id="mm-subtitle"
                    value={config.subtitle}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    placeholder="Hasta 30% de descuento"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mm-desc">Descripción</Label>
                <Textarea
                  id="mm-desc"
                  value={config.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe la oferta o promoción..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mm-image" className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  URL de Imagen
                </Label>
                <Input
                  id="mm-image"
                  value={config.imageUrl}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                  placeholder="/images/cartagena.png"
                />
                {config.imageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 max-w-xs">
                    <img
                      src={config.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-base">Botón de Acción (CTA)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mm-cta-text">Texto del botón</Label>
                  <Input
                    id="mm-cta-text"
                    value={config.ctaText}
                    onChange={(e) => updateField('ctaText', e.target.value)}
                    placeholder="Ver Oferta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mm-cta-link">Enlace / Vista destino</Label>
                  <Input
                    id="mm-cta-link"
                    value={config.ctaLink}
                    onChange={(e) => updateField('ctaLink', e.target.value)}
                    placeholder="portal-destinations o https://..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mm-cta-type">Tipo de acción</Label>
                <Select
                  value={config.ctaType}
                  onValueChange={(v) => updateField('ctaType', v)}
                >
                  <SelectTrigger id="mm-cta-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="navigate">Navegación interna (vista SPA)</SelectItem>
                    <SelectItem value="link">Enlace externo (URL)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">
                  {config.ctaType === 'navigate'
                    ? 'El botón navegará a una vista interna del portal (ej: portal-destinations, portal-hotels)'
                    : 'El botón abrirá una URL externa en una nueva pestaña'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — Settings & Preview */}
        <div className="space-y-6">
          {/* Timer Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-base">Temporizador</CardTitle>
              </div>
              <CardDescription>
                Regresiva para promociones con fecha límite
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Activar temporizador</Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Muestra cuenta regresiva en el popup
                  </p>
                </div>
                <Switch
                  checked={config.timerEnabled}
                  onCheckedChange={(checked) => updateField('timerEnabled', checked)}
                />
              </div>

              {config.timerEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="mm-timer-label">Texto del temporizador</Label>
                    <Input
                      id="mm-timer-label"
                      value={config.timerLabel}
                      onChange={(e) => updateField('timerLabel', e.target.value)}
                      placeholder="Oferta termina en"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mm-timer-end">Fecha y hora de fin</Label>
                    <Input
                      id="mm-timer-end"
                      type="datetime-local"
                      value={
                        config.timerEnd
                          ? new Date(config.timerEnd).toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={(e) =>
                        updateField(
                          'timerEnd',
                          e.target.value ? new Date(e.target.value).toISOString() : null
                        )
                      }
                    />
                    <p className="text-xs text-gray-400">
                      Cuando el temporizador llegue a cero, el modal se ocultará automáticamente
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-base">Visualización</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mm-position">Posición del popup</Label>
                <Select
                  value={config.position}
                  onValueChange={(v) => updateField('position', v)}
                >
                  <SelectTrigger id="mm-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Centro de pantalla</SelectItem>
                    <SelectItem value="bottom-right">Esquina inferior derecha</SelectItem>
                    <SelectItem value="bottom-left">Esquina inferior izquierda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mm-delay">Retardo de aparición (ms)</Label>
                <Input
                  id="mm-delay"
                  type="number"
                  min={0}
                  max={30000}
                  step={500}
                  value={config.delayMs}
                  onChange={(e) => updateField('delayMs', Number(e.target.value))}
                />
                <p className="text-xs text-gray-400">
                  Tiempo en milisegundos antes de mostrar el popup (3000 ms = 3 seg)
                </p>
              </div>

              <Separator className="my-2" />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700 font-medium mb-1">Comportamiento</p>
                <ul className="text-xs text-amber-600 space-y-1">
                  <li>• Se muestra una vez por sesión del navegador</li>
                  <li>• Si el usuario cierra el popup, no vuelve en la misma sesión</li>
                  <li>• Si pasan 24 horas, se vuelve a mostrar</li>
                  <li>• Si el temporizador expira, el popup se desactiva</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-dashed border-amber-300 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="text-base text-amber-700">
                👁️ Vista Previa del Modal
              </CardTitle>
              <CardDescription>
                Así se verá el popup en el portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black/40 rounded-xl overflow-hidden" style={{ minHeight: 320 }}>
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                    {config.imageUrl && (
                      <div className="relative h-40">
                        <img
                          src={config.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    )}
                    <div className="p-5">
                      {config.subtitle && (
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                          {config.subtitle}
                        </p>
                      )}
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {config.title || 'Título del Modal'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {config.description || 'Descripción de la oferta...'}
                      </p>
                      {config.timerEnabled && config.timerEnd && (
                        <div className="bg-amber-50 rounded-lg p-2.5 mb-4 text-center">
                          <p className="text-[10px] text-amber-600 uppercase tracking-wider font-medium">
                            {config.timerLabel}
                          </p>
                          <p className="text-lg font-bold text-amber-700 font-mono">
                            23:59:59
                          </p>
                        </div>
                      )}
                      <button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-amber-500/25">
                        {config.ctaText || 'Ver Oferta'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

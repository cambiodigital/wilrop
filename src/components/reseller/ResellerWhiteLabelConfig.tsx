'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Palette, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

interface WhiteLabelConfigProps {
  enabled: boolean;
  brandName?: string;
  brandColor?: string;
  logoUrl?: string;
  customDomain?: string;
}

export default function ResellerWhiteLabelConfig({
  enabled,
  brandName,
  brandColor,
  logoUrl,
  customDomain,
}: WhiteLabelConfigProps) {
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(enabled);
  const [form, setForm] = useState({
    brandName: brandName || '',
    brandColor: brandColor || '#f59e0b',
    customDomain: customDomain || '',
  });
  const [saving, setSaving] = useState(false);

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Marca Blanca</CardTitle>
          <CardDescription>
            Personaliza tu panel con tu propia marca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <Palette className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              La configuración de marca blanca no está habilitada para tu cuenta.
              Contacta al administrador para activarla.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/reseller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whiteLabel: {
            enabled: whiteLabelEnabled,
            brandName: form.brandName,
            brandColor: form.brandColor,
            customDomain: form.customDomain,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Configuración de marca blanca guardada');
      } else {
        toast.error(json.error || 'Error al guardar la configuración');
      }
    } catch {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Marca Blanca</CardTitle>
            <CardDescription>
              Personaliza tu panel con tu propia marca
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={whiteLabelEnabled}
              onCheckedChange={setWhiteLabelEnabled}
            />
            <span className="text-sm text-muted-foreground">Activado</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {whiteLabelEnabled && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="brandName">Nombre de marca</Label>
              <Input
                id="brandName"
                value={form.brandName}
                onChange={(e) => setForm((prev) => ({ ...prev, brandName: e.target.value }))}
                placeholder="Mi Agencia de Viajes"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brandColor">Color principal</Label>
              <div className="flex items-center gap-3">
                <input
                  id="brandColor"
                  type="color"
                  value={form.brandColor}
                  onChange={(e) => setForm((prev) => ({ ...prev, brandColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <Input
                  value={form.brandColor}
                  onChange={(e) => setForm((prev) => ({ ...prev, brandColor: e.target.value }))}
                  className="w-32"
                  placeholder="#f59e0b"
                />
                <div
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: form.brandColor }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customDomain">Dominio personalizado (opcional)</Label>
              <Input
                id="customDomain"
                value={form.customDomain}
                onChange={(e) => setForm((prev) => ({ ...prev, customDomain: e.target.value }))}
                placeholder="panel.miagencia.com"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                Vista previa en /reseller/whitelabel/preview
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

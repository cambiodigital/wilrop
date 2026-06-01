'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Palette,
  Eye,
  Save,
  Share2,
  Globe,
  Store,
  MessageCircle,
  Sparkles,
  ChevronRight,
  X,
  Check,
  Phone,
  Percent,
  MapPin,
  RotateCcw,
  Monitor,
  Smartphone,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useWhiteLabelStore, colorPresets, themes } from '@/store/useWhiteLabelStore';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────
interface ApiDestination {
  id: string;
  name: string;
  region: string;
  description: string;
  image: string;
  priceFrom: number;
}

interface ApiPackage {
  id: string;
  title: string;
  destinationName: string;
  primaryDestinationId: string | null;
  price: number;
  duration: string;
}

interface ApiOwnExcursion {
  id: string;
  destinationId?: string;
  destinationName?: string;
  cityName?: string;
  description?: string;
  shortDesc?: string;
  images?: string[];
  basePrice?: number;
  active?: boolean;
}

// ─── ColorSwatch ──────────────────────────────────────────────────
function ColorSwatch({
  color,
  isSelected,
  onClick,
}: {
  color: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none"
      style={{
        backgroundColor: color,
        boxShadow: isSelected ? `0 0 0 3px white, 0 0 0 5px ${color}` : '0 0 0 1px rgba(0,0,0,0.1)',
      }}
      aria-label={`Color ${color}`}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-white drop-shadow-sm" />
        </motion.div>
      )}
    </button>
  );
}

// ─── LogoUpload ───────────────────────────────────────────────────
function LogoUpload({
  logoUrl,
  onUpload,
  onRemove,
  uploading,
}: {
  logoUrl: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      {logoUrl ? (
        <div className="relative w-full h-24 rounded-lg border border-border overflow-hidden bg-muted/50 flex items-center justify-center">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <img
              src={logoUrl}
              alt="Logo de la tienda"
              className="max-h-20 max-w-[80%] object-contain"
            />
          )}
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/90 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`w-full h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <Upload className="w-6 h-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Arrastra o haz clic para subir</span>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

// ─── MiniPreview ──────────────────────────────────────────────────
function MiniPreview({
  config,
  destinations,
  packages,
}: {
  config: ReturnType<typeof useWhiteLabelStore.getState>['config'];
  destinations: ApiDestination[];
  packages: ApiPackage[];
}) {
  const selectedDestinations = destinations.filter((d) =>
    config.selectedDestinations.includes(d.id)
  );
  const previewDestinations = selectedDestinations.slice(0, 3);
  const previewPackages = packages.filter((p) =>
    p.primaryDestinationId && config.selectedDestinations.includes(p.primaryDestinationId)
  ).slice(0, 3);

  const initials = config.storeName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="w-full h-full bg-background rounded-lg overflow-hidden border border-border shadow-sm flex flex-col force-light">
      {/* Fake browser bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/80 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-2">
          <div className="h-5 bg-background rounded px-2 py-0.5 text-[9px] text-muted-foreground flex items-center">
            <Globe className="w-2.5 h-2.5 mr-1" />
            www.{getStoreSlug(config.subdomain, config.storeName)}.wilropgroup.com
          </div>
        </div>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
          className="px-3 py-2.5 flex items-center justify-between transition-colors duration-300"
          style={{ backgroundColor: config.primaryColor }}
        >
          <div className="flex items-center gap-2">
            {config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt={config.storeName}
                className="w-6 h-6 rounded-md object-contain bg-white/10"
              />
            ) : (
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: config.secondaryColor }}
              >
                {initials}
              </div>
            )}
            <span className="text-white text-[11px] font-semibold truncate max-w-[120px]">
              {config.storeName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center">
              <Phone className="w-2.5 h-2.5 text-white" />
            </div>
            {config.whatsappNumber && (
              <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Hero */}
        <div
          className="px-4 py-6 text-center transition-colors duration-300"
          style={{
            background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`,
          }}
        >
          {config.logoUrl ? (
            <img
              src={config.logoUrl}
              alt={config.storeName}
              className="w-10 h-10 rounded-xl object-contain mx-auto mb-2 bg-white/10"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold mx-auto mb-2"
              style={{ backgroundColor: `${config.accentColor}40` }}
            >
              {initials}
            </div>
          )}
          <h2 className="text-white text-[13px] font-bold mb-0.5">{config.storeName}</h2>
          <p className="text-white/80 text-[9px] mb-2">{config.slogan}</p>
          <div
            className="inline-block px-3 py-1 rounded-full text-[9px] font-medium text-white"
            style={{ backgroundColor: config.accentColor }}
          >
            Explorar Destinos
          </div>
        </div>

        {/* Destinations */}
        <div className="px-3 py-3">
          <h3 className="text-[11px] font-semibold mb-2 text-foreground">Destinos Destacados</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {previewDestinations.map((dest) => (
              <div key={dest.id} className="rounded-lg overflow-hidden border border-border">
                <div
                  className="h-14 flex items-center justify-center text-white text-[8px] font-medium p-1"
                  style={{
                    backgroundColor: config.primaryColor + '20',
                    color: config.primaryColor,
                  }}
                >
                  <div className="text-center">
                    <MapPin className="w-3 h-3 mx-auto mb-0.5" />
                    <span>{dest.name.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Packages */}
        <div className="px-3 py-3">
          <h3 className="text-[11px] font-semibold mb-2 text-foreground">Paquetes Populares</h3>
          <div className="space-y-1.5">
            {previewPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-lg border border-border p-2 flex items-center gap-2"
              >
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center text-white text-[8px] shrink-0"
                  style={{ backgroundColor: config.secondaryColor }}
                >
                  {pkg.destinationName.split(' ')[0] || 'Tour'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-semibold truncate">{pkg.title}</div>
                  <div className="text-[8px] text-muted-foreground">{pkg.duration}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[9px] font-bold" style={{ color: config.primaryColor }}>
                    {formatCurrency(pkg.price)}
                  </div>
                  <div
                    className="text-[7px] font-medium text-white px-1.5 py-0.5 rounded mt-0.5 text-center"
                    style={{ backgroundColor: config.accentColor }}
                  >
                    Reservar
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Bar */}
        <div
          className="px-3 py-2 flex items-center gap-2 transition-colors duration-300"
          style={{ backgroundColor: config.secondaryColor }}
        >
          <MessageCircle className="w-3.5 h-3.5 text-white" />
          <span className="text-white text-[9px] font-medium">
            {config.whatsappNumber || 'Escríbenos por WhatsApp'}
          </span>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-muted/50 border-t border-border text-center">
          <span className="text-[7px] text-muted-foreground">Powered by WILROP Colombia Travel</span>
        </div>
      </div>
    </div>
  );
}

function toSlug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9-]/g, '');
}

function getStoreSlug(subdomain: string | undefined, storeName: string): string {
  return subdomain?.trim() || toSlug(storeName) || 'tienda';
}

// ─── Main Component ───────────────────────────────────────────────
export default function WhiteLabelCreator() {
  const { config, updateConfig, resetConfig, applyTheme } = useWhiteLabelStore();
  const router = useRouter();
  const { toast } = useToast();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Real data from API
  const [destinations, setDestinations] = useState<ApiDestination[]>([]);
  const [packages, setPackages] = useState<ApiPackage[]>([]);

  // Load reseller's catalog destinations and packages from API
  useEffect(() => {
    async function fetchCatalog() {
      try {
        const [destRes, pkgRes, ownExcursionRes] = await Promise.all([
          fetch('/api/reseller/catalog?sourceType=destination'),
          fetch('/api/reseller/catalog?sourceType=package'),
          fetch('/api/reseller/products/excursions'),
        ]);
        const destJson = await destRes.json();
        const pkgJson = await pkgRes.json();
        const ownExcursionJson = await ownExcursionRes.json();
        let mappedDestinations: ApiDestination[] = [];
        if (destJson.success && Array.isArray(destJson.data)) {
          // Catalog items have sourceData with the actual destination info
          mappedDestinations = destJson.data.map((item: any) => ({
            id: item.sourceId,
            name: item.sourceData?.name || item.customName || '',
            region: item.sourceData?.region || '',
            description: item.sourceData?.description || '',
            image: item.sourceData?.image || '',
            priceFrom: item.sourceData?.priceFrom || 0,
          }));
        }
        if (ownExcursionJson.success && Array.isArray(ownExcursionJson.data)) {
          const existingIds = new Set(mappedDestinations.map((destination) => destination.id));
          const excursionDestinations: ApiDestination[] = ownExcursionJson.data
            .filter((excursion: ApiOwnExcursion) => excursion.active && excursion.destinationId && !existingIds.has(excursion.destinationId))
            .map((excursion: ApiOwnExcursion) => {
              existingIds.add(excursion.destinationId as string);
              return {
                id: excursion.destinationId as string,
                name: excursion.destinationName || excursion.cityName || 'Destino de excursión',
                region: excursion.cityName || '',
                description: excursion.shortDesc || excursion.description || '',
                image: excursion.images?.[0] || '',
                priceFrom: excursion.basePrice || 0,
              };
            });
          mappedDestinations = [...mappedDestinations, ...excursionDestinations];
        }
        setDestinations(mappedDestinations);
        if (pkgJson.success && Array.isArray(pkgJson.data)) {
          const mapped: ApiPackage[] = pkgJson.data.map((item: any) => ({
            id: item.sourceId,
            title: item.sourceData?.title || item.customName || '',
            destinationName: item.sourceData?.destinationName || '',
            primaryDestinationId: item.sourceData?.primaryDestinationId || null,
            price: item.customPrice || item.sourceData?.price || 0,
            duration: item.sourceData?.duration || '',
          }));
          setPackages(mapped);
        }
      } catch {
        // silent
      }
    }
    fetchCatalog();
  }, []);

  // Load saved white-label config from API
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/reseller/whitelabel');
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          updateConfig({
            ...(d.storeName ? { storeName: d.storeName } : {}),
            ...(d.slogan ? { slogan: d.slogan } : {}),
            ...(d.logoUrl ? { logoUrl: d.logoUrl } : {}),
            ...(d.primaryColor ? { primaryColor: d.primaryColor } : {}),
            ...(d.secondaryColor ? { secondaryColor: d.secondaryColor } : {}),
            ...(d.accentColor ? { accentColor: d.accentColor } : {}),
            ...(d.selectedDestinations ? { selectedDestinations: d.selectedDestinations } : {}),
            ...(d.whatsappNumber ? { whatsappNumber: d.whatsappNumber } : {}),
            ...(d.commissionRate ? { commissionRate: d.commissionRate } : {}),
            ...(d.subdomain ? { subdomain: d.subdomain } : {}),
          });
        }
      } catch {
        // silent — use defaults
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allSelected = destinations.length > 0 && config.selectedDestinations.length === destinations.length;

  const toggleAllDestinations = () => {
    if (allSelected) {
      updateConfig({ selectedDestinations: [] });
    } else {
      updateConfig({ selectedDestinations: destinations.map((d) => d.id) });
    }
  };

  const toggleDestination = (id: string) => {
    if (config.selectedDestinations.includes(id)) {
      updateConfig({
        selectedDestinations: config.selectedDestinations.filter((d) => d !== id),
      });
    } else {
      updateConfig({
        selectedDestinations: [...config.selectedDestinations, id],
      });
    }
  };

  // Upload logo via /api/upload, get permanent URL
  const handleLogoUpload = async (file: File) => {
    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    updateConfig({ logoUrl: objectUrl });
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.success && json.fileUrl) {
        URL.revokeObjectURL(objectUrl);
        updateConfig({ logoUrl: json.fileUrl });
      } else {
        toast({ title: 'Error al subir el logo', description: json.error || 'Intenta de nuevo', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error al subir el logo', description: 'No se pudo conectar con el servidor', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    if (config.logoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(config.logoUrl);
    }
    updateConfig({ logoUrl: null });
  };

  // Save config via API
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/reseller/whitelabel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: config.storeName,
          slogan: config.slogan,
          logoUrl: config.logoUrl,
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          accentColor: config.accentColor,
          selectedDestinations: config.selectedDestinations,
          whatsappNumber: config.whatsappNumber,
          commissionRate: config.commissionRate,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Cambios guardados', description: 'La configuración de tu tienda se ha guardado correctamente.' });
      } else {
        toast({ title: 'Error al guardar', description: json.error || 'Intenta de nuevo', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error al guardar', description: 'No se pudo conectar con el servidor', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleThemeApply = (themeName: string) => {
    applyTheme(themeName);
    setActiveTheme(themeName);
  };

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => {
    updateConfig({ [field]: value });
    setActiveTheme(null);
  };

  const mockUrl = `${getStoreSlug(config.subdomain, config.storeName)}.wilropgroup.com`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 force-light">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">Creador de Marca Blanca</h1>
              <p className="text-xs text-muted-foreground">Configura tu tienda virtual de viajes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetConfig}
              className="hidden sm:flex items-center gap-1.5 text-muted-foreground"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="hidden sm:flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </Button>
            <Button
              size="sm"
              onClick={() => router.push('/reseller/whitelabel/preview')}
              className="items-center gap-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white border-0"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Vista Previa</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Configuration */}
          <div className="w-full lg:w-[40%] space-y-5">
            {/* Section 1: Brand Identity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl border border-border shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Store className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="text-base font-semibold">Identidad de tu Marca</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="storeName" className="text-sm">Nombre de la Tienda</Label>
                  <Input
                    id="storeName"
                    value={config.storeName}
                    onChange={(e) => updateConfig({ storeName: e.target.value })}
                    placeholder="Tu Agencia de Viajes"
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="slogan" className="text-sm">Eslogan</Label>
                  <Input
                    id="slogan"
                    value={config.slogan}
                    onChange={(e) => updateConfig({ slogan: e.target.value })}
                    placeholder="Tu eslogan aquí"
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Logo de la Tienda</Label>
                  <LogoUpload
                    logoUrl={config.logoUrl}
                    onUpload={handleLogoUpload}
                    onRemove={handleRemoveLogo}
                    uploading={uploading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp" className="text-sm flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                    Número de WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={config.whatsappNumber}
                    onChange={(e) => updateConfig({ whatsappNumber: e.target.value })}
                    placeholder="+57 300 123 4567"
                    className="h-10"
                  />
                </div>
              </div>
            </motion.div>

            <Separator />

            {/* Section 2: Brand Colors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-xl border border-border shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-base font-semibold">Colores de tu Marca</h2>
              </div>

              {/* Theme Presets */}
              <div className="space-y-1.5 mb-5">
                <Label className="text-sm">Temas Predefinidos</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(themes).map(([name, colors]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleThemeApply(name)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all duration-200 text-left ${
                        activeTheme === name
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex gap-0.5">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.primary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.secondary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.accent }} />
                      </div>
                      <span className="text-xs font-medium">{name}</span>
                      {activeTheme === name && (
                        <Check className="w-3.5 h-3.5 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Pickers */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm flex items-center justify-between">
                    <span>Color Primario</span>
                    <span className="text-xs text-muted-foreground font-normal uppercase">{config.primaryColor}</span>
                  </Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {colorPresets.map((preset) => (
                      <ColorSwatch
                        key={`primary-${preset.value}`}
                        color={preset.value}
                        isSelected={config.primaryColor === preset.value}
                        onClick={() => handleColorChange('primaryColor', preset.value)}
                      />
                    ))}
                    <div className="relative">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="w-8 h-8 rounded-full cursor-pointer border border-border p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
                        aria-label="Color primario personalizado"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm flex items-center justify-between">
                    <span>Color Secundario</span>
                    <span className="text-xs text-muted-foreground font-normal uppercase">{config.secondaryColor}</span>
                  </Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {colorPresets.map((preset) => (
                      <ColorSwatch
                        key={`secondary-${preset.value}`}
                        color={preset.value}
                        isSelected={config.secondaryColor === preset.value}
                        onClick={() => handleColorChange('secondaryColor', preset.value)}
                      />
                    ))}
                    <div className="relative">
                      <input
                        type="color"
                        value={config.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="w-8 h-8 rounded-full cursor-pointer border border-border p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
                        aria-label="Color secundario personalizado"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm flex items-center justify-between">
                    <span>Color de Acento</span>
                    <span className="text-xs text-muted-foreground font-normal uppercase">{config.accentColor}</span>
                  </Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {colorPresets.map((preset) => (
                      <ColorSwatch
                        key={`accent-${preset.value}`}
                        color={preset.value}
                        isSelected={config.accentColor === preset.value}
                        onClick={() => handleColorChange('accentColor', preset.value)}
                      />
                    ))}
                    <div className="relative">
                      <input
                        type="color"
                        value={config.accentColor}
                        onChange={(e) => handleColorChange('accentColor', e.target.value)}
                        className="w-8 h-8 rounded-full cursor-pointer border border-border p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
                        aria-label="Color de acento personalizado"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <Separator />

            {/* Section 3: Catalog */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-xl border border-border shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-base font-semibold">Catálogo de Destinos</h2>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {config.selectedDestinations.length}/{destinations.length}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/50 mb-2">
                  <Checkbox
                    id="select-all"
                    checked={allSelected}
                    onCheckedChange={toggleAllDestinations}
                  />
                  <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer flex-1">
                    Seleccionar todos
                  </Label>
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {destinations.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No hay destinos disponibles
                    </p>
                  ) : (
                    destinations.map((dest) => {
                      const isSelected = config.selectedDestinations.includes(dest.id);
                      return (
                        <motion.div
                          key={dest.id}
                          layout
                          className={`flex items-center gap-3 py-2.5 px-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'border-primary/20 bg-primary/5'
                              : 'border-transparent hover:bg-muted/30'
                          }`}
                          onClick={() => toggleDestination(dest.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleDestination(dest.id)}
                            className="pointer-events-none"
                          />
                          <div
                            className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: isSelected ? config.primaryColor : '#94a3b8' }}
                          >
                            {dest.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{dest.name}</div>
                            <div className="text-xs text-muted-foreground">{dest.region}</div>
                          </div>
                          {isSelected && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <Check className="w-4 h-4 text-primary" />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>

            <Separator />

            {/* Section 4: Commission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-xl border border-border shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-base font-semibold">Comisión Personalizada</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Porcentaje de Comisión</Label>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: config.primaryColor }}
                    >
                      {config.commissionRate}%
                    </span>
                  </div>
                </div>

                <Slider
                  value={[config.commissionRate]}
                  onValueChange={(v) => updateConfig({ commissionRate: v[0] })}
                  min={8}
                  max={20}
                  step={1}
                  className="py-2"
                />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>8% mínimo</span>
                  <span>20% máximo</span>
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="text-xs font-medium mb-2">Estimación de ganancias</div>
                  <div className="grid grid-cols-3 gap-2">
                    {packages.filter(p => p.primaryDestinationId && config.selectedDestinations.includes(p.primaryDestinationId)).slice(0, 3).map(pkg => (
                      <div key={pkg.id} className="text-center">
                        <div className="text-xs text-muted-foreground truncate">{pkg.title.split(' ').slice(0, 2).join(' ')}</div>
                        <div className="text-sm font-bold" style={{ color: config.secondaryColor }}>
                          {formatCurrency(Math.round(pkg.price * config.commissionRate / 100))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <Separator />

            {/* Section 5: Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-white rounded-xl border border-border shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                </div>
                <h2 className="text-base font-semibold">Acciones</h2>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full h-11 text-sm font-medium bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white border-0"
                  onClick={() => router.push('/reseller/whitelabel/preview')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Vista Previa Completa
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-10 text-sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Guardar
                  </Button>

                  <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-10 text-sm" onClick={handleShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartir
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="force-light">
                      <DialogHeader>
                        <DialogTitle>Compartir tu Tienda</DialogTitle>
                        <DialogDescription>
                          Comparte este enlace con tus clientes para que accedan a tu tienda virtual.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-10 px-3 rounded-md border border-border bg-muted/50 flex items-center text-sm truncate">
                          <Globe className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">https://{mockUrl}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard?.writeText(`https://${mockUrl}`);
                            toast({ title: 'Enlace copiado', description: 'El enlace de tu tienda se ha copiado al portapapeles.' });
                            setShareDialogOpen(false);
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                      <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                          Cerrar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-full lg:w-[60%] hidden lg:block">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Vista Previa en Tiempo Real</span>
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg border border-border bg-white">
                <MiniPreview config={config} destinations={destinations} packages={packages} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Preview Button */}
        <div className="fixed bottom-4 left-4 right-4 z-20 lg:hidden">
          <Button
            className="w-full h-12 text-sm font-medium bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white border-0 shadow-lg rounded-full"
            onClick={() => router.push('/reseller/whitelabel/preview')}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Ver Vista Previa
          </Button>
        </div>
      </div>
    </div>
  );
}

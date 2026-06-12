"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  Upload,
  ImagePlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  id: "",
  active: false,
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  ctaText: "Ver Oferta",
  ctaLink: "",
  ctaType: "navigate",
  timerEnabled: false,
  timerLabel: "Oferta termina en",
  timerEnd: null,
  position: "center",
  delayMs: 3000,
};

function normalizeModalConfig(
  value: Partial<ModalConfig> | null | undefined,
): ModalConfig {
  return {
    id: value?.id ?? emptyConfig.id,
    active: value?.active ?? emptyConfig.active,
    title: value?.title ?? emptyConfig.title,
    subtitle: value?.subtitle ?? emptyConfig.subtitle,
    description: value?.description ?? emptyConfig.description,
    imageUrl: value?.imageUrl ?? emptyConfig.imageUrl,
    ctaText: value?.ctaText ?? emptyConfig.ctaText,
    ctaLink: value?.ctaLink ?? emptyConfig.ctaLink,
    ctaType: value?.ctaType ?? emptyConfig.ctaType,
    timerEnabled: value?.timerEnabled ?? emptyConfig.timerEnabled,
    timerLabel: value?.timerLabel ?? emptyConfig.timerLabel,
    timerEnd: value?.timerEnd ?? emptyConfig.timerEnd,
    position: value?.position ?? emptyConfig.position,
    delayMs: value?.delayMs ?? emptyConfig.delayMs,
  };
}

export default function AdminMarketingModal() {
  const [config, setConfig] = useState<ModalConfig>(emptyConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imgError, setImgError] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketing-modal");
      if (!res.ok) throw new Error("Error al cargar configuración");
      const json = await res.json();
      setConfig(normalizeModalConfig(json.data));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5 MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "marketing");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al subir la imagen");
      }

      const data = await res.json();
      setImgError(false);
      updateField("imageUrl", data.url);
      toast.success("Imagen subida correctamente");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al subir";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/marketing-modal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Error al guardar");
      const json = await res.json();
      setConfig(normalizeModalConfig(json.data ?? config));
      toast.success("Modal de marketing actualizado correctamente");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof ModalConfig>(
    key: K,
    value: ModalConfig[K],
  ) => {
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
        className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Modal de Marketing
          </h1>
          <p className="mt-1">
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
              <Badge className="bg-muted text-muted-foreground hover:bg-muted">
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
            {showPreview ? "Ocultar Vista Previa" : "Vista Previa"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activation */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Visibilidad</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Modal activo</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    El popup se mostrará a los visitantes del portal
                  </p>
                </div>
                <Switch
                  checked={config.active}
                  onCheckedChange={(checked) => updateField("active", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
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
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="¡Oferta Especial de Verano!"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mm-subtitle">Subtítulo</Label>
                  <Input
                    id="mm-subtitle"
                    value={config.subtitle}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                    placeholder="Hasta 30% de descuento"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mm-desc">Descripción</Label>
                <Textarea
                  id="mm-desc"
                  value={config.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe la oferta o promoción..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mm-image" className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Imagen
                </Label>
                {config.imageUrl ? (
                  <div className="relative group rounded-lg overflow-hidden border border-border max-w-xs">
                    {!imgError ? (
                      <img
                        src={config.imageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted flex items-center justify-center">
                        <ImagePlus className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setImgError(false);
                          imageInputRef.current?.click();
                        }}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Cambiar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          updateField("imageUrl", "");
                          setImgError(false);
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleImageUpload(file);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => imageInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                      dragOver
                        ? "border-ring bg-accent"
                        : "border-input hover:border-ring/60 hover:bg-accent/50",
                      uploading && "pointer-events-none opacity-60",
                    )}
                  >
                    {uploading ? (
                      <div className="space-y-2">
                        <div className="animate-spin w-6 h-6 border-2 border-ring border-t-transparent rounded-full mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          Subiendo imagen...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          Arrastra una imagen o{" "}
                          <span className="text-primary font-medium">
                            haz clic para seleccionar
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WebP, GIF (máx. 5 MB)
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">
                  Botón de Acción (CTA)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mm-cta-text">Texto del botón</Label>
                  <Input
                    id="mm-cta-text"
                    value={config.ctaText}
                    onChange={(e) => updateField("ctaText", e.target.value)}
                    placeholder="Ver Oferta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mm-cta-link">Enlace / Vista destino</Label>
                  <Input
                    id="mm-cta-link"
                    value={config.ctaLink}
                    onChange={(e) => updateField("ctaLink", e.target.value)}
                    placeholder="portal-destinations o https://..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mm-cta-type">Tipo de acción</Label>
                <Select
                  value={config.ctaType}
                  onValueChange={(v) => updateField("ctaType", v)}
                >
                  <SelectTrigger id="mm-cta-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="navigate">
                      Navegación interna (vista SPA)
                    </SelectItem>
                    <SelectItem value="link">Enlace externo (URL)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {config.ctaType === "navigate"
                    ? "El botón navegará a una vista interna del portal (ej: portal-destinations, portal-hotels)"
                    : "El botón abrirá una URL externa en una nueva pestaña"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — Settings & Preview */}
        <div className="space-y-6">
          {/* Timer Settings */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Temporizador</CardTitle>
              </div>
              <CardDescription>
                Regresiva para promociones con fecha límite
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Activar temporizador
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Muestra cuenta regresiva en el popup
                  </p>
                </div>
                <Switch
                  checked={config.timerEnabled}
                  onCheckedChange={(checked) =>
                    updateField("timerEnabled", checked)
                  }
                />
              </div>

              {config.timerEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="mm-timer-label">
                      Texto del temporizador
                    </Label>
                    <Input
                      id="mm-timer-label"
                      value={config.timerLabel}
                      onChange={(e) =>
                        updateField("timerLabel", e.target.value)
                      }
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
                          : ""
                      }
                      onChange={(e) =>
                        updateField(
                          "timerEnd",
                          e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Cuando el temporizador llegue a cero, el modal se ocultará
                      automáticamente
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">Visualización</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mm-position">Posición del popup</Label>
                <Select
                  value={config.position}
                  onValueChange={(v) => updateField("position", v)}
                >
                  <SelectTrigger id="mm-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Centro de pantalla</SelectItem>
                    <SelectItem value="bottom-right">
                      Esquina inferior derecha
                    </SelectItem>
                    <SelectItem value="bottom-left">
                      Esquina inferior izquierda
                    </SelectItem>
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
                  onChange={(e) =>
                    updateField("delayMs", Number(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Tiempo en milisegundos antes de mostrar el popup (3000 ms = 3
                  seg)
                </p>
              </div>

              <Separator className="my-2" />

              <div className="bg-accent border border-border rounded-lg p-3">
                <p className="text-xs text-foreground font-medium mb-1">
                  Comportamiento
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Se muestra una vez por sesión del navegador</li>
                  <li>
                    • Si el usuario cierra el popup, no vuelve en la misma
                    sesión
                  </li>
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
          <Card className="border-2 border-dashed border-border bg-accent/30">
            <CardHeader>
              <CardTitle className="text-base text-foreground">
                👁️ Vista Previa del Modal
              </CardTitle>
              <CardDescription>
                Así se verá el popup en el portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black/40 rounded-xl overflow-hidden min-h-[320px]">
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="relative bg-card text-card-foreground rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                    {config.imageUrl && (
                      <div className="relative h-40">
                        <img
                          src={config.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    )}
                    <div className="p-5">
                      {config.subtitle && (
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                          {config.subtitle}
                        </p>
                      )}
                      <h3 className="text-lg font-bold text-card-foreground mb-2">
                        {config.title || "Título del Modal"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {config.description || "Descripción de la oferta..."}
                      </p>
                      {config.timerEnabled && config.timerEnd && (
                        <div className="bg-accent rounded-lg p-2.5 mb-4 text-center border border-border">
                          <p className="text-[10px] text-primary uppercase tracking-wider font-medium">
                            {config.timerLabel}
                          </p>
                          <p className="text-lg font-bold text-foreground font-mono">
                            23:59:59
                          </p>
                        </div>
                      )}
                      <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm shadow-sm">
                        {config.ctaText || "Ver Oferta"}
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

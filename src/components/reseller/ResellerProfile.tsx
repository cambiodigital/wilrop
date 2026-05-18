'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Mail, Phone, Globe, FileText, MapPin, User, Upload, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const levelLabels: Record<string, string> = {
  starter: 'Starter',
  standard: 'Standard',
  free_light: 'Free Light',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  under_review: 'En Revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

export default function ResellerProfile() {
  const [profile, setProfile] = useState<ResellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    contactName: '',
    companyName: '',
    country: '',
    phone: '',
    website: '',
    taxId: '',
    address: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/reseller/profile');
        const json = await res.json();
        if (json.success) {
          setProfile(json.data);
          setForm({
            contactName: json.data.contactName,
            companyName: json.data.companyName,
            country: json.data.country,
            phone: json.data.phone,
            website: json.data.website,
            taxId: json.data.taxId,
            address: json.data.address,
          });
        } else {
          toast.error(json.error || 'No se pudo cargar el perfil');
        }
      } catch {
        toast.error('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!form.contactName.trim()) {
      toast.error('El nombre de contacto es obligatorio');
      return;
    }
    if (!form.companyName.trim()) {
      toast.error('El nombre de empresa es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/reseller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Perfil actualizado correctamente');
        const profileRes = await fetch('/api/reseller/profile');
        const profileJson = await profileRes.json();
        if (profileJson.success) {
          setProfile(profileJson.data);
        }
      } else {
        toast.error(json.error || 'Error al actualizar el perfil');
      }
    } catch {
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo no debe superar los 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        const updateRes = await fetch('/api/reseller/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, logoUrl: json.url }),
        });

        const updateJson = await updateRes.json();
        if (updateJson.success) {
          toast.success('Logo actualizado correctamente');
          const profileRes = await fetch('/api/reseller/profile');
          const profileJson = await profileRes.json();
          if (profileJson.success) {
            setProfile(profileJson.data);
          }
        }
      } else {
        toast.error(json.error || 'Error al subir el logo');
      }
    } catch {
      toast.error('Error al subir el logo');
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  const statusConfig: Record<string, { className: string; label: string }> = {
    pending: { className: 'bg-amber-100 text-amber-700 hover:bg-amber-100', label: statusLabels.pending },
    under_review: { className: 'bg-blue-100 text-blue-700 hover:bg-blue-100', label: statusLabels.under_review },
    approved: { className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100', label: statusLabels.approved },
    rejected: { className: 'bg-red-100 text-red-700 hover:bg-red-100', label: statusLabels.rejected },
  };

  const status = profile ? statusConfig[profile.approvalStatus] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tu información como revendedor</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Código: {profile?.code}</Badge>
          {status && <Badge className={status.className}>{status.label}</Badge>}
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-primary/20">
                <AvatarImage src={profile?.logoUrl ?? undefined} alt={profile?.companyName} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                  {profile?.companyName ? getInitials(profile.companyName) : 'RE'}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="logo-upload"
                className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">{profile?.companyName || 'Sin empresa'}</h2>
              <p className="text-sm text-gray-600">{profile?.contactName || 'Sin contacto'}</p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                {profile?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </span>
                )}
                {profile?.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.country}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  Nivel: {levelLabels[profile?.sellerLevel || ''] || profile?.sellerLevel}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Comisión: {profile?.commission}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Perfil</CardTitle>
          <CardDescription>Actualiza los datos de tu cuenta de revendedor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactName" className="label-required">
                Nombre de contacto
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contactName"
                  value={form.contactName}
                  onChange={(e) => updateField('contactName', e.target.value)}
                  placeholder="Juan Pérez"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="label-required">
                Nombre de empresa
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="Mi Agencia de Viajes S.A."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                value={profile?.email ?? ''}
                disabled
                className="pl-10 bg-gray-50 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="country">País</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="México"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="website">Sitio web</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://miagencia.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxId">NIT / RUT / ID Fiscal</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="taxId"
                  value={form.taxId}
                  onChange={(e) => updateField('taxId', e.target.value)}
                  placeholder="12345678-9"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Dirección</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="address"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Calle 123, Ciudad, País"
                className="pl-10"
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (profile) {
                  setForm({
                    contactName: profile.contactName,
                    companyName: profile.companyName,
                    country: profile.country,
                    phone: profile.phone,
                    website: profile.website,
                    taxId: profile.taxId,
                    address: profile.address,
                  });
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ResellerProfile {
  id: string;
  code: string;
  contactName: string;
  companyName: string;
  email: string;
  country: string;
  phone: string;
  website: string;
  taxId: string;
  address: string;
  logoUrl: string | null;
  sellerLevel: string;
  commission: number;
  whiteLabelEnabled: boolean;
  approvalStatus: string;
  active: boolean;
  registrationDate: string;
  documents: Array<{
    id: string;
    docType: string;
    fileName: string;
    status: string;
    uploadedAt: string;
  }>;
}

interface ProfileForm {
  contactName: string;
  companyName: string;
  country: string;
  phone: string;
  website: string;
  taxId: string;
  address: string;
}

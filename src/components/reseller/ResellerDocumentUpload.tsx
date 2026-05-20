'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const docTypeLabels: Record<string, string> = {
  id: 'Documento de Identidad',
  business_license: 'Licencia Comercial',
  tax_certificate: 'Certificado Fiscal',
  bank_statement: 'Estado de Cuenta Bancario',
  other: 'Otro',
};

const statusConfig: Record<string, { className: string; label: string; icon: typeof CheckCircle }> = {
  verified: { className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100', label: 'Verificado', icon: CheckCircle },
  pending: { className: 'bg-amber-100 text-amber-700 hover:bg-amber-100', label: 'Pendiente', icon: Clock },
  rejected: { className: 'bg-red-100 text-red-700 hover:bg-red-100', label: 'Rechazado', icon: XCircle },
};

interface DocumentItem {
  id: string;
  docType: string;
  fileName: string;
  status: string;
  uploadedAt: string;
}

export default function ResellerDocumentUpload({ documents }: { documents?: DocumentItem[] }) {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('id');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no debe superar los 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        toast.success('Documento subido correctamente. Pendiente de verificación.');
        e.target.value = '';
      } else {
        toast.error(json.error || 'Error al subir el documento');
      }
    } catch {
      toast.error('Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos de Verificación</CardTitle>
        <CardDescription>
          Sube los documentos necesarios para verificar tu cuenta de revendedor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-1.5 flex-1">
            <label className="text-sm font-medium">Tipo de documento</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {Object.entries(docTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Archivo</label>
            <Button
              variant="outline"
              className="gap-2"
              disabled={uploading}
              asChild
            >
              <label className="cursor-pointer">
                <Upload className="w-4 h-4" />
                {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Formatos aceptados: PDF, JPG, PNG. Tamaño máximo: 10MB.
        </p>

        <Separator />

        {/* Documents List */}
        {!documents?.length ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p>No hay documentos subidos aún.</p>
            <p className="text-xs mt-1">Sube tus documentos para completar la verificación.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const status = statusConfig[doc.status] ?? statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {docTypeLabels[doc.docType] ?? doc.docType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.fileName} · {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <Badge className={status.className}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

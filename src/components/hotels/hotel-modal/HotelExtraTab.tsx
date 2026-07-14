"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface HotelExtraTabProps {
  mode: "admin" | "reseller";
  form: { resellerId?: string | null; featured: boolean; active: boolean };
  resellers: Array<{
    id: string;
    companyName?: string;
    contactName?: string;
    email?: string;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateField: (key: any, value: any) => void;
}

export function HotelExtraTab({
  mode,
  form,
  resellers,
  updateField,
}: HotelExtraTabProps) {
  return (
    <div className="space-y-4 mt-4 overflow-y-auto flex-1 min-h-0">
      {mode === "admin" && (
        <div className="space-y-1.5 pt-2">
          <Label htmlFor="hotel-reseller">Asignar a Revendedor</Label>
          <select
            id="hotel-reseller"
            value={form.resellerId ?? ""}
            onChange={(e) => updateField("resellerId", e.target.value || "")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Ninguno / Global (Administrador)</option>
            {resellers.map((reseller) => (
              <option key={reseller.id} value={reseller.id}>
                {reseller.companyName || reseller.contactName || reseller.email}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Switch
            checked={form.featured}
            onCheckedChange={(checked) => updateField("featured", checked)}
          />
          <Label>Destacado</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={form.active}
            onCheckedChange={(checked) => updateField("active", checked)}
          />
          <Label>Activo</Label>
        </div>
      </div>
    </div>
  );
}

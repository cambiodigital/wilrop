"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UniversalHotelModal, {
  type UniversalHotelRecord,
} from "@/components/hotels/UniversalHotelModal";
import {
  Building2,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

export default function ResellerOwnHotels() {
  const [hotels, setHotels] = useState<UniversalHotelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] =
    useState<UniversalHotelRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reseller/products/hotels");
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.error || "No se pudieron cargar tus hoteles");
      }
      setHotels(Array.isArray(json.data) ? json.data : []);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar tus hoteles",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleToggleActive = async (hotel: UniversalHotelRecord) => {
    try {
      const res = await fetch(`/api/reseller/products/hotels/${hotel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !hotel.active }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.error || "No se pudo actualizar");
      }
      setHotels((prev) =>
        prev.map((item) =>
          item.id === hotel.id ? { ...item, active: !item.active } : item,
        ),
      );
      toast.success(hotel.active ? "Despublicado" : "Publicado");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error de conexión");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este hotel? Esta acción no se puede deshacer."))
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/reseller/products/hotels/${id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.error || "No se pudo eliminar");
      }
      setHotels((prev) => prev.filter((hotel) => hotel.id !== id));
      toast.success("Hotel eliminado");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (count: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          className={`size-5 ${index <= count ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Tus hoteles propios
          </h2>
          <p className="text-sm text-gray-500">
            Crea y gestiona tus propios hoteles. Al publicarlos, aparecen en tu
            tienda.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedHotel(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="size-4" />
          Nuevo hotel
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center">
          <Building2 className="mx-auto size-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">
            Aún no has creado hoteles propios
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Crea tu primer hotel para ofrecerlo a tus clientes.
          </p>
          <Button
            onClick={() => {
              setSelectedHotel(null);
              setDialogOpen(true);
            }}
            className="mt-4 gap-2"
            size="sm"
          >
            <Plus className="size-3.5" />
            Crear hotel
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hotels.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden">
              <div className="relative h-32 overflow-hidden bg-primary/5">
                {hotel.images[0] ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building2 className="size-8 text-primary/30" />
                  </div>
                )}
                <Badge
                  className={`absolute right-2 top-2 ${hotel.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-gray-100 text-gray-500 hover:bg-gray-100"}`}
                >
                  {hotel.active ? "Publicado" : "Borrador"}
                </Badge>
              </div>
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {renderStars(hotel.stars)}
                    {hotel.cityName && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {hotel.cityName}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(hotel.priceFrom)}
                  <span className="ml-1 text-xs font-normal text-gray-500">
                    desde
                  </span>
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleToggleActive(hotel)}
                  >
                    {hotel.active ? (
                      <>
                        <EyeOff className="size-3.5" />
                        Despublicar
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5" />
                        Publicar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      setSelectedHotel(hotel);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:text-red-700"
                    disabled={deletingId === hotel.id}
                    onClick={() => handleDelete(hotel.id)}
                  >
                    {deletingId === hotel.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UniversalHotelModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hotel={selectedHotel}
        mode="reseller"
        onSaved={fetchHotels}
      />
    </div>
  );
}

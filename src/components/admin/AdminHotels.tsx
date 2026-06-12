"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UniversalHotelModal, {
  type UniversalHotelRecord,
} from "@/components/hotels/UniversalHotelModal";
import { Building2, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "w-3.5 h-3.5",
            index < count
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}

export default function AdminHotels() {
  const [hotels, setHotels] = useState<UniversalHotelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] =
    useState<UniversalHotelRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hotels");
      if (!res.ok) throw new Error("Error al cargar hoteles");
      const json = await res.json();
      setHotels(Array.isArray(json.data) ? json.data : []);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al cargar hoteles",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const filtered = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/hotels/${deletingId}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json.error || "Error al eliminar");
      }
      toast.success("Hotel eliminado correctamente");
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchHotels();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Hoteles
          </h1>
          <p className="mt-1">
            Gestiona los hoteles asociados a WILROP Colombia Travel
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedHotel(null);
            setDialogOpen(true);
          }}
          size="default"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Hotel
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar hoteles..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Estrellas</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Destacado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell
                        colSpan={8}
                        className="py-10 text-center text-muted-foreground"
                      >
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No se encontraron hoteles
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((hotel) => (
                    <TableRow key={hotel.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {hotel.images[0] ? (
                            <img
                              src={hotel.images[0]}
                              alt={hotel.name}
                              className="w-14 h-10 object-cover rounded-md border"
                            />
                          ) : (
                            <div className="w-14 h-10 rounded-md border bg-muted flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              {hotel.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {hotel.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{hotel.cityName || "Sin destino"}</TableCell>
                      <TableCell>
                        <StarRating count={hotel.stars} />
                      </TableCell>
                      <TableCell>{formatCurrency(hotel.priceFrom)}</TableCell>
                      <TableCell>{hotel.rating}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {hotel.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {hotel.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{hotel.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {hotel.featured ? (
                          <Badge className="badge-featured text-xs">
                            Destacado
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => {
                              setSelectedHotel(hotel);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setDeletingId(hotel.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UniversalHotelModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hotel={selectedHotel}
        mode="admin"
        onSaved={fetchHotels}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar hotel?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El hotel será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

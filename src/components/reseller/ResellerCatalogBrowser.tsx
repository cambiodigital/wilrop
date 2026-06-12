"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ResellerCatalogFilters,
  type CatalogFilters,
} from "./ResellerCatalogFilters";
import {
  ResellerCatalogItem,
  CatalogItemSkeleton,
  type CatalogItem,
} from "./ResellerCatalogItem";
import { ResellerPriceEditor } from "./ResellerPriceEditor";
import { ResellerAddToCatalogDialog } from "./ResellerAddToCatalogDialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { replaceCatalogItemById } from "@/lib/reseller/catalog-state";

interface ResellerCatalogBrowserProps {
  canCustomizePrices: boolean;
  maxCatalogItems: number;
  defaultFilter?: string;
}

export default function ResellerCatalogBrowser({
  canCustomizePrices,
  maxCatalogItems,
  defaultFilter,
}: ResellerCatalogBrowserProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCount, setCurrentCount] = useState(0);
  const [filters, setFilters] = useState<CatalogFilters>({
    search: "",
    sourceType: defaultFilter || "all",
    active: undefined,
    featured: undefined,
  });

  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [priceEditorOpen, setPriceEditorOpen] = useState(false);
  const [addToCatalogOpen, setAddToCatalogOpen] = useState(false);

  const replaceItemById = useCallback((nextItem: CatalogItem) => {
    setItems((prev) => replaceCatalogItemById(prev, nextItem));
    setEditingItem((prev) => (prev?.id === nextItem.id ? nextItem : prev));
  }, []);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.sourceType && filters.sourceType !== "all")
        params.set("sourceType", filters.sourceType);
      if (filters.active !== undefined)
        params.set("active", filters.active.toString());
      if (filters.featured !== undefined)
        params.set("featured", filters.featured.toString());

      const res = await fetch(`/api/reseller/catalog?${params}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        setCurrentCount(json.data.length);
      }
    } catch {
      toast.error("No se pudo cargar el catálogo");
    } finally {
      setLoading(false);
    }
  }, [filters.sourceType, filters.active, filters.featured]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const handleToggleActive = async (id: string) => {
    try {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const res = await fetch(`/api/reseller/catalog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !item.active }),
      });

      const json = await res.json();
      if (json.success) {
        replaceItemById(json.data);
        toast.success(
          item.active ? "Producto desactivado" : "Producto activado",
        );
      } else {
        toast.error(json.error || "No se pudo actualizar");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await fetch(`/api/reseller/catalog/${id}/toggle-featured`, {
        method: "POST",
      });

      const json = await res.json();
      if (json.success) {
        replaceItemById(json.data);
      } else {
        toast.error(json.error || "No se pudo actualizar");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto de tu catálogo?"))
      return;

    try {
      const res = await fetch(`/api/reseller/catalog/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setCurrentCount((c) => c - 1);
        toast.success("Producto eliminado del catálogo");
      } else {
        toast.error(json.error || "No se pudo eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleSavePrice = async (
    itemId: string,
    data: {
      customPrice: number | null;
      customName: string;
      customDescription: string;
    },
  ) => {
    try {
      const res = await fetch(`/api/reseller/catalog/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (json.success) {
        replaceItemById(json.data);
        setEditingItem(null);
      } else {
        throw new Error(json.error);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleAddToCatalog = async (
    product: { sourceType: string; sourceId: string },
    customPrice?: number | null,
  ) => {
    try {
      const res = await fetch("/api/reseller/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: product.sourceType,
          sourceId: product.sourceId,
          customPrice: customPrice ?? null,
          customName: "",
          customDescription: "",
          active: true,
          featured: false,
          sortOrder: 0,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error);
      }

      setItems((prev) => [...prev, json.data]);
      setCurrentCount((c) => c + 1);
    } catch (error) {
      throw error;
    }
  };

  const filteredItems = items.filter((item) => {
    if (!filters.search) return true;
    const search = filters.search.toLowerCase();
    const name =
      item.customName ||
      (item.sourceData.name as string) ||
      (item.sourceData.title as string) ||
      "";
    const location =
      (item.sourceData.cityName as string) ||
      (item.sourceData.region as string) ||
      (item.sourceData.location as string) ||
      (item.sourceData.origin as string) ||
      "";
    return (
      name.toLowerCase().includes(search) ||
      location.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Catálogo</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los productos que ofreces a tus clientes
          </p>
        </div>
        <Button onClick={() => setAddToCatalogOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Agregar productos
        </Button>
      </div>

      <ResellerCatalogFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalItems={items.length}
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CatalogItemSkeleton key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
          <Plus className="size-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {items.length === 0
              ? "Tu catálogo está vacío"
              : "No hay productos con esos filtros"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {items.length === 0
              ? "Agrega productos desde el catálogo disponible para empezar a vender"
              : "Intenta cambiar los filtros de búsqueda"}
          </p>
          {items.length === 0 && (
            <Button
              onClick={() => setAddToCatalogOpen(true)}
              className="mt-4 gap-2"
            >
              <Plus className="size-4" />
              Agregar productos
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <ResellerCatalogItem
              key={item.id}
              item={item}
              onToggleActive={handleToggleActive}
              onToggleFeatured={handleToggleFeatured}
              onDelete={handleDelete}
              onEditPrice={(i) => {
                setEditingItem(i);
                setPriceEditorOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <ResellerPriceEditor
        item={editingItem}
        open={priceEditorOpen}
        onOpenChange={(open) => {
          setPriceEditorOpen(open);
          if (!open) setEditingItem(null);
        }}
        onSave={handleSavePrice}
        canCustomizePrices={canCustomizePrices}
      />

      <ResellerAddToCatalogDialog
        open={addToCatalogOpen}
        onOpenChange={setAddToCatalogOpen}
        canCustomizePrices={canCustomizePrices}
        maxCatalogItems={maxCatalogItems}
        currentCatalogCount={currentCount}
        onAdd={handleAddToCatalog}
      />
    </div>
  );
}

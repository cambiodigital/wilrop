"use client";

import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import type { RoomTypeRow } from "./types";

interface RoomTypesTableProps {
  roomTypes: RoomTypeRow[];
  isCreateMode: boolean;
  onEdit: (roomType: RoomTypeRow) => void;
  onDelete: (roomType: RoomTypeRow) => void;
}

export function RoomTypesTable({
  roomTypes,
  isCreateMode,
  onEdit,
  onDelete,
}: RoomTypesTableProps) {
  if (roomTypes.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Nombre</TableHead>
          <TableHead className="text-xs">Camas</TableHead>
          <TableHead className="text-xs">Capacidad</TableHead>
          <TableHead className="text-xs">Precio Base</TableHead>
          <TableHead className="text-xs">Estado</TableHead>
          <TableHead className="text-xs text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roomTypes.map((roomType) => (
          <TableRow key={roomType.id}>
            <TableCell className="text-sm font-medium">{roomType.name}</TableCell>
            <TableCell className="text-xs text-muted-foreground">{roomType.beds}</TableCell>
            <TableCell className="text-xs">{roomType.maxGuests} pax</TableCell>
            <TableCell className="text-xs font-semibold">
              {formatCurrency(roomType.basePrice)}
            </TableCell>
            <TableCell>
              {roomType.active ? (
                <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-600">
                  Activo
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Inactivo</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={() => onEdit(roomType)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(roomType)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

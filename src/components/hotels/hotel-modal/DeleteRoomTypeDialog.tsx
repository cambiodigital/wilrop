"use client";

import { Button } from "@/components/ui/button";
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

interface DeleteRoomTypeDialogProps {
  open: boolean;
  mode: "admin" | "reseller";
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteRoomTypeDialog({
  open,
  mode,
  onClose,
  onConfirm,
}: DeleteRoomTypeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <AlertDialogContent
        className={
          mode === "admin"
            ? "admin-dialog"
            : "force-light bg-white text-slate-900 border-slate-200"
        }
      >
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar habitacion?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta accion no se puede deshacer. La habitacion y sus allotments asociados seran
            eliminados permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MovimientoForm } from "./movimiento-form";

export function NewMovimientoDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="primary" className="h-10 px-6 shadow-lg shadow-primary/10">
            <Plus className="mr-2 h-5 w-5" />
            Nuevo Movimiento
          </Button>
        }
      />
      <DialogContent className="w-[95vw] sm:max-w-4xl bg-surface-container-lowest p-0 border-none shadow-[0px_40px_80px_-20px_rgba(25,28,30,0.15)] rounded-[2rem] overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-on-surface-variant/10">
        <div className="p-6 sm:p-12 space-y-8 sm:space-y-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold tracking-tight text-on-surface">Registro de Movimiento</DialogTitle>
            <DialogDescription className="text-on-surface-variant font-medium text-base mt-2">
              Complete el formulario ministerial para el control de ingresos y egresos.
            </DialogDescription>
          </DialogHeader>

          <MovimientoForm mode="create" onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

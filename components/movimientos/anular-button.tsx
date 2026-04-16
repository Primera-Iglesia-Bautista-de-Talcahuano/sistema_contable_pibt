"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AnularButton({
  movimientoId,
  disabled,
  size,
  className,
  onSuccess,
}: {
  movimientoId: string;
  disabled?: boolean;
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [motivo, setMotivo] = useState("");

  async function handleAnular() {
    if (!motivo.trim()) return;

    setLoading(true);
    const res = await fetch(`/api/movimientos/${movimientoId}/anular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancellation_reason: motivo }),
    });
    setLoading(false);

    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { message?: string };
      window.alert(payload.message ?? "No se pudo anular.");
      return;
    }

    setIsOpen(false);
    onSuccess?.();
    router.refresh();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="destructive" disabled={disabled} size={size ?? "sm"} className={className} />}>
        Anular
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Anular Movimiento</DialogTitle>
          <DialogDescription>
            Por favor ingresa un motivo para anular este movimiento.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Input
              id="motivo"
              autoFocus
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Error de digitación"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" disabled={loading} />}>
            Cancelar
          </DialogClose>
          <Button onClick={handleAnular} disabled={loading || !motivo.trim()} variant="destructive">
            {loading ? "Anulando..." : "Confirmar Anulación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { toast } from "sonner"

export function CancelButton({
  movementId,
  disabled,
  size,
  className,
  onSuccess
}: {
  movementId: string
  disabled?: boolean
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
  onSuccess?: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [motivo, setMotivo] = useState("")

  const handleAnular = useCallback(async () => {
    if (!motivo.trim()) return

    setLoading(true)
    const promise = fetch(`/api/movements/${movementId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancellation_reason: motivo })
    }).then(async (res) => {
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(payload.message ?? "No se pudo anular.")
      }
    })

    toast.promise(promise, {
      loading: "Anulando movimiento...",
      success: () => {
        setIsOpen(false)
        onSuccess?.()
        router.refresh()
        return "Movimiento anulado"
      },
      error: (e: Error) => e.message
    })

    await promise.catch(() => {})
    setLoading(false)
  }, [motivo, movementId, onSuccess, router])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="destructive"
            disabled={disabled}
            size={size ?? "sm"}
            className={className}
          />
        }
      >
        Anular
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Anular Movimiento</DialogTitle>
          <DialogDescription>
            Por favor ingresa un motivo para anular este movimiento.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Field>
            <FieldLabel htmlFor="motivo">Motivo</FieldLabel>
            <Input
              id="motivo"
              autoFocus
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Error de digitación"
            />
          </Field>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" disabled={loading} />}>Cancelar</DialogClose>
          <Button onClick={handleAnular} disabled={loading || !motivo.trim()} variant="destructive">
            {loading ? "Anulando..." : "Confirmar Anulación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

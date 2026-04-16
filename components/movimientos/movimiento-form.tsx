"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createMovimientoSchema } from "@/lib/validators/movimiento"
import type { CreateMovimientoInput } from "@/lib/validators/movimiento"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/types/movimientos"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"

type Props = {
  mode: "create" | "edit"
  movimientoId?: string
  initialValues?: Partial<CreateMovimientoInput>
  onSuccess?: () => void
}

function toDateValue(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10)
  return value.slice(0, 10)
}

export function MovimientoForm({ mode, movimientoId, initialValues, onSuccess }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<MovimientoFormInput, unknown, CreateMovimientoInput>({
    resolver: zodResolver(createMovimientoSchema),
    defaultValues: {
      movement_date: toDateValue(initialValues?.movement_date),
      movement_type: initialValues?.movement_type ?? "INCOME",
      amount: initialValues?.amount ?? 0,
      category: initialValues?.category ?? "",
      concept: initialValues?.concept ?? "",
      reference_person: initialValues?.reference_person ?? "",
      received_by: initialValues?.received_by ?? "",
      delivered_by: initialValues?.delivered_by ?? "",
      beneficiary: initialValues?.beneficiary ?? "",
      payment_method: initialValues?.payment_method ?? "",
      support_number: initialValues?.support_number ?? "",
      notes: initialValues?.notes ?? "",
    },
  })

  const tipo = useWatch({ control: form.control, name: "movement_type" })
  const categorias = useMemo(
    () => (tipo === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES),
    [tipo]
  )

  async function onSubmit(values: CreateMovimientoInput) {
    setError(null)
    const endpoint = mode === "create" ? "/api/movimientos" : `/api/movimientos/${movimientoId}`
    const method = mode === "create" ? "POST" : "PUT"
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { message?: string }
      setError(payload.message ?? "No se pudo guardar el movimiento.")
      return
    }

    const payload = (await res.json()) as { id?: string }
    if (onSuccess) {
      onSuccess()
    } else {
      if (mode === "create") {
        router.push(`/movimientos/${payload.id}`)
      } else {
        router.push(`/movimientos/${movimientoId}`)
      }
    }
    router.refresh()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {/* SECCIÓN 1: DATOS PRINCIPALES */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 px-1">
          <div className="h-px flex-1 bg-border" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Datos Principales
          </h3>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Fecha de Registro
            </Label>
            <Controller
              name="movement_date"
              control={form.control}
              render={({ field }) => (
                <DatePicker
                  value={field.value ? new Date(`${field.value}T12:00:00Z`) : undefined}
                  onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                />
              )}
            />
            {form.formState.errors.movement_date && (
              <p className="text-xs text-destructive mt-1 ml-1">
                {form.formState.errors.movement_date.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Tipo de Operación
            </Label>
            <select
              className="flex h-12 sm:h-14 w-full items-center justify-between rounded-lg border border-border bg-background px-4 text-base font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none transition-all"
              {...form.register("movement_type")}
            >
              <option value="INCOME">Ingreso (Entrada)</option>
              <option value="EXPENSE">Egreso (Gasto)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Monto (CLP)
            </Label>
            <Input
              type="number"
              min="1"
              className="h-12 sm:h-14 text-lg font-bold"
              placeholder="0"
              {...form.register("amount", { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive mt-1 ml-1">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Categoría
            </Label>
            <select
              className="flex h-12 sm:h-14 w-full items-center justify-between rounded-lg border border-border bg-background px-4 text-base font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none transition-all"
              {...form.register("category")}
            >
              <option value="">Seleccione Categoría</option>
              {categorias.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {form.formState.errors.category && (
              <p className="text-xs text-destructive mt-1 ml-1">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Concepto / Glosa
          </Label>
          <Input
            className="h-12 sm:h-14 font-medium"
            placeholder="Descripción breve del movimiento..."
            {...form.register("concept")}
          />
          {form.formState.errors.concept && (
            <p className="text-xs text-destructive mt-1 ml-1">
              {form.formState.errors.concept.message}
            </p>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: PARTICIPANTES */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 px-1">
          <div className="h-px flex-1 bg-border" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Personas Involucradas
          </h3>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Referente / Entidad
            </Label>
            <Input className="h-12 sm:h-14" placeholder="Opcional" {...form.register("reference_person")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Recibido por
            </Label>
            <Input className="h-12 sm:h-14" placeholder="Opcional" {...form.register("received_by")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Entregado por
            </Label>
            <Input className="h-12 sm:h-14" placeholder="Opcional" {...form.register("delivered_by")} />
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: RESPALDO Y OBSERVACIONES */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 px-1">
          <div className="h-px flex-1 bg-border" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Respaldo & Detalles
          </h3>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Beneficiario
            </Label>
            <Input className="h-12 sm:h-14" placeholder="Opcional" {...form.register("beneficiary")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Medio de Pago
            </Label>
            <Input
              className="h-12 sm:h-14"
              placeholder="Efectivo, Transferencia, etc."
              {...form.register("payment_method")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              N° Documento Respaldo
            </Label>
            <Input
              className="h-12 sm:h-14"
              placeholder="Boleta, Factura, etc."
              {...form.register("support_number")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Observaciones Adicionales
          </Label>
          <textarea
            className="flex min-h-[100px] sm:min-h-[120px] w-full rounded-lg border border-border bg-background px-4 py-3 text-base font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            placeholder="Algún detalle adicional relevante..."
            {...form.register("notes")}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm font-semibold">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base flex-1 sm:flex-none"
        >
          {form.formState.isSubmitting
            ? "Procesando..."
            : mode === "create"
              ? "Confirmar y Guardar"
              : "Actualizar Información"}
        </Button>
        {onSuccess && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            className="h-10 sm:h-11 flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}

type MovimientoFormInput = z.input<typeof createMovimientoSchema>

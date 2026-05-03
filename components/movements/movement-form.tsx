"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createMovementSchema } from "@/lib/validators/movement"
import type { CreateMovementInput } from "@/lib/validators/movement"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/types/movements"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"
import { NativeSelect } from "@/components/ui/native-select"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileInput } from "@/components/ui/file-input"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { createMovement, updateMovement } from "@/app/actions/movements"

type EditMovement = {
  id: string
  movement_date: string
  movement_type: string
  amount: number | string
  category: string
  concept: string
  reference_person?: string | null
  received_by?: string | null
  delivered_by?: string | null
  beneficiary?: string | null
  payment_method?: string | null
  support_number?: string | null
  notes?: string | null
}

type Props =
  | { mode: "create"; onSuccess?: () => void }
  | { mode: "edit"; movement: EditMovement; onSuccess?: () => void }

function toDateValue(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10)
  return value.slice(0, 10)
}

export function MovementForm(props: Props) {
  const { mode, onSuccess } = props
  const movement = mode === "edit" ? props.movement : undefined
  const movementId = movement?.id

  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [supportFile, setSupportFile] = useState<File | null>(null)

  const form = useForm<MovementFormInput, unknown, CreateMovementInput>({
    resolver: zodResolver(createMovementSchema),
    defaultValues: {
      movement_date: toDateValue(movement?.movement_date),
      movement_type: (movement?.movement_type as "INCOME" | "EXPENSE") ?? "INCOME",
      amount: movement ? Number(movement.amount) : ("" as unknown as number),
      category: movement?.category ?? "",
      concept: movement?.concept ?? "",
      reference_person: movement?.reference_person ?? "",
      received_by: movement?.received_by ?? "",
      delivered_by: movement?.delivered_by ?? "",
      beneficiary: movement?.beneficiary ?? "",
      payment_method: movement?.payment_method ?? "",
      support_number: movement?.support_number ?? "",
      notes: movement?.notes ?? ""
    }
  })

  const movementType = useWatch({ control: form.control, name: "movement_type" })
  const categories = useMemo(
    () => (movementType === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES),
    [movementType]
  )

  async function onSubmit(values: CreateMovementInput) {
    setError(null)

    let attachment_url: string | null = null
    if (supportFile) {
      try {
        const supabase = createSupabaseBrowserClient()
        const ext = supportFile.name.split(".").pop() ?? "bin"
        const path = `${crypto.randomUUID()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("movement-attachments")
          .upload(path, supportFile, { upsert: false })
        if (uploadError) throw uploadError
        attachment_url = uploadData.path
      } catch {
        setError("Error al subir el comprobante. Intente nuevamente.")
        return
      }
    }

    try {
      if (mode === "create") {
        const created = await createMovement({ ...values, attachment_url })
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(`/movements/${created.id}`)
        }
      } else {
        await updateMovement(movementId!, { ...values, attachment_url })
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(`/movements/${movementId}`)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el movimiento.")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 px-1">
          <div className="h-px flex-1 bg-border" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Datos Principales
          </h3>
          <div className="h-px flex-1 bg-border" />
        </div>

        <FieldGroup>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Field data-invalid={!!form.formState.errors.movement_date || undefined}>
              <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Fecha de Registro
              </FieldLabel>
              <Controller
                name="movement_date"
                control={form.control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value ? new Date(`${field.value}T12:00:00Z`) : undefined}
                    onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                    className="h-12 sm:h-14"
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.movement_date]} />
            </Field>

            <Field>
              <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Tipo de Operación
              </FieldLabel>
              <NativeSelect className="w-full" size="lg" {...form.register("movement_type")}>
                <option value="INCOME">Ingreso (Entrada)</option>
                <option value="EXPENSE">Egreso (Gasto)</option>
              </NativeSelect>
            </Field>

            <Field data-invalid={!!form.formState.errors.amount || undefined}>
              <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Monto (CLP)
              </FieldLabel>
              <Input
                type="number"
                min="1"
                className="h-12 sm:h-14 text-lg font-bold"
                placeholder="0"
                aria-invalid={!!form.formState.errors.amount}
                {...form.register("amount", { valueAsNumber: true })}
              />
              <FieldError errors={[form.formState.errors.amount]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.category || undefined}>
              <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Categoría
              </FieldLabel>
              <NativeSelect
                className="w-full"
                size="lg"
                aria-invalid={!!form.formState.errors.category}
                {...form.register("category")}
              >
                <option value="">Seleccione Categoría</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </NativeSelect>
              <FieldError errors={[form.formState.errors.category]} />
            </Field>
          </div>

          <Field data-invalid={!!form.formState.errors.concept || undefined}>
            <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Concepto / Glosa
            </FieldLabel>
            <Input
              className="h-12 sm:h-14 font-medium"
              placeholder="Descripción breve del movimiento..."
              aria-invalid={!!form.formState.errors.concept}
              {...form.register("concept")}
            />
            <FieldError errors={[form.formState.errors.concept]} />
          </Field>
        </FieldGroup>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 px-1">
          <div className="h-px flex-1 bg-border" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Personas Involucradas
          </h3>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Field>
            <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Referente / Entidad
            </FieldLabel>
            <Input
              className="h-12 sm:h-14"
              placeholder="Opcional"
              {...form.register("reference_person")}
            />
          </Field>

          <Field>
            <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Recibido por
            </FieldLabel>
            <Input
              className="h-12 sm:h-14"
              placeholder="Opcional"
              {...form.register("received_by")}
            />
          </Field>

          <Field>
            <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Entregado por
            </FieldLabel>
            <Input
              className="h-12 sm:h-14"
              placeholder="Opcional"
              {...form.register("delivered_by")}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 px-1">
          <div className="h-px flex-1 bg-border" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Respaldo & Detalles
          </h3>
          <div className="h-px flex-1 bg-border" />
        </div>

        <FieldGroup>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Field>
              <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Beneficiario
              </FieldLabel>
              <Input
                className="h-12 sm:h-14"
                placeholder="Opcional"
                {...form.register("beneficiary")}
              />
            </Field>

            <Field>
              <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Medio de Pago
              </FieldLabel>
              <Input
                className="h-12 sm:h-14"
                placeholder="Efectivo, Transferencia, etc."
                {...form.register("payment_method")}
              />
            </Field>

            <Field>
              <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                N° Documento Respaldo
              </FieldLabel>
              <Input
                className="h-12 sm:h-14"
                placeholder="Boleta, Factura, etc."
                {...form.register("support_number")}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Observaciones Adicionales
            </FieldLabel>
            <textarea
              className="flex min-h-[100px] sm:min-h-[120px] w-full rounded-lg border border-border bg-background px-4 py-3 text-base font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              placeholder="Algún detalle adicional relevante..."
              {...form.register("notes")}
            />
          </Field>

          <Field>
            <FieldLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Comprobante (foto o archivo)
            </FieldLabel>
            <FileInput id="support-file" value={supportFile} onChange={setSupportFile} />
          </Field>
        </FieldGroup>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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

type MovementFormInput = z.input<typeof createMovementSchema>

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, AlertTriangle, Clock, CheckCircle, XCircle, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions
} from "@/components/ui/item"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { DatePicker } from "@/components/ui/date-picker"
import { formatDate, formatCLP } from "@/lib/utils"
import { createIntentionSchema } from "@/lib/validators/intention"
import type { CreateIntentionInput } from "@/lib/validators/intention"
import type { intentionsService } from "@/services/intentions/intentions.service"
import type { ministriesService } from "@/services/ministries/ministries.service"
import { createRequest } from "@/app/actions/requests"

type Intention = Awaited<ReturnType<typeof intentionsService.list>>[number]
type MinistryAssignment = Awaited<ReturnType<typeof ministriesService.getMinistryForUser>>
type Ministry = NonNullable<MinistryAssignment>["ministries"] | null

type BudgetSummary = { allocated: number; used: number; remaining: number }
type ActivePeriod = { id: string; name: string } | null

const STATUS_ICONS = {
  PENDING: <Clock className="size-4 text-amber-500" />,
  APPROVED: <CheckCircle className="size-4 text-green-500" />,
  REJECTED: <XCircle className="size-4 text-red-500" />
}

const STATUS_LABELS = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada"
}

export function IntentionsClient({
  canSubmit,
  intentions: initialIntentions,
  ministry,
  budgetSummary,
  activePeriod
}: {
  canSubmit: boolean
  intentions: Intention[]
  ministry: Ministry
  budgetSummary: BudgetSummary | null
  activePeriod: ActivePeriod
}) {
  const router = useRouter()
  const [intentions, setIntentions] = useState<Intention[]>(initialIntentions)
  const [open, setOpen] = useState(false)

  const isMinister = canSubmit

  type IntentionFormValues = Omit<CreateIntentionInput, "amount"> & { amount: string }
  const form = useForm<IntentionFormValues, unknown, CreateIntentionInput>({
    resolver: zodResolver(createIntentionSchema) as Resolver<
      IntentionFormValues,
      unknown,
      CreateIntentionInput
    >,
    defaultValues: {
      period_id: activePeriod?.id ?? "",
      amount: "",
      description: "",
      purpose: "",
      date_needed: ""
    }
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedAmount = form.watch("amount")
  const overBudgetWarning =
    isMinister && budgetSummary && Number(watchedAmount) > budgetSummary.remaining

  async function handleSubmit(values: CreateIntentionInput) {
    if (!activePeriod) return
    try {
      const created = await createRequest({
        ...values,
        purpose: values.purpose || undefined,
        date_needed: values.date_needed || undefined
      })
      setIntentions((prev) => [created as unknown as Intention, ...prev])
      setOpen(false)
      form.reset({
        period_id: activePeriod.id,
        amount: "",
        description: "",
        purpose: "",
        date_needed: ""
      })
      toast.success("Solicitud enviada al equipo de tesorería")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al enviar solicitud")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Solicitudes de Presupuesto</h1>
          <p className="text-sm text-muted-foreground">
            {isMinister
              ? `Ministerio: ${ministry?.name ?? "Sin asignar"}`
              : "Todas las solicitudes"}
          </p>
        </div>
        {isMinister && activePeriod && (
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o)
              if (!o)
                form.reset({
                  period_id: activePeriod.id,
                  amount: "",
                  description: "",
                  purpose: "",
                  date_needed: ""
                })
            }}
          >
            <DialogTrigger
              render={
                <Button size="sm">
                  <Plus className="size-4" />
                  Nueva solicitud
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitud de intención de presupuesto</DialogTitle>
              </DialogHeader>
              {budgetSummary && (
                <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/50 p-3 text-center text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Asignado</p>
                    <p className="font-semibold">{formatCLP(budgetSummary.allocated)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Utilizado</p>
                    <p className="font-semibold">{formatCLP(budgetSummary.used)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Disponible</p>
                    <p
                      className={`font-semibold ${budgetSummary.remaining <= 0 ? "text-red-500" : "text-green-600"}`}
                    >
                      {formatCLP(budgetSummary.remaining)}
                    </p>
                  </div>
                </div>
              )}
              {overBudgetWarning && (
                <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                  <AlertTriangle className="size-4 shrink-0" />
                  El monto supera tu presupuesto disponible. La solicitud quedará bajo revisión
                  especial del equipo de tesorería.
                </div>
              )}
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="int-amount">Monto solicitado (CLP) *</FieldLabel>
                  <Input
                    id="int-amount"
                    type="number"
                    min={1}
                    step={1000}
                    placeholder="100000"
                    {...form.register("amount")}
                  />
                  <FieldError errors={[form.formState.errors.amount]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="int-description">Descripción *</FieldLabel>
                  <Input
                    id="int-description"
                    placeholder="Ej: Materiales para campamento de jóvenes"
                    {...form.register("description")}
                  />
                  <FieldError errors={[form.formState.errors.description]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="int-purpose">Propósito</FieldLabel>
                  <Input
                    id="int-purpose"
                    placeholder="Categoría o finalidad del gasto"
                    {...form.register("purpose")}
                  />
                  <FieldError errors={[form.formState.errors.purpose]} />
                </Field>
                <Field>
                  <FieldLabel>Fecha en que se necesita</FieldLabel>
                  <Controller
                    control={form.control}
                    name="date_needed"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? new Date(field.value + "T00:00:00") : undefined}
                        onChange={(date) =>
                          field.onChange(
                            date
                              ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                              : ""
                          )
                        }
                      />
                    )}
                  />
                  <FieldError errors={[form.formState.errors.date_needed]} />
                </Field>
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Enviando..." : "Enviar solicitud"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isMinister && budgetSummary && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Presupuesto asignado", value: budgetSummary.allocated, color: "" },
            { label: "Utilizado", value: budgetSummary.used, color: "text-amber-600" },
            {
              label: "Disponible",
              value: budgetSummary.remaining,
              color: budgetSummary.remaining <= 0 ? "text-red-500" : "text-green-600"
            }
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-xl font-bold mt-1 ${color}`}>{formatCLP(value)}</p>
            </Card>
          ))}
        </div>
      )}

      {intentions.length === 0 ? (
        <Empty>
          <EmptyMedia>
            <FileText className="size-10 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Sin solicitudes</EmptyTitle>
            <EmptyDescription>
              {isMinister
                ? "Crea tu primera solicitud de presupuesto."
                : "No hay solicitudes registradas."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup>
          {intentions.map((intention) => (
            <Item
              key={intention.id}
              className="cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => router.push(`/requests/${intention.id}`)}
            >
              <ItemContent>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{STATUS_ICONS[intention.status]}</div>
                  <div className="flex-1 min-w-0">
                    <ItemTitle className="flex items-center gap-2">
                      {formatCLP(intention.amount)}
                      {intention.is_over_budget && (
                        <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded font-normal">
                          Sobre presupuesto
                        </span>
                      )}
                    </ItemTitle>
                    <ItemDescription>{intention.description}</ItemDescription>
                    {!isMinister && intention.ministries && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {intention.ministries.name}
                      </p>
                    )}
                  </div>
                </div>
              </ItemContent>
              <ItemActions>
                <div className="text-right">
                  <p className="text-xs font-medium">{STATUS_LABELS[intention.status]}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(intention.created_at)}
                  </p>
                </div>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
    </div>
  )
}

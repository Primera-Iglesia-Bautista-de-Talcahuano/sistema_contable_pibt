"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import { Plus, Calendar, ChevronDown, Unlock, Lock, List } from "lucide-react"
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
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { DatePicker } from "@/components/ui/date-picker"
import { formatDate, formatCLP } from "@/lib/utils"
import { createBudgetPeriodSchema } from "@/lib/validators/budget"
import type { CreateBudgetPeriodInput } from "@/lib/validators/budget"
import {
  createBudgetPeriod,
  releaseBudgetPeriod,
  closeBudgetPeriod,
  listBudgetsByPeriod,
  upsertMinistryBudget
} from "@/app/actions/budget"

type Period = {
  id: string
  name: string
  start_date: string
  end_date: string
  status: "DRAFT" | "ACTIVE" | "CLOSED"
  released_at: string | null
}

type Ministry = {
  id: string
  name: string
  is_active: boolean
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  CLOSED: "Cerrado"
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-muted-foreground bg-muted",
  ACTIVE: "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  CLOSED: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
}

export function BudgetClient({
  initialPeriods,
  ministries
}: {
  initialPeriods: Period[]
  ministries: Ministry[]
}) {
  const [periods, setPeriods] = useState<Period[]>(initialPeriods)
  const [open, setOpen] = useState(false)

  const form = useForm<CreateBudgetPeriodInput>({
    resolver: zodResolver(createBudgetPeriodSchema),
    defaultValues: { name: "", start_date: "", end_date: "" }
  })

  async function handleCreate(values: CreateBudgetPeriodInput) {
    try {
      const created = await createBudgetPeriod(values)
      setPeriods((prev) => [created as unknown as Period, ...prev])
      setOpen(false)
      form.reset()
      toast.success("Período creado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear período")
    }
  }

  async function handleRelease(id: string) {
    try {
      const releasedData = await releaseBudgetPeriod(id)
      setPeriods((prev) => prev.map((p) => (p.id === id ? (releasedData as unknown as Period) : p)))
      toast.success("Período liberado a los ministros")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al liberar período")
    }
  }

  async function handleClose(id: string) {
    try {
      const closedData = await closeBudgetPeriod(id)
      setPeriods((prev) => prev.map((p) => (p.id === id ? (closedData as unknown as Period) : p)))
      toast.success("Período cerrado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cerrar período")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Presupuesto</h1>
          <p className="text-sm text-muted-foreground">
            Define períodos presupuestarios y asigna montos por ministerio
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) form.reset()
          }}
        >
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="size-4" />
                Nuevo período
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo período presupuestario</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4 pt-2">
              <Field>
                <FieldLabel htmlFor="period-name">Nombre *</FieldLabel>
                <Input
                  id="period-name"
                  placeholder="Presupuesto 2025-2026"
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Fecha inicio *</FieldLabel>
                  <Controller
                    control={form.control}
                    name="start_date"
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
                  <FieldError errors={[form.formState.errors.start_date]} />
                </Field>
                <Field>
                  <FieldLabel>Fecha fin *</FieldLabel>
                  <Controller
                    control={form.control}
                    name="end_date"
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
                  <FieldError errors={[form.formState.errors.end_date]} />
                </Field>
              </div>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creando..." : "Crear período"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {periods.length === 0 ? (
        <Empty>
          <EmptyMedia>
            <Calendar className="size-10 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Sin períodos</EmptyTitle>
            <EmptyDescription>Crea el primer período presupuestario.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {periods.map((period) => (
            <PeriodCard
              key={period.id}
              period={period}
              ministries={ministries}
              onRelease={() => handleRelease(period.id)}
              onClose={() => handleClose(period.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PeriodCard({
  period,
  ministries,
  onRelease,
  onClose
}: {
  period: Period
  ministries: Ministry[]
  onRelease: () => void
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [budgets, setBudgets] = useState<BudgetRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [amounts, setAmounts] = useState<Record<string, string>>({})

  type BudgetRow = {
    id: string
    ministry_id: string
    amount: number
    status: string
    ministries: { id: string; name: string } | null
  }

  async function loadBudgets() {
    setLoading(true)
    try {
      const data = (await listBudgetsByPeriod(period.id)) as unknown as BudgetRow[]
      setBudgets(data)
      setAmounts(Object.fromEntries(data.map((b) => [b.ministry_id, String(b.amount)])))
    } catch {
      // silently fail - expand/collapse is a secondary action
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    const next = !expanded
    setExpanded(next)
    if (next && budgets === null) loadBudgets()
  }

  async function saveBudget(ministryId: string) {
    const amount = parseFloat(amounts[ministryId] ?? "0")
    if (!amount || amount <= 0) return
    setSavingId(ministryId)
    try {
      const saved = (await upsertMinistryBudget({
        ministry_id: ministryId,
        period_id: period.id,
        amount
      })) as unknown as BudgetRow
      setBudgets((prev) => {
        if (!prev) return [saved]
        const exists = prev.find((b) => b.ministry_id === ministryId)
        if (exists) return prev.map((b) => (b.ministry_id === ministryId ? saved : b))
        return [...prev, saved]
      })
      toast.success("Presupuesto guardado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSavingId(null)
    }
  }

  const budgetByMinistry = Object.fromEntries((budgets ?? []).map((b) => [b.ministry_id, b]))

  return (
    <Card className="overflow-hidden">
      {/* Info row */}
      <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold truncate">{period.name}</p>
            <span
              className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[period.status]}`}
            >
              {STATUS_LABELS[period.status]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(period.start_date)} – {formatDate(period.end_date)}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" className="shrink-0 mt-0.5" onClick={handleToggle}>
          <ChevronDown
            className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </Button>
      </div>

      {/* Action row */}
      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        <Link
          href={`/budget/${period.id}`}
          className="inline-flex items-center gap-1.5 rounded-[min(var(--radius-md),10px)] bg-primary px-3 h-8 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          <List className="size-3.5" />
          Gestionar ítems
        </Link>
        {period.status === "DRAFT" && (
          <Button size="sm" variant="outline" onClick={onRelease}>
            <Unlock className="size-3.5" />
            Liberar
          </Button>
        )}
        {period.status === "ACTIVE" && (
          <Button size="sm" variant="outline" onClick={onClose}>
            <Lock className="size-3.5" />
            Cerrar
          </Button>
        )}
      </div>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-2">
          {loading && <p className="text-xs text-muted-foreground">Cargando...</p>}
          {!loading &&
            ministries
              .filter((m) => m.is_active)
              .map((ministry) => {
                const existing = budgetByMinistry[ministry.id]
                return (
                  <div key={ministry.id} className="flex flex-wrap items-center gap-2 py-1">
                    <span className="text-sm flex-1 min-w-0 truncate">{ministry.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {existing && (
                        <span className="text-xs text-muted-foreground">
                          {formatCLP(existing.amount)}
                        </span>
                      )}
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        className="w-32 text-sm h-8"
                        placeholder="Monto CLP"
                        value={amounts[ministry.id] ?? ""}
                        onChange={(e) =>
                          setAmounts((prev) => ({ ...prev, [ministry.id]: e.target.value }))
                        }
                        disabled={period.status === "CLOSED"}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        disabled={period.status === "CLOSED" || savingId === ministry.id}
                        onClick={() => saveBudget(ministry.id)}
                      >
                        {savingId === ministry.id ? "..." : "Guardar"}
                      </Button>
                    </div>
                  </div>
                )
              })}
        </div>
      )}
    </Card>
  )
}

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Printer,
  Upload,
  Info
} from "lucide-react"
import * as XLSX from "xlsx"
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
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { formatCLP } from "@/lib/utils"
import {
  createBudgetItemSchema,
  updateBudgetItemSchema,
  createBudgetItemAllocationSchema,
  updateBudgetItemAllocationSchema
} from "@/lib/validators/budget"
import type {
  CreateBudgetItemInput,
  UpdateBudgetItemInput,
  CreateBudgetItemAllocationInput,
  UpdateBudgetItemAllocationInput,
  AllocationType
} from "@/lib/validators/budget"
import {
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  createBudgetItemAllocation,
  updateBudgetItemAllocation,
  deleteBudgetItemAllocation
} from "@/app/actions/budget"

type Ministry = { id: string; name: string }

type Allocation = {
  id: string
  item_id: string
  ministry_id: string | null
  description: string | null
  allocation_type: string
  value: number
  ministries: { id: string; name: string } | null
}

type BudgetItem = {
  id: string
  period_id: string
  ministry_id: string | null
  description: string
  amount: number
  notes: string | null
  ministries: { id: string; name: string } | null
  budget_item_allocations: Allocation[]
}

type Period = {
  id: string
  name: string
  status: "DRAFT" | "ACTIVE" | "CLOSED"
}

function computeAllocatedAmount(allocations: Allocation[], itemAmount: number) {
  if (allocations.length === 0) return null
  const type = allocations[0].allocation_type as AllocationType
  if (type === "PERCENTAGE") {
    const totalPct = allocations.reduce((sum, a) => sum + Number(a.value), 0)
    return { type, totalPct, totalAmount: (totalPct / 100) * itemAmount }
  }
  const totalAmount = allocations.reduce((sum, a) => sum + Number(a.value), 0)
  return { type, totalPct: (totalAmount / itemAmount) * 100, totalAmount }
}

export function BudgetItemsClient({
  period,
  initialItems,
  ministries
}: {
  period: Period
  initialItems: BudgetItem[]
  ministries: Ministry[]
}) {
  const [items, setItems] = useState<BudgetItem[]>(initialItems)
  const [createOpen, setCreateOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const readonly = period.status === "CLOSED"
  const isActive = period.status === "ACTIVE"

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleItemCreated(item: BudgetItem) {
    setItems((prev) => [...prev, item])
    setCreateOpen(false)
  }

  function handleItemUpdated(updated: BudgetItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)))
  }

  function handleItemDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function handleAllocationCreated(itemId: string, alloc: Allocation) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, budget_item_allocations: [...i.budget_item_allocations, alloc] }
          : i
      )
    )
  }

  function handleAllocationUpdated(itemId: string, updated: Allocation) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              budget_item_allocations: i.budget_item_allocations.map((a) =>
                a.id === updated.id ? { ...a, ...updated } : a
              )
            }
          : i
      )
    )
  }

  function handleAllocationDeleted(itemId: string, allocId: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, budget_item_allocations: i.budget_item_allocations.filter((a) => a.id !== allocId) }
          : i
      )
    )
  }

  function handleExportExcel() {
    const rows: Record<string, string | number>[] = []
    for (const item of items) {
      rows.push({
        Descripción: item.description,
        Ministerio: item.ministries?.name ?? "General",
        "Monto (CLP)": Number(item.amount),
        Notas: item.notes ?? "",
        "Sub-ítems": item.budget_item_allocations.length
      })
      for (const alloc of item.budget_item_allocations) {
        const effectiveAmount =
          alloc.allocation_type === "PERCENTAGE"
            ? (Number(alloc.value) / 100) * Number(item.amount)
            : Number(alloc.value)
        rows.push({
          Descripción: `  ↳ ${alloc.description ?? "—"}`,
          Ministerio: alloc.ministries?.name ?? "—",
          "Monto (CLP)": Math.round(effectiveAmount),
          Notas: alloc.allocation_type === "PERCENTAGE" ? `${alloc.value}%` : "",
          "Sub-ítems": ""
        })
      }
    }
    const totalRow = {
      Descripción: "TOTAL",
      Ministerio: "",
      "Monto (CLP)": items.reduce((sum, i) => sum + Number(i.amount), 0),
      Notas: "",
      "Sub-ítems": ""
    }
    rows.push(totalRow)

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Presupuesto")
    XLSX.writeFile(wb, `presupuesto-${period.name.toLowerCase().replace(/\s+/g, "-")}.xlsx`)
  }

  const total = items.reduce((sum, i) => sum + Number(i.amount), 0)

  return (
    <div className="space-y-4">
      {/* Toolbar: primary action + secondary exports */}
      <div className="flex flex-col gap-2 print:hidden sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-2">
          {!readonly && (
            <Dialog open={createOpen} onOpenChange={(o) => setCreateOpen(o)}>
              <DialogTrigger
                render={
                  <Button size="sm">
                    <Plus className="size-4" />
                    Nuevo ítem
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo ítem de presupuesto</DialogTitle>
                </DialogHeader>
                <BudgetItemForm
                  periodId={period.id}
                  ministries={ministries}
                  onSuccess={(item) => handleItemCreated(item as BudgetItem)}
                />
              </DialogContent>
            </Dialog>
          )}
          <Button size="sm" variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="size-4" />
            Exportar Excel
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" />
            Imprimir / PDF
          </Button>
          <Button size="sm" variant="outline" disabled title="Disponible próximamente">
            <Upload className="size-4" />
            Importar desde Excel
          </Button>
        </div>
      </div>

      {/* Active period banner */}
      {isActive && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300 print:hidden">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            Este presupuesto está aprobado. Todos los cambios quedan registrados en auditoría.
          </span>
        </div>
      )}

      {/* Items list */}
      {items.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No hay ítems en este presupuesto. Agrega el primero con el botón de arriba.
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              ministries={ministries}
              readonly={readonly}
              expanded={expandedIds.has(item.id)}
              onToggleExpand={() => toggleExpand(item.id)}
              onUpdated={(updated) => handleItemUpdated(updated as BudgetItem)}
              onDeleted={() => handleItemDeleted(item.id)}
              onAllocationCreated={(alloc) => handleAllocationCreated(item.id, alloc as Allocation)}
              onAllocationUpdated={(alloc) => handleAllocationUpdated(item.id, alloc as Allocation)}
              onAllocationDeleted={(allocId) => handleAllocationDeleted(item.id, allocId)}
            />
          ))}

          {/* Total */}
          <div className="flex items-center justify-between border-t px-4 py-3 mt-1">
            <span className="text-sm font-semibold">Total presupuestado</span>
            <span className="text-base font-bold">{formatCLP(total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ItemRow({
  item,
  ministries,
  readonly,
  expanded,
  onToggleExpand,
  onUpdated,
  onDeleted,
  onAllocationCreated,
  onAllocationUpdated,
  onAllocationDeleted
}: {
  item: BudgetItem
  ministries: Ministry[]
  readonly: boolean
  expanded: boolean
  onToggleExpand: () => void
  onUpdated: (item: unknown) => void
  onDeleted: () => void
  onAllocationCreated: (alloc: unknown) => void
  onAllocationUpdated: (alloc: unknown) => void
  onAllocationDeleted: (allocId: string) => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm("¿Eliminar este ítem de presupuesto?")) return
    setDeleting(true)
    try {
      await deleteBudgetItem(item.id)
      toast.success("Ítem eliminado")
      onDeleted()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar")
    } finally {
      setDeleting(false)
    }
  }

  const allocated = computeAllocatedAmount(item.budget_item_allocations, Number(item.amount))

  return (
    <Card className="overflow-hidden">
      {/* Main item row */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Expand toggle */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors print:hidden"
          aria-label={expanded ? "Colapsar asignaciones" : "Ver asignaciones"}
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug">{item.description}</p>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {formatCLP(Number(item.amount))}
            </span>
          </div>

          {/* Ministry + meta */}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {item.ministries ? (
              <span className="text-xs text-muted-foreground">{item.ministries.name}</span>
            ) : (
              <span className="text-xs italic text-muted-foreground">Gasto general</span>
            )}
            {item.notes && (
              <span className="text-xs text-muted-foreground">· {item.notes}</span>
            )}
            {item.budget_item_allocations.length > 0 && (
              <span className="text-xs text-muted-foreground print:hidden">
                · {item.budget_item_allocations.length} asignación(es)
                {allocated &&
                  ` (${allocated.totalPct.toFixed(0)}% asignado)`}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {!readonly && (
          <div className="flex shrink-0 items-center gap-1 print:hidden">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger
                render={
                  <Button variant="ghost" size="icon-sm" aria-label="Editar ítem">
                    <Pencil className="size-3.5" />
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar ítem</DialogTitle>
                </DialogHeader>
                <BudgetItemForm
                  periodId={item.period_id}
                  ministries={ministries}
                  defaultValues={{
                    description: item.description,
                    amount: Number(item.amount),
                    ministry_id: item.ministry_id,
                    notes: item.notes
                  }}
                  editId={item.id}
                  onSuccess={(updated) => {
                    onUpdated(updated)
                    setEditOpen(false)
                  }}
                />
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Eliminar ítem"
              disabled={deleting}
              onClick={handleDelete}
            >
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        )}
      </div>

      {/* Allocations panel */}
      {expanded && (
        <div className="border-t bg-muted/30 px-4 py-3 space-y-3 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Asignaciones
            </p>
            {!readonly && (
              <AllocationCreateButton
                itemId={item.id}
                ministries={ministries}
                existingType={
                  item.budget_item_allocations[0]?.allocation_type as AllocationType | undefined
                }
                onCreated={onAllocationCreated}
              />
            )}
          </div>

          {item.budget_item_allocations.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Sin asignaciones. Puedes distribuir este ítem entre ministerios o áreas.
            </p>
          ) : (
            <>
              <div className="space-y-1">
                {item.budget_item_allocations.map((alloc) => {
                  const effectiveAmount =
                    alloc.allocation_type === "PERCENTAGE"
                      ? (Number(alloc.value) / 100) * Number(item.amount)
                      : Number(alloc.value)
                  return (
                    <AllocationRow
                      key={alloc.id}
                      alloc={alloc}
                      effectiveAmount={effectiveAmount}
                      ministries={ministries}
                      readonly={readonly}
                      onUpdated={onAllocationUpdated}
                      onDeleted={() => onAllocationDeleted(alloc.id)}
                    />
                  )
                })}
              </div>

              {/* Summary footer */}
              {allocated && (
                <div className="flex items-center justify-between border-t pt-2 text-xs">
                  <span className="text-muted-foreground">Total asignado</span>
                  <span
                    className={
                      allocated.totalPct > 100 ? "text-destructive font-semibold" : "font-medium"
                    }
                  >
                    {formatCLP(Math.round(allocated.totalAmount))} ({allocated.totalPct.toFixed(1)}%)
                    {allocated.totalPct > 100 && " · ⚠ excede el monto"}
                    {allocated.totalPct < 100 &&
                      ` · sin asignar: ${formatCLP(Math.round(Number(item.amount) - allocated.totalAmount))}`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  )
}

function AllocationRow({
  alloc,
  effectiveAmount,
  ministries,
  readonly,
  onUpdated,
  onDeleted
}: {
  alloc: Allocation
  effectiveAmount: number
  ministries: Ministry[]
  readonly: boolean
  onUpdated: (alloc: unknown) => void
  onDeleted: () => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm("¿Eliminar esta asignación?")) return
    setDeleting(true)
    try {
      await deleteBudgetItemAllocation(alloc.id)
      toast.success("Asignación eliminada")
      onDeleted()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-start gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted/50">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-sm">
            {alloc.ministries?.name ?? <em className="font-normal">Sin ministerio</em>}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {alloc.allocation_type === "PERCENTAGE"
              ? `${Number(alloc.value).toFixed(1)}%`
              : formatCLP(Number(alloc.value))}
          </span>
        </div>
        {alloc.description && (
          <p className="text-xs text-muted-foreground truncate">{alloc.description}</p>
        )}
      </div>

      {/* Effective amount */}
      <span className="shrink-0 text-sm font-semibold tabular-nums">
        {formatCLP(Math.round(effectiveAmount))}
      </span>

      {/* Actions */}
      {!readonly && (
        <div className="flex shrink-0 items-center gap-0.5">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Editar asignación">
                  <Pencil className="size-3" />
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar asignación</DialogTitle>
              </DialogHeader>
              <AllocationForm
                itemId={alloc.item_id}
                ministries={ministries}
                lockedType={alloc.allocation_type as AllocationType}
                defaultValues={{
                  ministry_id: alloc.ministry_id,
                  description: alloc.description,
                  value: Number(alloc.value)
                }}
                editId={alloc.id}
                onSuccess={(updated) => {
                  onUpdated(updated)
                  setEditOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Eliminar asignación"
            disabled={deleting}
            onClick={handleDelete}
          >
            <Trash2 className="size-3 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  )
}

function AllocationCreateButton({
  itemId,
  ministries,
  existingType,
  onCreated
}: {
  itemId: string
  ministries: Ministry[]
  existingType?: AllocationType
  onCreated: (alloc: unknown) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="h-7 text-xs">
            <Plus className="size-3" />
            Añadir asignación
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva asignación</DialogTitle>
        </DialogHeader>
        {existingType && (
          <p className="text-xs text-muted-foreground -mt-4">
            Tipo fijado por las asignaciones existentes:{" "}
            <strong>{existingType === "PERCENTAGE" ? "Porcentaje" : "Monto fijo"}</strong>
          </p>
        )}
        <AllocationForm
          itemId={itemId}
          ministries={ministries}
          lockedType={existingType}
          onSuccess={(alloc) => {
            onCreated(alloc)
            setOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

// ── Forms ─────────────────────────────────────────────────────

function BudgetItemForm({
  periodId,
  ministries,
  defaultValues,
  editId,
  onSuccess
}: {
  periodId: string
  ministries: Ministry[]
  defaultValues?: { description?: string; amount?: number; ministry_id?: string | null; notes?: string | null }
  editId?: string
  onSuccess: (item: unknown) => void
}) {
  const isEdit = !!editId
  const schema = isEdit ? updateBudgetItemSchema : createBudgetItemSchema

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          description: defaultValues?.description ?? "",
          amount: defaultValues?.amount ?? (undefined as unknown as number),
          ministry_id: defaultValues?.ministry_id ?? null,
          notes: defaultValues?.notes ?? ""
        }
      : {
          period_id: periodId,
          description: "",
          amount: undefined as unknown as number,
          ministry_id: null,
          notes: ""
        }
  })

  async function handleSubmit(values: CreateBudgetItemInput | UpdateBudgetItemInput) {
    try {
      let result
      if (isEdit) {
        result = await updateBudgetItem(editId!, values as UpdateBudgetItemInput)
        toast.success("Ítem actualizado")
      } else {
        result = await createBudgetItem(values as CreateBudgetItemInput)
        toast.success("Ítem creado")
      }
      onSuccess(result)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-1">
      <Field>
        <FieldLabel htmlFor="item-desc">Descripción *</FieldLabel>
        <Input id="item-desc" placeholder="Ej: Equipos de sonido" {...form.register("description")} />
        <FieldError errors={[form.formState.errors.description]} />
      </Field>

      <Field>
        <FieldLabel htmlFor="item-amount">Monto (CLP) *</FieldLabel>
        <Input id="item-amount" type="number" min={0} step={1000} placeholder="0" {...form.register("amount")} />
        <FieldError errors={[form.formState.errors.amount]} />
      </Field>

      <Field>
        <FieldLabel htmlFor="item-ministry">Ministerio</FieldLabel>
        <NativeSelect
          id="item-ministry"
          {...form.register("ministry_id")}
          className="w-full"
        >
          <NativeSelectOption value="">Sin ministerio (gasto general)</NativeSelectOption>
          {ministries.map((m) => (
            <NativeSelectOption key={m.id} value={m.id}>
              {m.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError errors={[form.formState.errors.ministry_id]} />
      </Field>

      <Field>
        <FieldLabel htmlFor="item-notes">Notas</FieldLabel>
        <Input id="item-notes" placeholder="Observaciones opcionales" {...form.register("notes")} />
        <FieldError errors={[form.formState.errors.notes]} />
      </Field>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear ítem"}
      </Button>
    </form>
  )
}

function AllocationForm({
  itemId,
  ministries,
  lockedType,
  defaultValues,
  editId,
  onSuccess
}: {
  itemId: string
  ministries: Ministry[]
  lockedType?: AllocationType
  defaultValues?: { ministry_id?: string | null; description?: string | null; value?: number }
  editId?: string
  onSuccess: (alloc: unknown) => void
}) {
  const isEdit = !!editId
  const schema = isEdit ? updateBudgetItemAllocationSchema : createBudgetItemAllocationSchema
  const [selectedType, setSelectedType] = useState<AllocationType>(lockedType ?? "AMOUNT")

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          ministry_id: defaultValues?.ministry_id ?? null,
          description: defaultValues?.description ?? "",
          value: defaultValues?.value ?? (undefined as unknown as number)
        }
      : {
          item_id: itemId,
          ministry_id: null,
          description: "",
          allocation_type: lockedType ?? "AMOUNT",
          value: undefined as unknown as number
        }
  })

  async function handleSubmit(values: CreateBudgetItemAllocationInput | UpdateBudgetItemAllocationInput) {
    try {
      let result
      if (isEdit) {
        result = await updateBudgetItemAllocation(editId!, values as UpdateBudgetItemAllocationInput)
        toast.success("Asignación actualizada")
      } else {
        result = await createBudgetItemAllocation(values as CreateBudgetItemAllocationInput)
        toast.success("Asignación creada")
      }
      onSuccess(result)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-1">
      {!isEdit && !lockedType && (
        <Field>
          <FieldLabel htmlFor="alloc-type">Tipo de asignación *</FieldLabel>
          <NativeSelect
            id="alloc-type"
            {...form.register("allocation_type" as never)}
            className="w-full"
            onChange={(e) => {
              form.setValue("allocation_type" as never, e.target.value as never)
              setSelectedType(e.target.value as AllocationType)
            }}
          >
            <NativeSelectOption value="AMOUNT">Monto fijo (CLP)</NativeSelectOption>
            <NativeSelectOption value="PERCENTAGE">Porcentaje (%)</NativeSelectOption>
          </NativeSelect>
        </Field>
      )}

      {isEdit && (
        <p className="text-xs text-muted-foreground">
          Tipo: <strong>{lockedType === "PERCENTAGE" ? "Porcentaje" : "Monto fijo"}</strong> (no modificable)
        </p>
      )}

      <Field>
        <FieldLabel htmlFor="alloc-ministry">Ministerio / Área</FieldLabel>
        <NativeSelect
          id="alloc-ministry"
          {...form.register("ministry_id")}
          className="w-full"
        >
          <NativeSelectOption value="">Sin ministerio</NativeSelectOption>
          {ministries.map((m) => (
            <NativeSelectOption key={m.id} value={m.id}>
              {m.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

      <Field>
        <FieldLabel htmlFor="alloc-desc">Descripción</FieldLabel>
        <Input id="alloc-desc" placeholder="Ej: Equipos sala adultos" {...form.register("description")} />
      </Field>

      <Field>
        <FieldLabel htmlFor="alloc-value">
          {selectedType === "PERCENTAGE" ? "Porcentaje (0–100)" : "Monto (CLP)"} *
        </FieldLabel>
        <Input
          id="alloc-value"
          type="number"
          min={0}
          step={selectedType === "PERCENTAGE" ? 0.1 : 1000}
          placeholder={selectedType === "PERCENTAGE" ? "Ej: 40" : "0"}
          {...form.register("value")}
        />
        <FieldError errors={[form.formState.errors.value]} />
      </Field>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear asignación"}
      </Button>
    </form>
  )
}

# Movimientos Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all MD3/old design tokens across every movimientos file with Sage & Stone semantic tokens, enforce font-size minimums, and apply shadcn layout rules.

**Architecture:** Pure token/style swap — no data layer or logic changes. Six files modified top-to-bottom; the table component is done first since it is rendered by the dashboard too. Every task runs `pnpm lint && pnpm typecheck` before committing.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, shadcn base-vega (Base UI primitives), lucide-react

---

## Token replacement cheat-sheet (apply everywhere)

| Old token | New token |
|---|---|
| `bg-surface-container-lowest` | `bg-card` |
| `bg-surface-container-low` | `bg-muted` |
| `bg-surface-container-high` | `bg-muted/80` |
| `text-on-surface` | `text-foreground` |
| `text-on-surface-variant` | `text-muted-foreground` |
| `border-on-surface-variant/10` | `border-border` |
| `border-on-surface-variant/5` | `border-border` |
| `border-surface-container-highest/10` | `border-border` |
| `bg-on-surface-variant/10` | `bg-border` |
| `rounded-[2rem]` | `rounded-xl` |
| `space-y-*` / `space-x-*` | `flex flex-col gap-*` / `flex gap-*` |
| `h-N w-N` (equal) | `size-N` |
| `text-[10px]` (labels/headers) | `text-[11px]` |
| `text-[10px]` (helper/secondary) | `text-xs` |
| `bg-tertiary/10 text-tertiary` | `bg-destructive/10 text-destructive` |
| `bg-secondary-container/50 text-on-secondary-container` | `bg-muted text-muted-foreground` |
| `text-primary-container` | `text-primary/80` |
| `focus:ring-primary-fixed` | `focus:ring-ring` |
| `text-error` | `text-destructive` |
| `bg-error-container text-on-error-container` | `bg-destructive/10 text-destructive` |

---

## Review requirement (ALL tasks)

Every spec + code quality review MUST apply:
- **redesign audit**: font sizes ≥11px for labels, ≥12px helper text; no hardcoded hex; no `space-y-*`; `size-*` for equal dims
- **shadcn rules**: semantic tokens, `flex flex-col gap-*`, `Label` component, `size-*`, `data-icon` for icons in Button

---

## Files

| Action | File | What changes |
|---|---|---|
| Modify | `components/movimientos/movimientos-table.tsx` | MD3 tokens → semantic, font sizes, rounded-xl, dividers |
| Modify | `components/movimientos/new-movimiento-dialog.tsx` | MD3 tokens → semantic, data-icon on Plus |
| Modify | `components/movimientos/anular-button.tsx` | `space-y-2` → `flex flex-col gap-2` |
| Modify | `app/(dashboard)/movimientos/page.tsx` | MD3 tokens → semantic, Label for selects, remove Card wrapper |
| Modify | `components/movimientos/movimiento-form.tsx` | MD3 tokens → semantic, section dividers, error colors |
| Modify | `app/(dashboard)/movimientos/nuevo/page.tsx` | MD3 tokens → semantic |
| Modify | `app/(dashboard)/movimientos/[id]/page.tsx` | MD3 tokens, helper fns, size-*, h-N w-N |
| Modify | `app/(dashboard)/movimientos/[id]/editar/page.tsx` | MD3 tokens → semantic |

---

## Task 1: Redesign `components/movimientos/movimientos-table.tsx`

**Files:**
- Modify: `components/movimientos/movimientos-table.tsx`

- [ ] **Step 1: Replace the file**

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AnularButton } from "./anular-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export type SerializedMovimiento = {
  id: string
  folio_display: string
  movement_date: string
  movement_type: string
  amount: string
  category: string
  concept: string
  reference_person: string | null
  received_by: string | null
  delivered_by: string | null
  beneficiary: string | null
  payment_method: string | null
  support_number: string | null
  notes: string | null
  cancellation_reason: string | null
  status: string
  created_by: { full_name: string }
}

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
})

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value || "—"}</p>
    </div>
  )
}

const MOVEMENT_TYPE_LABEL: Record<string, string> = {
  INCOME: "Ingreso",
  EXPENSE: "Egreso",
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo",
  CANCELLED: "Anulado",
}

export function MovimientosTable({
  rows,
  canWrite,
}: {
  rows: SerializedMovimiento[]
  canWrite: boolean
}) {
  const [selected, setSelected] = useState<SerializedMovimiento | null>(null)

  return (
    <>
      <div className="bg-card rounded-xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  Folio
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  Fecha
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  Tipo
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.15em] text-muted-foreground text-right">
                  Monto
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  Categoría
                </th>
                <th className="px-4 sm:px-6 py-4 font-bold text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelected(row)}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 sm:px-6 py-4 font-bold text-primary text-sm">
                    #{row.folio_display}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-muted-foreground font-medium text-sm whitespace-nowrap tabular-nums">
                    {formatDate(row.movement_date)}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase",
                        row.movement_type === "INCOME"
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {MOVEMENT_TYPE_LABEL[row.movement_type] ?? row.movement_type}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right font-bold text-foreground tabular-nums text-sm">
                    {clp.format(Number(row.amount))}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase",
                        row.status === "ACTIVE"
                          ? "bg-primary/5 text-primary/80"
                          : "bg-destructive/5 text-destructive/70"
                      )}
                    >
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td
                    className="px-6 py-16 text-center text-sm font-medium text-muted-foreground"
                    colSpan={6}
                  >
                    No hay registros para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        {selected && (
          <DialogContent className="w-[95vw] sm:max-w-lg bg-card p-0 border border-border rounded-xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              <DialogHeader>
                <div className="flex items-center gap-3 flex-wrap">
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                    #{selected.folio_display}
                  </DialogTitle>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase",
                      selected.movement_type === "INCOME"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {MOVEMENT_TYPE_LABEL[selected.movement_type] ?? selected.movement_type}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase",
                      selected.status === "ACTIVE"
                        ? "bg-primary/5 text-primary/80"
                        : "bg-destructive/5 text-destructive/70"
                    )}
                  >
                    {STATUS_LABEL[selected.status] ?? selected.status}
                  </span>
                </div>
                <DialogDescription className="sr-only">
                  Detalle del movimiento {selected.folio_display}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg bg-muted px-6 py-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Monto
                </p>
                <p className="font-heading text-2xl sm:text-3xl font-black tabular-nums text-primary">
                  {clp.format(Number(selected.amount))}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Fecha" value={formatDate(selected.movement_date)} />
                <Field label="Categoría" value={selected.category} />
                <div className="col-span-2">
                  <Field label="Concepto / Glosa" value={selected.concept} />
                </div>
                <Field label="Referente / Entidad" value={selected.reference_person} />
                <Field label="Responsable" value={selected.created_by.full_name} />
                <Field label="Recibido por" value={selected.received_by} />
                <Field label="Entregado por" value={selected.delivered_by} />
                <Field label="Beneficiario" value={selected.beneficiary} />
                <Field label="Medio de pago" value={selected.payment_method} />
                <div className="col-span-2">
                  <Field label="N° Documento Respaldo" value={selected.support_number} />
                </div>
              </div>

              {selected.notes && (
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Observaciones
                  </p>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {selected.notes}
                  </p>
                </div>
              )}

              {selected.status === "CANCELLED" && selected.cancellation_reason && (
                <div className="rounded-lg bg-destructive/5 px-5 py-4 flex flex-col gap-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-destructive">
                    Motivo de Anulación
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {selected.cancellation_reason}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="h-10 px-5"
                  render={<Link href={`/movimientos/${selected.id}`} />}
                >
                  Ver detalles
                </Button>
                {canWrite && selected.status !== "CANCELLED" && (
                  <AnularButton
                    movimientoId={selected.id}
                    onSuccess={() => setSelected(null)}
                    className="h-10 px-5 bg-destructive/10 hover:bg-destructive/20 text-destructive border-none shadow-none"
                  />
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
```

- [ ] **Step 2: Run CI**

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors/warnings.

- [ ] **Step 3: Commit**

```bash
git add components/movimientos/movimientos-table.tsx
git commit -m "feat: redesign movimientos table — Sage & Stone tokens, divide-border, semantic badges"
```

---

## Task 2: Redesign `components/movimientos/new-movimiento-dialog.tsx` + `anular-button.tsx`

**Files:**
- Modify: `components/movimientos/new-movimiento-dialog.tsx`
- Modify: `components/movimientos/anular-button.tsx`

- [ ] **Step 1: Replace `new-movimiento-dialog.tsx`**

```tsx
"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MovimientoForm } from "./movimiento-form"

export function NewMovimientoDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-10 px-6">
            <Plus data-icon="inline-start" />
            Nuevo Movimiento
          </Button>
        }
      />
      <DialogContent className="w-[95vw] sm:max-w-4xl bg-card p-0 border border-border rounded-xl overflow-y-auto max-h-[90vh]">
        <div className="p-6 sm:p-10 flex flex-col gap-8">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Registro de Movimiento
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1">
              Complete el formulario para registrar un ingreso o egreso.
            </DialogDescription>
          </DialogHeader>

          <MovimientoForm mode="create" onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Fix `anular-button.tsx` — replace `space-y-2` with `flex flex-col gap-2`**

Find this block in `components/movimientos/anular-button.tsx`:
```tsx
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo</Label>
```

Replace with:
```tsx
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="motivo">Motivo</Label>
```

- [ ] **Step 3: Run CI**

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors/warnings.

- [ ] **Step 4: Commit**

```bash
git add components/movimientos/new-movimiento-dialog.tsx components/movimientos/anular-button.tsx
git commit -m "feat: redesign new-movimiento dialog — Sage & Stone tokens, data-icon, gap-*"
```

---

## Task 3: Redesign `app/(dashboard)/movimientos/page.tsx`

**Files:**
- Modify: `app/(dashboard)/movimientos/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements } from "@/lib/permissions/rbac"
import { movimientosService } from "@/services/movimientos/movimientos.service"
import { NewMovimientoDialog } from "@/components/movimientos/new-movimiento-dialog"
import { MovimientosTable } from "@/components/movimientos/movimientos-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  searchParams: Promise<{
    search?: string
    movement_type?: "INCOME" | "EXPENSE" | "ALL"
    status?: "ACTIVE" | "CANCELLED" | "ALL"
  }>
}

export default async function MovimientosPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  const canWrite = canCreateOrEditMovements(user?.role)
  const params = await searchParams
  const search = params.search?.trim() ?? ""
  const movement_type = params.movement_type ?? "ALL"
  const status = params.status ?? "ALL"

  const rows = await movimientosService.list({ search, movement_type, status })

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Movimientos
          </h1>
          <p className="text-sm text-muted-foreground">
            Registro de ingresos y egresos
          </p>
        </div>
        {canWrite && <NewMovimientoDialog />}
      </div>

      {/* ── Filter form ──────────────────────────────────────────── */}
      <form
        className="rounded-xl bg-card border border-border p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        method="get"
      >
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="search"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Buscar
          </Label>
          <Input
            id="search"
            name="search"
            defaultValue={search}
            placeholder="Folio, concepto..."
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="movement_type"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Tipo
          </Label>
          <select
            id="movement_type"
            name="movement_type"
            defaultValue={movement_type}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Egreso</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="status"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Estado
          </Label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="CANCELLED">Anulado</option>
          </select>
        </div>
        <Button type="submit" className="h-10">
          Aplicar filtros
        </Button>
      </form>

      {/* ── Table ───────────────────────────────────────────────── */}
      <MovimientosTable
        canWrite={canWrite}
        rows={rows.map((row) => ({
          id: row.id,
          folio_display: row.folio_display ?? String(row.folio),
          movement_date: row.movement_date,
          movement_type: row.movement_type,
          amount: String(row.amount),
          category: row.category,
          concept: row.concept,
          reference_person: row.reference_person,
          received_by: row.received_by,
          delivered_by: row.delivered_by,
          beneficiary: row.beneficiary,
          payment_method: row.payment_method,
          support_number: row.support_number,
          notes: row.notes,
          cancellation_reason: row.cancellation_reason,
          status: row.status,
          created_by: {
            full_name: (row.users as { full_name: string } | null)?.full_name ?? "",
          },
        }))}
      />
    </div>
  )
}
```

- [ ] **Step 2: Run CI**

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors/warnings.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/movimientos/page.tsx"
git commit -m "feat: redesign movimientos list page — Sage & Stone tokens, Label filters, clean header"
```

---

## Task 4: Redesign `components/movimientos/movimiento-form.tsx`

**Files:**
- Modify: `components/movimientos/movimiento-form.tsx`

- [ ] **Step 1: Replace the file**

```tsx
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
```

- [ ] **Step 2: Run CI**

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors/warnings.

- [ ] **Step 3: Commit**

```bash
git add components/movimientos/movimiento-form.tsx
git commit -m "feat: redesign movimiento form — Sage & Stone tokens, gap-*, border tokens, section dividers"
```

---

## Task 5: Redesign `app/(dashboard)/movimientos/nuevo/page.tsx`

**Files:**
- Modify: `app/(dashboard)/movimientos/nuevo/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import { redirect } from "next/navigation"
import { MovimientoForm } from "@/components/movimientos/movimiento-form"
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements } from "@/lib/permissions/rbac"

export default async function NuevoMovimientoPage() {
  const user = await getCurrentUser()
  if (!canCreateOrEditMovements(user?.role)) {
    redirect("/movimientos")
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Registro de Movimiento
        </h1>
        <p className="text-sm text-muted-foreground">
          Formulario para el control de ingresos y egresos.
        </p>
      </div>
      <div className="rounded-xl bg-card border border-border p-6 sm:p-10">
        <MovimientoForm mode="create" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run CI**

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors/warnings.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/movimientos/nuevo/page.tsx"
git commit -m "feat: redesign nuevo movimiento page — Sage & Stone tokens, gap-*, card wrapper"
```

---

## Task 6: Redesign `app/(dashboard)/movimientos/[id]/page.tsx`

**Files:**
- Modify: `app/(dashboard)/movimientos/[id]/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { movimientosService } from "@/services/movimientos/movimientos.service"
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements } from "@/lib/permissions/rbac"
import { AnularButton } from "@/components/movimientos/anular-button"
import { RegenerarPdfButton } from "@/components/movimientos/regenerar-pdf-button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, Edit, FileText, User, Calendar, Tag, Info as InfoIcon } from "lucide-react"

type Props = { params: Promise<{ id: string }> }

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default async function MovimientoDetallePage({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()
  const canWrite = canCreateOrEditMovements(user?.role)

  let row: Awaited<ReturnType<typeof movimientosService.findById>>
  try {
    row = await movimientosService.findById(id)
  } catch {
    notFound()
  }

  const clp = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  })

  const createdBy = row.created_by as { full_name: string; email: string } | null
  const updatedBy = row.updated_by as { full_name: string; email: string } | null
  const cancelledBy = row.cancelled_by as { full_name: string; email: string } | null
  const auditLog = (row.movement_audit_log ?? []) as Array<{
    id: string
    action: string
    event_date: string
    note: string | null
    users: { full_name: string } | null
  }>

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href="/movimientos"
            className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Volver a la lista
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Detalle #{row.folio_display ?? row.folio}
            </h1>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest",
                row.status === "ACTIVE"
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {row.status === "ACTIVE" ? "Activo" : "Anulado"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {row.movement_type === "INCOME" ? "Ingreso" : "Egreso"} • Registrado el{" "}
            {formatDate(row.movement_date)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {canWrite && row.status !== "CANCELLED" && (
            <>
              <Button
                variant="outline"
                className="h-10 px-5"
                render={<Link href={`/movimientos/${row.id}/editar`} />}
              >
                <Edit className="size-4 text-primary" data-icon="inline-start" />
                Editar
              </Button>
              <RegenerarPdfButton movimientoId={row.id} />
              <AnularButton
                movimientoId={row.id}
                className="h-10 px-5 bg-destructive/10 hover:bg-destructive/20 text-destructive border-none shadow-none"
              />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Main detail card ─────────────────────────────────── */}
        <div className="lg:col-span-2">
          <Card className="p-6 sm:p-10 border border-border">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-6">
                <DetailItem
                  icon={<FileText />}
                  label="Monto total"
                  value={clp.format(Number(row.amount))}
                  valueClass="font-heading text-3xl font-black text-primary"
                />
                <DetailItem icon={<Tag />} label="Categoría" value={row.category} />
                <DetailItem icon={<InfoIcon />} label="Concepto / Glosa" value={row.concept} />
                <DetailItem icon={<User />} label="Referente / Donante" value={row.reference_person} />
              </div>
              <div className="flex flex-col gap-6">
                <DetailItem
                  icon={<Calendar />}
                  label="Fecha del Movimiento"
                  value={formatDate(row.movement_date)}
                />
                <DetailItem icon={<InfoIcon />} label="Medio de Pago" value={row.payment_method} />
                <DetailItem icon={<FileText />} label="Número de Respaldo" value={row.support_number} />
                <DetailItem icon={<User />} label="Beneficiario" value={row.beneficiary} />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Observaciones
              </p>
              <p className="text-sm font-medium text-foreground leading-relaxed text-pretty">
                {row.notes || "Sin observaciones adicionales."}
              </p>
            </div>

            {row.status === "CANCELLED" && (
              <div className="mt-6 p-5 rounded-lg bg-destructive/5 flex flex-col gap-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-destructive">
                  Motivo de Anulación
                </p>
                <p className="text-sm font-bold text-foreground">
                  {row.cancellation_reason || "No especificado."}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* ── Sidebar cards ────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <Card className="bg-muted border-none p-6 flex flex-col gap-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-3">
              Trazabilidad
            </h3>
            <div className="flex flex-col gap-5">
              <AuditLogItem label="Creado por" user={createdBy?.full_name ?? "—"} date={row.created_at} />
              {updatedBy && (
                <AuditLogItem label="Última edición" user={updatedBy.full_name} date={row.updated_at} />
              )}
              {cancelledBy && (
                <AuditLogItem label="Anulado por" user={cancelledBy.full_name} date={row.cancelled_at} />
              )}
            </div>
          </Card>

          <Card className="bg-card border border-border p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Historial Técnico
            </h3>
            <div className="flex flex-col gap-3">
              <TechnicalItem label="Estado PDF" value={row.pdf_status} />
              <TechnicalItem label="ID Drive" value={row.drive_file_id} />
              <TechnicalItem
                label="Sincronización"
                value={row.synced_to_sheet ? "Completado" : "Pendiente"}
              />
              <TechnicalItem label="Notificación" value={row.notification_status} />
            </div>
          </Card>
        </div>
      </div>

      {/* ── Audit log ───────────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden border border-border">
        <CardHeader className="bg-muted/50 px-6 sm:px-8 py-5">
          <CardTitle className="text-base font-bold tracking-tight text-foreground">
            Historial de Auditoría
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {auditLog.map((item) => (
              <div key={item.id} className="px-6 sm:px-8 py-4 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Por <span className="text-primary">{item.users?.full_name ?? "—"}</span> •{" "}
                    {new Date(item.event_date).toLocaleString("es-CL")}
                  </p>
                  {item.note && (
                    <p className="text-xs text-muted-foreground mt-1 max-w-lg">{item.note}</p>
                  )}
                </div>
              </div>
            ))}
            {!auditLog.length && (
              <div className="p-10 text-center text-sm font-medium text-muted-foreground">
                Sin eventos registrados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailItem({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
  valueClass?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        <div className="[&_svg]:size-3.5 text-primary">{icon}</div>
        {label}
      </div>
      <p className={cn("text-base font-bold text-foreground", valueClass)}>{value || "—"}</p>
    </div>
  )
}

function AuditLogItem({
  label,
  user,
  date,
}: {
  label: string
  user: string
  date: string | null
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{user}</p>
      <p className="text-xs text-muted-foreground">
        {date ? new Date(date).toLocaleString("es-CL") : "—"}
      </p>
    </div>
  )
}

function TechnicalItem({
  label,
  value,
}: {
  label: string
  value?: string | boolean | null
}) {
  const display = typeof value === "boolean" ? (value ? "Sí" : "No") : value
  return (
    <div className="flex items-center justify-between text-xs border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="font-bold text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{display || "—"}</span>
    </div>
  )
}
```

- [ ] **Step 2: Run CI**

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors/warnings.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/movimientos/[id]/page.tsx"
git commit -m "feat: redesign movimiento detail page — Sage & Stone tokens, size-4 icons, gap-*, divide-border"
```

---

## Task 7: Redesign `app/(dashboard)/movimientos/[id]/editar/page.tsx`

**Files:**
- Modify: `app/(dashboard)/movimientos/[id]/editar/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
type Props = { params: Promise<{ id: string }> }
import { notFound, redirect } from "next/navigation"
import { MovimientoForm } from "@/components/movimientos/movimiento-form"
import { movimientosService } from "@/services/movimientos/movimientos.service"
import { getCurrentUser } from "@/lib/supabase/server"
import { canCreateOrEditMovements } from "@/lib/permissions/rbac"

export default async function EditarMovimientoPage({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!canCreateOrEditMovements(user?.role)) {
    redirect(`/movimientos/${id}`)
  }

  let row: Awaited<ReturnType<typeof movimientosService.findById>>
  try {
    row = await movimientosService.findById(id)
  } catch {
    notFound()
  }

  if (row.status === "CANCELLED") redirect(`/movimientos/${id}`)

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Editar Movimiento
        </h1>
        <p className="text-sm text-muted-foreground">
          Solo se permite editar movimientos en estado activo.
        </p>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 sm:p-10">
        <MovimientoForm
          mode="edit"
          movimientoId={id}
          initialValues={{
            movement_date: row.movement_date.slice(0, 10),
            movement_type: row.movement_type,
            amount: Number(row.amount),
            category: row.category,
            concept: row.concept,
            reference_person: row.reference_person ?? "",
            received_by: row.received_by ?? "",
            delivered_by: row.delivered_by ?? "",
            beneficiary: row.beneficiary ?? "",
            payment_method: row.payment_method ?? "",
            support_number: row.support_number ?? "",
            notes: row.notes ?? "",
          }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run CI**

```bash
pnpm lint && pnpm typecheck
```

Expected: zero errors/warnings.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/movimientos/[id]/editar/page.tsx"
git commit -m "feat: redesign editar movimiento page — Sage & Stone tokens, gap-*, card wrapper"
```

---

## Review criteria for each task

### Spec compliance
- All MD3 tokens replaced: no `surface-container-*`, `on-surface`, `on-surface-variant`, `tertiary`, `primary-container`, `error-container`, `on-error-container`
- Font sizes: labels `text-[11px]` minimum, helper text `text-xs` minimum, page headings `text-3xl`
- No `text-[9px]` or `text-[10px]`
- Badges: EXPENSE type → `bg-destructive/10 text-destructive`, INCOME → `bg-primary/10 text-primary`

### shadcn compliance
- No `space-y-*` — `flex flex-col gap-*` everywhere
- `size-*` for equal-dimension icons (`size-4` not `h-4 w-4`)
- Icons inside `Button` use `data-icon`
- `Label` component used for form labels (not raw `<label>`)
- No hardcoded colors — semantic tokens only

---

## Self-Review

**Spec coverage:** ✅ All 8 files covered across 7 tasks. Token cheat-sheet applied consistently.

**Placeholder scan:** No TBD, no "implement later". All steps have complete code.

**Type consistency:**
- `SerializedMovimiento` type in `movimientos-table.tsx` unchanged — all callers remain compatible
- `MovimientoForm` props unchanged — both `nuevo/page.tsx` and `editar/page.tsx` call it identically
- `movimientosService.findById` return type accessed identically in Tasks 6 and 7

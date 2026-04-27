"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, Calendar, ChevronDown, Unlock, Lock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import { formatDate, formatCLP } from "@/lib/utils"

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
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/periodos-presupuesto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, start_date: startDate, end_date: endDate })
      })
      const created = (await res.json()) as Period & { message?: string }
      if (!res.ok) throw new Error(created.message)
      setPeriods((prev) => [created, ...prev])
      setOpen(false)
      setName("")
      setStartDate("")
      setEndDate("")
      toast.success("Período creado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear período")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRelease(id: string) {
    try {
      const res = await fetch(`/api/periodos-presupuesto/${id}/liberar`, { method: "POST" })
      const releasedData = (await res.json()) as Period & { message?: string }
      if (!res.ok) throw new Error(releasedData.message)
      setPeriods((prev) => prev.map((p) => (p.id === id ? releasedData : p)))
      toast.success("Período liberado a los ministros")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al liberar período")
    }
  }

  async function handleClose(id: string) {
    try {
      const res = await fetch(`/api/periodos-presupuesto/${id}/cerrar`, { method: "POST" })
      const closedData = (await res.json()) as Period & { message?: string }
      if (!res.ok) throw new Error(closedData.message)
      setPeriods((prev) => prev.map((p) => (p.id === id ? closedData : p)))
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
        <Dialog open={open} onOpenChange={setOpen}>
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
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="period-name">Nombre *</Label>
                <Input
                  id="period-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Presupuesto 2025-2026"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start-date">Fecha inicio *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end-date">Fecha fin *</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creando..." : "Crear período"}
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
      const res = await fetch(`/api/presupuestos?period_id=${period.id}`)
      if (!res.ok) return
      const data = (await res.json()) as BudgetRow[]
      setBudgets(data)
      setAmounts(Object.fromEntries(data.map((b) => [b.ministry_id, String(b.amount)])))
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
      const res = await fetch("/api/presupuestos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ministry_id: ministryId, period_id: period.id, amount })
      })
      const saved = (await res.json()) as BudgetRow & { message?: string }
      if (!res.ok) throw new Error(saved.message)
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
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold">{period.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(period.start_date)} – {formatDate(period.end_date)}
            </p>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[period.status]}`}
          >
            {STATUS_LABELS[period.status]}
          </span>
        </div>
        <div className="flex items-center gap-2">
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
          <Button variant="ghost" size="sm" onClick={handleToggle}>
            <ChevronDown
              className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
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
                  <div key={ministry.id} className="flex items-center gap-3 py-1">
                    <span className="text-sm flex-1">{ministry.name}</span>
                    <div className="flex items-center gap-2">
                      {existing && (
                        <span className="text-xs text-muted-foreground">
                          {formatCLP(existing.amount)}
                        </span>
                      )}
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        className="w-36 text-sm h-8"
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

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, AlertTriangle, Clock, CheckCircle, XCircle, FileText } from "lucide-react"
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
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions
} from "@/components/ui/item"
import { formatDate, formatCLP } from "@/lib/utils"
import type { UserRole } from "@/types/auth"

type Intention = {
  id: string
  amount: number
  description: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  is_over_budget: boolean
  created_at: string
  reviewed_at: string | null
  review_message: string | null
  ministries: { id: string; name: string } | null
  users: { id: string; full_name: string; email: string } | null
}

type BudgetSummary = { allocated: number; used: number; remaining: number }
type ActivePeriod = { id: string; name: string } | null
type Ministry = { id: string; name: string } | null

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
  role,
  intentions: initialIntentions,
  ministry,
  budgetSummary,
  activePeriod
}: {
  role: UserRole
  intentions: Intention[]
  ministry: Ministry
  budgetSummary: BudgetSummary | null
  activePeriod: ActivePeriod
}) {
  const router = useRouter()
  const [intentions, setIntentions] = useState<Intention[]>(initialIntentions)
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [purpose, setPurpose] = useState("")
  const [dateNeeded, setDateNeeded] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const isMinister = role === "MINISTER"

  const overBudgetWarning =
    isMinister && budgetSummary && parseFloat(amount) > budgetSummary.remaining

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activePeriod) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_id: activePeriod.id,
          amount: parseFloat(amount),
          description,
          purpose: purpose || undefined,
          date_needed: dateNeeded || undefined
        })
      })
      const created = (await res.json()) as Intention & { message?: string }
      if (!res.ok) throw new Error(created.message)
      setIntentions((prev) => [created, ...prev])
      setOpen(false)
      setAmount("")
      setDescription("")
      setPurpose("")
      setDateNeeded("")
      toast.success("Solicitud enviada al equipo de tesorería")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al enviar solicitud")
    } finally {
      setSubmitting(false)
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
          <Dialog open={open} onOpenChange={setOpen}>
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="int-amount">Monto solicitado (CLP) *</Label>
                  <Input
                    id="int-amount"
                    type="number"
                    min={1}
                    step={1000}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100000"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="int-description">Descripción *</Label>
                  <Input
                    id="int-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: Materiales para campamento de jóvenes"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="int-purpose">Propósito</Label>
                  <Input
                    id="int-purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Categoría o finalidad del gasto"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="int-date">Fecha en que se necesita</Label>
                  <Input
                    id="int-date"
                    type="date"
                    value={dateNeeded}
                    onChange={(e) => setDateNeeded(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar solicitud"}
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
              onClick={() => router.push(`/solicitudes/${intention.id}`)}
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

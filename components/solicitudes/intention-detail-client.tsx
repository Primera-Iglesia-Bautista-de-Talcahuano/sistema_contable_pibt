"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  ArrowLeft,
  Banknote,
  FileText,
  Plus
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { formatDate, formatDateTime, formatCLP } from "@/lib/utils"
import type { UserRole } from "@/types/auth"

type Intention = {
  id: string
  amount: number
  description: string
  purpose: string | null
  date_needed: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  is_over_budget: boolean
  review_message: string | null
  reviewed_at: string | null
  created_at: string
  ministries: { id: string; name: string } | null
  users: { id: string; full_name: string; email: string } | null
}

type Transfer = {
  id: string
  amount: number
  transfer_date: string
  reference: string | null
  notes: string | null
  registered_by: string
} | null

type Comment = {
  id: string
  message: string
  created_at: string
  users: { id: string; full_name: string; role: string } | null
}

type Settlement = {
  id: string
  amount: number
  description: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  is_late: boolean
  expense_date: string
  created_at: string
  review_message: string | null
  attachment_url: string | null
}

const STATUS_CONFIG = {
  PENDING: { icon: Clock, color: "text-amber-500", label: "Pendiente de revisión" },
  APPROVED: { icon: CheckCircle, color: "text-green-500", label: "Aprobada" },
  REJECTED: { icon: XCircle, color: "text-red-500", label: "Rechazada" }
}

export function IntentionDetailClient({
  intention,
  comments: initialComments,
  transfer,
  settlements: initialSettlements,
  userRole
}: {
  intention: Intention
  comments: Comment[]
  transfer: Transfer
  settlements: Settlement[]
  userRole: UserRole
}) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [settlements, setSettlements] = useState<Settlement[]>(initialSettlements)
  const status = STATUS_CONFIG[intention.status]
  const StatusIcon = status.icon
  const canReview = userRole === "ADMIN" || userRole === "OPERATOR"
  const isMinister = userRole === "MINISTER"

  // Review state
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED">("APPROVED")
  const [reviewMessage, setReviewMessage] = useState("")
  const [reviewing, setReviewing] = useState(false)

  // Transfer state
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferAmount, setTransferAmount] = useState(String(intention.amount))
  const [transferDate, setTransferDate] = useState("")
  const [transferRef, setTransferRef] = useState("")
  const [transferNotes, setTransferNotes] = useState("")
  const [registeringTransfer, setRegisteringTransfer] = useState(false)
  const [currentTransfer, setCurrentTransfer] = useState<Transfer>(transfer)

  // Comment state
  const [commentMsg, setCommentMsg] = useState("")
  const [addingComment, setAddingComment] = useState(false)

  // Settlement state
  const [settlementOpen, setSettlementOpen] = useState(false)
  const [settlAmount, setSettlAmount] = useState("")
  const [settlDesc, setSettlDesc] = useState("")
  const [settlDate, setSettlDate] = useState("")
  const [submittingSettlement, setSubmittingSettlement] = useState(false)

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    setReviewing(true)
    try {
      const res = await fetch(`/api/solicitudes/${intention.id}/revisar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: reviewAction, message: reviewMessage })
      })
      const data = await res.json()
      if (res.status === 409) {
        toast.info(data.message)
        setReviewOpen(false)
        return
      }
      if (!res.ok) throw new Error(data.message)
      toast.success(reviewAction === "APPROVED" ? "Solicitud aprobada" : "Solicitud rechazada")
      setReviewOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al revisar")
    } finally {
      setReviewing(false)
    }
  }

  async function handleRegisterTransfer(e: React.FormEvent) {
    e.preventDefault()
    setRegisteringTransfer(true)
    try {
      const res = await fetch(`/api/solicitudes/${intention.id}/transferencia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(transferAmount),
          transfer_date: transferDate,
          reference: transferRef || undefined,
          notes: transferNotes || undefined
        })
      })
      if (!res.ok) throw new Error((await res.json()).message)
      const data = await res.json()
      setCurrentTransfer(data)
      setTransferOpen(false)
      toast.success("Transferencia registrada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar")
    } finally {
      setRegisteringTransfer(false)
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentMsg.trim()) return
    setAddingComment(true)
    try {
      const res = await fetch(`/api/solicitudes/${intention.id}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commentMsg.trim() })
      })
      if (!res.ok) throw new Error((await res.json()).message)
      const data = await res.json()
      setComments((prev) => [...prev, data])
      setCommentMsg("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al comentar")
    } finally {
      setAddingComment(false)
    }
  }

  async function handleSubmitSettlement(e: React.FormEvent) {
    e.preventDefault()
    setSubmittingSettlement(true)
    try {
      const res = await fetch("/api/rendiciones-ministerio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intention_id: intention.id,
          amount: parseFloat(settlAmount),
          description: settlDesc,
          expense_date: settlDate
        })
      })
      if (!res.ok) throw new Error((await res.json()).message)
      const data = await res.json()
      setSettlements((prev) => [...prev, data])
      setSettlementOpen(false)
      setSettlAmount("")
      setSettlDesc("")
      setSettlDate("")
      toast.success("Rendición enviada para revisión")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al enviar rendición")
    } finally {
      setSubmittingSettlement(false)
    }
  }

  const lateExpiry = settlDate
    ? Math.floor((Date.now() - new Date(settlDate).getTime()) / 86_400_000) > 30
    : false

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="size-4" />
        Volver
      </Button>

      {/* Header */}
      <Card className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusIcon className={`size-5 ${status.color}`} />
              <span className="font-semibold">{status.label}</span>
            </div>
            <p className="text-2xl font-bold">{formatCLP(intention.amount)}</p>
            {intention.is_over_budget && (
              <div className="flex items-center gap-1.5 text-amber-600 text-sm">
                <AlertTriangle className="size-4" />
                Sobre presupuesto disponible
              </div>
            )}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>{intention.ministries?.name}</p>
            <p>{formatDate(intention.created_at)}</p>
          </div>
        </div>

        <Separator />

        <div className="grid gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Descripción: </span>
            {intention.description}
          </div>
          {intention.purpose && (
            <div>
              <span className="text-muted-foreground">Propósito: </span>
              {intention.purpose}
            </div>
          )}
          {intention.date_needed && (
            <div>
              <span className="text-muted-foreground">Fecha requerida: </span>
              {formatDate(intention.date_needed)}
            </div>
          )}
          {intention.users && (
            <div>
              <span className="text-muted-foreground">Solicitado por: </span>
              {intention.users.full_name}
            </div>
          )}
        </div>

        {intention.review_message && (
          <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
            <span className="font-medium">Mensaje del revisor: </span>
            {intention.review_message}
          </div>
        )}

        {/* Actions for tesorería */}
        {canReview && intention.status === "PENDING" && (
          <div className="flex gap-2 pt-1">
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogTrigger
                onClick={() => setReviewAction("APPROVED")}
                render={<Button size="sm"><CheckCircle className="size-4" />Aprobar</Button>}
              />
              <DialogTrigger
                onClick={() => setReviewAction("REJECTED")}
                render={<Button size="sm" variant="outline"><XCircle className="size-4" />Rechazar</Button>}
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {reviewAction === "APPROVED" ? "Aprobar solicitud" : "Rechazar solicitud"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleReview} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="review-msg">Mensaje *</Label>
                    <Input
                      id="review-msg"
                      value={reviewMessage}
                      onChange={(e) => setReviewMessage(e.target.value)}
                      placeholder="Escribe un mensaje para el ministro"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={reviewing}
                    variant={reviewAction === "APPROVED" ? "default" : "destructive"}
                  >
                    {reviewing ? "Procesando..." : reviewAction === "APPROVED" ? "Confirmar aprobación" : "Confirmar rechazo"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </Card>

      {/* Transfer section */}
      {intention.status === "APPROVED" && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Banknote className="size-4" />
              Transferencia
            </h2>
            {canReview && !currentTransfer && (
              <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                <DialogTrigger render={<Button size="sm">Registrar transferencia</Button>} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar transferencia</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRegisterTransfer} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <Label>Monto (CLP) *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Fecha de transferencia *</Label>
                      <Input
                        type="date"
                        value={transferDate}
                        onChange={(e) => setTransferDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Referencia</Label>
                      <Input
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        placeholder="N° de comprobante o referencia bancaria"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Notas</Label>
                      <Input
                        value={transferNotes}
                        onChange={(e) => setTransferNotes(e.target.value)}
                        placeholder="Observaciones opcionales"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={registeringTransfer}>
                      {registeringTransfer ? "Registrando..." : "Registrar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {currentTransfer ? (
            <div className="grid gap-1.5 text-sm bg-green-50 dark:bg-green-900/20 rounded-md p-3">
              <div><span className="text-muted-foreground">Monto: </span>{formatCLP(currentTransfer.amount)}</div>
              <div><span className="text-muted-foreground">Fecha: </span>{formatDate(currentTransfer.transfer_date)}</div>
              {currentTransfer.reference && (
                <div><span className="text-muted-foreground">Referencia: </span>{currentTransfer.reference}</div>
              )}
              {currentTransfer.notes && (
                <div><span className="text-muted-foreground">Notas: </span>{currentTransfer.notes}</div>
              )}
            </div>
          ) : (
            <p className="text-sm text-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="size-4" />
              Transferencia pendiente de registro
            </p>
          )}
        </Card>
      )}

      {/* Settlement section */}
      {intention.status === "APPROVED" && currentTransfer && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="size-4" />
              Rendición de gastos
            </h2>
            {isMinister && (
              <Dialog open={settlementOpen} onOpenChange={setSettlementOpen}>
                <DialogTrigger render={<Button size="sm"><Plus className="size-4" />Nueva rendición</Button>} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rendición de gastos</DialogTitle>
                  </DialogHeader>
                  {lateExpiry && (
                    <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                      <AlertTriangle className="size-4 shrink-0" />
                      La fecha del gasto supera los 30 días. Esta rendición podría ser rechazada por el equipo de tesorería.
                    </div>
                  )}
                  <form onSubmit={handleSubmitSettlement} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Monto del gasto (CLP) *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={settlAmount}
                        onChange={(e) => setSettlAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Descripción *</Label>
                      <Input
                        value={settlDesc}
                        onChange={(e) => setSettlDesc(e.target.value)}
                        placeholder="Detalle del gasto realizado"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Fecha del gasto *</Label>
                      <Input
                        type="date"
                        value={settlDate}
                        onChange={(e) => setSettlDate(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={submittingSettlement}>
                      {submittingSettlement ? "Enviando..." : "Enviar rendición"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {settlements.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin rendiciones aún.</p>
          ) : (
            <div className="space-y-2">
              {settlements.map((s) => (
                <div key={s.id} className="rounded-md border p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{formatCLP(s.amount)}</span>
                    <span className={`text-xs font-medium ${
                      s.status === "APPROVED" ? "text-green-600" :
                      s.status === "REJECTED" ? "text-red-500" : "text-amber-500"
                    }`}>
                      {s.status === "APPROVED" ? "Aprobada" : s.status === "REJECTED" ? "Rechazada" : "En revisión"}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{s.description}</p>
                  <p className="text-xs text-muted-foreground">Gasto: {formatDate(s.expense_date)}</p>
                  {s.is_late && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="size-3" />
                      Gasto tardío (+30 días)
                    </p>
                  )}
                  {s.review_message && (
                    <p className="text-xs bg-muted/50 rounded px-2 py-1">
                      <span className="font-medium">Revisor: </span>{s.review_message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Comments */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageSquare className="size-4" />
          Comentarios
        </h2>
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin comentarios aún.</p>
        )}
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="text-sm border-l-2 border-muted pl-3 space-y-0.5">
              <p className="font-medium">{c.users?.full_name ?? "Usuario"}</p>
              <p className="text-muted-foreground">{c.message}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(c.created_at)}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
          <Input
            value={commentMsg}
            onChange={(e) => setCommentMsg(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1"
          />
          <Button size="sm" type="submit" disabled={addingComment || !commentMsg.trim()}>
            {addingComment ? "..." : "Comentar"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

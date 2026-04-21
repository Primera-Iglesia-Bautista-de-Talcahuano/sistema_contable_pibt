"use client"

import { useEffect, useState, useCallback } from "react"
import { cn, formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet"
import { format } from "date-fns"
import { Plus, Receipt, Calendar, Hash, Banknote, FileText, Paperclip } from "lucide-react"
import type { Database } from "@/types/database.types"

type Invoice = Database["public"]["Tables"]["invoices"]["Row"]

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0
})

export default function RendicionesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [number, setNumber] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch("/api/invoices")
      if (!res.ok) throw new Error()
      setInvoices(await res.json())
    } catch {
      // silently fail — list stays empty
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!number || !date || !amount) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number,
          date: format(date, "yyyy-MM-dd"),
          amount: parseFloat(amount),
          description: description || null
        })
      })
      if (!res.ok) throw new Error()
      const created: Invoice = await res.json()
      setInvoices((prev) => [created, ...prev])
      setNumber("")
      setDate(undefined)
      setAmount("")
      setDescription("")
      setAttachedFile(null)
      setOpen(false)
    } catch {
      // keep dialog open on error
    } finally {
      setSubmitting(false)
    }
  }

  const toggleStatus = async (invoice: Invoice) => {
    const nextStatus = invoice.status === "SETTLED" ? "PENDING" : "SETTLED"
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      })
      if (!res.ok) throw new Error()
      const updated: Invoice = await res.json()
      setInvoices((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      setSelectedInvoice((prev) => (prev?.id === updated.id ? updated : prev))
    } catch {
      // silently fail
    }
  }

  return (
    <section className="mx-auto max-w-6xl flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Rendiciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona la rendición de boletas.{" "}
            <strong className="text-primary font-semibold">Plazo máximo: 30 de cada mes.</strong>
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2">
                <Plus data-icon="inline-start" />
                Agregar Boleta
              </Button>
            }
          />
          <DialogContent className="w-[95vw] sm:max-w-xl bg-card p-0 overflow-y-auto max-h-[90vh]">
            <div className="p-6 sm:p-10 flex flex-col gap-8">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
                  Nueva Boleta
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-base mt-1">
                  Ingrese los detalles de la boleta para ser rendida.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border" />
                  <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
                    Detalles de la Boleta
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="invoice-number"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Número de Boleta
                    </Label>
                    <Input
                      id="invoice-number"
                      placeholder="Ej: BOL-001"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="h-12 bg-muted border-none rounded-xl px-5 text-base font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="invoice-date"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Fecha de Emisión
                    </Label>
                    <DatePicker value={date} onChange={setDate} className="h-12" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="invoice-amount"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Monto Total
                    </Label>
                    <Input
                      id="invoice-amount"
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 bg-muted border-none rounded-xl px-5 text-lg font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="invoice-description"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Descripción
                    </Label>
                    <Input
                      id="invoice-description"
                      placeholder="Descripción de la boleta..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="h-12 bg-muted border-none rounded-xl px-5 text-base font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <Label
                      htmlFor="invoice-file"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Comprobante (foto o archivo)
                    </Label>
                    <label
                      htmlFor="invoice-file"
                      className="flex h-20 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary/40 hover:bg-muted"
                    >
                      <input
                        id="invoice-file"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setAttachedFile(e.target.files?.[0] ?? null)}
                        className="sr-only"
                      />
                      <Paperclip className="size-4 text-muted-foreground/60" />
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                        {attachedFile
                          ? attachedFile.name
                          : "Seleccionar archivo o tomar foto"}
                      </span>
                    </label>
                    {attachedFile && attachedFile.type.startsWith("image/") && (
                      <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(attachedFile)}
                          alt="Vista previa"
                          className="size-12 object-cover rounded-lg border border-border"
                        />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {attachedFile.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {(attachedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button type="submit" className="h-11" disabled={submitting}>
                    {submitting ? "Registrando..." : "Registrar Boleta"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-11"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {invoices.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-card border border-border p-4 sm:p-5 flex flex-col gap-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Total boletas
            </p>
            <p className="font-heading text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {invoices.length}
            </p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 sm:p-5 flex flex-col gap-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Pendiente
            </p>
            <p className="font-heading text-2xl font-bold tracking-tight text-destructive tabular-nums">
              {clp.format(
                invoices
                  .filter((i) => i.status === "PENDING")
                  .reduce((s, i) => s + Number(i.amount), 0)
              )}
            </p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 sm:p-5 flex flex-col gap-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Rendido
            </p>
            <p className="font-heading text-2xl font-bold tracking-tight text-income tabular-nums">
              {clp.format(
                invoices
                  .filter((i) => i.status === "SETTLED")
                  .reduce((s, i) => s + Number(i.amount), 0)
              )}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <Card className="p-0 overflow-hidden">
          <Empty className="border-0 py-16">
            <EmptyHeader>
              <EmptyTitle>Cargando...</EmptyTitle>
            </EmptyHeader>
          </Empty>
        </Card>
      ) : invoices.length === 0 ? (
        <Card className="p-0 overflow-hidden">
          <Empty className="border-0 py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Receipt />
              </EmptyMedia>
              <EmptyTitle>Sin boletas</EmptyTitle>
              <EmptyDescription>
                No hay boletas registradas para el período actual.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Card>
      ) : (
        <ItemGroup>
          {invoices.map((invoice) => (
            <Item
              key={invoice.id}
              variant="outline"
              onClick={() => setSelectedInvoice(invoice)}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <ItemContent>
                <ItemTitle className="font-bold text-foreground">{invoice.number}</ItemTitle>
                <ItemDescription>
                  {formatDate(invoice.date)} ·{" "}
                  <span className="font-bold text-foreground tabular-nums">
                    {clp.format(Number(invoice.amount))}
                  </span>
                  {invoice.description && ` · ${invoice.description}`}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                    invoice.status === "SETTLED"
                      ? "badge-income"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {invoice.status === "SETTLED" ? "Rendida" : "Pendiente"}
                </span>
                <Button
                  variant={invoice.status === "SETTLED" ? "outline" : "default"}
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleStatus(invoice)
                  }}
                  className="rounded-full px-5"
                >
                  {invoice.status === "SETTLED" ? "Reabrir" : "Rendir"}
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}

      <Sheet open={!!selectedInvoice} onOpenChange={(o) => !o && setSelectedInvoice(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
          {selectedInvoice && (
            <div className="flex flex-col gap-8 p-6 sm:p-8">
              <SheetHeader className="p-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Receipt className="size-5 text-primary" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl font-bold">{selectedInvoice.number}</SheetTitle>
                    <SheetDescription className="text-xs">Detalle de boleta</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                  <Calendar className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Fecha de Emisión
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(selectedInvoice.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                  <Banknote className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Monto
                    </p>
                    <p className="text-lg font-bold tabular-nums text-foreground">
                      {clp.format(Number(selectedInvoice.amount))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                  <Hash className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Número de Boleta
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedInvoice.number}
                    </p>
                  </div>
                </div>

                {selectedInvoice.description && (
                  <div className="flex items-start gap-3 rounded-xl bg-muted/50 px-4 py-3">
                    <FileText className="size-4 shrink-0 translate-y-0.5 text-muted-foreground" />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Descripción
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedInvoice.description}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Estado
                    </p>
                    <span
                      className={cn(
                        "inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                        selectedInvoice.status === "SETTLED"
                          ? "badge-income"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {selectedInvoice.status === "SETTLED" ? "Rendida" : "Pendiente"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 border-t border-border">
                <Button
                  variant={selectedInvoice.status === "SETTLED" ? "outline" : "default"}
                  className="h-11"
                  onClick={() => toggleStatus(selectedInvoice)}
                >
                  {selectedInvoice.status === "SETTLED" ? "Reabrir boleta" : "Marcar como rendida"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </section>
  )
}

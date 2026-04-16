"use client"

import { useState } from "react"
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
  ItemActions,
  ItemHeader
} from "@/components/ui/item"
import { format } from "date-fns"
import { Plus, Receipt } from "lucide-react"

type Boleta = {
  id: string
  numero: string
  fecha: string
  monto: number
  descripcion: string
  rendida: boolean
  archivo?: File
}

export default function RendicionBoletasPage() {
  const [boletas, setBoletas] = useState<Boleta[]>([
    {
      id: "1",
      numero: "BOL-001",
      fecha: "2026-03-01",
      monto: 15000,
      descripcion: "Boleta de luz - Marzo",
      rendida: false
    },
    {
      id: "2",
      numero: "BOL-002",
      fecha: "2026-03-05",
      monto: 25000,
      descripcion: "Boleta de agua - Marzo",
      rendida: true
    },
    {
      id: "3",
      numero: "BOL-003",
      fecha: "2026-03-10",
      monto: 12000,
      descripcion: "Boleta de gas - Marzo",
      rendida: false
    },
    {
      id: "4",
      numero: "BOL-004",
      fecha: "2026-03-15",
      monto: 35000,
      descripcion: "Boleta de teléfono - Marzo",
      rendida: true
    },
    {
      id: "5",
      numero: "BOL-005",
      fecha: "2026-03-20",
      monto: 18000,
      descripcion: "Boleta de internet - Marzo",
      rendida: false
    }
  ])
  const [numero, setNumero] = useState("")
  const [fecha, setFecha] = useState<Date | undefined>(undefined)
  const [monto, setMonto] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [archivo, setArchivo] = useState<File | null>(null)
  const [open, setOpen] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!numero || !fecha || !monto) return

    setBoletas((prev) => [
      {
        id: crypto.randomUUID(),
        numero,
        fecha: format(fecha, "yyyy-MM-dd"),
        monto: parseFloat(monto),
        descripcion,
        rendida: false,
        archivo: archivo ?? undefined
      },
      ...prev
    ])
    setNumero("")
    setFecha(undefined)
    setMonto("")
    setDescripcion("")
    setArchivo(null)
    setOpen(false)
  }

  const toggleRendida = (id: string) => {
    setBoletas((prev) => prev.map((b) => (b.id === id ? { ...b, rendida: !b.rendida } : b)))
  }

  const clp = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  })

  return (
    <section className="mx-auto max-w-6xl flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Rendición de Boletas
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
                      htmlFor="boleta-numero"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Número de Boleta
                    </Label>
                    <Input
                      id="boleta-numero"
                      placeholder="Ej: BOL-001"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="h-12 bg-muted border-none rounded-xl px-5 text-base font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="boleta-fecha"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Fecha de Emisión
                    </Label>
                    <DatePicker value={fecha} onChange={setFecha} className="h-12" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="boleta-monto"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Monto Total
                    </Label>
                    <Input
                      id="boleta-monto"
                      type="number"
                      placeholder="0"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      className="h-12 bg-muted border-none rounded-xl px-5 text-lg font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="boleta-descripcion"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Descripción
                    </Label>
                    <Input
                      id="boleta-descripcion"
                      placeholder="Descripción de la boleta..."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      className="h-12 bg-muted border-none rounded-xl px-5 text-base font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <Label
                      htmlFor="boleta-archivo"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Adjuntar Comprobante
                    </Label>
                    <label
                      htmlFor="boleta-archivo"
                      className="flex h-20 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary/40 hover:bg-muted"
                    >
                      <input
                        id="boleta-archivo"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                        {archivo ? archivo.name : "Click para subir o capturar foto"}
                      </span>
                    </label>
                    {archivo && archivo.type.startsWith("image/") && (
                      <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(archivo)}
                          alt="Vista previa"
                          className="size-10 object-cover rounded-lg border border-border"
                        />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {archivo.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {(archivo.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button type="submit" className="h-11">
                    Registrar Boleta
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

      {/* List */}
      {boletas.length === 0 ? (
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
          {boletas.map((boleta) => (
            <Item key={boleta.id} variant="outline">
              <ItemContent>
                <ItemHeader>
                  <ItemTitle className="font-bold text-foreground">{boleta.numero}</ItemTitle>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                      boleta.rendida
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {boleta.rendida ? "Rendida" : "Pendiente"}
                  </span>
                </ItemHeader>
                <ItemDescription>
                  {formatDate(boleta.fecha)} ·{" "}
                  <span className="font-bold text-foreground tabular-nums">
                    {clp.format(boleta.monto)}
                  </span>
                  {boleta.descripcion && ` · ${boleta.descripcion}`}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                {boleta.archivo ? (
                  <span className="hidden sm:inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary uppercase tracking-wide">
                    {boleta.archivo.name.split(".").pop()}
                  </span>
                ) : (
                  <span className="hidden sm:inline text-[11px] text-muted-foreground/50 italic">
                    Sin adjunto
                  </span>
                )}
                <Button
                  variant={boleta.rendida ? "outline" : "default"}
                  size="xs"
                  onClick={() => toggleRendida(boleta.id)}
                  className="rounded-full px-5"
                >
                  {boleta.rendida ? "Reabrir" : "Rendir"}
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
    </section>
  )
}

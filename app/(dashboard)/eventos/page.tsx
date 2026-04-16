"use client"

import { FormEvent, useState } from "react"
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
import { Item, ItemGroup, ItemContent, ItemTitle, ItemDescription, ItemHeader } from "@/components/ui/item"
import { format } from "date-fns"
import { formatDate } from "@/lib/utils"
import { Plus, CalendarDays } from "lucide-react"

type Evento = {
  id: string
  fecha: string
  titulo: string
  descripcion: string
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [fecha, setFecha] = useState<Date | undefined>(undefined)
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [open, setOpen] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!fecha || !titulo) return

    setEventos((prev) => [
      {
        id: crypto.randomUUID(),
        fecha: format(fecha, "yyyy-MM-dd"),
        titulo,
        descripcion
      },
      ...prev
    ])
    setFecha(undefined)
    setTitulo("")
    setDescripcion("")
    setOpen(false)
  }

  return (
    <section className="mx-auto max-w-6xl flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Eventos
          </h1>
          <p className="text-sm text-muted-foreground">
            Registrar eventos separados de movimientos contables.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2">
                <Plus data-icon="inline-start" />
                Nuevo Evento
              </Button>
            }
          />
          <DialogContent className="w-[95vw] sm:max-w-xl bg-card p-0 overflow-y-auto max-h-[90vh]">
            <div className="p-6 sm:p-10 flex flex-col gap-8">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
                  Nuevo Evento
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-base mt-1">
                  Registre los detalles de un nuevo evento ministerial.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border" />
                  <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
                    Detalles del Evento
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="evt-fecha"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Fecha del Evento
                    </Label>
                    <DatePicker value={fecha} onChange={setFecha} className="h-12" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="evt-titulo"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Título del Evento
                    </Label>
                    <Input
                      id="evt-titulo"
                      placeholder="Ej: Reunión de tesorería..."
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      className="h-12 bg-muted border-none rounded-xl px-5 text-base font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <Label
                      htmlFor="evt-descripcion"
                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Descripción <span className="text-xs font-normal opacity-50">(Opcional)</span>
                    </Label>
                    <textarea
                      id="evt-descripcion"
                      className="flex min-h-[120px] w-full rounded-xl border-none bg-muted px-5 py-4 text-base font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      placeholder="Agregue detalles importantes sobre el evento..."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button type="submit" className="h-11">
                    Guardar Evento
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
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">Eventos Registrados</h2>

        {eventos.length === 0 ? (
          <Card className="p-0 overflow-hidden">
            <Empty className="border-0 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarDays />
                </EmptyMedia>
                <EmptyTitle>Sin eventos</EmptyTitle>
                <EmptyDescription>No hay eventos registrados aún.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </Card>
        ) : (
          <ItemGroup>
            {eventos.map((evento) => (
              <Item key={evento.id} variant="outline">
                <ItemContent>
                  <ItemHeader>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                      {formatDate(evento.fecha)}
                    </p>
                  </ItemHeader>
                  <ItemTitle className="text-base font-bold text-foreground">
                    {evento.titulo}
                  </ItemTitle>
                  {evento.descripcion && (
                    <ItemDescription>{evento.descripcion}</ItemDescription>
                  )}
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        )}
      </div>
    </section>
  )
}

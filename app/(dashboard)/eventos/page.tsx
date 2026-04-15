"use client";

import { FormEvent, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Evento = {
  id: string;
  fecha: string;
  titulo: string;
  descripcion: string;
};

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [fecha, setFecha] = useState<Date | undefined>(undefined);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fecha || !titulo) {
      return;
    }

    const nuevoEvento: Evento = {
      id: crypto.randomUUID(),
      fecha: format(fecha, "yyyy-MM-dd"),
      titulo,
      descripcion,
    };

    setEventos((prev) => [nuevoEvento, ...prev]);
    setFecha(undefined);
    setTitulo("");
    setDescripcion("");
    setOpen(false);
  };

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <Card className="bg-surface-container-lowest p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Eventos</h1>
            <p className="mt-1 text-sm text-on-surface-variant font-medium">Registrar eventos separados de movimientos contables.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button variant="primary" className="h-10 px-6 shadow-lg shadow-primary/10">
                  <Plus className="mr-2 h-5 w-5" />
                  Nuevo Evento
                </Button>
              }
            />
            <DialogContent className="w-[95vw] sm:max-w-2xl bg-surface-container-lowest p-0 border-none shadow-[0px_40px_80px_-20px_rgba(25,28,30,0.15)] rounded-[2rem] overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-on-surface-variant/10">
              <div className="p-6 sm:p-12 space-y-8 sm:space-y-10">
                <DialogHeader>
                  <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Nuevo Evento</DialogTitle>
                  <DialogDescription className="text-on-surface-variant font-medium text-base mt-2">
                    Registre los detalles de un nuevo evento ministerial.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 px-1">
                      <div className="h-px flex-1 bg-on-surface-variant/10" />
                      <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant opacity-50">
                        Detalles del Evento
                      </h3>
                      <div className="h-px flex-1 bg-on-surface-variant/10" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                      <div className="space-y-2">
                        <Label htmlFor="evt-fecha" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Fecha del Evento</Label>
                        <DatePicker
                          value={fecha}
                          onChange={setFecha}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="evt-titulo" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Título del Evento</Label>
                        <Input
                          id="evt-titulo"
                          type="text"
                          placeholder="Ej: Reunión de tesorería..."
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          className="h-12 sm:h-14 bg-surface-container-low border-none rounded-2xl px-5 text-base font-medium"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="evt-descripcion" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Descripción Detallada <span className="text-[10px] opacity-50 ml-1 font-normal">(Opcional)</span></Label>
                        <textarea
                          id="evt-descripcion"
                          className="flex min-h-[120px] w-full rounded-2xl border-none bg-surface-container-low px-5 py-4 text-base font-medium text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary-fixed transition-all"
                          placeholder="Agregue detalles importantes sobre el evento..."
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-6 border-t border-on-surface-variant/5">
                    <Button type="submit" variant="primary" className="h-10 sm:h-11 text-sm sm:text-base shadow-lg shadow-primary/10 rounded-xl">
                      Guardar Evento en Bitácora
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      className="h-10 sm:h-11 border-none bg-surface-container-low hover:bg-surface-container-high transition-colors rounded-xl"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="px-2 text-xl font-bold tracking-tight text-on-surface">Eventos Registrados</h2>
        {eventos.length === 0 ? (
          <Card className="p-12 text-center bg-surface-container-low border-none">
            <p className="text-sm font-medium text-on-surface-variant">No hay eventos registrados aún.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {eventos.map((evento) => (
              <Card key={evento.id} className="p-6 transition-all hover:translate-y-[-2px] border-none">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{formatDate(evento.fecha)}</p>
                    <h3 className="text-lg font-bold text-on-surface">{evento.titulo}</h3>
                    <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                      {evento.descripcion || "Sin descripción adicional."}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

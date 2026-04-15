"use client";

import { useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Boleta = {
  id: string;
  numero: string;
  fecha: string;
  monto: number;
  descripcion: string;
  rendida: boolean;
  archivo?: File;
};

export default function RendicionBoletasPage() {
  const [boletas, setBoletas] = useState<Boleta[]>([
    {
      id: "1",
      numero: "BOL-001",
      fecha: "2026-03-01",
      monto: 15000,
      descripcion: "Boleta de luz - Marzo",
      rendida: false,
    },
    {
      id: "2",
      numero: "BOL-002",
      fecha: "2026-03-05",
      monto: 25000,
      descripcion: "Boleta de agua - Marzo",
      rendida: true,
    },
    {
      id: "3",
      numero: "BOL-003",
      fecha: "2026-03-10",
      monto: 12000,
      descripcion: "Boleta de gas - Marzo",
      rendida: false,
    },
    {
      id: "4",
      numero: "BOL-004",
      fecha: "2026-03-15",
      monto: 35000,
      descripcion: "Boleta de teléfono - Marzo",
      rendida: true,
    },
    {
      id: "5",
      numero: "BOL-005",
      fecha: "2026-03-20",
      monto: 18000,
      descripcion: "Boleta de internet - Marzo",
      rendida: false,
    },
  ]);
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState<Date | undefined>(undefined);
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!numero || !fecha || !monto) {
      return;
    }

    const nuevaBoleta: Boleta = {
      id: crypto.randomUUID(),
      numero,
      fecha: format(fecha, "yyyy-MM-dd"),
      monto: parseFloat(monto),
      descripcion,
      rendida: false,
      archivo: archivo || undefined,
    };

    setBoletas((prev) => [nuevaBoleta, ...prev]);
    setNumero("");
    setFecha(undefined);
    setMonto("");
    setDescripcion("");
    setArchivo(null);
    setOpen(false);
  };

  const toggleRendida = (id: string) => {
    setBoletas((prev) =>
      prev.map((boleta) =>
        boleta.id === id ? { ...boleta, rendida: !boleta.rendida } : boleta
      )
    );
  };

  const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <Card className="bg-surface-container-lowest p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Rendición de Boletas</h1>
            <p className="mt-1 text-sm text-on-surface-variant font-medium">
              Gestiona la rendición de boletas. <strong className="text-primary">Plazo máximo: 30 de cada mes.</strong>
            </p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button variant="primary" className="h-10 px-6 shadow-lg shadow-primary/10">
                  <Plus className="mr-2 h-5 w-5" />
                  Agregar Boleta
                </Button>
              }
            />
            <DialogContent className="w-[95vw] sm:max-w-2xl bg-surface-container-lowest p-0 border-none shadow-[0px_40px_80px_-20px_rgba(25,28,30,0.15)] rounded-[2rem] overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-on-surface-variant/10">
              <div className="p-6 sm:p-12 space-y-8 sm:space-y-10">
                <DialogHeader>
                  <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Nueva Boleta</DialogTitle>
                  <DialogDescription className="text-on-surface-variant font-medium text-base mt-2">
                    Ingrese los detalles de la boleta para ser rendida.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 px-1">
                      <div className="h-px flex-1 bg-on-surface-variant/10" />
                      <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant opacity-50">
                        Detalles de la Boleta
                      </h3>
                      <div className="h-px flex-1 bg-on-surface-variant/10" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="boleta-numero" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Número de Boleta</Label>
                        <Input
                          id="boleta-numero"
                          type="text"
                          placeholder="Ej: BOL-001"
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                          className="h-12 sm:h-14 bg-surface-container-low border-none rounded-2xl px-5 text-base font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="boleta-fecha" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Fecha de Emisión</Label>
                        <DatePicker
                          value={fecha}
                          onChange={setFecha}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="boleta-monto" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Monto Total</Label>
                        <Input
                          id="boleta-monto"
                          type="number"
                          placeholder="0"
                          value={monto}
                          onChange={(e) => setMonto(e.target.value)}
                          className="h-12 sm:h-14 bg-surface-container-low border-none rounded-2xl px-5 text-lg font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="boleta-descripcion" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Descripción / Detalle</Label>
                        <Input
                          id="boleta-descripcion"
                          type="text"
                          placeholder="Descripción de la boleta..."
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          className="h-12 sm:h-14 bg-surface-container-low border-none rounded-2xl px-5 text-base font-medium"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="boleta-archivo" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Adjuntar Comprobante (Imagen/PDF)</Label>
                        <label
                          htmlFor="boleta-archivo"
                          className="relative flex h-20 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-on-surface-variant/20 bg-surface-container-low transition-colors hover:border-primary/40 hover:bg-surface-container-high"
                        >
                          <input
                            id="boleta-archivo"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                            className="sr-only"
                          />
                          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50">
                            {archivo ? archivo.name : "Click para subir o capturar foto"}
                          </span>
                        </label>
                        {archivo && (
                          <div className="mt-4 bg-primary/5 p-4 rounded-2xl flex items-center justify-between border border-primary/10">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg text-primary">📎</div>
                              <div>
                                <p className="text-xs font-bold text-on-surface truncate max-w-[200px]">
                                  {archivo.name}
                                </p>
                                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-tighter">
                                  {(archivo.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            {archivo.type.startsWith("image/") && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={URL.createObjectURL(archivo)}
                                alt="Vista previa"
                                className="h-10 w-10 object-cover rounded-lg border border-primary/20 shadow-sm"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-6 border-t border-on-surface-variant/5">
                    <Button type="submit" variant="primary" className="h-10 sm:h-11 text-sm sm:text-base shadow-lg shadow-primary/10 rounded-xl">
                      Registrar Boleta para Rendición
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

      <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0px_4px_24px_-4px_rgba(25,28,30,0.06)] border border-outline/10">
          {boletas.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-sm font-medium text-on-surface-variant/60">No hay boletas registradas para el periodo actual.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="text-on-surface-variant/40 border-none">
                    <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Número</th>
                    <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Fecha</th>
                    <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Monto</th>
                    <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Descripción</th>
                    <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Adjunto</th>
                    <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Estado</th>
                    <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em] text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0">
                  {boletas.map((boleta, index) => (
                    <tr 
                      key={boleta.id} 
                      className={cn(
                        "group transition-all duration-300 hover:bg-surface-container-low/60",
                        index % 2 === 0 ? "bg-transparent" : "bg-surface-container-low/20"
                      )}
                    >
                      <td className="px-8 py-5 font-bold text-on-surface text-sm">{boleta.numero}</td>
                      <td className="px-8 py-5 text-on-surface-variant font-medium text-sm whitespace-nowrap tabular-nums">
                        {formatDate(boleta.fecha)}
                      </td>
                      <td className="px-8 py-5 font-black text-on-surface text-base tabular-nums">{clp.format(boleta.monto)}</td>
                      <td className="px-8 py-5 text-on-surface-variant font-medium text-sm max-w-[200px] truncate" title={boleta.descripcion}>
                        {boleta.descripcion || "—"}
                      </td>
                      <td className="px-8 py-5">
                        {boleta.archivo ? (
                          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider bg-primary/5 px-3 py-1 rounded-full w-fit">
                            <span className="text-sm">📎</span> {boleta.archivo.name.split('.').pop()}
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-on-surface-variant/30 uppercase tracking-widest italic">Sin adjunto</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                            boleta.rendida
                              ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                              : "bg-on-surface-variant/10 text-on-surface-variant/60"
                          )}
                        >
                          {boleta.rendida ? "Rendida" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button
                          variant={boleta.rendida ? "outline" : "primary"}
                          size="xs"
                          onClick={() => toggleRendida(boleta.id)}
                          className={cn(
                            "rounded-full px-5 transition-all",
                            boleta.rendida ? "border-none bg-surface-container-highest hover:bg-on-surface-variant/10" : "shadow-lg shadow-primary/10"
                          )}
                        >
                          {boleta.rendida ? "Reabrir" : "Rendir"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnularButton } from "./anular-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export type SerializedMovimiento = {
  id: string;
  folio_display: string;
  movement_date: string;
  movement_type: string;
  amount: string;
  category: string;
  concept: string;
  reference_person: string | null;
  received_by: string | null;
  delivered_by: string | null;
  beneficiary: string | null;
  payment_method: string | null;
  support_number: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  status: string;
  created_by: { full_name: string };
};

const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">{label}</p>
      <p className="text-sm font-semibold text-on-surface">{value || "—"}</p>
    </div>
  );
}

const MOVEMENT_TYPE_LABEL: Record<string, string> = {
  INCOME: "Ingreso",
  EXPENSE: "Egreso",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo",
  CANCELLED: "Anulado",
};

export function MovimientosTable({
  rows,
  canWrite,
}: {
  rows: SerializedMovimiento[];
  canWrite: boolean;
}) {
  const [selected, setSelected] = useState<SerializedMovimiento | null>(null);

  return (
    <>
      <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0px_4px_24px_-4px_rgba(25,28,30,0.06)] border border-outline/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="text-on-surface-variant/40 border-none">
                <th className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Folio</th>
                <th className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Fecha</th>
                <th className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Tipo</th>
                <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em] text-right">Monto</th>
                <th className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Categoría</th>
                <th className="px-4 sm:px-8 py-4 sm:py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  onClick={() => setSelected(row)}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:bg-primary/5",
                    index % 2 === 0 ? "bg-transparent" : "bg-surface-container-low/20"
                  )}
                >
                  <td className="px-4 sm:px-8 py-4 sm:py-5 font-bold text-primary">#{row.folio_display}</td>
                  <td className="px-4 sm:px-8 py-4 sm:py-5 text-on-surface-variant font-medium text-sm whitespace-nowrap tabular-nums">
                    {formatDate(row.movement_date)}
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-5">
                    <span className={cn(
                      "inline-flex rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase",
                      row.movement_type === "INCOME" ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary"
                    )}>
                      {MOVEMENT_TYPE_LABEL[row.movement_type] ?? row.movement_type}
                    </span>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-5 text-right font-black text-on-surface tabular-nums">
                    {clp.format(Number(row.amount))}
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-5">
                    <span className="inline-flex rounded-full bg-secondary-container/50 px-3 py-1 text-[10px] font-bold text-on-secondary-container uppercase tracking-widest">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-5">
                    <span className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase",
                      row.status === "ACTIVE" ? "bg-primary/5 text-primary/70" : "bg-destructive/5 text-destructive/70"
                    )}>
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className="px-8 py-20 text-center text-sm font-medium text-on-surface-variant/60" colSpan={6}>
                    No hay registros en la bitácora para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected && (
          <DialogContent className="w-[95vw] sm:max-w-lg bg-surface-container-lowest p-0 border-none shadow-[0px_40px_80px_-20px_rgba(25,28,30,0.15)] rounded-[2rem] overflow-y-auto max-h-[90vh]">
            <div className="p-8 space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-3 flex-wrap">
                  <DialogTitle className="text-2xl font-extrabold tracking-tight text-on-surface">
                    #{selected.folio_display}
                  </DialogTitle>
                  <span className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase",
                    selected.movement_type === "INCOME" ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary"
                  )}>
                    {MOVEMENT_TYPE_LABEL[selected.movement_type] ?? selected.movement_type}
                  </span>
                  <span className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase",
                    selected.status === "ACTIVE" ? "bg-primary/5 text-primary/70" : "bg-destructive/5 text-destructive/70"
                  )}>
                    {STATUS_LABEL[selected.status] ?? selected.status}
                  </span>
                </div>
                <DialogDescription className="sr-only">Detalle del movimiento {selected.folio_display}</DialogDescription>
              </DialogHeader>

              {/* Monto destacado */}
              <div className="bg-surface-container-low rounded-2xl px-6 py-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-1">Monto</p>
                <p className="text-2xl sm:text-3xl font-black tabular-nums text-primary">{clp.format(Number(selected.amount))}</p>
              </div>

              {/* Campos en grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
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
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">Observaciones</p>
                  <p className="text-sm font-medium text-on-surface leading-relaxed">{selected.notes}</p>
                </div>
              )}

              {selected.status === "CANCELLED" && selected.cancellation_reason && (
                <div className="rounded-2xl bg-destructive/5 px-5 py-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-destructive">Motivo de Anulación</p>
                  <p className="text-sm font-semibold text-on-surface">{selected.cancellation_reason}</p>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-on-surface-variant/10">
                <Button
                  variant="outline"
                  className="h-11 px-5 border-none bg-surface-container-low hover:bg-surface-container-high font-bold"
                  render={<Link href={`/movimientos/${selected.id}`} />}
                >
                  Ver detalles completos
                </Button>
                {canWrite && selected.status !== "CANCELLED" && (
                  <AnularButton
                    movimientoId={selected.id}
                    onSuccess={() => setSelected(null)}
                    className="h-11 px-5 border-none bg-destructive/10 hover:bg-destructive/20 text-destructive shadow-none"
                  />
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

import { z } from "zod";

export const movimientoBaseSchema = z.object({
  fechaMovimiento: z.string().min(1, "La fecha es requerida"),
  tipoMovimiento: z.enum(["INGRESO", "EGRESO"]),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0").max(999_999_999_999, "Monto fuera de rango"),
  categoria: z.string().min(1, "La categoria es requerida").max(100),
  concepto: z.string().min(3, "El concepto es requerido").max(500),
  referente: z.string().max(200).optional().nullable(),
  recibidoPor: z.string().max(200).optional().nullable(),
  entregadoPor: z.string().max(200).optional().nullable(),
  beneficiario: z.string().max(200).optional().nullable(),
  medioPago: z.string().max(100).optional().nullable(),
  numeroRespaldo: z.string().max(100).optional().nullable(),
  observaciones: z.string().max(1000).optional().nullable(),
});

export const createMovimientoSchema = movimientoBaseSchema;

export const updateMovimientoSchema = movimientoBaseSchema.extend({
  id: z.string().min(1),
});

export const anularMovimientoSchema = z.object({
  motivoAnulacion: z.string().min(3, "Debes indicar un motivo de anulacion"),
});

export type CreateMovimientoInput = z.infer<typeof createMovimientoSchema>;
export type UpdateMovimientoInput = z.infer<typeof updateMovimientoSchema>;
export type AnularMovimientoInput = z.infer<typeof anularMovimientoSchema>;

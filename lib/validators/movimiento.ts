import { z } from "zod";

export const movimientoBaseSchema = z.object({
  movement_date: z.string().min(1, "La fecha es requerida"),
  movement_type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  category: z.string().min(1, "La categoria es requerida"),
  concept: z.string().min(3, "El concepto es requerido"),
  reference_person: z.string().optional().nullable(),
  received_by: z.string().optional().nullable(),
  delivered_by: z.string().optional().nullable(),
  beneficiary: z.string().optional().nullable(),
  payment_method: z.string().optional().nullable(),
  support_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const createMovimientoSchema = movimientoBaseSchema;

export const updateMovimientoSchema = movimientoBaseSchema.extend({
  id: z.string().min(1),
});

export const anularMovimientoSchema = z.object({
  cancellation_reason: z.string().min(3, "Debes indicar un motivo de anulacion"),
});

export type CreateMovimientoInput = z.infer<typeof createMovimientoSchema>;
export type UpdateMovimientoInput = z.infer<typeof updateMovimientoSchema>;
export type AnularMovimientoInput = z.infer<typeof anularMovimientoSchema>;

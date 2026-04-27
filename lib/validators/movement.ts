import { z } from "zod"

export const movementBaseSchema = z.object({
  movement_date: z.string().date("La fecha no tiene un formato válido"),
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
  attachment_url: z.string().url().optional().nullable()
})

export const createMovementSchema = movementBaseSchema

export const updateMovementSchema = movementBaseSchema.extend({
  id: z.string().min(1)
})

export const cancelMovementSchema = z.object({
  cancellation_reason: z.string().min(3, "Debes indicar un motivo de anulacion")
})

export type CreateMovementInput = z.infer<typeof createMovementSchema>
export type UpdateMovementInput = z.infer<typeof updateMovementSchema>
export type CancelMovementInput = z.infer<typeof cancelMovementSchema>

import { z } from "zod"

export const createIntentionSchema = z.object({
  period_id: z.string().uuid("Período inválido"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  description: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
  purpose: z.string().optional(),
  date_needed: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido")
    .optional()
})

export const reviewIntentionSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  message: z.string().min(1, "El mensaje es requerido")
})

export const registerTransferSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  transfer_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  reference: z.string().optional(),
  notes: z.string().optional()
})

export const addCommentSchema = z.object({
  message: z.string().min(1, "El comentario no puede estar vacío")
})

export type CreateIntentionInput = z.infer<typeof createIntentionSchema>
export type ReviewIntentionInput = z.infer<typeof reviewIntentionSchema>
export type RegisterTransferInput = z.infer<typeof registerTransferSchema>
export type AddCommentInput = z.infer<typeof addCommentSchema>

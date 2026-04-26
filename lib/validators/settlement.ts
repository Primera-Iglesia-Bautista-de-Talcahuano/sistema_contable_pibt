import { z } from "zod"

export const createSettlementSchema = z.object({
  intention_id: z.string().uuid("Solicitud inválida"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  description: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  attachment_url: z.string().url("URL de adjunto inválida").optional()
})

export const reviewSettlementSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  message: z.string().min(1, "El mensaje es requerido")
})

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>
export type ReviewSettlementInput = z.infer<typeof reviewSettlementSchema>

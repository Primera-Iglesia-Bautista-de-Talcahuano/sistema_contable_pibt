import { z } from "zod"

export const createBudgetPeriodSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido")
})

export const updateBudgetPeriodSchema = z.object({
  name: z.string().min(2).optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
})

export const upsertMinistryBudgetSchema = z.object({
  ministry_id: z.string().uuid(),
  period_id: z.string().uuid(),
  amount: z.number().positive("El monto debe ser mayor a 0")
})

export type CreateBudgetPeriodInput = z.infer<typeof createBudgetPeriodSchema>
export type UpdateBudgetPeriodInput = z.infer<typeof updateBudgetPeriodSchema>
export type UpsertMinistryBudgetInput = z.infer<typeof upsertMinistryBudgetSchema>

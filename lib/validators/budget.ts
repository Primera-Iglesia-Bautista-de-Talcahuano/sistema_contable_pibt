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
  amount: z.coerce.number().positive("El monto debe ser mayor a 0")
})

export const createBudgetItemSchema = z.object({
  period_id: z.string().uuid(),
  ministry_id: z.string().uuid().nullable().optional(),
  description: z.string().min(2, "La descripción debe tener al menos 2 caracteres"),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  notes: z.string().nullable().optional()
})

export const updateBudgetItemSchema = createBudgetItemSchema.omit({ period_id: true }).partial()

export const allocationTypeSchema = z.enum(["AMOUNT", "PERCENTAGE"])

export const createBudgetItemAllocationSchema = z.object({
  item_id: z.string().uuid(),
  ministry_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  allocation_type: allocationTypeSchema,
  value: z.coerce.number().positive("El valor debe ser mayor a 0")
})

export const updateBudgetItemAllocationSchema = createBudgetItemAllocationSchema
  .omit({ item_id: true, allocation_type: true })
  .partial()

export type CreateBudgetPeriodInput = z.infer<typeof createBudgetPeriodSchema>
export type UpdateBudgetPeriodInput = z.infer<typeof updateBudgetPeriodSchema>
export type UpsertMinistryBudgetInput = z.infer<typeof upsertMinistryBudgetSchema>
export type CreateBudgetItemInput = z.infer<typeof createBudgetItemSchema>
export type UpdateBudgetItemInput = z.infer<typeof updateBudgetItemSchema>
export type AllocationType = z.infer<typeof allocationTypeSchema>
export type CreateBudgetItemAllocationInput = z.infer<typeof createBudgetItemAllocationSchema>
export type UpdateBudgetItemAllocationInput = z.infer<typeof updateBudgetItemAllocationSchema>

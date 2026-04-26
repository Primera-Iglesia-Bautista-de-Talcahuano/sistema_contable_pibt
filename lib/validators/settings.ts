import { z } from "zod"

export const updateSettingsSchema = z.object({
  tesoreria_notification_email: z.string().email("Email inválido").optional().or(z.literal("")),
  voucher_email: z.string().email("Email inválido").optional().or(z.literal("")),
  reminder_interval_days: z
    .number()
    .int()
    .min(1, "Mínimo 1 día")
    .max(30, "Máximo 30 días")
    .optional(),
  budget_period_start_month: z
    .number()
    .int()
    .min(1, "Mes inválido")
    .max(12, "Mes inválido")
    .optional()
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>

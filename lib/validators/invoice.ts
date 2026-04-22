import { z } from "zod"

export const createInvoiceSchema = z.object({
  number: z.string().min(1, "El número de boleta es requerido"),
  date: z.string().date("La fecha de emisión no tiene un formato válido"),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().optional().nullable(),
  attachment_url: z.string().url().optional().nullable()
})

export const updateInvoiceSchema = z.object({
  status: z.enum(["PENDING", "SETTLED"])
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>

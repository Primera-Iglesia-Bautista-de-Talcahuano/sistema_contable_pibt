import { z } from "zod"

export const createUsuarioSchema = z.object({
  full_name: z.string().min(3, "Nombre requerido"),
  email: z.email("Email inválido"),
  role: z.enum(["ADMIN", "OPERATOR", "VIEWER", "MINISTER"])
})

export const updateUsuarioSchema = z.object({
  id: z.string().min(1),
  full_name: z.string().min(3, "Nombre requerido"),
  role: z.enum(["ADMIN", "OPERATOR", "VIEWER", "MINISTER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING_ACTIVATION", "PENDING_RESET"])
})

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>

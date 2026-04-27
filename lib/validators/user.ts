import { z } from "zod"

export const createUserSchema = z.object({
  full_name: z.string().min(3, "Nombre requerido"),
  email: z.email("Email inválido"),
  role: z.enum(["ADMIN", "OPERATOR", "VIEWER", "MINISTER"])
})

export const updateUserSchema = z.object({
  id: z.string().min(1),
  full_name: z.string().min(3, "Nombre requerido"),
  role: z.enum(["ADMIN", "OPERATOR", "VIEWER", "MINISTER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING_ACTIVATION", "PENDING_RESET"])
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

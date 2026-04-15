import { z } from "zod";

export const createUsuarioSchema = z.object({
  full_name: z.string().min(3, "Nombre requerido"),
  email: z.email("Email invalido"),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
  role: z.enum(["ADMIN", "OPERATOR", "VIEWER"]),
  active: z.boolean().optional().default(true),
});

export const updateUsuarioSchema = z.object({
  id: z.string().min(1),
  full_name: z.string().min(3, "Nombre requerido"),
  role: z.enum(["ADMIN", "OPERATOR", "VIEWER"]),
  active: z.boolean(),
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;

import { z } from "zod";

export const updateUserSchema = z.object({
  userId: z.string().trim().min(1),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  email: z.string().trim().email("Correo inválido").max(320),
  role: z.enum(["USER", "ADMIN"]),
  emailVerified: z.boolean(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const bulkUpdateUsersSchema = z.object({
  userIds: z
    .array(z.string().trim().min(1))
    .min(1, "Selecciona al menos un cliente.")
    .max(50, "Máximo 50 clientes por acción."),
  role: z.enum(["USER", "ADMIN"]).optional(),
  emailVerified: z.boolean().optional(),
});

export type BulkUpdateUsersInput = z.infer<typeof bulkUpdateUsersSchema>;

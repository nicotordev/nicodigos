import { z } from "zod";

const optionalMediaUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine(
    (value) => value === undefined || /^https?:\/\//i.test(value),
    "URL de imagen inválida",
  );

export const upsertCategorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  description: z
    .string()
    .transform((value) => value.trim())
    .optional(),
  imageUrl: optionalMediaUrl,
  bannerUrl: optionalMediaUrl,
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export type UpsertCategoryInput = z.infer<typeof upsertCategorySchema>;

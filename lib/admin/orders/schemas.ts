import { z } from "zod";

const orderStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELED",
  "REFUNDED",
]);

export const updateOrderSchema = z.object({
  orderId: z.string().trim().min(1),
  status: orderStatusSchema,
  billingDocumentType: z.string().trim().min(1).max(32),
  billingFullName: z.string().trim().max(200),
  billingEmail: z
    .string()
    .trim()
    .max(320)
    .refine(
      (value) =>
        value.length === 0 || z.string().email().safeParse(value).success,
      "Correo de facturación inválido",
    ),
  billingPhone: z.string().trim().max(40),
  billingRut: z.string().trim().max(20),
  billingGiro: z.string().trim().max(120),
  billingCompanyName: z.string().trim().max(200),
  billingRegion: z.string().trim().max(120),
  billingCommune: z.string().trim().max(120),
  billingCity: z.string().trim().max(120),
  billingStreet: z.string().trim().max(200),
  billingUnit: z.string().trim().max(80),
  kinguinOrderId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  kinguinStatus: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  isPreorder: z.boolean(),
  preorderReleaseAt: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

export const sendOrderCustomerEmailSchema = z.object({
  orderId: z.string().trim().min(1),
  to: z.string().trim().email("Correo destinatario inválido"),
  subject: z.string().trim().min(1, "El asunto es obligatorio").max(200),
  htmlBody: z.string().trim().min(1, "El mensaje no puede estar vacío"),
});

export type SendOrderCustomerEmailInput = z.infer<
  typeof sendOrderCustomerEmailSchema
>;

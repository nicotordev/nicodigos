import { z } from "zod";

import {
  CHECKOUT_PHONE_INVALID_MESSAGE,
  isValidCheckoutPhone,
  normalizeCheckoutPhone,
} from "@/lib/chile/phone";
import { isValidRut, normalizeRut, RUT_INVALID_MESSAGE } from "@/lib/chile/rut";
import { CHECKOUT_NEW_ADDRESS_ID } from "@/lib/store/checkout/constants";

export const checkoutDocumentTypes = ["boleta", "factura"] as const;
export type CheckoutDocumentType = (typeof checkoutDocumentTypes)[number];

export const checkoutDocumentTypeOptions: {
  value: CheckoutDocumentType;
  label: string;
  description: string;
}[] = [
  {
    value: "boleta",
    label: "Boleta",
    description: "Consumidor final — nombre y RUT en la boleta",
  },
  {
    value: "factura",
    label: "Factura",
    description: "Empresa o persona con giro — datos tributarios completos",
  },
];

const checkoutBillingBaseSchema = z.object({
  documentType: z.enum(checkoutDocumentTypes),
  fullName: z.string().trim().max(120).optional().default(""),
  email: z.email("Ingresa un correo válido"),
  phone: z
    .string()
    .trim()
    .min(1, "Ingresa un teléfono de contacto")
    .max(32, "Teléfono demasiado largo")
    .refine(isValidCheckoutPhone, CHECKOUT_PHONE_INVALID_MESSAGE),
  rut: z
    .string()
    .trim()
    .min(1, "El RUT es obligatorio")
    .max(16)
    .refine(isValidRut, RUT_INVALID_MESSAGE),
  giro: z.string().trim().max(160).optional().default(""),
  companyName: z.string().trim().max(160).optional().default(""),
  addressSelection: z.string().trim().min(1),
  addressLabel: z
    .string()
    .trim()
    .min(1, "Ponle un nombre a la dirección (ej. Casa, Empresa)")
    .max(80),
  region: z.string().trim().min(1, "La región es obligatoria").max(80),
  commune: z.string().trim().min(1, "La comuna es obligatoria").max(80),
  city: z.string().trim().min(1, "La ciudad es obligatoria").max(80),
  street: z.string().trim().min(1, "La dirección es obligatoria").max(200),
  unit: z.string().trim().max(40).optional().default(""),
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: "Debes aceptar los términos y la política de privacidad",
  }),
});

export const checkoutBillingSchema = checkoutBillingBaseSchema.superRefine(
  (data, ctx) => {
    if (data.documentType === "boleta" && !data.fullName.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["fullName"],
        message: "El nombre es obligatorio para la boleta",
      });
    }

    if (data.documentType === "factura") {
      if (!data.giro?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["giro"],
          message: "El giro es obligatorio para factura",
        });
      }

      if (!data.companyName?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["companyName"],
          message: "La razón social es obligatoria para factura",
        });
      }
    }
  },
);

export type CheckoutBillingInput = z.infer<typeof checkoutBillingSchema>;

export type CheckoutBillingFormValues = Omit<
  CheckoutBillingInput,
  "acceptTerms"
> & {
  acceptTerms: boolean;
};

export function sanitizeCheckoutBilling(
  input: CheckoutBillingInput,
): CheckoutBillingInput {
  const isFactura = input.documentType === "factura";

  return {
    ...input,
    rut: normalizeRut(input.rut),
    fullName: input.fullName.trim(),
    phone: normalizeCheckoutPhone(input.phone),
    addressLabel: input.addressLabel.trim(),
    unit: input.unit?.trim() ?? "",
    giro: isFactura ? (input.giro?.trim() ?? "") : "",
    companyName: isFactura ? (input.companyName?.trim() ?? "") : "",
    addressSelection: input.addressSelection.trim() || CHECKOUT_NEW_ADDRESS_ID,
  };
}

export type CheckoutBillingInitial = CheckoutBillingFormValues;

const checkoutContactSchema = checkoutBillingBaseSchema.pick({
  email: true,
  phone: true,
});

const checkoutBillingIdentitySchema = checkoutBillingBaseSchema
  .pick({
    documentType: true,
    fullName: true,
    rut: true,
    giro: true,
    companyName: true,
  })
  .superRefine((data, ctx) => {
    if (data.documentType === "boleta" && !data.fullName.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["fullName"],
        message: "El nombre es obligatorio para la boleta",
      });
    }

    if (data.documentType === "factura") {
      if (!data.giro?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["giro"],
          message: "El giro es obligatorio para factura",
        });
      }

      if (!data.companyName?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["companyName"],
          message: "La razón social es obligatoria para factura",
        });
      }
    }
  });

const checkoutAddressSchema = checkoutBillingBaseSchema.pick({
  addressSelection: true,
  addressLabel: true,
  region: true,
  commune: true,
  city: true,
  street: true,
  unit: true,
});

/** Paso 1: correo y teléfono. */
export function isCheckoutContactComplete(
  values: Pick<CheckoutBillingFormValues, "email" | "phone">,
): boolean {
  return checkoutContactSchema.safeParse(values).success;
}

/** Paso 2: tipo de documento e identificación tributaria. */
export function isCheckoutBillingIdentityComplete(
  values: CheckoutBillingFormValues,
): boolean {
  return checkoutBillingIdentitySchema.safeParse(values).success;
}

/** Paso 3: dirección de facturación. */
export function isCheckoutAddressComplete(
  values: CheckoutBillingFormValues,
): boolean {
  return checkoutAddressSchema.safeParse(values).success;
}

/** Misma regla que el servidor: formulario listo para pagar. */
export function isCheckoutBillingComplete(
  values: CheckoutBillingFormValues,
): boolean {
  return checkoutBillingSchema.safeParse(values).success;
}
